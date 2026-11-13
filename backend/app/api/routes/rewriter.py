import json
from typing import Optional
import uuid
from fastapi import APIRouter, Depends, Header, HTTPException, status
import aiosqlite

from app.agents.rewriter import ResumeRewriterAgent
from app.db.session import get_db
from app.models.schemas import (
    RewriteResponse,
    VerificationResultResponse,
)
from app.services.aggregator import build_audit_report
from app.services.llm.client import LLMService, get_llm_service
from app.services.verifier import VerificationEngine


router = APIRouter()


@router.post("/rewrite/{session_id}", response_model=RewriteResponse, summary="Generate truthful improved resume")
async def rewrite_resume(
    session_id: str,
    db: aiosqlite.Connection = Depends(get_db),
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-Api-Key"),
    x_openai_api_key: Optional[str] = Header(None, alias="X-OpenAI-Api-Key"),
    x_api_key: Optional[str] = Header(None, alias="X-Api-Key"),
    x_llm_provider: Optional[str] = Header(None, alias="X-LLM-Provider"),
    x_llm_model: Optional[str] = Header(None, alias="X-LLM-Model"),
):
    """Trigger the Resume Rewriter Agent to correct all supported objections.
    
    Strictly preserves candidate truthfulness (CON-005) and runs the automated
    Factual Release Gate.
    """
    # 0. Query session and API key configuration
    s_cur = await db.execute(
        "SELECT llm_provider, llm_model, api_key_override FROM audit_sessions WHERE id = ?",
        (session_id,)
    )
    s_row = await s_cur.fetchone()

    eff_key = (s_row["api_key_override"] if s_row else None) or x_gemini_api_key or x_openai_api_key or x_api_key
    eff_prov = (s_row["llm_provider"] if s_row else None) or x_llm_provider or "gemini"
    eff_model = (s_row["llm_model"] if s_row else None) or x_llm_model

    if eff_key:
        llm_service = LLMService(
            provider=eff_prov,
            gemini_api_key=eff_key if (eff_prov == "gemini" or not eff_prov) else None,
            gemini_model=eff_model if eff_prov == "gemini" else None,
            openai_api_key=eff_key if eff_prov == "openai" else None,
            openai_model=eff_model if eff_prov == "openai" else None,
        )
    else:
        llm_service = get_llm_service()

    # 1. Fetch candidate input
    c_cur = await db.execute("SELECT raw_text FROM candidate_inputs WHERE session_id = ?", (session_id,))
    c_row = await c_cur.fetchone()
    if not c_row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate input not found.")

    # 2. Fetch job description
    jd_cur = await db.execute("SELECT raw_text FROM job_descriptions WHERE session_id = ?", (session_id,))
    jd_row = await jd_cur.fetchone()
    if not jd_row:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job description is required.")

    # 3. Fetch audit findings
    f_cur = await db.execute(
        """SELECT issue_title, severity, reason_for_rejection, suggested_fix
           FROM agent_findings WHERE session_id = ?""",
        (session_id,)
    )
    findings = [dict(r) for r in await f_cur.fetchall()]
    report_dict = {"findings": findings}

    # 4. Generate improved rewrite
    rewriter = ResumeRewriterAgent(llm_service)
    rewrite_output = await rewriter.rewrite(
        candidate_text=c_row["raw_text"],
        job_description=jd_row["raw_text"],
        rejection_report=report_dict,
    )

    # 5. Run Factual Verification Release Gate
    verification_res = VerificationEngine.verify(
        session_id=session_id,
        original_candidate_text=c_row["raw_text"],
        improved_markdown=rewrite_output.improved_markdown,
        change_set=rewrite_output.change_set,
        original_findings_count=len(findings),
    )

    # 6. Persist to database
    rw_id = str(uuid.uuid4())
    change_set_data = [item.model_dump() for item in rewrite_output.change_set]
    await db.execute("DELETE FROM rewritten_resumes WHERE session_id = ?", (session_id,))
    await db.execute(
        """INSERT INTO rewritten_resumes (id, session_id, version, content_json, markdown_text, change_set_json)
           VALUES (?, ?, 1, ?, ?, ?)""",
        (rw_id, session_id, json.dumps({}), rewrite_output.improved_markdown, json.dumps(change_set_data))
    )

    # Persist verification result
    vr_id = str(uuid.uuid4())
    await db.execute("DELETE FROM verification_results WHERE session_id = ?", (session_id,))
    await db.execute(
        """INSERT INTO verification_results
           (id, session_id, passed_gate, verified_claims_json, unsupported_claims_json,
            resolved_findings_count, unresolved_findings_count, release_decision_notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            vr_id,
            session_id,
            1 if verification_res.passed_gate else 0,
            json.dumps(verification_res.verified_claims),
            json.dumps(verification_res.unsupported_claims),
            verification_res.resolved_findings_count,
            verification_res.unresolved_findings_count,
            verification_res.notes
        )
    )
    await db.commit()

    return RewriteResponse(
        session_id=session_id,
        version=1,
        improved_markdown=rewrite_output.improved_markdown,
        change_set=rewrite_output.change_set,
        passed_gate=verification_res.passed_gate,
    )


@router.post("/verify/{session_id}", response_model=VerificationResultResponse, summary="Run factual verification gate")
async def verify_resume(
    session_id: str,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Re-run the Factual Verification Engine and Release Gate against the latest rewrite."""
    c_cur = await db.execute("SELECT raw_text FROM candidate_inputs WHERE session_id = ?", (session_id,))
    c_row = await c_cur.fetchone()
    if not c_row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate input not found.")

    rw_cur = await db.execute("SELECT markdown_text, change_set_json FROM rewritten_resumes WHERE session_id = ?", (session_id,))
    rw_row = await rw_cur.fetchone()
    if not rw_row:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No rewritten resume found to verify.")

    raw_change_set = json.loads(rw_row["change_set_json"])
    change_set = [from_dict for from_dict in raw_change_set]

    # Convert to FactualChangeItem
    from app.models.schemas import FactualChangeItem
    items = [FactualChangeItem(**item) for item in change_set]

    res = VerificationEngine.verify(
        session_id=session_id,
        original_candidate_text=c_row["raw_text"],
        improved_markdown=rw_row["markdown_text"],
        change_set=items,
    )
    return res

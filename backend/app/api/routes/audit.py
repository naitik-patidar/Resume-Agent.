"""API routes for triggering sequential audits and fetching aggregated reports."""
import asyncio
from typing import Dict, List, Optional
from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, status
import aiosqlite
from pydantic import BaseModel, Field

from app.agents.orchestrator import run_next_agent_step, run_sequential_audit
from app.config import settings
from app.db.session import get_db
from app.models.schemas import (
    AgentFindingSchema,
    AuditReportResponse,
    SessionStatusEnum,
    SeverityEnum,
)
from app.services.aggregator import build_audit_report
from app.services.llm.client import LLMService, get_llm_service


router = APIRouter()


class AnalyzeRequest(BaseModel):
    session_id: str
    api_key: Optional[str] = Field(default=None, description="Optional custom user API key")
    provider: Optional[str] = Field(default=None, description="Optional AI provider (gemini, openai, ollama)")
    model: Optional[str] = Field(default=None, description="Optional target model")
    base_url: Optional[str] = Field(default=None, description="Optional custom endpoint URL")


class AnalyzeResponse(BaseModel):
    session_id: str
    status: str
    message: str


async def background_audit_runner(session_id: str):
    """Isolated background task worker that creates its own SQLite connection and uses session-specific LLM config."""
    async with aiosqlite.connect(settings.DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        await db.execute("PRAGMA foreign_keys = ON;")

        # Query session-specific LLM settings
        cursor = await db.execute(
            "SELECT llm_provider, llm_model, api_key_override FROM audit_sessions WHERE id = ?",
            (session_id,)
        )
        session_row = await cursor.fetchone()
        custom_llm = None
        default_svc = get_llm_service()
        if default_svc.mock_provider:
            custom_llm = default_svc
        elif session_row and session_row["api_key_override"]:
            prov = session_row["llm_provider"] or "gemini"
            key = session_row["api_key_override"]
            model = session_row["llm_model"]
            custom_llm = LLMService(
                provider=prov,
                gemini_api_key=key if (prov == "gemini" or not prov) else None,
                gemini_model=model if prov == "gemini" else None,
                openai_api_key=key if prov == "openai" else None,
                openai_model=model if prov == "openai" else None,
            )

        await run_sequential_audit(session_id, db, llm_service=custom_llm)


@router.post("/analyze", response_model=AnalyzeResponse, summary="Start sequential seven-agent resume audit")
async def start_audit(
    payload: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: aiosqlite.Connection = Depends(get_db),
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-Api-Key"),
    x_openai_api_key: Optional[str] = Header(None, alias="X-OpenAI-Api-Key"),
    x_api_key: Optional[str] = Header(None, alias="X-Api-Key"),
    x_llm_provider: Optional[str] = Header(None, alias="X-LLM-Provider"),
    x_llm_model: Optional[str] = Header(None, alias="X-LLM-Model"),
):
    """Initiate the sequential 7-agent audit pipeline.
    
    Agents execute one-by-one in strict order:
    1. ATS -> 2. Recruiter -> 3. Technical -> 4. Experience -> 5. Formatting -> 6. Credibility -> 7. Job Match.
    """
    sid = payload.session_id

    # Check session
    cursor = await db.execute("SELECT id, status FROM audit_sessions WHERE id = ?", (sid,))
    session = await cursor.fetchone()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session '{sid}' not found.")

    # Check candidate input presence
    c_cursor = await db.execute("SELECT id FROM candidate_inputs WHERE session_id = ?", (sid,))
    if not await c_cursor.fetchone():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot start audit: No resume or professional experience submitted."
        )

    # Check job description presence
    jd_cursor = await db.execute("SELECT id FROM job_descriptions WHERE session_id = ?", (sid,))
    if not await jd_cursor.fetchone():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot start audit: Target job description is required."
        )

    # Determine user-provided API key & model
    effective_key = payload.api_key or x_gemini_api_key or x_openai_api_key or x_api_key
    effective_provider = payload.provider or x_llm_provider
    if not effective_provider and effective_key:
        if x_openai_api_key or (effective_key and effective_key.startswith("sk-")):
            effective_provider = "openai"
        else:
            effective_provider = "gemini"

    effective_model = payload.model or x_llm_model

    # Persist user LLM configuration for this session
    if effective_key or effective_provider or effective_model:
        await db.execute(
            """UPDATE audit_sessions
               SET llm_provider = ?, llm_model = ?, api_key_override = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?""",
            (effective_provider, effective_model, effective_key, sid)
        )
        await db.commit()

    # Launch background worker
    background_tasks.add_task(background_audit_runner, sid)

    return AnalyzeResponse(
        session_id=sid,
        status="started",
        message="Sequential audit initiated. Monitor progress via /api/resume/status/{session_id}."
    )


@router.post("/step/{session_id}", summary="Execute next agent step (Serverless resilient)")
async def step_audit(session_id: str, db: aiosqlite.Connection = Depends(get_db)):
    """Execute the next queued agent. Ideal for serverless environments (e.g. Vercel) where background processes freeze."""
    executed = await run_next_agent_step(session_id, db)
    return {"session_id": session_id, "step_executed": executed}


@router.get("/report/{session_id}", response_model=AuditReportResponse, summary="Get consolidated rejection report")
async def get_audit_report(session_id: str, db: aiosqlite.Connection = Depends(get_db)):
    """Retrieve the aggregated, deduplicated rejection report once audit completes."""
    cursor = await db.execute("SELECT id, status FROM audit_sessions WHERE id = ?", (session_id,))
    session = await cursor.fetchone()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session '{session_id}' not found.")

    if session["status"] in (SessionStatusEnum.CREATED.value, SessionStatusEnum.READY.value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audit has not been started yet. Call POST /api/resume/analyze first."
        )

    # Query all findings
    f_cursor = await db.execute(
        """SELECT id, agent_name, issue_title, severity, evidence_from_resume,
                  reason_for_rejection, suggested_fix, confidence, requires_user_input
           FROM agent_findings
           WHERE session_id = ?
           ORDER BY confidence DESC""",
        (session_id,)
    )
    finding_rows = await f_cursor.fetchall()

    raw_findings = [
        AgentFindingSchema(
            id=r["id"],
            agent_name=r["agent_name"],
            issue_title=r["issue_title"],
            severity=SeverityEnum(r["severity"]),
            evidence_from_resume=r["evidence_from_resume"],
            reason_for_rejection=r["reason_for_rejection"],
            suggested_fix=r["suggested_fix"],
            confidence=r["confidence"],
            requires_user_input=bool(r["requires_user_input"]),
        )
        for r in finding_rows
    ]

    # Query agent category scores and failures
    exec_cursor = await db.execute(
        "SELECT agent_name, status, category_score FROM agent_executions WHERE session_id = ?",
        (session_id,)
    )
    exec_rows = await exec_cursor.fetchall()

    category_scores = {}
    failed_agents = []

    for r in exec_rows:
        if r["status"] == "completed" and r["category_score"] is not None:
            category_scores[r["agent_name"]] = r["category_score"]
        elif r["status"] == "failed":
            failed_agents.append(r["agent_name"])

    return build_audit_report(
        session_id=session_id,
        raw_findings=raw_findings,
        category_scores=category_scores,
        failed_agents=failed_agents,
    )

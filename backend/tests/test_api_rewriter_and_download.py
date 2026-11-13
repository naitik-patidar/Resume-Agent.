"""Integration tests for rewrite, verification, and gated download endpoints."""
import json
import pytest
from httpx import AsyncClient
import aiosqlite

from app.config import settings
from app.agents.rewriter import RewriterLLMOutput
from app.models.schemas import (
    AgentAuditOutput,
    AgentFindingSchema,
    FactualChangeItem,
    SeverityEnum,
)
from app.services.llm.client import LLMService, set_llm_service
from tests.test_parser import create_sample_pdf


class MockRewriterService:
    async def generate_structured(self, system_prompt, user_prompt, response_model, agent_name):
        return RewriterLLMOutput(
            improved_markdown="# Alex Morgan\n\n## Experience\n- Engineered high-throughput distributed system processing 10,000 requests/sec with 99.9% uptime.",
            change_set=[
                FactualChangeItem(
                    original_text="Engineered distributed system.",
                    revised_text="Engineered high-throughput distributed system.",
                    reason="Strengthened clarity and impact.",
                    source_evidence="Engineered distributed system.",
                    factual_claims_added_or_changed=["distributed system"],
                    requires_user_confirmation=False,
                )
            ],
            summary_of_changes="Polished bullet points and strengthened impact."
        )


@pytest.fixture(autouse=True)
def setup_mock_llm():
    mock_service = LLMService(mock_provider=MockRewriterService())
    set_llm_service(mock_service)
    yield
    set_llm_service(LLMService())


@pytest.mark.asyncio
async def test_rewrite_session_not_found(client: AsyncClient):
    resp = await client.post("/api/resume/rewrite/non-existent-session")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_rewrite_missing_job_description(client: AsyncClient):
    # Upload resume only
    pdf_bytes = create_sample_pdf()
    up_resp = await client.post("/api/resume/upload", files={"file": ("resume.pdf", pdf_bytes, "application/pdf")})
    sid = up_resp.json()["session_id"]

    resp = await client.post(f"/api/resume/rewrite/{sid}")
    assert resp.status_code == 400
    assert "job description is required" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_rewrite_verify_and_gated_download_flow(client: AsyncClient):
    # 1. Upload candidate resume
    pdf_bytes = create_sample_pdf()
    up_resp = await client.post("/api/resume/upload", files={"file": ("resume.pdf", pdf_bytes, "application/pdf")})
    sid = up_resp.json()["session_id"]

    # 2. Submit target job description
    jd_payload = {
        "session_id": sid,
        "title": "Backend Architect",
        "job_description_text": "Looking for Backend Architect with Python and distributed systems."
    }
    await client.post("/api/job-description/submit", json=jd_payload)

    # 3. Insert mock agent findings to simulate audit completion
    async with aiosqlite.connect(settings.DATABASE_PATH) as db:
        await db.execute(
            """INSERT INTO agent_findings
               (id, session_id, agent_name, issue_title, severity, evidence_from_resume,
                reason_for_rejection, suggested_fix, confidence)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            ("find-1", sid, "Technical Rejection Agent", "Weak phrasing", "Medium", "text", "Too passive", "Use action verbs", 0.9)
        )
        await db.commit()

    # 4. Trigger rewrite
    rw_resp = await client.post(f"/api/resume/rewrite/{sid}")
    assert rw_resp.status_code == 200
    rw_data = rw_resp.json()
    assert rw_data["session_id"] == sid
    assert "# Alex Morgan" in rw_data["improved_markdown"]
    assert len(rw_data["change_set"]) == 1
    assert rw_data["change_set"][0]["reason"] == "Strengthened clarity and impact."

    # 5. Verify endpoint
    v_resp = await client.post(f"/api/resume/verify/{sid}")
    assert v_resp.status_code == 200
    v_data = v_resp.json()
    assert "passed_gate" in v_data
    assert "verified_claims" in v_data

    # 6. Test Gate-blocked download (simulate gate failure)
    async with aiosqlite.connect(settings.DATABASE_PATH) as db:
        await db.execute(
            "UPDATE verification_results SET passed_gate = 0, release_decision_notes = 'Blocked: Unverified metric 50%' WHERE session_id = ?",
            (sid,)
        )
        await db.commit()

    blocked_resp = await client.get(f"/api/resume/download/{sid}?format=pdf")
    assert blocked_resp.status_code == 403
    assert "Release Gate" in blocked_resp.json()["detail"]

    # 7. Test Gate-passed downloads (DOCX and PDF)
    async with aiosqlite.connect(settings.DATABASE_PATH) as db:
        await db.execute(
            "UPDATE verification_results SET passed_gate = 1, release_decision_notes = 'Passed: All claims verified.' WHERE session_id = ?",
            (sid,)
        )
        await db.commit()

    # Download PDF
    pdf_resp = await client.get(f"/api/resume/download/{sid}?format=pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert pdf_resp.content.startswith(b"%PDF-")

    # Download DOCX
    docx_resp = await client.get(f"/api/resume/download/{sid}?format=docx")
    assert docx_resp.status_code == 200
    assert "wordprocessingml.document" in docx_resp.headers["content-type"]
    assert docx_resp.content.startswith(b"PK")

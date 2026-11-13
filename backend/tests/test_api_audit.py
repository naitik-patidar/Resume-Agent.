"""Integration tests for audit launch and report retrieval API endpoints."""
import pytest
from httpx import AsyncClient

from app.agents.orchestrator import run_sequential_audit
from app.db.session import get_db
from app.models.schemas import AgentAuditOutput, AgentFindingSchema, SeverityEnum
from app.services.llm.client import LLMService, set_llm_service
from tests.test_parser import create_sample_pdf


class MockAuditService:
    async def generate_structured(self, system_prompt, user_prompt, response_model, agent_name):
        f = AgentFindingSchema(
            agent_name=agent_name,
            issue_title=f"Sample issue from {agent_name}",
            severity=SeverityEnum.HIGH,
            evidence_from_resume="Verbatim quote",
            reason_for_rejection="Standard rejection reason",
            suggested_fix="Standard fix advice",
            confidence=0.9,
        )
        return AgentAuditOutput(
            agent_name=agent_name,
            findings=[f],
            category_score=80,
            summary=f"Audit completed by {agent_name}"
        )


@pytest.fixture(autouse=True)
def setup_mock_llm():
    mock_service = LLMService(mock_provider=MockAuditService())
    set_llm_service(mock_service)
    yield
    set_llm_service(LLMService())


@pytest.mark.asyncio
async def test_start_audit_validation_errors(client: AsyncClient):
    # Non-existent session
    resp = await client.post("/api/resume/analyze", json={"session_id": "non-existent-uuid"})
    assert resp.status_code == 404

    # Upload resume only (no JD yet)
    pdf_bytes = create_sample_pdf()
    up_resp = await client.post("/api/resume/upload", files={"file": ("resume.pdf", pdf_bytes, "application/pdf")})
    sid = up_resp.json()["session_id"]

    # Try starting audit without job description
    analyze_resp = await client.post("/api/resume/analyze", json={"session_id": sid})
    assert analyze_resp.status_code == 400
    assert "job description is required" in analyze_resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_audit_and_report_end_to_end(client: AsyncClient):
    # 1. Upload resume
    pdf_bytes = create_sample_pdf()
    up_resp = await client.post("/api/resume/upload", files={"file": ("my_resume.pdf", pdf_bytes, "application/pdf")})
    sid = up_resp.json()["session_id"]

    # 2. Submit target job description
    jd_payload = {
        "session_id": sid,
        "title": "Backend Architect",
        "job_description_text": "Seeking a Backend Architect with Python, FastAPI, and Docker experience."
    }
    await client.post("/api/job-description/submit", json=jd_payload)

    # 3. Before audit, requesting report should return 400
    pre_report = await client.get(f"/api/resume/report/{sid}")
    assert pre_report.status_code == 400

    # 4. Run sequential audit directly to test synchronous outcome
    from app.db.session import get_db
    from app.config import settings
    import aiosqlite
    async with aiosqlite.connect(settings.DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        await db.execute("PRAGMA foreign_keys = ON;")
        await run_sequential_audit(sid, db, LLMService(mock_provider=MockAuditService()))

    # 5. Check session status
    status_resp = await client.get(f"/api/resume/status/{sid}")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert status_data["status"] == "completed"
    assert len(status_data["agents"]) == 7

    # 6. Fetch aggregated report
    report_resp = await client.get(f"/api/resume/report/{sid}")
    assert report_resp.status_code == 200
    report_data = report_resp.json()
    assert report_data["session_id"] == sid
    assert report_data["overall_score"] == 80
    assert report_data["findings_count"] == 7
    assert len(report_data["category_scores"]) == 7
    assert "ATS Rejection Agent" in report_data["category_scores"]

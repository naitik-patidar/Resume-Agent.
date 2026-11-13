"""Test LLM provider configuration and API key verification endpoints."""
import pytest
from httpx import AsyncClient, ASGITransport
import aiosqlite

from app.main import app
from app.config import settings
from app.db.session import init_db
from app.models.schemas import AgentAuditOutput, AgentFindingSchema, SeverityEnum
from app.services.llm.client import LLMService, set_llm_service


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
async def test_get_providers():
    """Verify that GET /api/llm/providers returns supported providers and presets."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/llm/providers")
        assert resp.status_code == 200
        data = resp.json()
        assert "providers" in data
        provider_ids = [p["id"] for p in data["providers"]]
        assert "gemini" in provider_ids
        assert "openai" in provider_ids
        assert "ollama" in provider_ids


@pytest.mark.asyncio
async def test_verify_key_missing_key():
    """Verify that POST /api/llm/verify-key handles missing keys gracefully."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/llm/verify-key",
            json={"provider": "gemini", "api_key": ""},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["valid"] is False
        assert "Missing API key" in data["error"] or "required" in data["message"].lower()


@pytest.mark.asyncio
async def test_verify_key_invalid_gemini():
    """Verify that POST /api/llm/verify-key returns valid=False for fake keys without crashing."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/llm/verify-key",
            json={"provider": "gemini", "api_key": "INVALID_TEST_KEY_12345", "model": "gemini-2.5-flash"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["valid"] is False
        assert data["error"] is not None


@pytest.mark.asyncio
async def test_custom_api_key_stored_in_session():
    """Verify that user API key override passed in analyze request is saved in the session."""
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Create candidate input
        c_resp = await client.post(
            "/api/experience/submit",
            json={
                "experience_text": "Senior Engineer with 8 years of Python and distributed systems experience. Led backend platform architecture and microservices deployment.",
                "candidate_name": "Test User",
            },
        )
        assert c_resp.status_code == 200
        session_id = c_resp.json()["session_id"]

        # 2. Submit JD
        await client.post(
            "/api/job-description/submit",
            json={
                "session_id": session_id,
                "job_description_text": "We are looking for a Senior Python Backend Architect to lead microservices development, high-scale APIs, and cloud infrastructure.",
            },
        )

        # 3. Start audit with custom key & provider
        custom_key = "AIzaSy_custom_test_key"
        analyze_resp = await client.post(
            "/api/resume/analyze",
            json={"session_id": session_id, "api_key": custom_key, "provider": "gemini", "model": "gemini-2.5-flash"},
        )
        assert analyze_resp.status_code == 200

        # 4. Check DB for stored key override
        async with aiosqlite.connect(settings.DATABASE_PATH) as db:
            db.row_factory = aiosqlite.Row
            cur = await db.execute("SELECT llm_provider, llm_model, api_key_override FROM audit_sessions WHERE id = ?", (session_id,))
            row = await cur.fetchone()
            assert row is not None
            assert row["llm_provider"] == "gemini"
            assert row["llm_model"] == "gemini-2.5-flash"
            assert row["api_key_override"] == custom_key

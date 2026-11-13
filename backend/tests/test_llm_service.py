"""Unit tests for LLM service, JSON extractor, and rate limit backoff."""
import json
import pytest
from pydantic import BaseModel

from app.services.llm.client import (
    LLMService,
    LLMServiceError,
    extract_json_payload,
)


class DummyModel(BaseModel):
    message: str
    score: int


def test_extract_json_payload_raw():
    raw = '{"message": "hello", "score": 95}'
    data = extract_json_payload(raw)
    assert data["message"] == "hello"
    assert data["score"] == 95


def test_extract_json_payload_markdown_fences():
    fenced = """```json
    {
        "message": "fenced json",
        "score": 88
    }
    ```"""
    data = extract_json_payload(fenced)
    assert data["message"] == "fenced json"
    assert data["score"] == 88


def test_extract_json_payload_with_surrounding_text():
    messy = """Here is your evaluation report:
    {
        "message": "embedded json",
        "score": 75
    }
    Hope this helps!"""
    data = extract_json_payload(messy)
    assert data["message"] == "embedded json"
    assert data["score"] == 75


def test_extract_json_payload_invalid_raises():
    with pytest.raises(LLMServiceError):
        extract_json_payload("No json object to be found here.")


@pytest.mark.asyncio
async def test_llm_service_with_mock_provider():
    class MockProvider:
        async def generate_structured(self, system_prompt, user_prompt, response_model, agent_name):
            return response_model(message=f"Audited by {agent_name}", score=90)

    service = LLMService(mock_provider=MockProvider())
    result = await service.generate_structured(
        system_prompt="Audit system",
        user_prompt="Candidate text",
        response_model=DummyModel,
        agent_name="TestAgent"
    )
    assert result.message == "Audited by TestAgent"
    assert result.score == 90


def test_normalize_ollama_url():
    from app.services.llm.client import _normalize_ollama_url
    assert _normalize_ollama_url("http://localhost:11434") == "http://127.0.0.1:11434"
    assert _normalize_ollama_url("http://127.0.0.1:11434") == "http://127.0.0.1:11434"
    assert _normalize_ollama_url("") == "http://127.0.0.1:11434"


@pytest.mark.asyncio
async def test_llm_service_heuristic_fallback():
    from app.models.schemas import AgentAuditOutput
    from app.agents.rewriter import RewriterLLMOutput

    # Point to an unreachable host/port to trigger resilient fallback
    service = LLMService(ollama_base_url="http://127.0.0.1:99999", gemini_api_key="")
    
    # 1. Audit output fallback
    audit_res = await service.generate_structured(
        system_prompt="Audit resume",
        user_prompt="<candidate_resume>Jane Doe\nSoftware Engineer</candidate_resume><job_description>Python engineer</job_description>",
        response_model=AgentAuditOutput,
        agent_name="ATS Rejection Agent"
    )
    assert audit_res.agent_name == "ATS Rejection Agent"
    assert len(audit_res.findings) > 0
    assert 0 <= audit_res.category_score <= 100

    # 2. Rewriter output fallback
    rewrite_res = await service.generate_structured(
        system_prompt="Rewrite resume",
        user_prompt="<candidate_resume>Jane Doe\nResponsible for backend development.</candidate_resume><job_description>Python engineer</job_description>",
        response_model=RewriterLLMOutput,
        agent_name="Resume Rewriter Agent"
    )
    assert "Jane Doe" in rewrite_res.improved_markdown
    assert len(rewrite_res.summary_of_changes) > 0


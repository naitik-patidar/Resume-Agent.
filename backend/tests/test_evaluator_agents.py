"""Unit tests for the seven evaluator agents and prompt building."""
import pytest
from app.agents.evaluators import (
    get_sequential_agents,
    ATSRejectionAgent,
    RecruiterRejectionAgent,
    TechnicalRejectionAgent,
    ExperienceRejectionAgent,
    FormattingRejectionAgent,
    CredibilityRejectionAgent,
    JobMatchRejectionAgent,
)
from app.models.schemas import AgentAuditOutput, AgentFindingSchema, SeverityEnum
from app.services.llm.client import LLMService


def test_sequential_order_of_all_seven_agents():
    agents = get_sequential_agents()
    assert len(agents) == 7
    expected_order = [
        "ATS Rejection Agent",
        "Recruiter Rejection Agent",
        "Technical Rejection Agent",
        "Experience Rejection Agent",
        "Formatting Rejection Agent",
        "Credibility Rejection Agent",
        "Job Match Rejection Agent",
    ]
    for idx, agent in enumerate(agents, start=1):
        assert agent.execution_order == idx
        assert agent.name == expected_order[idx - 1]
        assert len(agent.responsibility) > 10


def test_untrusted_data_boundaries():
    agent = ATSRejectionAgent()
    user_prompt = agent.build_user_prompt("CANDIDATE_DATA", "JOB_DATA")
    assert "<candidate_resume>\nCANDIDATE_DATA\n</candidate_resume>" in user_prompt
    assert "<job_description>\nJOB_DATA\n</job_description>" in user_prompt
    assert "SECURITY DIRECTIVE" in user_prompt


@pytest.mark.asyncio
async def test_agent_evaluates_with_mock_llm():
    class MockEvaluatorLLM:
        async def generate_structured(self, system_prompt, user_prompt, response_model, agent_name):
            finding = AgentFindingSchema(
                agent_name=agent_name,
                issue_title="Missing Docker keyword",
                severity=SeverityEnum.HIGH,
                evidence_from_resume="No mention of containerization",
                reason_for_rejection="Job requires Docker containers",
                suggested_fix="Highlight Docker usage in projects",
                confidence=0.95,
                requires_user_input=False
            )
            return AgentAuditOutput(
                agent_name=agent_name,
                findings=[finding],
                category_score=75,
                summary=f"Audit completed by {agent_name} with 1 finding."
            )

    service = LLMService(mock_provider=MockEvaluatorLLM())
    agent = TechnicalRejectionAgent()
    result = await agent.evaluate("Experienced engineer...", "Looking for Docker...", service)
    
    assert result.agent_name == "Technical Rejection Agent"
    assert result.category_score == 75
    assert len(result.findings) == 1
    assert result.findings[0].issue_title == "Missing Docker keyword"
    assert result.findings[0].agent_name == "Technical Rejection Agent"

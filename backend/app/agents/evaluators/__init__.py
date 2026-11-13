"""Seven specialized adversarial rejection agents in strict execution order."""
from typing import List
from app.agents.evaluators.base import BaseRejectionAgent
from app.agents.evaluators.ats import ATSRejectionAgent
from app.agents.evaluators.recruiter import RecruiterRejectionAgent
from app.agents.evaluators.technical import TechnicalRejectionAgent
from app.agents.evaluators.experience import ExperienceRejectionAgent
from app.agents.evaluators.formatting import FormattingRejectionAgent
from app.agents.evaluators.credibility import CredibilityRejectionAgent
from app.agents.evaluators.job_match import JobMatchRejectionAgent


def get_sequential_agents() -> List[BaseRejectionAgent]:
    """Return all seven agents in their mandatory sequential execution order."""
    return [
        ATSRejectionAgent(),
        RecruiterRejectionAgent(),
        TechnicalRejectionAgent(),
        ExperienceRejectionAgent(),
        FormattingRejectionAgent(),
        CredibilityRejectionAgent(),
        JobMatchRejectionAgent(),
    ]


__all__ = [
    "BaseRejectionAgent",
    "ATSRejectionAgent",
    "RecruiterRejectionAgent",
    "TechnicalRejectionAgent",
    "ExperienceRejectionAgent",
    "FormattingRejectionAgent",
    "CredibilityRejectionAgent",
    "JobMatchRejectionAgent",
    "get_sequential_agents",
]

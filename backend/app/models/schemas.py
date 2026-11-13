"""Pydantic request and response schemas for all platform endpoints."""
from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, field_validator


class SeverityEnum(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class SessionStatusEnum(str, Enum):
    CREATED = "created"
    READY = "ready"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class AgentExecutionStatusEnum(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    RETRYING = "retrying"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class InputTypeEnum(str, Enum):
    UPLOAD = "upload"
    PASTED = "pasted"


# --- Request Schemas ---

class ExperienceSubmitRequest(BaseModel):
    session_id: Optional[str] = None
    experience_text: str = Field(..., min_length=100, description="Pasted work experience, projects, education, and skills.")

    @field_validator("experience_text")
    @classmethod
    def validate_experience_text(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 100:
            raise ValueError("Experience text must be at least 100 characters.")
        return stripped


class JobDescriptionSubmitRequest(BaseModel):
    session_id: str = Field(..., description="Active audit session ID.")
    job_description_text: str = Field(..., min_length=50, description="Target job description text.")
    title: Optional[str] = Field(None, max_length=150)
    company: Optional[str] = Field(None, max_length=150)

    @field_validator("job_description_text")
    @classmethod
    def validate_jd_text(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 50:
            raise ValueError("Job description text must be at least 50 characters.")
        return stripped


# --- Response Schemas ---

class SessionCreateResponse(BaseModel):
    session_id: str
    status: SessionStatusEnum
    created_at: str


class CandidateInputResponse(BaseModel):
    session_id: str
    input_type: InputTypeEnum
    filename: Optional[str] = None
    char_count: int
    word_count: int
    sections_found: List[str]
    preview_text: str


class JobDescriptionResponse(BaseModel):
    session_id: str
    title: Optional[str] = None
    company: Optional[str] = None
    char_count: int
    word_count: int
    detected_skills: List[str]
    preview_text: str


class AgentExecutionState(BaseModel):
    agent_name: str
    execution_order: int
    status: AgentExecutionStatusEnum
    attempt_count: int = 0
    latency_ms: int = 0
    category_score: Optional[int] = None
    findings_count: int = 0
    summary: Optional[str] = None
    error_msg: Optional[str] = None


class SessionStatusResponse(BaseModel):
    session_id: str
    status: SessionStatusEnum
    candidate_input_type: Optional[InputTypeEnum] = None
    candidate_name: Optional[str] = None
    has_resume: bool
    has_job_description: bool
    current_agent: Optional[str] = None
    agents: Dict[str, AgentExecutionState] = Field(default_factory=dict)


class AgentFindingSchema(BaseModel):
    id: Optional[str] = None
    agent_name: str
    issue_title: str
    severity: SeverityEnum
    evidence_from_resume: str
    reason_for_rejection: str
    suggested_fix: str
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    requires_user_input: bool = False


class AgentAuditOutput(BaseModel):
    agent_name: str
    findings: List[AgentFindingSchema]
    category_score: int = Field(ge=0, le=100)
    summary: str


class AuditReportResponse(BaseModel):
    session_id: str
    overall_score: int
    findings_count: int
    category_scores: Dict[str, int]
    findings: List[AgentFindingSchema]
    failed_reviews: List[str] = Field(default_factory=list)


class FactualChangeItem(BaseModel):
    original_text: str
    revised_text: str
    reason: str
    source_evidence: str
    factual_claims_added_or_changed: List[str] = Field(default_factory=list)
    requires_user_confirmation: bool = False


class RewriteResponse(BaseModel):
    session_id: str
    version: int
    improved_markdown: str
    change_set: List[FactualChangeItem]
    passed_gate: bool


class VerificationResultResponse(BaseModel):
    session_id: str
    passed_gate: bool
    verified_claims: List[str]
    unsupported_claims: List[str]
    resolved_findings_count: int
    unresolved_findings_count: int
    new_findings_count: int
    notes: Optional[str] = None


class DeleteSessionResponse(BaseModel):
    session_id: str
    status: str
    message: str

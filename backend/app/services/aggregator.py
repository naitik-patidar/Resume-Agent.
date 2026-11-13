"""Rejection aggregator for deduplicating, clustering, and scoring multi-agent findings."""
import re
from typing import Dict, List, Set, Tuple
from app.models.schemas import (
    AgentFindingSchema,
    AuditReportResponse,
    SeverityEnum,
)


SEVERITY_ORDER = {
    SeverityEnum.CRITICAL: 1,
    SeverityEnum.HIGH: 2,
    SeverityEnum.MEDIUM: 3,
    SeverityEnum.LOW: 4,
}

# Category weights for explainable overall score (out of 100)
CATEGORY_WEIGHTS = {
    "ATS Rejection Agent": 0.15,
    "Recruiter Rejection Agent": 0.15,
    "Technical Rejection Agent": 0.20,
    "Experience Rejection Agent": 0.20,
    "Formatting Rejection Agent": 0.10,
    "Credibility Rejection Agent": 0.10,
    "Job Match Rejection Agent": 0.10,
}


def normalize_title(title: str) -> str:
    """Normalize finding title for duplicate clustering."""
    cleaned = re.sub(r"[^\w\s]", "", title.lower())
    # Keep key words
    words = [w for w in cleaned.split() if len(w) > 3]
    return " ".join(sorted(words[:4]))


def deduplicate_and_cluster(findings: List[AgentFindingSchema]) -> List[AgentFindingSchema]:
    """Cluster duplicate findings across agents while preserving agent attribution and evidence."""
    seen_keys: Dict[str, AgentFindingSchema] = {}
    deduped: List[AgentFindingSchema] = []

    for finding in findings:
        norm_key = normalize_title(finding.issue_title)
        
        # Check if already seen similar issue
        if norm_key and norm_key in seen_keys:
            existing = seen_keys[norm_key]
            # Merge agent attribution if not already present
            if finding.agent_name not in existing.agent_name:
                existing.agent_name = f"{existing.agent_name}, {finding.agent_name}"
            # Upgrade severity if the new finding is more severe
            if SEVERITY_ORDER[finding.severity] < SEVERITY_ORDER[existing.severity]:
                existing.severity = finding.severity
            # Append additional evidence quote if distinct
            if finding.evidence_from_resume and finding.evidence_from_resume not in existing.evidence_from_resume:
                existing.evidence_from_resume += f" | {finding.evidence_from_resume}"
        else:
            if norm_key:
                seen_keys[norm_key] = finding
            deduped.append(finding)

    # Sort by severity (Critical first), then confidence
    deduped.sort(key=lambda f: (SEVERITY_ORDER.get(f.severity, 5), -f.confidence))
    return deduped


def calculate_overall_score(category_scores: Dict[str, int]) -> int:
    """Compute weighted explainable score out of 100 based on completed reviews."""
    if not category_scores:
        return 0

    total_weight = 0.0
    weighted_sum = 0.0

    for agent_name, score in category_scores.items():
        weight = CATEGORY_WEIGHTS.get(agent_name, 0.14)
        weighted_sum += score * weight
        total_weight += weight

    if total_weight == 0:
        return 0

    # Scale back to 100 based on evaluated categories
    return int(round(weighted_sum / total_weight))


def build_audit_report(
    session_id: str,
    raw_findings: List[AgentFindingSchema],
    category_scores: Dict[str, int],
    failed_agents: List[str],
) -> AuditReportResponse:
    """Aggregate all agent findings, deduplicate, compute score, and produce final report."""
    deduped_findings = deduplicate_and_cluster(raw_findings)
    overall_score = calculate_overall_score(category_scores)

    return AuditReportResponse(
        session_id=session_id,
        overall_score=overall_score,
        findings_count=len(deduped_findings),
        category_scores=category_scores,
        findings=deduped_findings,
        failed_reviews=failed_agents,
    )

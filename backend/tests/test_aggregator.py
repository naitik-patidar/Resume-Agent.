"""Unit tests for Rejection Aggregator deduplication, clustering, and scoring."""
from app.models.schemas import AgentFindingSchema, SeverityEnum
from app.services.aggregator import (
    calculate_overall_score,
    deduplicate_and_cluster,
    build_audit_report,
)


def test_deduplicate_and_cluster_merges_duplicate_findings():
    f1 = AgentFindingSchema(
        agent_name="ATS Rejection Agent",
        issue_title="Missing PostgreSQL Database Keyword",
        severity=SeverityEnum.HIGH,
        evidence_from_resume="Postgres not found",
        reason_for_rejection="ATS keyword mismatch",
        suggested_fix="Add PostgreSQL to skills",
        confidence=0.9,
    )
    f2 = AgentFindingSchema(
        agent_name="Job Match Rejection Agent",
        issue_title="Missing PostgreSQL Database Keyword",
        severity=SeverityEnum.CRITICAL,
        evidence_from_resume="Job requires PostgreSQL",
        reason_for_rejection="Missing core requirement",
        suggested_fix="Highlight relational database experience",
        confidence=0.95,
    )
    f3 = AgentFindingSchema(
        agent_name="Formatting Rejection Agent",
        issue_title="Inconsistent Date Formats",
        severity=SeverityEnum.MEDIUM,
        evidence_from_resume="06/2021 vs June 2021",
        reason_for_rejection="Formatting clash",
        suggested_fix="Standardize dates",
        confidence=0.85,
    )

    clustered = deduplicate_and_cluster([f1, f2, f3])
    # The two PostgreSQL findings should be merged into one
    assert len(clustered) == 2

    postgres_finding = next(f for f in clustered if "PostgreSQL" in f.issue_title)
    # Severity should be upgraded to CRITICAL
    assert postgres_finding.severity == SeverityEnum.CRITICAL
    # Both agents should be attributed
    assert "ATS Rejection Agent" in postgres_finding.agent_name
    assert "Job Match Rejection Agent" in postgres_finding.agent_name

    # Check ordering: CRITICAL must come before MEDIUM
    assert clustered[0].severity == SeverityEnum.CRITICAL
    assert clustered[1].severity == SeverityEnum.MEDIUM


def test_calculate_overall_score():
    category_scores = {
        "ATS Rejection Agent": 80,
        "Recruiter Rejection Agent": 70,
        "Technical Rejection Agent": 90,
        "Experience Rejection Agent": 85,
        "Formatting Rejection Agent": 95,
        "Credibility Rejection Agent": 100,
        "Job Match Rejection Agent": 60,
    }
    score = calculate_overall_score(category_scores)
    assert 75 <= score <= 85


def test_build_audit_report():
    f = AgentFindingSchema(
        agent_name="Recruiter Rejection Agent",
        issue_title="Cliché Summary",
        severity=SeverityEnum.LOW,
        evidence_from_resume="'Hard worker'",
        reason_for_rejection="Adds no value",
        suggested_fix="Show concrete achievements",
        confidence=0.8,
    )
    scores = {"Recruiter Rejection Agent": 70}
    report = build_audit_report("session-123", [f], scores, failed_agents=["ATS Rejection Agent"])

    assert report.session_id == "session-123"
    assert report.findings_count == 1
    assert report.overall_score == 70
    assert "ATS Rejection Agent" in report.failed_reviews

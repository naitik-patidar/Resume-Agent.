"""Unit tests for Factual Verification Engine and Release Gate."""
from app.models.schemas import FactualChangeItem
from app.services.verifier import (
    VerificationEngine,
    check_ownership_shifts,
    check_unsupported_metrics,
    extract_numeric_metrics,
)


def test_extract_numeric_metrics():
    text = "Improved latency by 35% and scaled cluster to 10k nodes, saving $500,000 annually with 99.99% uptime."
    metrics = extract_numeric_metrics(text)
    assert "35%" in metrics
    assert "99.99%" in metrics
    assert "$500,000" in metrics
    assert "10k" in metrics


def test_check_unsupported_metrics_detects_fabrication():
    original = "Worked on database optimization. Reduced latency."
    # Fabricated metric 40% not present in original
    revised = "Optimized database queries, reducing latency by 40%."
    discrepancies = check_unsupported_metrics(original, revised)
    assert len(discrepancies) == 1
    assert "40%" in discrepancies[0]


def test_check_unsupported_metrics_passes_when_supported():
    original = "Managed a cluster with 99.9% uptime and reduced costs by 25%."
    revised = "Maintained 99.9% uptime across production cluster and achieved 25% cost reduction."
    discrepancies = check_unsupported_metrics(original, revised)
    assert len(discrepancies) == 0


def test_check_ownership_shifts_detects_inflation():
    change_set = [
        FactualChangeItem(
            original_text="Assisted the senior architect with API design.",
            revised_text="Architected enterprise REST APIs.",
            reason="Active voice",
            source_evidence="Assisted the senior architect with API design.",
            requires_user_confirmation=False,
        )
    ]
    shifts = check_ownership_shifts(change_set)
    assert len(shifts) == 1
    assert "Unverified ownership elevation" in shifts[0]


def test_verification_engine_release_gate_decision():
    orig_text = "Software Engineer. Built microservices in Go. Handled 5k req/sec."
    
    # 1. Honest rewrite with provenance
    honest_markdown = (
        "# John Doe\n\n"
        "## Experience\n"
        "- Engineered scalable microservices in Go handling 5k req/sec.\n"
    )
    honest_change_set = [
        FactualChangeItem(
            original_text="Built microservices in Go. Handled 5k req/sec.",
            revised_text="Engineered scalable microservices in Go handling 5k req/sec.",
            reason="Converted to impact verb",
            source_evidence="Built microservices in Go. Handled 5k req/sec.",
            requires_user_confirmation=False,
        )
    ]
    res_pass = VerificationEngine.verify(
        session_id="s1",
        original_candidate_text=orig_text,
        improved_markdown=honest_markdown,
        change_set=honest_change_set,
        original_findings_count=3,
    )
    assert res_pass.passed_gate is True
    assert len(res_pass.unsupported_claims) == 0

    # 2. Dishonest rewrite with fabricated 75% metric
    hallucinated_markdown = (
        "# John Doe\n\n"
        "## Experience\n"
        "- Engineered microservices in Go, increasing throughput by 75%.\n"
    )
    res_fail = VerificationEngine.verify(
        session_id="s2",
        original_candidate_text=orig_text,
        improved_markdown=hallucinated_markdown,
        change_set=honest_change_set,
        original_findings_count=3,
    )
    assert res_fail.passed_gate is False
    assert any("75%" in c for c in res_fail.unsupported_claims)

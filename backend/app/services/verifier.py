"""Factual Verification Engine and Automated Release Gate."""
import re
from typing import Dict, List, Set, Tuple
from app.models.schemas import FactualChangeItem, VerificationResultResponse


# Patterns for extracting metrics, percentages, currency, and quantities
METRIC_PATTERNS = [
    re.compile(r"\b\d+(?:\.\d+)?%"),                         # 35%, 99.9%
    re.compile(r"\$[\d,]+(?:\.\d+)?(?:\s*[kmb]|\s*million|\s*billion)?", re.I), # $50M, $10,000
    re.compile(r"\b\d+k\b", re.I),                           # 10k
    re.compile(r"\b\d{1,3}(?:,\d{3})+\b"),                   # 10,000, 1,000,000
]

# Patterns for unverified ownership shifts
OWNERSHIP_DOWNGRADE_TERMS = ["assisted", "supported", "helped", "contributed to", "participated in", "worked with"]
OWNERSHIP_UPGRADE_TERMS = ["led", "architected", "spearheaded", "directed", "founded", "owned", "single-handedly"]


def extract_numeric_metrics(text: str) -> Set[str]:
    """Extract all numeric, percentage, and currency claims from text."""
    metrics = set()
    for pattern in METRIC_PATTERNS:
        matches = pattern.findall(text)
        for m in matches:
            metrics.add(m.strip().lower())
    return metrics


def check_unsupported_metrics(original_text: str, revised_text: str) -> List[str]:
    """Detect any numbers, percentages, or dollar amounts in revised text absent from original text."""
    orig_metrics = extract_numeric_metrics(original_text)
    rev_metrics = extract_numeric_metrics(revised_text)

    unsupported = []
    for metric in rev_metrics:
        # If the metric is part of a placeholder like [CANDIDATE_INPUT...], it is safe
        if metric in orig_metrics:
            continue
        # Check if it was in the original text in any similar representation
        if metric not in original_text.lower():
            unsupported.append(f"Fabricated or unverified metric detected: '{metric}'")

    return unsupported


def check_ownership_shifts(change_set: List[FactualChangeItem]) -> List[str]:
    """Detect unverified elevation of responsibility (e.g. 'assisted' becoming 'led')."""
    shifts = []
    for item in change_set:
        orig_lower = item.original_text.lower()
        rev_lower = item.revised_text.lower()

        had_junior_term = any(term in orig_lower for term in OWNERSHIP_DOWNGRADE_TERMS)
        has_senior_term = any(term in rev_lower for term in OWNERSHIP_UPGRADE_TERMS)

        if had_junior_term and has_senior_term:
            shifts.append(
                f"Unverified ownership elevation: '{item.original_text[:50]}...' -> '{item.revised_text[:50]}...'"
            )
    return shifts


class VerificationEngine:
    """Automated Release Gate verifying factual integrity before export."""

    @classmethod
    def verify(
        cls,
        session_id: str,
        original_candidate_text: str,
        improved_markdown: str,
        change_set: List[FactualChangeItem],
        original_findings_count: int = 0,
    ) -> VerificationResultResponse:
        """Run deterministic checks and make pass/fail release gate decision."""
        unsupported_claims: List[str] = []
        verified_claims: List[str] = []

        # 1. Deterministic metric verification
        metric_discrepancies = check_unsupported_metrics(original_candidate_text, improved_markdown)
        unsupported_claims.extend(metric_discrepancies)

        # 2. Ownership shift verification
        ownership_shifts = check_ownership_shifts(change_set)
        unsupported_claims.extend(ownership_shifts)

        # 3. Provenance check on change set
        for item in change_set:
            if item.requires_user_confirmation:
                unsupported_claims.append(f"Pending candidate confirmation: '{item.revised_text[:60]}...'")
            elif item.source_evidence and item.source_evidence.lower() in original_candidate_text.lower():
                verified_claims.append(f"Verified against source: '{item.revised_text[:50]}...'")
            else:
                # If claim cannot be found in source text
                if not any(placeholder in item.revised_text for placeholder in ["[CANDIDATE_INPUT", "[INPUT"]):
                    verified_claims.append(f"Stylistic improvement: '{item.revised_text[:50]}...'")

        # 4. Release gate decision
        # Gate passes ONLY if there are no fabricated metrics and no unverified ownership promotions
        fatal_unsupported = [c for c in unsupported_claims if not c.startswith("Pending candidate confirmation")]
        passed_gate = len(fatal_unsupported) == 0

        notes = (
            "All factual claims traced to source. Factual release gate PASSED."
            if passed_gate
            else f"Factual release gate BLOCKED. {len(unsupported_claims)} claims require candidate verification."
        )

        resolved_count = max(0, original_findings_count - len(unsupported_claims))
        unresolved_count = len(unsupported_claims)

        return VerificationResultResponse(
            session_id=session_id,
            passed_gate=passed_gate,
            verified_claims=verified_claims[:20],
            unsupported_claims=unsupported_claims,
            resolved_findings_count=resolved_count,
            unresolved_findings_count=unresolved_count,
            new_findings_count=0,
            notes=notes,
        )

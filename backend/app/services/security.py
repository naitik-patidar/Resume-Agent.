"""Layered security defense: prompt injection screening, delimiter escaping, and output verification."""
import re
from typing import List, Tuple
from pydantic import BaseModel


# Known prompt injection pattern heuristics
INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions?", re.I),
    re.compile(r"disregard\s+(all\s+)?(previous|prior|above)", re.I),
    re.compile(r"system\s+override", re.I),
    re.compile(r"you\s+are\s+now\s+(a|an|in)\b", re.I),
    re.compile(r"act\s+as\s+(a|an|the)\b", re.I),
    re.compile(r"\bdeveloper\s+mode\b", re.I),
    re.compile(r"\bjailbreak\b", re.I),
    re.compile(r"output\s+(the\s+)?(system|initial|above)\s+prompt", re.I),
    re.compile(r"repeat\s+(the\s+)?(instructions|prompt)\s+above", re.I),
    re.compile(r"do\s+not\s+(audit|reject|analyze)", re.I),
    re.compile(r"give\s+(this\s+resume\s+)?(a\s+)?100(/100)?", re.I),
    re.compile(r"mark\s+(as\s+)?(perfect|verified|flawless)", re.I),
]

# Sensitive boundary delimiters that attacker text must never mimic
RESERVED_TAGS = [
    "candidate_resume",
    "job_description",
    "system",
    "prompt",
    "developer",
    "instructions",
]


class SecurityScanResult(BaseModel):
    is_safe: bool
    risk_score: float  # 0.0 (safe) to 1.0 (high injection probability)
    detected_patterns: List[str]
    neutralized_text: str


class PromptInjectionGuard:
    """Layered prompt injection defense providing input screening, tag escaping, and output verification."""

    @classmethod
    def sanitize_untrusted_input(cls, text: str) -> SecurityScanResult:
        """Screen and neutralize prompt injection attempts and delimiter escaping in untrusted text."""
        detected = []
        risk_score = 0.0

        # 1. Scan for injection phrases
        for pattern in INJECTION_PATTERNS:
            matches = pattern.findall(text)
            if matches:
                detected.append(pattern.pattern)
                risk_score += 0.35

        risk_score = min(1.0, risk_score)

        # 2. Neutralize XML delimiter breakouts (e.g. </candidate_resume>)
        neutralized = text
        for tag in RESERVED_TAGS:
            # Replace <tag>, </tag>, <tag ...> with safe bracketed notation
            open_pattern = re.compile(rf"<\s*{tag}\b[^>]*>", re.I)
            close_pattern = re.compile(rf"<\s*/\s*{tag}\s*>", re.I)

            if open_pattern.search(neutralized) or close_pattern.search(neutralized):
                detected.append(f"Delimiter escaping attempt: <{tag}>")
                risk_score = min(1.0, risk_score + 0.5)
                neutralized = open_pattern.sub(f"[{tag.upper()}_TEXT]", neutralized)
                neutralized = close_pattern.sub(f"[/{tag.upper()}_TEXT]", neutralized)

        # General tag escape for any other raw angle brackets
        neutralized = re.sub(r"<(/?[a-zA-Z0-9_\-]+)>", r"[\1]", neutralized)

        is_safe = risk_score < 0.7

        return SecurityScanResult(
            is_safe=is_safe,
            risk_score=risk_score,
            detected_patterns=detected,
            neutralized_text=neutralized,
        )

    @classmethod
    def verify_model_output(cls, output_text: str) -> Tuple[bool, List[str]]:
        """Screen LLM output to ensure no system instructions or prompt leakage occurred."""
        red_flags = []
        lower = output_text.lower()

        leak_indicators = [
            "system prompt",
            "strict fairness invariant",
            "security directive:",
            "untrusted data directive",
            "you are an applicant tracking system",
            "you are a veteran senior recruiter",
        ]

        for indicator in leak_indicators:
            if indicator in lower:
                red_flags.append(f"Potential prompt leakage detected: '{indicator}'")

        is_valid = len(red_flags) == 0
        return is_valid, red_flags

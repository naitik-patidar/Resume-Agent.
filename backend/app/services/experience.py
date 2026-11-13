"""Handler for pasted professional experience input (Option 2)."""
import re
from typing import Dict, List, Tuple
from app.services.parser import detect_sections


def process_experience_text(text: str) -> Tuple[str, Dict[str, str], List[str]]:
    """Clean, normalize, and segment pasted professional experience text.
    
    The raw text is preserved as immutable source evidence, while sections
    are identified for structured agent analysis.
    """
    cleaned = re.sub(r"\r\n?", "\n", text).strip()
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    
    sections_map, detected_sections = detect_sections(cleaned)
    return cleaned, sections_map, detected_sections

"""Handler for manual job description submission."""
import re
from typing import List, Tuple, Optional


# Standard technical and functional competencies to detect for preview confirmation
COMMON_COMPETENCIES = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", "C++", "C#", "Go", "Rust",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
    "Git", "CI/CD", "REST APIs", "GraphQL", "Microservices", "FastAPI", "Django", "Flask",
    "Machine Learning", "Deep Learning", "Data Engineering", "TensorFlow", "PyTorch",
    "Agile", "Scrum", "DevOps", "System Design", "Leadership", "Product Management"
]


def detect_competencies(text: str) -> List[str]:
    """Identify key competencies and keywords mentioned in the job description."""
    found = []
    lower_text = text.lower()
    for competency in COMMON_COMPETENCIES:
        # Use word boundaries; escape special regex characters like + or .
        pattern = r"\b" + re.escape(competency.lower()) + r"\b"
        if re.search(pattern, lower_text):
            found.append(competency)
    return found


def process_job_description(
    text: str,
    title: Optional[str] = None,
    company: Optional[str] = None
) -> Tuple[str, List[str]]:
    """Clean job description text and extract detected competencies for preview."""
    cleaned = re.sub(r"\r\n?", "\n", text).strip()
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    
    detected = detect_competencies(cleaned)
    return cleaned, detected

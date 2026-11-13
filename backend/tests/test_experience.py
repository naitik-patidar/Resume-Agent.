"""Unit tests for pasted professional experience processing."""
from app.services.experience import process_experience_text


def test_process_experience_text_normalizes_and_detects():
    raw_input = (
        "Samantha Ray\r\n"
        "samantha@example.com | 555-0199\r\n\r\n"
        "Summary\r\n"
        "Lead Infrastructure Engineer with 8 years of cloud automation experience.\r\n\r\n"
        "Work Experience\r\n"
        "Lead DevOps Engineer at MegaCorp (2020 - Present)\r\n"
        "- Automated Kubernetes deployments using ArgoCD\r\n"
        "- Reduced cloud spend by 22% across multi-region AWS infrastructure\r\n\r\n"
        "Education\r\n"
        "M.S. in Computer Engineering, Stanford University\r\n\r\n"
        "Skills\r\n"
        "Kubernetes, Terraform, AWS, Python, Golang, CI/CD\r\n"
    )

    clean_text, sections_map, detected = process_experience_text(raw_input)

    assert "\r" not in clean_text
    assert "Summary" in detected
    assert "Experience" in detected
    assert "Education" in detected
    assert "Skills" in detected
    assert "ArgoCD" in sections_map["Experience"]
    assert "Stanford" in sections_map["Education"]

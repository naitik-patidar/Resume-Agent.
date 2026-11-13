"""Unit tests for job description text processing and competency detection."""
from app.services.job import process_job_description, detect_competencies


def test_detect_competencies():
    jd_text = (
        "We are looking for a Senior Backend Engineer to join our platform team. "
        "You will design scalable REST APIs with Python and FastAPI, manage PostgreSQL "
        "databases, and deploy containerized services using Docker and Kubernetes on AWS. "
        "Experience with Redis caching and CI/CD pipelines is strongly preferred."
    )
    detected = detect_competencies(jd_text)
    assert "Python" in detected
    assert "FastAPI" in detected
    assert "PostgreSQL" in detected
    assert "Docker" in detected
    assert "Kubernetes" in detected
    assert "AWS" in detected
    assert "Redis" in detected
    assert "CI/CD" in detected
    assert "REST APIs" in detected


def test_process_job_description_cleans_and_extracts():
    jd_raw = (
        "Role: Staff Platform Engineer\r\n\r\n\r\n"
        "Requirements:\r\n"
        "- 5+ years building backend systems in Go or Python\r\n"
        "- In-depth knowledge of Kubernetes and Microservices\r\n"
        "- Experience with PostgreSQL and System Design\r\n"
    )
    cleaned, skills = process_job_description(jd_raw, title="Staff Platform Engineer", company="Acme Corp")
    assert "\r" not in cleaned
    assert "Python" in skills
    assert "Go" in skills
    assert "Kubernetes" in skills
    assert "PostgreSQL" in skills
    assert "System Design" in skills

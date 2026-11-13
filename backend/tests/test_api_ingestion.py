"""Integration tests for candidate input, job description, status, and deletion APIs."""
import pytest
from httpx import AsyncClient
from tests.test_parser import create_sample_pdf, create_sample_docx


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_upload_resume_pdf(client: AsyncClient):
    pdf_bytes = create_sample_pdf()
    files = {"file": ("my_resume.pdf", pdf_bytes, "application/pdf")}
    
    response = await client.post("/api/resume/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["input_type"] == "upload"
    assert data["filename"] == "my_resume.pdf"
    assert data["char_count"] > 100
    assert "Experience" in data["sections_found"]
    assert "Alex Rivera" in data["preview_text"]
    session_id = data["session_id"]

    # Verify status is 'created' before job description is added
    status_resp = await client.get(f"/api/resume/status/{session_id}")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert status_data["status"] == "created"
    assert status_data["has_resume"] is True
    assert status_data["has_job_description"] is False


@pytest.mark.asyncio
async def test_upload_resume_invalid_format(client: AsyncClient):
    files = {"file": ("resume.txt", b"plain text is not supported as file upload", "text/plain")}
    response = await client.post("/api/resume/upload", files=files)
    assert response.status_code == 415
    assert "Unsupported format" in response.json()["detail"]


@pytest.mark.asyncio
async def test_submit_pasted_experience(client: AsyncClient):
    experience_text = (
        "Sarah Connor - Systems Architect\n"
        "sarah@skynet-defense.com | (555) 321-4321\n\n"
        "Summary\n"
        "Battle-tested systems engineer specializing in defensive cyber security and infrastructure hardening.\n\n"
        "Work Experience\n"
        "Principal Architect at Cyberdyne Resistance (2021 - Present)\n"
        "- Hardened Linux kernel security configurations preventing zero-day breaches\n"
        "- Designed fault-tolerant offline backup clusters with zero data loss\n\n"
        "Skills\n"
        "Linux, C++, Python, Cryptography, Network Security, Docker\n"
    )
    payload = {"experience_text": experience_text}
    response = await client.post("/api/experience/submit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["input_type"] == "pasted"
    assert data["filename"] == "pasted_experience.txt"
    assert "Experience" in data["sections_found"]
    assert "Sarah Connor" in data["preview_text"]
    session_id = data["session_id"]

    # Check status
    status_resp = await client.get(f"/api/resume/status/{session_id}")
    assert status_resp.status_code == 200
    assert status_resp.json()["has_resume"] is True


@pytest.mark.asyncio
async def test_submit_job_description_and_readiness(client: AsyncClient):
    # 1. First upload a resume
    docx_bytes = create_sample_docx()
    files = {"file": ("developer.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    upload_resp = await client.post("/api/resume/upload", files=files)
    session_id = upload_resp.json()["session_id"]

    # 2. Submit target job description
    jd_payload = {
        "session_id": session_id,
        "title": "Full Stack Engineer",
        "company": "NextGen Labs",
        "job_description_text": (
            "We are seeking an experienced Full Stack Engineer proficient in React, "
            "TypeScript, and Python. You will architect robust REST APIs, maintain PostgreSQL "
            "databases, and deploy containerized services on AWS."
        )
    }
    jd_resp = await client.post("/api/job-description/submit", json=jd_payload)
    assert jd_resp.status_code == 200
    jd_data = jd_resp.json()
    assert jd_data["title"] == "Full Stack Engineer"
    assert "React" in jd_data["detected_skills"]
    assert "Python" in jd_data["detected_skills"]

    # 3. Check status: session should now be 'ready'
    status_resp = await client.get(f"/api/resume/status/{session_id}")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert status_data["status"] == "ready"
    assert status_data["has_resume"] is True
    assert status_data["has_job_description"] is True


@pytest.mark.asyncio
async def test_submit_job_description_non_existent_session(client: AsyncClient):
    payload = {
        "session_id": "non-existent-uuid",
        "job_description_text": "Looking for a Python developer with FastAPI and Docker experience."
    }
    response = await client.post("/api/job-description/submit", json=payload)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_session(client: AsyncClient):
    # Create session via experience
    exp_payload = {
        "experience_text": (
            "Alex Smith\n"
            "Summary\nDedicated software engineer with a track record of reliable delivery.\n"
            "Experience\nSoftware Engineer at StartupCorp\n- Implemented backend services in Python and SQL\n"
            "Education\nB.S. in CS, University of Washington\n"
        )
    }
    exp_resp = await client.post("/api/experience/submit", json=exp_payload)
    session_id = exp_resp.json()["session_id"]

    # Delete session
    del_resp = await client.post(f"/api/resume/delete/{session_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "deleted"

    # Verify session is gone (404)
    status_resp = await client.get(f"/api/resume/status/{session_id}")
    assert status_resp.status_code == 404

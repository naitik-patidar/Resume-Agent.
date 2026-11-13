"""API routes for manual job description submission."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
import aiosqlite

from app.db.session import get_db
from app.models.schemas import JobDescriptionResponse, JobDescriptionSubmitRequest, SessionStatusEnum
from app.services.job import process_job_description


router = APIRouter()


@router.post("/submit", response_model=JobDescriptionResponse, summary="Submit target job description")
async def submit_job_description(
    payload: JobDescriptionSubmitRequest,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Ingest the target job description pasted manually by the user.
    
    Treats the user-provided text as the authoritative job description,
    extracts key competencies for review, and marks the session 'ready'
    if candidate information is already present.
    """
    sid = payload.session_id

    # Verify session exists
    cursor = await db.execute("SELECT id, status FROM audit_sessions WHERE id = ?", (sid,))
    session = await cursor.fetchone()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{sid}' does not exist. Please upload a resume or paste experience first."
        )

    clean_text, detected_skills = process_job_description(
        payload.job_description_text,
        title=payload.title,
        company=payload.company
    )

    jd_id = str(uuid.uuid4())
    words = len(clean_text.split())
    chars = len(clean_text)

    # Insert or update job description
    await db.execute("DELETE FROM job_descriptions WHERE session_id = ?", (sid,))
    await db.execute(
        """INSERT INTO job_descriptions (id, session_id, raw_text, title, company, char_count, word_count)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (jd_id, sid, clean_text, payload.title, payload.company, chars, words)
    )

    # Check if candidate input exists; if so, update status to 'ready'
    input_cursor = await db.execute("SELECT id FROM candidate_inputs WHERE session_id = ?", (sid,))
    has_input = await input_cursor.fetchone()
    if has_input:
        await db.execute(
            "UPDATE audit_sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (SessionStatusEnum.READY.value, sid)
        )

    await db.commit()

    preview = clean_text[:400] + ("..." if len(clean_text) > 400 else "")

    return JobDescriptionResponse(
        session_id=sid,
        title=payload.title,
        company=payload.company,
        char_count=chars,
        word_count=words,
        detected_skills=detected_skills,
        preview_text=preview
    )

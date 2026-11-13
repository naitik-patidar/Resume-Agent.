"""API routes for pasted professional experience submission (Option 2)."""
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
import aiosqlite

from app.db.session import get_db
from app.models.schemas import (
    CandidateInputResponse,
    ExperienceSubmitRequest,
    InputTypeEnum,
    SessionStatusEnum,
)
from app.services.experience import process_experience_text


router = APIRouter()


@router.post("/submit", response_model=CandidateInputResponse, summary="Submit pasted professional experience")
async def submit_experience(
    payload: ExperienceSubmitRequest,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Ingest candidate experience pasted directly by the user.
    
    Preserves raw submitted text as immutable source evidence, segments
    standard resume sections, and initializes or updates the audit session.
    """
    raw_text, sections_map, detected_sections = process_experience_text(payload.experience_text)

    sid = payload.session_id or str(uuid.uuid4())
    input_id = str(uuid.uuid4())
    words = len(raw_text.split())
    chars = len(raw_text)

    # Check if session exists; if not, create it
    cursor = await db.execute("SELECT id FROM audit_sessions WHERE id = ?", (sid,))
    existing_session = await cursor.fetchone()
    if not existing_session:
        await db.execute(
            """INSERT INTO audit_sessions (id, status, candidate_input_type, updated_at)
               VALUES (?, ?, ?, CURRENT_TIMESTAMP)""",
            (sid, SessionStatusEnum.CREATED.value, InputTypeEnum.PASTED.value)
        )
    else:
        await db.execute(
            """UPDATE audit_sessions SET candidate_input_type = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?""",
            (InputTypeEnum.PASTED.value, sid)
        )

    # Check if job description already exists to determine if session is 'ready'
    jd_cursor = await db.execute("SELECT id FROM job_descriptions WHERE session_id = ?", (sid,))
    has_jd = await jd_cursor.fetchone()
    if has_jd:
        await db.execute("UPDATE audit_sessions SET status = ? WHERE id = ?", (SessionStatusEnum.READY.value, sid))

    # Persist or update candidate_inputs
    await db.execute("DELETE FROM candidate_inputs WHERE session_id = ?", (sid,))
    await db.execute(
        """INSERT INTO candidate_inputs
           (id, session_id, input_type, filename, file_type, raw_text, sections_json, char_count, word_count)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            input_id,
            sid,
            InputTypeEnum.PASTED.value,
            "pasted_experience.txt",
            "text",
            raw_text,
            json.dumps(sections_map),
            chars,
            words
        )
    )
    await db.commit()

    preview = raw_text[:500] + ("..." if len(raw_text) > 500 else "")

    return CandidateInputResponse(
        session_id=sid,
        input_type=InputTypeEnum.PASTED,
        filename="pasted_experience.txt",
        char_count=chars,
        word_count=words,
        sections_found=detected_sections,
        preview_text=preview
    )

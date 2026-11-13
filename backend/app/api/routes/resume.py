"""API routes for resume upload and session deletion."""
import json
import shutil
import uuid
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
import aiosqlite

from app.config import settings
from app.db.session import get_db
from app.models.schemas import CandidateInputResponse, DeleteSessionResponse, InputTypeEnum, SessionStatusEnum
from app.services.parser import parse_document, DocumentParsingError


router = APIRouter()


@router.post("/upload", response_model=CandidateInputResponse, summary="Upload a PDF or DOCX resume")
async def upload_resume(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
    db: aiosqlite.Connection = Depends(get_db)
):
    """Upload and parse a candidate resume file (PDF or DOCX).
    
    Extracts text locally using PyMuPDF / python-docx, detects key resume sections,
    and initializes or updates the audit session.
    """
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file uploaded.")

    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported format '{ext}'. Only .pdf and .docx are supported."
        )

    # Read bytes with file size guard
    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_BYTES // (1024 * 1024)}MB."
        )

    # Local parsing
    try:
        raw_text, sections_map, detected_sections = parse_document(contents, file.filename)
    except DocumentParsingError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))

    sid = session_id or str(uuid.uuid4())
    input_id = str(uuid.uuid4())
    words = len(raw_text.split())
    chars = len(raw_text)

    # Save file safely to disk
    session_upload_dir = settings.UPLOAD_DIR / sid
    session_upload_dir.mkdir(parents=True, exist_ok=True)
    # Sanitize filename (alphanumeric, dots, dashes, underscores)
    safe_name = "".join(c for c in file.filename if c.isalnum() or c in "._-")
    saved_file_path = session_upload_dir / safe_name
    saved_file_path.write_bytes(contents)

    # Check if session exists; if not, create it
    cursor = await db.execute("SELECT id FROM audit_sessions WHERE id = ?", (sid,))
    existing_session = await cursor.fetchone()
    if not existing_session:
        await db.execute(
            """INSERT INTO audit_sessions (id, status, candidate_input_type, updated_at)
               VALUES (?, ?, ?, CURRENT_TIMESTAMP)""",
            (sid, SessionStatusEnum.CREATED.value, InputTypeEnum.UPLOAD.value)
        )
    else:
        await db.execute(
            """UPDATE audit_sessions SET candidate_input_type = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?""",
            (InputTypeEnum.UPLOAD.value, sid)
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
            InputTypeEnum.UPLOAD.value,
            safe_name,
            ext.lstrip("."),
            raw_text,
            json.dumps(sections_map),
            chars,
            words
        )
    )
    await db.commit()

    # Create short preview (first 500 chars)
    preview = raw_text[:500] + ("..." if len(raw_text) > 500 else "")

    return CandidateInputResponse(
        session_id=sid,
        input_type=InputTypeEnum.UPLOAD,
        filename=safe_name,
        char_count=chars,
        word_count=words,
        sections_found=detected_sections,
        preview_text=preview
    )


@router.post("/delete/{session_id}", response_model=DeleteSessionResponse, summary="Delete session and purge data")
async def delete_session(session_id: str, db: aiosqlite.Connection = Depends(get_db)):
    """Purge all data, database records, and uploaded files for a session."""
    # Delete from database
    await db.execute("DELETE FROM audit_sessions WHERE id = ?", (session_id,))
    await db.commit()

    # Remove files from uploads and generated directories
    upload_path = settings.UPLOAD_DIR / session_id
    if upload_path.exists():
        shutil.rmtree(upload_path, ignore_errors=True)

    generated_path = settings.GENERATED_DIR / session_id
    if generated_path.exists():
        shutil.rmtree(generated_path, ignore_errors=True)

    return DeleteSessionResponse(
        session_id=session_id,
        status="deleted",
        message="Session and all associated candidate data were permanently purged."
    )

"""API routes for downloading verified ATS-compliant DOCX and executive PDF resumes."""
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
import aiosqlite

from app.db.session import get_db
from app.services.docgen import generate_docx, generate_pdf


router = APIRouter()


@router.get("/download/{session_id}", summary="Download improved resume in DOCX or PDF format")
async def download_resume(
    session_id: str,
    format: str = Query("pdf", pattern="^(pdf|docx)$", description="Export format: 'pdf' or 'docx'"),
    db: aiosqlite.Connection = Depends(get_db)
):
    """Download the improved resume as a PDF or DOCX file.
    
    CRITICAL: Enforces the Factual Release Gate. Exports are blocked if any
    unverified or fabricated claims remain unconfirmed.
    """
    # 1. Fetch rewritten resume
    rw_cur = await db.execute("SELECT markdown_text FROM rewritten_resumes WHERE session_id = ?", (session_id,))
    rw_row = await rw_cur.fetchone()
    if not rw_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No rewritten resume exists for this session. Run rewrite first."
        )

    # 2. Check Factual Release Gate status
    v_cur = await db.execute("SELECT passed_gate, release_decision_notes FROM verification_results WHERE session_id = ?", (session_id,))
    v_row = await v_cur.fetchone()
    if not v_row or not v_row["passed_gate"]:
        notes = v_row["release_decision_notes"] if v_row else "Verification pending."
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Export blocked by Factual Integrity Release Gate: {notes}"
        )

    markdown_text = rw_row["markdown_text"]

    # 3. Fetch candidate name for clean filename
    s_cur = await db.execute("SELECT candidate_name FROM audit_sessions WHERE id = ?", (session_id,))
    s_row = await s_cur.fetchone()
    name = (s_row["candidate_name"] if s_row and s_row["candidate_name"] else "Candidate").replace(" ", "_")

    # 4. Generate document
    if format.lower() == "docx":
        docx_bytes = generate_docx(markdown_text)
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="Improved_Resume_{name}.docx"'
            }
        )
    else:
        pdf_bytes = generate_pdf(markdown_text)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="Improved_Resume_{name}.pdf"'
            }
        )

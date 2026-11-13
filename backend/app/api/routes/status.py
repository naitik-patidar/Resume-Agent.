"""API routes for session status tracking and execution observability."""
from fastapi import APIRouter, Depends, HTTPException, status
import aiosqlite

from app.db.session import get_db
from app.models.schemas import (
    AgentExecutionState,
    AgentExecutionStatusEnum,
    InputTypeEnum,
    SessionStatusEnum,
    SessionStatusResponse,
)


router = APIRouter()


@router.get("/status/{session_id}", response_model=SessionStatusResponse, summary="Get session status and agent execution states")
async def get_session_status(session_id: str, db: aiosqlite.Connection = Depends(get_db)):
    """Fetch real-time status of the audit session and sequential agent execution states.
    
    Returns backend-driven statuses: queued, running, retrying, completed, failed, or skipped.
    """
    cursor = await db.execute(
        "SELECT id, status, candidate_input_type, candidate_name FROM audit_sessions WHERE id = ?",
        (session_id,)
    )
    session_row = await cursor.fetchone()
    if not session_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )

    # Check candidate input presence
    input_cursor = await db.execute("SELECT id FROM candidate_inputs WHERE session_id = ?", (session_id,))
    has_input = await input_cursor.fetchone() is not None

    # Check job description presence
    jd_cursor = await db.execute("SELECT id FROM job_descriptions WHERE session_id = ?", (session_id,))
    has_jd = await jd_cursor.fetchone() is not None

    # Query agent executions
    exec_cursor = await db.execute(
        """SELECT ae.agent_name, ae.execution_order, ae.status, ae.attempt_count,
                  ae.latency_ms, ae.category_score, ae.summary, ae.error_msg,
                  COUNT(af.id) as findings_count
           FROM agent_executions ae
           LEFT JOIN agent_findings af ON ae.id = af.execution_id
           WHERE ae.session_id = ?
           GROUP BY ae.id
           ORDER BY ae.execution_order ASC""",
        (session_id,)
    )
    exec_rows = await exec_cursor.fetchall()

    agent_states = {}
    current_agent = None

    for r in exec_rows:
        state = AgentExecutionState(
            agent_name=r["agent_name"],
            execution_order=r["execution_order"],
            status=AgentExecutionStatusEnum(r["status"]),
            attempt_count=r["attempt_count"] or 0,
            latency_ms=r["latency_ms"] or 0,
            category_score=r["category_score"],
            findings_count=r["findings_count"] or 0,
            summary=r["summary"],
            error_msg=r["error_msg"]
        )
        agent_states[r["agent_name"]] = state
        if r["status"] == "running":
            current_agent = r["agent_name"]

    raw_input_type = session_row["candidate_input_type"]
    input_type = InputTypeEnum(raw_input_type) if raw_input_type else None

    return SessionStatusResponse(
        session_id=session_row["id"],
        status=SessionStatusEnum(session_row["status"]),
        candidate_input_type=input_type,
        candidate_name=session_row["candidate_name"],
        has_resume=has_input,
        has_job_description=has_jd,
        current_agent=current_agent,
        agents=agent_states
    )

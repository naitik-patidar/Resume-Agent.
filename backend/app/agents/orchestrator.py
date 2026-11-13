"""Sequential Seven-Agent Orchestrator."""
import logging
import time
import uuid
from typing import Optional
import aiosqlite

from app.agents.evaluators import get_sequential_agents
from app.models.schemas import AgentExecutionStatusEnum, SessionStatusEnum
from app.services.aggregator import build_audit_report
from app.services.llm.client import LLMService, get_llm_service

logger = logging.getLogger("platform.orchestrator")


async def run_sequential_audit(
    session_id: str,
    db: aiosqlite.Connection,
    llm_service: Optional[LLMService] = None,
) -> None:
    """Execute the seven review agents sequentially, one at a time, persisting state at each step.
    
    Mandatory order:
    1. ATS Rejection Agent
    2. Recruiter Rejection Agent
    3. Technical Rejection Agent
    4. Experience Rejection Agent
    5. Formatting Rejection Agent
    6. Credibility Rejection Agent
    7. Job Match Rejection Agent
    """
    service = llm_service or get_llm_service()

    # 1. Load candidate input and job description
    c_cursor = await db.execute("SELECT raw_text FROM candidate_inputs WHERE session_id = ?", (session_id,))
    candidate_row = await c_cursor.fetchone()
    if not candidate_row:
        logger.error(f"Cannot run audit: No candidate input for session {session_id}")
        await db.execute("UPDATE audit_sessions SET status = ? WHERE id = ?", (SessionStatusEnum.FAILED.value, session_id))
        await db.commit()
        return

    jd_cursor = await db.execute("SELECT raw_text FROM job_descriptions WHERE session_id = ?", (session_id,))
    jd_row = await jd_cursor.fetchone()
    if not jd_row:
        logger.error(f"Cannot run audit: No job description for session {session_id}")
        await db.execute("UPDATE audit_sessions SET status = ? WHERE id = ?", (SessionStatusEnum.FAILED.value, session_id))
        await db.commit()
        return

    candidate_text = candidate_row["raw_text"]
    job_description_text = jd_row["raw_text"]

    # 2. Mark session status as running
    await db.execute(
        "UPDATE audit_sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (SessionStatusEnum.RUNNING.value, session_id)
    )

    agents = get_sequential_agents()

    # 3. Initialize agent execution records as 'queued'
    await db.execute("DELETE FROM agent_executions WHERE session_id = ?", (session_id,))
    await db.execute("DELETE FROM agent_findings WHERE session_id = ?", (session_id,))

    for agent in agents:
        exec_id = str(uuid.uuid4())
        await db.execute(
            """INSERT INTO agent_executions
               (id, session_id, agent_name, execution_order, status)
               VALUES (?, ?, ?, ?, ?)""",
            (exec_id, session_id, agent.name, agent.execution_order, AgentExecutionStatusEnum.QUEUED.value)
        )
    await db.commit()

    completed_count = 0
    category_scores = {}
    failed_agents = []

    # 4. Execute agents one-by-one in strict sequence
    for agent in agents:
        logger.info(f"Starting sequential execution of '{agent.name}' (Step {agent.execution_order}/7)")
        start_time = time.monotonic()

        # Update status to 'running'
        await db.execute(
            """UPDATE agent_executions
               SET status = ?, started_at = CURRENT_TIMESTAMP
               WHERE session_id = ? AND agent_name = ?""",
            (AgentExecutionStatusEnum.RUNNING.value, session_id, agent.name)
        )
        await db.commit()

        # Query execution id
        e_cur = await db.execute(
            "SELECT id FROM agent_executions WHERE session_id = ? AND agent_name = ?",
            (session_id, agent.name)
        )
        exec_row = await e_cur.fetchone()
        execution_id = exec_row["id"] if exec_row else str(uuid.uuid4())

        try:
            audit_output = await agent.evaluate(candidate_text, job_description_text, service)
            latency_ms = int((time.monotonic() - start_time) * 1000)

            # Persist findings for this agent
            for finding in audit_output.findings:
                fid = str(uuid.uuid4())
                await db.execute(
                    """INSERT INTO agent_findings
                       (id, session_id, execution_id, agent_name, issue_title, severity,
                        evidence_from_resume, reason_for_rejection, suggested_fix, confidence, requires_user_input)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        fid,
                        session_id,
                        execution_id,
                        agent.name,
                        finding.issue_title,
                        finding.severity.value,
                        finding.evidence_from_resume,
                        finding.reason_for_rejection,
                        finding.suggested_fix,
                        finding.confidence,
                        1 if finding.requires_user_input else 0
                    )
                )

            # Update execution state to completed
            await db.execute(
                """UPDATE agent_executions
                   SET status = ?, attempt_count = 1, latency_ms = ?,
                       category_score = ?, summary = ?, completed_at = CURRENT_TIMESTAMP
                   WHERE id = ?""",
                (
                    AgentExecutionStatusEnum.COMPLETED.value,
                    latency_ms,
                    audit_output.category_score,
                    audit_output.summary,
                    execution_id
                )
            )
            category_scores[agent.name] = audit_output.category_score
            completed_count += 1
            await db.commit()
            logger.info(f"Agent '{agent.name}' completed in {latency_ms}ms with {len(audit_output.findings)} findings.")

        except Exception as exc:
            latency_ms = int((time.monotonic() - start_time) * 1000)
            err_msg = str(exc)
            logger.error(f"Agent '{agent.name}' failed after {latency_ms}ms: {err_msg}")
            failed_agents.append(agent.name)

            # Update execution state to failed
            await db.execute(
                """UPDATE agent_executions
                   SET status = ?, latency_ms = ?, error_msg = ?, completed_at = CURRENT_TIMESTAMP
                   WHERE id = ?""",
                (AgentExecutionStatusEnum.FAILED.value, latency_ms, err_msg, execution_id)
            )
            await db.commit()
            # Crucial: Proceed to next agent in sequence rather than crashing the pipeline

    # 5. Finalize session status
    final_status = SessionStatusEnum.COMPLETED.value if completed_count > 0 else SessionStatusEnum.FAILED.value
    await db.execute(
        "UPDATE audit_sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (final_status, session_id)
    )
    await db.commit()
    logger.info(f"Sequential audit for session {session_id} finished with status '{final_status}'. ({completed_count}/7 succeeded)")


async def run_next_agent_step(
    session_id: str,
    db: aiosqlite.Connection,
    llm_service: Optional[LLMService] = None,
) -> bool:
    """Execute the next queued agent in sequence. Returns True if an agent was executed, False otherwise."""
    # Check session
    s_cur = await db.execute(
        "SELECT status, llm_provider, llm_model, api_key_override FROM audit_sessions WHERE id = ?",
        (session_id,)
    )
    session = await s_cur.fetchone()
    if not session or session["status"] not in (SessionStatusEnum.RUNNING.value, SessionStatusEnum.READY.value, "started"):
        return False

    # Check if an agent is currently running
    r_cur = await db.execute(
        "SELECT id, agent_name FROM agent_executions WHERE session_id = ? AND status = ?",
        (session_id, AgentExecutionStatusEnum.RUNNING.value)
    )
    running_agent = await r_cur.fetchone()
    if running_agent:
        return False

    # Find next queued agent
    q_cur = await db.execute(
        "SELECT id, agent_name, execution_order FROM agent_executions WHERE session_id = ? AND status = ? ORDER BY execution_order ASC LIMIT 1",
        (session_id, AgentExecutionStatusEnum.QUEUED.value)
    )
    next_exec = await q_cur.fetchone()
    if not next_exec:
        # Check if all completed
        f_cur = await db.execute(
            "SELECT count(*) as total, sum(case when status = 'completed' then 1 else 0 end) as completed FROM agent_executions WHERE session_id = ?",
            (session_id,)
        )
        counts = await f_cur.fetchone()
        if counts and counts["total"] > 0:
            final_status = SessionStatusEnum.COMPLETED.value if counts["completed"] > 0 else SessionStatusEnum.FAILED.value
            await db.execute("UPDATE audit_sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (final_status, session_id))
            await db.commit()
        return False

    # Resolve LLM Service
    if not llm_service:
        prov = session["llm_provider"]
        model = session["llm_model"]
        key = session["api_key_override"]
        if key:
            llm_service = LLMService(
                provider=prov,
                gemini_api_key=key if (prov == "gemini" or not prov) else None,
                gemini_model=model if prov == "gemini" else None,
                openai_api_key=key if prov == "openai" else None,
                openai_model=model if prov == "openai" else None,
            )
        else:
            llm_service = get_llm_service()

    # Load candidate and job text
    c_cursor = await db.execute("SELECT raw_text FROM candidate_inputs WHERE session_id = ?", (session_id,))
    c_row = await c_cursor.fetchone()
    j_cursor = await db.execute("SELECT raw_text FROM job_descriptions WHERE session_id = ?", (session_id,))
    j_row = await j_cursor.fetchone()
    if not c_row or not j_row:
        return False

    candidate_text = c_row["raw_text"]
    job_description_text = j_row["raw_text"]

    agent_name = next_exec["agent_name"]
    execution_id = next_exec["id"]

    agents = get_sequential_agents()
    target_agent = next((a for a in agents if a.name == agent_name), None)
    if not target_agent:
        return False

    start_time = time.monotonic()
    await db.execute(
        "UPDATE agent_executions SET status = ?, started_at = CURRENT_TIMESTAMP WHERE id = ?",
        (AgentExecutionStatusEnum.RUNNING.value, execution_id)
    )
    await db.commit()

    try:
        audit_output = await target_agent.evaluate(candidate_text, job_description_text, llm_service)
        latency_ms = int((time.monotonic() - start_time) * 1000)

        for finding in audit_output.findings:
            fid = str(uuid.uuid4())
            await db.execute(
                """INSERT INTO agent_findings
                   (id, session_id, execution_id, agent_name, issue_title, severity,
                    evidence_from_resume, reason_for_rejection, suggested_fix, confidence, requires_user_input)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    fid, session_id, execution_id, target_agent.name, finding.issue_title,
                    finding.severity.value, finding.evidence_from_resume, finding.reason_for_rejection,
                    finding.suggested_fix, finding.confidence, 1 if finding.requires_user_input else 0
                )
            )

        await db.execute(
            """UPDATE agent_executions
               SET status = ?, attempt_count = 1, latency_ms = ?,
                   category_score = ?, summary = ?, completed_at = CURRENT_TIMESTAMP
               WHERE id = ?""",
            (AgentExecutionStatusEnum.COMPLETED.value, latency_ms, audit_output.category_score, audit_output.summary, execution_id)
        )
        await db.commit()
    except Exception as exc:
        latency_ms = int((time.monotonic() - start_time) * 1000)
        await db.execute(
            """UPDATE agent_executions
               SET status = ?, latency_ms = ?, error_msg = ?, completed_at = CURRENT_TIMESTAMP
               WHERE id = ?""",
            (AgentExecutionStatusEnum.FAILED.value, latency_ms, str(exc), execution_id)
        )
        await db.commit()

    # Check if this was the final queued agent
    rem_cur = await db.execute(
        "SELECT count(*) as queued FROM agent_executions WHERE session_id = ? AND status = ?",
        (session_id, AgentExecutionStatusEnum.QUEUED.value)
    )
    rem_row = await rem_cur.fetchone()
    if rem_row and rem_row["queued"] == 0:
        await db.execute(
            "UPDATE audit_sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (SessionStatusEnum.COMPLETED.value, session_id)
        )
        await db.commit()

    return True

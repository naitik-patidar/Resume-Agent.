"""Unit tests for sequential agent orchestration and fault isolation."""
import uuid
import pytest
import aiosqlite

from app.agents.orchestrator import run_sequential_audit
from app.config import settings
from app.models.schemas import (
    AgentAuditOutput,
    AgentExecutionStatusEnum,
    AgentFindingSchema,
    InputTypeEnum,
    SessionStatusEnum,
    SeverityEnum,
)
from app.services.llm.client import LLMService


class OrderTrackingMockLLM:
    """Mock LLM that logs the exact order of agent calls."""
    def __init__(self, fail_agent: str = None):
        self.call_order = []
        self.fail_agent = fail_agent

    async def generate_structured(self, system_prompt, user_prompt, response_model, agent_name):
        self.call_order.append(agent_name)
        if self.fail_agent and agent_name == self.fail_agent:
            raise RuntimeError(f"Simulated failure in {agent_name}")

        finding = AgentFindingSchema(
            agent_name=agent_name,
            issue_title=f"Sample defect found by {agent_name}",
            severity=SeverityEnum.MEDIUM,
            evidence_from_resume="Evidence quote",
            reason_for_rejection="Standard objection",
            suggested_fix="Fix advice",
            confidence=0.9,
        )
        return AgentAuditOutput(
            agent_name=agent_name,
            findings=[finding],
            category_score=85,
            summary=f"Audit completed by {agent_name}"
        )


@pytest.mark.asyncio
async def test_sequential_audit_strict_order_and_persistence(tmp_path):
    sid = str(uuid.uuid4())
    mock_llm = OrderTrackingMockLLM()
    llm_service = LLMService(mock_provider=mock_llm)

    async with aiosqlite.connect(settings.DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        await db.execute("PRAGMA foreign_keys = ON;")

        # Setup session, candidate input, and job description
        await db.execute(
            "INSERT INTO audit_sessions (id, status, candidate_input_type) VALUES (?, ?, ?)",
            (sid, SessionStatusEnum.READY.value, InputTypeEnum.UPLOAD.value)
        )
        await db.execute(
            """INSERT INTO candidate_inputs
               (id, session_id, input_type, filename, raw_text, char_count, word_count)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (str(uuid.uuid4()), sid, "upload", "resume.pdf", "John Doe - Software Engineer...", 150, 20)
        )
        await db.execute(
            """INSERT INTO job_descriptions
               (id, session_id, raw_text, char_count, word_count)
               VALUES (?, ?, ?, ?, ?)""",
            (str(uuid.uuid4()), sid, "Senior Backend Engineer role requirements...", 100, 15)
        )
        await db.commit()

        # Run sequential audit
        await run_sequential_audit(sid, db, llm_service)

        # 1. Verify exact execution order of all 7 agents
        expected_order = [
            "ATS Rejection Agent",
            "Recruiter Rejection Agent",
            "Technical Rejection Agent",
            "Experience Rejection Agent",
            "Formatting Rejection Agent",
            "Credibility Rejection Agent",
            "Job Match Rejection Agent",
        ]
        assert mock_llm.call_order == expected_order

        # 2. Verify all 7 agents marked completed in SQLite
        cur = await db.execute("SELECT agent_name, status, category_score FROM agent_executions WHERE session_id = ? ORDER BY execution_order", (sid,))
        rows = await cur.fetchall()
        assert len(rows) == 7
        for r in rows:
            assert r["status"] == AgentExecutionStatusEnum.COMPLETED.value
            assert r["category_score"] == 85

        # 3. Verify session status is completed
        s_cur = await db.execute("SELECT status FROM audit_sessions WHERE id = ?", (sid,))
        s_row = await s_cur.fetchone()
        assert s_row["status"] == SessionStatusEnum.COMPLETED.value

        # 4. Verify 7 findings saved
        f_cur = await db.execute("SELECT COUNT(*) as count FROM agent_findings WHERE session_id = ?", (sid,))
        f_row = await f_cur.fetchone()
        assert f_row["count"] == 7


@pytest.mark.asyncio
async def test_sequential_audit_fault_isolation(tmp_path):
    """Ensure that if one agent fails, subsequent agents continue to run and complete."""
    sid = str(uuid.uuid4())
    # Simulate failure in Technical Rejection Agent (Agent 3)
    mock_llm = OrderTrackingMockLLM(fail_agent="Technical Rejection Agent")
    llm_service = LLMService(mock_provider=mock_llm)

    async with aiosqlite.connect(settings.DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        await db.execute("PRAGMA foreign_keys = ON;")

        await db.execute(
            "INSERT INTO audit_sessions (id, status, candidate_input_type) VALUES (?, ?, ?)",
            (sid, SessionStatusEnum.READY.value, InputTypeEnum.PASTED.value)
        )
        await db.execute(
            """INSERT INTO candidate_inputs
               (id, session_id, input_type, filename, raw_text, char_count, word_count)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (str(uuid.uuid4()), sid, "pasted", "pasted.txt", "Jane Doe - Full Stack Developer...", 150, 20)
        )
        await db.execute(
            """INSERT INTO job_descriptions
               (id, session_id, raw_text, char_count, word_count)
               VALUES (?, ?, ?, ?, ?)""",
            (str(uuid.uuid4()), sid, "Full Stack Developer requirements...", 100, 15)
        )
        await db.commit()

        await run_sequential_audit(sid, db, llm_service)

        # Verify all 7 agents were called in order
        assert len(mock_llm.call_order) == 7

        # Check Agent 3 failed
        cur = await db.execute("SELECT status, error_msg FROM agent_executions WHERE session_id = ? AND agent_name = ?", (sid, "Technical Rejection Agent"))
        r3 = await cur.fetchone()
        assert r3["status"] == AgentExecutionStatusEnum.FAILED.value
        assert "Simulated failure" in r3["error_msg"]

        # Check Agent 4 succeeded despite Agent 3's failure
        cur4 = await db.execute("SELECT status FROM agent_executions WHERE session_id = ? AND agent_name = ?", (sid, "Experience Rejection Agent"))
        r4 = await cur4.fetchone()
        assert r4["status"] == AgentExecutionStatusEnum.COMPLETED.value

        # Session should still be completed because 6 agents succeeded
        s_cur = await db.execute("SELECT status FROM audit_sessions WHERE id = ?", (sid,))
        s_row = await s_cur.fetchone()
        assert s_row["status"] == SessionStatusEnum.COMPLETED.value

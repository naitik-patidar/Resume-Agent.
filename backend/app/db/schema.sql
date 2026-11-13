-- SQLite Database Schema for AI Multi-Agent Resume Rejection & Improvement Platform
-- Reconciled with Version 4 Master Directives

CREATE TABLE IF NOT EXISTS audit_sessions (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'created', -- created, ready, running, completed, failed
    candidate_input_type TEXT, -- upload, pasted
    candidate_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS candidate_inputs (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    input_type TEXT NOT NULL, -- upload, pasted
    filename TEXT,
    file_type TEXT, -- pdf, docx, text
    raw_text TEXT NOT NULL,
    sections_json TEXT, -- JSON mapping of detected sections
    char_count INTEGER NOT NULL,
    word_count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES audit_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_descriptions (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    title TEXT,
    company TEXT,
    char_count INTEGER NOT NULL,
    word_count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES audit_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agent_executions (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    execution_order INTEGER NOT NULL, -- 1 to 7
    status TEXT NOT NULL DEFAULT 'queued', -- queued, running, retrying, completed, failed, skipped
    attempt_count INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    category_score INTEGER,
    summary TEXT,
    error_msg TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES audit_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agent_findings (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    execution_id TEXT,
    agent_name TEXT NOT NULL,
    issue_title TEXT NOT NULL,
    severity TEXT NOT NULL, -- Critical, High, Medium, Low
    evidence_from_resume TEXT NOT NULL,
    reason_for_rejection TEXT NOT NULL,
    suggested_fix TEXT NOT NULL,
    confidence REAL NOT NULL DEFAULT 1.0,
    requires_user_input BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES audit_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (execution_id) REFERENCES agent_executions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rewritten_resumes (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    content_json TEXT NOT NULL,
    markdown_text TEXT NOT NULL,
    change_set_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES audit_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_results (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    passed_gate BOOLEAN NOT NULL DEFAULT 0,
    verified_claims_json TEXT,
    unsupported_claims_json TEXT,
    resolved_findings_count INTEGER DEFAULT 0,
    unresolved_findings_count INTEGER DEFAULT 0,
    new_findings_count INTEGER DEFAULT 0,
    release_decision_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES audit_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_candidate_inputs_session ON candidate_inputs(session_id);
CREATE INDEX IF NOT EXISTS idx_job_descriptions_session ON job_descriptions(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_session ON agent_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_findings_session ON agent_findings(session_id);

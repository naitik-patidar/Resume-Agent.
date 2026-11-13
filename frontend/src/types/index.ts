export type SessionStatus = 'idle' | 'created' | 'running' | 'retrying' | 'completed' | 'failed';

export type AgentExecutionStatus = 'queued' | 'running' | 'retrying' | 'completed' | 'failed' | 'skipped';

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface AgentState {
  agent_name: string;
  status: AgentExecutionStatus;
  attempt_count: number;
  max_retries: number;
  retry_reason?: string | null;
  findings_count: number;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
}

export interface SessionStatusResponse {
  session_id: string;
  status: SessionStatus;
  created_at?: string;
  completed_at?: string | null;
  current_agent?: string | null;
  agents: Record<string, any> | AgentState[];
}

export interface AgentFinding {
  id?: string;
  agent_name: string;
  issue_title: string;
  severity: Severity;
  evidence_from_resume: string;
  reason_for_rejection: string;
  suggested_fix: string;
  confidence: number;
}

export interface AuditReport {
  session_id: string;
  overall_score: number;
  findings_count: number;
  severity_distribution: Record<string, number>;
  category_scores: Record<string, number>;
  findings: AgentFinding[];
  coverage_limitations?: string[];
}

export interface FactualChangeItem {
  original_text: string;
  revised_text: string;
  reason: string;
  source_evidence: string;
  factual_claims_added_or_changed: string[];
  requires_user_confirmation: boolean;
}

export interface RewriteResponse {
  session_id: string;
  version: number;
  improved_markdown: string;
  change_set: FactualChangeItem[];
  passed_gate: boolean;
}

export interface VerificationResult {
  session_id: string;
  passed_gate: boolean;
  verified_claims: string[];
  unsupported_claims: string[];
  resolved_findings_count: number;
  unresolved_findings_count: number;
  notes: string;
}

export interface CandidateData {
  sessionId: string;
  sourceType: 'upload' | 'pasted';
  candidateName: string;
  extractedText: string;
  wordCount: number;
  detectedSections?: string[];
}

export interface JobDescriptionData {
  title?: string;
  company?: string;
  rawText: string;
  wordCount: number;
  detectedCompetencies: string[];
}

import {
  AuditReport,
  RewriteResponse,
  SessionStatusResponse,
  VerificationResult,
} from '../types';

const API_BASE = '/api';

export interface ResumeUploadApiResponse {
  session_id: string;
  filename: string;
  preview_text: string;
  sections_found: string[];
  word_count: number;
  char_count: number;
}

export async function uploadResumeFile(file: File): Promise<ResumeUploadApiResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/resume/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to upload resume' }));
    throw new Error(err.detail || 'Resume upload failed');
  }

  const data = await res.json();
  return {
    session_id: data.session_id,
    filename: data.filename || file.name,
    preview_text: data.preview_text || '',
    sections_found: data.sections_found || [],
    word_count: data.word_count || 0,
    char_count: data.char_count || 0,
  };
}

export async function submitPastedExperience(text: string, candidateName?: string): Promise<{
  session_id: string;
  source_type: string;
  character_count: number;
  word_count: number;
  sections_found: string[];
  preview_text: string;
}> {
  const res = await fetch(`${API_BASE}/experience/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      experience_text: text,
      candidate_name: candidateName || 'Candidate',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to submit experience' }));
    throw new Error(err.detail || 'Experience submission failed');
  }

  const data = await res.json();
  return {
    session_id: data.session_id,
    source_type: data.input_type || 'pasted',
    character_count: data.char_count || text.length,
    word_count: data.word_count || text.split(/\s+/).length,
    sections_found: data.sections_found || [],
    preview_text: data.preview_text || text.slice(0, 500),
  };
}

export async function submitJobDescription(
  sessionId: string,
  jobDescriptionText: string,
  title?: string,
  company?: string
): Promise<{
  session_id: string;
  character_count: number;
  word_count: number;
  detected_competencies: string[];
  preview_text: string;
}> {
  const res = await fetch(`${API_BASE}/job-description/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      job_description_text: jobDescriptionText,
      title: title || undefined,
      company: company || undefined,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to submit job description' }));
    throw new Error(err.detail || 'Job description submission failed');
  }

  const data = await res.json();
  return {
    session_id: data.session_id,
    character_count: data.char_count || jobDescriptionText.length,
    word_count: data.word_count || jobDescriptionText.split(/\s+/).length,
    detected_competencies: data.detected_skills || data.detected_competencies || [],
    preview_text: data.preview_text || jobDescriptionText.slice(0, 400),
  };
}

export async function startAudit(sessionId: string): Promise<{
  session_id: string;
  status: string;
  message: string;
  agents_queued: string[];
}> {
  const res = await fetch(`${API_BASE}/resume/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to start audit' }));
    throw new Error(err.detail || 'Audit launch failed');
  }

  return res.json();
}

export async function getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
  const res = await fetch(`${API_BASE}/resume/status/${sessionId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch status' }));
    throw new Error(err.detail || 'Status check failed');
  }
  return res.json();
}

export async function getAuditReport(sessionId: string): Promise<AuditReport> {
  const res = await fetch(`${API_BASE}/resume/report/${sessionId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch report' }));
    throw new Error(err.detail || 'Report retrieval failed');
  }
  return res.json();
}

export async function rewriteResume(sessionId: string): Promise<RewriteResponse> {
  const res = await fetch(`${API_BASE}/resume/rewrite/${sessionId}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to generate rewrite' }));
    throw new Error(err.detail || 'Rewrite generation failed');
  }
  return res.json();
}

export async function verifyResume(sessionId: string): Promise<VerificationResult> {
  const res = await fetch(`${API_BASE}/resume/verify/${sessionId}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to verify resume' }));
    throw new Error(err.detail || 'Verification failed');
  }
  return res.json();
}

export async function downloadResumeFile(
  sessionId: string,
  format: 'pdf' | 'docx',
  candidateName = 'Candidate'
): Promise<void> {
  const res = await fetch(`${API_BASE}/resume/download/${sessionId}?format=${format}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Download failed' }));
    throw new Error(err.detail || 'Export blocked by Factual Release Gate');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = candidateName.replace(/\s+/g, '_');
  a.download = `Improved_Resume_${safeName}.${format}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function deleteSessionData(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/resume/delete/${sessionId}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to delete session' }));
    throw new Error(err.detail || 'Deletion failed');
  }
}

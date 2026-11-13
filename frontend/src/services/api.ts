import {
  AuditReport,
  RewriteResponse,
  SessionStatusResponse,
  UserSettings,
  VerificationResult,
  VerifyKeyResponse,
} from '../types';

const SETTINGS_STORAGE_KEY = 'ai_resume_user_settings';
const API_BASE_STORAGE_KEY = 'ai_resume_api_base_url';

export const DEFAULT_SETTINGS: UserSettings = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-2.5-flash',
  isVerified: false,
};

export function getUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function saveUserSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    if (settings.apiBaseUrl !== undefined) {
      if (settings.apiBaseUrl.trim()) {
        localStorage.setItem(API_BASE_STORAGE_KEY, settings.apiBaseUrl.trim());
      } else {
        localStorage.removeItem(API_BASE_STORAGE_KEY);
      }
    }
  } catch {
    // ignore
  }
}

export function clearUserSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getApiBase(): string {
  try {
    const custom = localStorage.getItem(API_BASE_STORAGE_KEY);
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  } catch {
    // ignore
  }
  const envBase = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envBase && typeof envBase === 'string' && envBase.trim()) {
    return envBase.trim().replace(/\/+$/, '');
  }
  return '/api';
}

export function getAuthHeaders(existingHeaders: Record<string, string> = {}): Record<string, string> {
  const settings = getUserSettings();
  const headers: Record<string, string> = { ...existingHeaders };

  if (settings.apiKey && settings.apiKey.trim()) {
    const key = settings.apiKey.trim();
    headers['X-Api-Key'] = key;
    if (settings.provider === 'gemini') {
      headers['X-Gemini-Api-Key'] = key;
    } else if (settings.provider === 'openai') {
      headers['X-OpenAI-Api-Key'] = key;
    }
  }

  if (settings.provider) {
    headers['X-LLM-Provider'] = settings.provider;
  }
  if (settings.model) {
    headers['X-LLM-Model'] = settings.model;
  }

  return headers;
}

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

  const res = await fetch(`${getApiBase()}/resume/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
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
  const res = await fetch(`${getApiBase()}/experience/submit`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
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
  const res = await fetch(`${getApiBase()}/job-description/submit`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
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
  const settings = getUserSettings();
  const res = await fetch(`${getApiBase()}/resume/analyze`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      session_id: sessionId,
      api_key: settings.apiKey || undefined,
      provider: settings.provider || undefined,
      model: settings.model || undefined,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to start audit' }));
    throw new Error(err.detail || 'Audit launch failed');
  }

  return res.json();
}

export async function stepAudit(sessionId: string): Promise<{ session_id: string; step_executed: boolean }> {
  const res = await fetch(`${getApiBase()}/resume/step/${sessionId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    return { session_id: sessionId, step_executed: false };
  }
  return res.json();
}

export async function getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
  const res = await fetch(`${getApiBase()}/resume/status/${sessionId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch status' }));
    throw new Error(err.detail || 'Status check failed');
  }
  return res.json();
}

export async function getAuditReport(sessionId: string): Promise<AuditReport> {
  const res = await fetch(`${getApiBase()}/resume/report/${sessionId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch report' }));
    throw new Error(err.detail || 'Report retrieval failed');
  }
  return res.json();
}

export async function rewriteResume(sessionId: string): Promise<RewriteResponse> {
  const res = await fetch(`${getApiBase()}/resume/rewrite/${sessionId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to generate rewrite' }));
    throw new Error(err.detail || 'Rewrite generation failed');
  }
  return res.json();
}

export async function verifyResume(sessionId: string): Promise<VerificationResult> {
  const res = await fetch(`${getApiBase()}/resume/verify/${sessionId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
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
  const res = await fetch(`${getApiBase()}/resume/download/${sessionId}?format=${format}`, {
    headers: getAuthHeaders(),
  });
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
  const res = await fetch(`${getApiBase()}/resume/delete/${sessionId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to delete session' }));
    throw new Error(err.detail || 'Deletion failed');
  }
}

export async function verifyApiKey(
  provider: string,
  apiKey: string,
  model?: string,
  baseUrl?: string
): Promise<VerifyKeyResponse> {
  const res = await fetch(`${getApiBase()}/llm/verify-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider,
      api_key: apiKey,
      model,
      base_url: baseUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to test API key' }));
    throw new Error(err.detail || 'API key verification request failed');
  }

  return res.json();
}

export async function fetchProviders(): Promise<any> {
  const res = await fetch(`${getApiBase()}/llm/providers`);
  if (!res.ok) {
    throw new Error('Failed to load supported model providers');
  }
  return res.json();
}

export async function testBackendHealth(urlOverride?: string): Promise<{ status: string; project?: string }> {
  const base = urlOverride ? urlOverride.replace(/\/+$/, '') : getApiBase();
  const res = await fetch(`${base}/health`, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Backend check failed with HTTP ${res.status}`);
  }
  return res.json();
}

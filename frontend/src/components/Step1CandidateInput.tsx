import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Clipboard, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { uploadResumeFile, submitPastedExperience } from '../services/api';
import { CandidateData } from '../types';

interface Step1CandidateInputProps {
  onCandidateSubmitted: (data: CandidateData) => void;
  onOpenLegal?: (tab?: 'terms' | 'privacy' | 'permissions' | 'cookies' | 'ai-ethics') => void;
}

export const Step1CandidateInput: React.FC<Step1CandidateInputProps> = ({ onCandidateSubmitted, onOpenLegal }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [candidateName, setCandidateName] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler
  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    if (!file.name.match(/\.(pdf|docx)$/i)) {
      setErrorMessage('Please upload a valid PDF or DOCX file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be 10MB or smaller.');
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await uploadResumeFile(file);
      onCandidateSubmitted({
        sessionId: resp.session_id,
        sourceType: 'upload',
        candidateName: candidateName.trim() || resp.filename.replace(/\.[^/.]+$/, ''),
        extractedText: resp.preview_text || '',
        wordCount: resp.word_count || 0,
        detectedSections: resp.sections_found || [],
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pasted Experience Handler
  const handlePastedSubmit = async () => {
    setErrorMessage(null);
    if (pastedText.trim().length < 100) {
      setErrorMessage('Please provide at least 100 characters detailing your experience, roles, and accomplishments.');
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await submitPastedExperience(pastedText, candidateName.trim() || 'Candidate');
      onCandidateSubmitted({
        sessionId: resp.session_id,
        sourceType: 'pasted',
        candidateName: candidateName.trim() || 'Candidate',
        extractedText: resp.preview_text || pastedText,
        wordCount: resp.word_count || pastedText.split(/\s+/).length,
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Intro Banner with Lavender Highlight Box Matching User Request */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#FEF08A] border-2 border-black text-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 of 6 • Candidate Input</span>
        </div>

        <div>
          {/* Lavender Highlighted Title Box (Exact match to screenshot 2) */}
          <div className="inline-block bg-[#C9B7F5] border-2 border-black rounded-xl px-5 py-2 shadow-[3px_3px_0px_0px_#000]">
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Submit Candidate Profile
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-xl mx-auto">
          Upload your existing resume file or paste your raw career experience. Seven specialized hiring agents will scrutinize it to find every legitimate rejection objection.
        </p>
      </div>

      {/* Candidate Name Input Card */}
      <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000]">
        <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
          Candidate Full Name (Optional)
        </label>
        <input
          type="text"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          placeholder="e.g. Alex Morgan"
          className="w-full bg-[#FAF6F0] border-2 border-black rounded-xl px-4 py-2.5 text-sm text-black placeholder-slate-400 font-medium focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000] transition-all"
        />
      </div>

      {/* Tabs: Option 1 vs Option 2 (Styled to match website UI, no harsh blue!) */}
      <div className="bg-white border-2 border-black rounded-2xl p-1.5 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => { setActiveTab('upload'); setErrorMessage(null); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === 'upload'
              ? 'bg-[#C9B7F5] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
              : 'bg-transparent text-slate-700 hover:text-black hover:bg-slate-100'
          }`}
        >
          <UploadCloud className="w-4 h-4 text-black shrink-0" />
          <span>Option 1: Resume Upload (PDF / DOCX)</span>
        </button>
        <button
          onClick={() => { setActiveTab('paste'); setErrorMessage(null); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === 'paste'
              ? 'bg-[#C9B7F5] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
              : 'bg-transparent text-slate-700 hover:text-black hover:bg-slate-100'
          }`}
        >
          <Clipboard className="w-4 h-4 text-black shrink-0" />
          <span>Option 2: Paste Professional Experience</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#FFCCD5] border-2 border-black text-rose-950 text-xs sm:text-sm font-bold flex items-start space-x-3 shadow-[2px_2px_0px_0px_#000]">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-900 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Option 1: File Upload Zone */}
      {activeTab === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed border-black rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all ${
            dragActive
              ? 'bg-[#FFE2C8] scale-[1.01] shadow-[6px_6px_0px_0px_#000]'
              : 'bg-white hover:bg-[#FAF6F0] shadow-[5px_5px_0px_0px_#000]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF08A] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center text-black">
              {isSubmitting ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-base sm:text-lg font-black text-black">
                {isSubmitting ? 'Parsing resume with local engine...' : 'Drop your resume file here or click to browse'}
              </p>
              <p className="text-xs text-slate-600 font-medium">
                Supports ATS-standard PDF and DOCX (up to 10MB). Magic-byte validated locally.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-800 pt-2">
              <span className="flex items-center space-x-1.5 bg-[#FAF6F0] border border-black/30 px-3 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Zero Cloud Storage</span>
              </span>
              <span className="flex items-center space-x-1.5 bg-[#FAF6F0] border border-black/30 px-3 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Strict Anti-Prompt Injection</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Option 2: Pasted Experience */}
      {activeTab === 'paste' && (
        <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 space-y-4 shadow-[5px_5px_0px_0px_#000]">
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="font-black uppercase tracking-wider text-black">
              Paste Career Experience, Roles, Projects & Skills
            </span>
            <span className="font-mono font-bold">{pastedText.length} characters (min 100)</span>
          </div>

          <textarea
            rows={10}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Example:
Senior Backend Engineer at CloudScale Inc (2021 - Present)
- Designed microservices architecture processing 20M daily events using Python and Go.
- Led migration of legacy monolith to Kubernetes clusters, improving SLA from 99.5% to 99.95%.

Education:
B.S. in Computer Science, Georgia Tech (2017 - 2021)

Technical Skills:
Python, FastAPI, Docker, PostgreSQL, Redis, AWS"
            className="w-full bg-[#FAF6F0] border-2 border-black rounded-xl p-4 text-sm text-black placeholder-slate-400 focus:outline-none focus:bg-white font-mono shadow-[2px_2px_0px_0px_#000] resize-y"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-700 font-medium flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-black" />
              <span>Immutable candidate source record (truth baseline)</span>
            </div>

            <button
              onClick={handlePastedSubmit}
              disabled={isSubmitting || pastedText.trim().length < 100}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-black hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-black border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FEF08A]" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Save Experience & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* User Permission & Candidate Data Privacy Consent Box */}
      <div className="bg-[#FAF6F0] border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000] space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/20 pb-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-black uppercase tracking-wider text-black">
              Candidate Data Permission & Privacy Consent
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#DDF282] border border-black rounded text-[10px] font-black uppercase text-lime-950 w-fit">
            GDPR & CCPA Compliant
          </span>
        </div>

        <p className="text-xs text-slate-700 font-medium leading-relaxed">
          By uploading or submitting your resume text, you grant affirmative permission to parse and evaluate your career history exclusively for this audit session. 
          <strong> We never sell your personal information or train public AI foundation models on your resume.</strong> All processing is ephemeral and controlled by you.
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs font-bold text-slate-800">
          <button
            type="button"
            onClick={() => onOpenLegal?.('terms')}
            className="hover:text-black underline underline-offset-2 hover:decoration-2"
          >
            Terms of Service
          </button>
          <span className="text-slate-400">•</span>
          <button
            type="button"
            onClick={() => onOpenLegal?.('privacy')}
            className="hover:text-black underline underline-offset-2 hover:decoration-2"
          >
            Privacy Policy
          </button>
          <span className="text-slate-400">•</span>
          <button
            type="button"
            onClick={() => onOpenLegal?.('permissions')}
            className="hover:text-black underline underline-offset-2 hover:decoration-2"
          >
            User Permissions
          </button>
          <span className="text-slate-400">•</span>
          <button
            type="button"
            onClick={() => onOpenLegal?.('ai-ethics')}
            className="hover:text-black underline underline-offset-2 hover:decoration-2"
          >
            AI Fair Hiring Notice
          </button>
        </div>
      </div>
    </div>
  );
};

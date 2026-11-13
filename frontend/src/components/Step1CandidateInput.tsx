import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Clipboard, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { uploadResumeFile, submitPastedExperience } from '../services/api';
import { CandidateData } from '../types';

interface Step1CandidateInputProps {
  onCandidateSubmitted: (data: CandidateData) => void;
}

export const Step1CandidateInput: React.FC<Step1CandidateInputProps> = ({ onCandidateSubmitted }) => {
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
      {/* Intro Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 of 6 • Candidate Input</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Submit Candidate Profile
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Upload your existing resume file or paste your raw career experience. Seven specialized hiring agents will scrutinize it to find every legitimate rejection objection.
        </p>
      </div>

      {/* Candidate Name Input */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Candidate Full Name (Optional)
        </label>
        <input
          type="text"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          placeholder="e.g. Alex Morgan"
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Tabs: Option 1 vs Option 2 */}
      <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
        <button
          onClick={() => { setActiveTab('upload'); setErrorMessage(null); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'upload'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Option 1: Resume Upload (PDF / DOCX)</span>
        </button>
        <button
          onClick={() => { setActiveTab('paste'); setErrorMessage(null); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'paste'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clipboard className="w-4 h-4" />
          <span>Option 2: Paste Professional Experience</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
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
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
              : 'border-slate-700/80 hover:border-indigo-500/60 bg-slate-900/40 hover:bg-slate-900/70'
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
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              {isSubmitting ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-base font-semibold text-white">
                {isSubmitting ? 'Parsing resume with local engine...' : 'Drop your resume file here or click to browse'}
              </p>
              <p className="text-xs text-slate-400">
                Supports ATS-standard PDF and DOCX (up to 10MB). Magic-byte validated locally.
              </p>
            </div>

            <div className="flex items-center space-x-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Cloud Storage</span>
              </span>
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Strict Anti-Prompt Injection</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Option 2: Pasted Experience */}
      {activeTab === 'paste' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-slate-300">
              Paste Career Experience, Roles, Projects & Skills
            </span>
            <span>{pastedText.length} characters (min 100)</span>
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
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-mono transition-all resize-y"
          />

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Immutable candidate source record (truth baseline)</span>
            </div>

            <button
              onClick={handlePastedSubmit}
              disabled={isSubmitting || pastedText.trim().length < 100}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
    </div>
  );
};

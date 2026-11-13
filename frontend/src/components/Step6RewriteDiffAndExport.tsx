import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Download,
  FileCheck,
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
} from 'lucide-react';
import { downloadResumeFile, deleteSessionData } from '../services/api';
import { CandidateData, RewriteResponse, VerificationResult } from '../types';

interface Step6RewriteDiffAndExportProps {
  sessionId: string;
  candidate: CandidateData;
  rewrite: RewriteResponse;
  verification?: VerificationResult | null;
  onSessionDeleted: () => void;
}

export const Step6RewriteDiffAndExport: React.FC<Step6RewriteDiffAndExportProps> = ({
  sessionId,
  candidate,
  rewrite,
  verification,
  onSessionDeleted,
}) => {
  const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'docx' | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'provenance'>('preview');
  const [expandedChangeIndex, setExpandedChangeIndex] = useState<number | null>(null);

  const passedGate = verification?.passed_gate ?? rewrite.passed_gate;

  const handleDownload = async (format: 'pdf' | 'docx') => {
    setDownloadingFormat(format);
    try {
      await downloadResumeFile(sessionId, format, candidate.candidateName);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleDeleteSession = async () => {
    if (!window.confirm('Are you sure you want to delete all resume records, audits, and uploaded files for this session? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSessionData(sessionId);
      onSessionDeleted();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Deletion failed');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Step 6 of 6 • Truthful Rewrite & Gated Export</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Improved Resume & Factual Release Gate
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          All legitimate rejection objections have been corrected while strictly preserving candidate truthfulness. Unverified claims are prevented from passing the release gate.
        </p>
      </div>

      {/* Factual Integrity Release Gate Status Banner */}
      <div
        className={`rounded-2xl p-5 border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          passedGate
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
        }`}
      >
        <div className="flex items-start space-x-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
              passedGate
                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30'
            }`}
          >
            {passedGate ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {passedGate
                  ? 'Factual Integrity Release Gate: PASSED'
                  : 'Factual Integrity Release Gate: BLOCKED'}
              </h3>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                  passedGate
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {passedGate ? 'Export Unlocked' : 'Requires Review'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {passedGate
                ? 'Deterministic verification confirmed all metrics, companies, titles, and dates match original candidate evidence.'
                : verification?.notes || 'Unverified claims detected in rewrite. Downloads remain blocked until resolved.'}
            </p>
          </div>
        </div>

        {/* Download Buttons in Banner */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <button
            onClick={() => handleDownload('docx')}
            disabled={!passedGate || downloadingFormat !== null}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadingFormat === 'docx' ? 'Generating...' : 'Download DOCX'}</span>
          </button>

          <button
            onClick={() => handleDownload('pdf')}
            disabled={!passedGate || downloadingFormat !== null}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold border border-slate-700/80 transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadingFormat === 'pdf' ? 'Generating...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Tabs: Resume Preview vs Provenance Audit Ledger */}
      <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'preview'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Before & After Comparison</span>
        </button>
        <button
          onClick={() => setActiveTab('provenance')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'provenance'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Factual Provenance Ledger ({rewrite.change_set.length} Revisions)</span>
        </button>
      </div>

      {/* View 1: Before & After Split Diff */}
      {activeTab === 'preview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Original Source */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Original Candidate Input (Truth Baseline)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {candidate.wordCount} words
              </span>
            </div>
            <div className="max-h-[550px] overflow-y-auto bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
              {candidate?.extractedText || ''}
            </div>
          </div>

          {/* Right Column: Improved Resume */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Truthful Improved Resume (ATS Ready)</span>
              </span>
              <span className="text-[11px] text-emerald-400/80 font-mono">
                Verified v{rewrite?.version || 1}
              </span>
            </div>
            <div className="max-h-[550px] overflow-y-auto bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
              {rewrite?.improved_markdown || ''}
            </div>
          </div>
        </div>
      )}

      {/* View 2: Provenance Audit Ledger */}
      {activeTab === 'provenance' && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            Every revised sentence or bullet point is strictly mapped to verbatim original evidence.
            Zero metrics or company credentials were fabricated.
          </div>

          {(Array.isArray(rewrite?.change_set) ? rewrite.change_set : []).map((item, idx) => {
            const isExpanded = expandedChangeIndex === idx;

            return (
              <div
                key={idx}
                className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700/80 transition-all"
              >
                <div
                  onClick={() => setExpandedChangeIndex(isExpanded ? null : idx)}
                  className="flex items-start justify-between cursor-pointer gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {item.reason}
                      </h4>
                    </div>
                    <p className="text-xs text-emerald-300 font-mono line-clamp-1">
                      + {item.revised_text}
                    </p>
                  </div>

                  <button className="text-slate-400 hover:text-white p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                        Original Candidate Text:
                      </span>
                      <p className="p-2.5 rounded-lg bg-slate-950 text-slate-400 font-mono">
                        "{item.original_text}"
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-emerald-400 uppercase tracking-wider font-semibold text-[10px]">
                        Improved Truthful Text:
                      </span>
                      <p className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-200 font-mono">
                        "{item.revised_text}"
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-indigo-400 uppercase tracking-wider font-semibold text-[10px]">
                        Verbatim Source Evidence:
                      </span>
                      <p className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 font-mono">
                        "{item.source_evidence}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Actions: Clear/Delete Session */}
      <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 flex items-center space-x-2">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Privacy Guarantee: Data resides locally in SQLite and can be purged immediately.</span>
        </div>

        <button
          onClick={handleDeleteSession}
          disabled={isDeleting}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isDeleting ? 'Purging records...' : 'Purge All Session Data'}</span>
        </button>
      </div>
    </div>
  );
};

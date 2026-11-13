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
  Loader2,
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
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#FEF08A] border-2 border-black text-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Step 6 of 6 • Truthful Rewrite & Gated Export</span>
        </div>

        <div>
          <div className="inline-block bg-[#C9B7F5] border-2 border-black rounded-xl px-5 py-2 shadow-[3px_3px_0px_0px_#000]">
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Improved Resume & Factual Release Gate
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-xl mx-auto">
          All legitimate rejection objections have been corrected while strictly preserving candidate truthfulness. Unverified claims are prevented from passing the release gate.
        </p>
      </div>

      {/* Release Gate Status Banner */}
      <div
        className={`border-2 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          passedGate ? 'bg-[#DDF282]' : 'bg-[#FFCCD5]'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center shrink-0">
            {passedGate ? (
              <ShieldCheck className="w-6 h-6 text-emerald-800" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-rose-800" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-base text-black">
                {passedGate ? 'RELEASE GATE: PASSED (ZERO HALLUCINATIONS)' : 'RELEASE GATE: ATTENTION REQUIRED'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-black text-white text-[10px] font-black uppercase">
                v{rewrite.version}
              </span>
            </div>
            <p className="text-xs text-slate-800 font-medium mt-0.5">
              {passedGate
                ? 'All factual claims and revised metrics have been mathematically verified against your original ground truth resume.'
                : 'Some suggested statements could not be verified against the source text. Review the claim ledger below.'}
            </p>
          </div>
        </div>

        {/* Download Buttons Group */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <button
            onClick={() => handleDownload('pdf')}
            disabled={!passedGate || downloadingFormat !== null}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-black hover:bg-slate-800 disabled:opacity-50 text-white font-black text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            {downloadingFormat === 'pdf' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FEF08A]" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Export ATS PDF</span>
          </button>

          <button
            onClick={() => handleDownload('docx')}
            disabled={!passedGate || downloadingFormat !== null}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-[#FEF08A] hover:bg-yellow-200 disabled:opacity-50 text-black font-black text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            {downloadingFormat === 'docx' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
            ) : (
              <FileCheck className="w-3.5 h-3.5" />
            )}
            <span>Export DOCX</span>
          </button>
        </div>
      </div>

      {/* View Mode Toggle: Preview vs Provenance */}
      <div className="bg-white border-2 border-black rounded-2xl p-1.5 shadow-[4px_4px_0px_0px_#000] flex gap-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === 'preview'
              ? 'bg-[#C9B7F5] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
              : 'bg-transparent text-slate-700 hover:text-black hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4 text-black" />
          <span>Full Markdown Resume Preview</span>
        </button>

        <button
          onClick={() => setActiveTab('provenance')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === 'provenance'
              ? 'bg-[#C9B7F5] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
              : 'bg-transparent text-slate-700 hover:text-black hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>Line-by-Line Changes ({rewrite.change_set?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Full Markdown Document Preview */}
      {activeTab === 'preview' && (
        <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <span className="text-xs font-black uppercase tracking-wider text-black">
              Standardized ATS Markdown Format
            </span>
            <span className="text-xs text-slate-600 font-bold">
              Ready for immediate export or copy
            </span>
          </div>

          <div className="bg-[#FAF6F0] rounded-2xl p-6 border-2 border-black font-mono text-xs text-black leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto shadow-inner">
            {rewrite.improved_markdown}
          </div>
        </div>
      )}

      {/* Tab 2: Line-by-Line Provenance Diff */}
      {activeTab === 'provenance' && (
        <div className="space-y-4">
          {(rewrite.change_set || []).map((change, idx) => {
            const isExpanded = expandedChangeIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] space-y-3"
              >
                <div
                  onClick={() => setExpandedChangeIndex(isExpanded ? null : idx)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#FEF08A] border border-black font-mono text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-black">
                      {change.reason}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-black" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-black" />
                  )}
                </div>

                {/* Diff Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#FFCCD5]/50 border-2 border-black">
                    <span className="text-[10px] uppercase font-black tracking-wider text-rose-950 block mb-1">
                      Original Text:
                    </span>
                    <p className="font-mono text-slate-900 leading-relaxed">{change.original_text}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#DDF282]/50 border-2 border-black">
                    <span className="text-[10px] uppercase font-black tracking-wider text-emerald-950 block mb-1">
                      Truthful Revision:
                    </span>
                    <p className="font-mono text-black font-bold leading-relaxed">{change.revised_text}</p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-2 border-t border-black/10 text-xs space-y-2">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-600 block">
                        Source Evidence:
                      </span>
                      <p className="font-mono text-slate-800 bg-[#FAF6F0] p-2 rounded-lg border border-black/30 mt-0.5">
                        {change.source_evidence}
                      </p>
                    </div>

                    {change.factual_claims_added_or_changed?.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-600 block">
                          Claims Modified:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {change.factual_claims_added_or_changed.map((claim, cIdx) => (
                            <span key={cIdx} className="px-2 py-0.5 rounded bg-white border border-black text-[10px] font-bold text-black">
                              {claim}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Session Management & GDPR Wipe */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-black">Audit Complete & Saved</h4>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Your improved resume is ready. You can permanently wipe this session and all uploaded files anytime.
          </p>
        </div>

        <button
          onClick={handleDeleteSession}
          disabled={isDeleting}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#FFCCD5] hover:bg-rose-200 border-2 border-black text-rose-950 text-xs font-black shadow-[2px_2px_0px_0px_#000] transition-all"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-900" />
          <span>{isDeleting ? 'Wiping Session...' : 'Delete Session Data'}</span>
        </button>
      </div>
    </div>
  );
};

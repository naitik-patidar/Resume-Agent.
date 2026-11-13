import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Quote,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import { AuditReport, Severity } from '../types';

interface Step5RejectionReportProps {
  report: AuditReport;
  onProceedToRewrite: () => void;
  isRewriting: boolean;
}

export const Step5RejectionReport: React.FC<Step5RejectionReportProps> = ({
  report,
  onProceedToRewrite,
  isRewriting,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  const findingsList = Array.isArray(report?.findings) ? report.findings : [];
  const filteredFindings =
    selectedSeverity === 'ALL'
      ? findingsList
      : findingsList.filter(
          (f) => (f.severity || '').toUpperCase() === selectedSeverity.toUpperCase()
        );

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'Critical':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-[#FFCCD5] text-rose-950 border-2 border-black text-xs font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_#000]">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-900" />
            <span>Critical Rejection</span>
          </span>
        );
      case 'High':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-[#FFE2C8] text-amber-950 border-2 border-black text-xs font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_#000]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-900" />
            <span>High Risk</span>
          </span>
        );
      case 'Medium':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-[#FEF08A] text-yellow-950 border-2 border-black text-xs font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_#000]">
            <Info className="w-3.5 h-3.5 text-yellow-900" />
            <span>Medium Flaw</span>
          </span>
        );
      case 'Low':
        return (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-white text-slate-800 border-2 border-black text-xs font-bold uppercase tracking-wider">
            <span>Low Polish</span>
          </span>
        );
    }
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-[#DDF282] text-lime-950';
    if (score >= 60) return 'bg-[#FEF08A] text-yellow-950';
    return 'bg-[#FFCCD5] text-rose-950';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#FEF08A] border-2 border-black text-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Step 5 of 6 • Consolidated Rejection Report</span>
        </div>

        <div>
          <div className="inline-block bg-[#C9B7F5] border-2 border-black rounded-xl px-5 py-2 shadow-[3px_3px_0px_0px_#000]">
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Adversarial Audit Results
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-xl mx-auto">
          Every objection below represents a concrete hiring hurdle discovered by the 7 evaluator agents. These will be automatically fixed by the truthful rewriter agent.
        </p>
      </div>

      {/* Score and Dimensions Overview */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000] grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Score Ring */}
        <div className="flex flex-col items-center justify-center p-4 border-b lg:border-b-0 lg:border-r-2 border-black text-center space-y-2">
          <span className="text-xs uppercase tracking-wider font-black text-slate-700">
            Overall Committee Score
          </span>
          <div
            className={`w-28 h-28 rounded-full border-4 border-black flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_#000] ${getScoreBg(
              report.overall_score
            )}`}
          >
            <span className="text-4xl font-black leading-none font-mono">
              {report.overall_score}
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest mt-1">
              / 100
            </span>
          </div>
          <span className="text-xs font-bold text-slate-700">
            {report.overall_score >= 80 ? '✓ Committee Pass' : report.overall_score >= 60 ? '⚠ Needs Revision' : '✕ High Rejection Risk'}
          </span>
        </div>

        {/* Severity Distribution */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-black text-black uppercase tracking-wider">
            Objections by Severity ({report.findings_count} total)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-[#FFCCD5]/80 border-2 border-black text-center shadow-[2px_2px_0px_0px_#000]">
              <span className="text-2xl font-black text-rose-950 font-mono block">
                {report.severity_distribution?.Critical || 0}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-900">
                Critical
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FFE2C8]/80 border-2 border-black text-center shadow-[2px_2px_0px_0px_#000]">
              <span className="text-2xl font-black text-amber-950 font-mono block">
                {report.severity_distribution?.High || 0}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                High Risk
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FEF08A]/80 border-2 border-black text-center shadow-[2px_2px_0px_0px_#000]">
              <span className="text-2xl font-black text-yellow-950 font-mono block">
                {report.severity_distribution?.Medium || 0}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-yellow-900">
                Medium
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border-2 border-black text-center shadow-[2px_2px_0px_0px_#000]">
              <span className="text-2xl font-black text-slate-900 font-mono block">
                {report.severity_distribution?.Low || 0}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                Low Polish
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        {['ALL', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSelectedSeverity(sev)}
            className={`px-4 py-1.5 rounded-xl text-xs font-black border-2 border-black transition-all ${
              selectedSeverity === sev
                ? 'bg-[#C9B7F5] text-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-white text-slate-700 hover:text-black hover:bg-slate-100'
            }`}
          >
            {sev === 'ALL' ? `All Objections (${findingsList.length})` : sev}
          </button>
        ))}
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.length === 0 ? (
          <div className="text-center py-10 bg-white border-2 border-black rounded-3xl p-8 shadow-[4px_4px_0px_0px_#000]">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-base font-black text-black">No objections in this category</h3>
            <p className="text-xs text-slate-600 font-medium">Your resume passed this audit dimension cleanly.</p>
          </div>
        ) : (
          filteredFindings.map((finding, idx) => (
            <div
              key={finding.id || idx}
              className="bg-white border-2 border-black rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000] space-y-3.5"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b-2 border-black/10">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-black text-slate-500">#{idx + 1}</span>
                  <h4 className="text-base font-black text-black">{finding.issue_title}</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-600 bg-[#FAF6F0] px-2 py-0.5 rounded border border-black/30">
                    {finding.agent_name}
                  </span>
                  {getSeverityBadge(finding.severity)}
                </div>
              </div>

              {/* Evidence */}
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center space-x-1">
                  <Quote className="w-3 h-3 text-slate-500" />
                  <span>Flagged Resume Evidence:</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF6F0] border-2 border-black text-xs font-mono text-slate-900 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {finding.evidence_from_resume}
                </div>
              </div>

              {/* Rejection Reason */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-900 block">
                  Why Hiring Managers Reject This:
                </span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {finding.reason_for_rejection}
                </p>
              </div>

              {/* Suggested Fix */}
              <div className="p-3.5 rounded-xl bg-[#DDF282]/50 border-2 border-black flex items-start space-x-2.5">
                <Lightbulb className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-900 font-medium leading-relaxed">
                  <span className="font-black text-black block mb-0.5">Recommended Remedy:</span>
                  {finding.suggested_fix}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CTA: Proceed to Rewrite */}
      <div className="bg-[#FFE2C8] border-2 border-black rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[5px_5px_0px_0px_#000]">
        <div>
          <h3 className="text-base sm:text-lg font-black text-black">
            Ready to Neutralize All Rejection Objections?
          </h3>
          <p className="text-xs text-slate-800 font-medium mt-1">
            The Truthful Rewriter Agent will rewrite every flagged bullet with strict mathematical provenance.
          </p>
        </div>

        <button
          onClick={onProceedToRewrite}
          disabled={isRewriting}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl bg-black hover:bg-slate-800 text-white font-black text-sm border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
        >
          {isRewriting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#FEF08A]" />
              <span>Generating Provenance Rewrite...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#FEF08A]" />
              <span>Rewrite Resume with Provenance</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

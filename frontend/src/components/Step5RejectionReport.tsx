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
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Critical Rejection</span>
          </span>
        );
      case 'High':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>High Risk</span>
          </span>
        );
      case 'Medium':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider">
            <Info className="w-3.5 h-3.5" />
            <span>Medium Flaw</span>
          </span>
        );
      case 'Low':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 text-xs font-medium uppercase tracking-wider">
            <span>Low Polish</span>
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Step 5 of 6 • Consolidated Rejection Report</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Adversarial Audit Results
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Every objection below represents a concrete hiring hurdle discovered by the 7 evaluator agents. These will be automatically fixed by the truthful rewriter agent.
        </p>
      </div>

      {/* Score and Dimensions Overview */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Score Ring */}
        <div className="flex flex-col items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-slate-800 text-center space-y-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Overall Candidate Score
          </span>
          <div
            className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center shadow-lg ${getScoreColor(
              report.overall_score
            )}`}
          >
            <span className="text-4xl font-extrabold tracking-tight">
              {report.overall_score}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
              / 100
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {report.findings_count} total objections identified across 7 agents
          </p>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-2 space-y-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
            Category Dimension Scores
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.entries(report.category_scores || {}).map(([cat, score]) => (
              <div
                key={cat}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 space-y-1"
              >
                <div className="text-[11px] font-medium text-slate-400 truncate">
                  {cat.replace(' Rejection Agent', '')}
                </div>
                <div className="flex items-center justify-between">
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        score >= 80 ? 'bg-emerald-400' : score >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white">{score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => {
            const count =
              sev === 'ALL'
                ? report.findings.length
                : report.findings.filter((f) => f.severity.toUpperCase() === sev).length;

            return (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSeverity === sev
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev} ({count})
              </button>
            );
          })}
        </div>

        {/* Top CTA to proceed */}
        <button
          onClick={onProceedToRewrite}
          disabled={isRewriting}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-500 text-white text-sm font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isRewriting ? 'Generating Truthful Rewrite...' : 'Fix Objections with Truthful Rewriter'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.map((finding, idx) => (
          <div
            key={finding.id || idx}
            className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-3.5 shadow-lg hover:border-slate-700/80 transition-all"
          >
            {/* Finding Top Row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                {getSeverityBadge(finding.severity)}
                <span className="text-xs font-semibold text-slate-400 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/50">
                  {finding.agent_name}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Confidence: {Math.round(finding.confidence * 100)}%
              </span>
            </div>

            {/* Issue Title */}
            <h4 className="text-base font-bold text-white tracking-tight">
              {finding.issue_title}
            </h4>

            {/* Reason for Rejection */}
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-rose-400">
                Reason For Rejection:
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {finding.reason_for_rejection}
              </p>
            </div>

            {/* Evidence from Resume */}
            {finding.evidence_from_resume && (
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 space-y-1">
                <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <Quote className="w-3 h-3 text-indigo-400" />
                  <span>Evidence From Resume:</span>
                </div>
                <p className="text-xs font-mono text-slate-300 italic pl-1 border-l-2 border-indigo-500/60">
                  "{finding.evidence_from_resume}"
                </p>
              </div>
            )}

            {/* Suggested Fix */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                <span>Actionable Fix:</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200">
                {finding.suggested_fix}
              </p>
            </div>
          </div>
        ))}

        {filteredFindings.length === 0 && (
          <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800 p-6 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm text-slate-300 font-semibold">No objections in this severity tier.</p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="pt-4 text-center">
        <button
          onClick={onProceedToRewrite}
          disabled={isRewriting}
          className="inline-flex items-center space-x-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white text-base font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          <span>{isRewriting ? 'GENERATING TRUTHFUL REWRITE...' : 'FIX OBJECTIONS WITH TRUTHFUL REWRITER'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

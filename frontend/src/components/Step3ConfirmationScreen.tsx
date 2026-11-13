import React from 'react';
import { ShieldAlert, FileText, Target, Play, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { CandidateData, JobDescriptionData } from '../types';

interface Step3ConfirmationScreenProps {
  candidate: CandidateData;
  job: JobDescriptionData;
  onBackToCandidate: () => void;
  onBackToJob: () => void;
  onStartAudit: () => void;
  isStarting: boolean;
}

export const Step3ConfirmationScreen: React.FC<Step3ConfirmationScreenProps> = ({
  candidate,
  job,
  onBackToCandidate,
  onBackToJob,
  onStartAudit,
  isStarting,
}) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Intro */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Step 3 of 6 • Pre-Flight Confirmation</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Verify Inputs Before Rejection Audit
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Review candidate source record and target job description side-by-side. Once started, 7 hiring agents will run in strict sequence.
        </p>
      </div>

      {/* Side-by-Side Review Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Candidate Source Record */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Candidate Profile
                </h3>
              </div>
              <button
                onClick={onBackToCandidate}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Edit Input
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Candidate:</span>
                <span className="font-semibold text-white">{candidate?.candidateName || 'Candidate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Source:</span>
                <span className="capitalize">{candidate?.sourceType === 'upload' ? 'Resume Document' : 'Pasted Experience'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Word Count:</span>
                <span>{candidate?.wordCount || 0} words</span>
              </div>
              {candidate?.detectedSections && candidate.detectedSections.length > 0 && (
                <div className="pt-2">
                  <span className="text-slate-500 block mb-1">Sections Found:</span>
                  <div className="flex flex-wrap gap-1">
                    {candidate.detectedSections.map((sec) => (
                      <span key={sec} className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700/60">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                Extracted Text Preview:
              </span>
              <div className="max-h-48 overflow-y-auto bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
                {(candidate?.extractedText || 'No extracted text available').slice(0, 500)}...
              </div>
            </div>
          </div>
        </div>

        {/* Target Job Description */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Target Job Listing
                </h3>
              </div>
              <button
                onClick={onBackToJob}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Edit Job
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Role:</span>
                <span className="font-semibold text-white">{job?.title || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Company:</span>
                <span>{job?.company || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Word Count:</span>
                <span>{job?.wordCount || 0} words</span>
              </div>
              {job?.detectedCompetencies && job.detectedCompetencies.length > 0 && (
                <div className="pt-2">
                  <span className="text-slate-500 block mb-1">Key Competencies:</span>
                  <div className="flex flex-wrap gap-1">
                    {job.detectedCompetencies.map((comp) => (
                      <span key={comp} className="px-2 py-0.5 rounded bg-cyan-500/10 text-[11px] text-cyan-300 border border-cyan-500/20">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                Target Requirements Preview:
              </span>
              <div className="max-h-48 overflow-y-auto bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
                {(job?.rawText || 'No job requirements text available').slice(0, 500)}...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Pipeline Info Notice */}
      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start space-x-3">
        <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Sequential Multi-Agent Execution Protocol Active</p>
          <p className="text-slate-400">
            All 7 agents (ATS, Recruiter, Technical, Experience, Formatting, Credibility, Job Match) will run sequentially 1-by-1 to guarantee zero burst rate limiting and complete audit transparency.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={onBackToJob}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Edit</span>
        </button>

        <button
          onClick={onStartAudit}
          disabled={isStarting}
          className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white text-base font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>{isStarting ? 'INITIALIZING AGENT SWARM...' : 'START RESUME AUDIT'}</span>
        </button>
      </div>
    </div>
  );
};

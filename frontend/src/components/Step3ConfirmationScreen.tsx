import React from 'react';
import { ShieldAlert, FileText, Target, Play, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
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
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#FEF08A] border-2 border-black text-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Step 3 of 6 • Pre-Flight Confirmation</span>
        </div>

        <div>
          <div className="inline-block bg-[#C9B7F5] border-2 border-black rounded-xl px-5 py-2 shadow-[3px_3px_0px_0px_#000]">
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Verify Inputs Before Rejection Audit
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-xl mx-auto">
          Review candidate source record and target job description side-by-side. Once started, 7 hiring agents will run in strict sequence.
        </p>
      </div>

      {/* Side-by-Side Review Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Candidate Source Record */}
        <div className="bg-white border-2 border-black rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-[5px_5px_0px_0px_#000]">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-black" />
                <h3 className="text-sm font-black text-black uppercase tracking-wider">
                  Candidate Profile
                </h3>
              </div>
              <button
                onClick={onBackToCandidate}
                className="text-xs font-bold text-slate-700 hover:text-black underline"
              >
                Edit Input
              </button>
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-800">
              <div className="flex justify-between py-1 border-b border-black/10">
                <span className="text-slate-600 font-bold">Candidate:</span>
                <span className="font-black text-black">{candidate?.candidateName || 'Candidate'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/10">
                <span className="text-slate-600 font-bold">Source:</span>
                <span className="capitalize">{candidate?.sourceType === 'upload' ? 'Resume Document' : 'Pasted Experience'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/10">
                <span className="text-slate-600 font-bold">Word Count:</span>
                <span className="font-mono">{candidate?.wordCount || 0} words</span>
              </div>
              {candidate?.detectedSections && candidate.detectedSections.length > 0 && (
                <div className="pt-2">
                  <span className="text-slate-700 font-bold block mb-1.5">Sections Detected:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.detectedSections.map((sec) => (
                      <span key={sec} className="px-2 py-0.5 rounded-md bg-[#FAF6F0] text-[10px] font-bold text-black border border-black/40">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-700 font-black block mb-1">
                Extracted Text Preview:
              </span>
              <div className="max-h-44 overflow-y-auto bg-[#FAF6F0] rounded-xl p-3 border-2 border-black text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                {(candidate?.extractedText || 'No extracted text available').slice(0, 500)}...
              </div>
            </div>
          </div>
        </div>

        {/* Target Job Description */}
        <div className="bg-white border-2 border-black rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-[5px_5px_0px_0px_#000]">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-black" />
                <h3 className="text-sm font-black text-black uppercase tracking-wider">
                  Target Job Listing
                </h3>
              </div>
              <button
                onClick={onBackToJob}
                className="text-xs font-bold text-slate-700 hover:text-black underline"
              >
                Edit Listing
              </button>
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-800">
              <div className="flex justify-between py-1 border-b border-black/10">
                <span className="text-slate-600 font-bold">Role:</span>
                <span className="font-black text-black">{job?.title || 'General Position'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/10">
                <span className="text-slate-600 font-bold">Company:</span>
                <span className="font-black text-black">{job?.company || 'Confidential'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/10">
                <span className="text-slate-600 font-bold">Word Count:</span>
                <span className="font-mono">{job?.wordCount || 0} words</span>
              </div>

              {job?.detectedCompetencies && job.detectedCompetencies.length > 0 && (
                <div className="pt-2">
                  <span className="text-slate-700 font-bold block mb-1.5">Detected Core Competencies:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.detectedCompetencies.map((comp) => (
                      <span key={comp} className="px-2 py-0.5 rounded-md bg-[#FEF08A] text-[10px] font-black text-black border border-black/40">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-700 font-black block mb-1">
                Job Description Preview:
              </span>
              <div className="max-h-44 overflow-y-auto bg-[#FAF6F0] rounded-xl p-3 border-2 border-black text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                {(job?.rawText || 'No job description provided').slice(0, 500)}...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Launch Bar */}
      <div className="bg-[#DDF282] border-2 border-black rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[5px_5px_0px_0px_#000]">
        <div>
          <div className="flex items-center space-x-2 text-black font-black text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-800" />
            <span>Ready for 7-Agent Adversarial Committee</span>
          </div>
          <p className="text-xs text-slate-800 font-medium mt-1">
            Execution runs sequentially in isolated memory steps with verified evidence guarantee.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onBackToJob}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 border-2 border-black text-black text-xs font-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onStartAudit}
            disabled={isStarting}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-2xl bg-black hover:bg-slate-800 text-white font-black text-sm border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#FEF08A]" />
                <span>Initializing Agents...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Launch 7-Agent Audit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

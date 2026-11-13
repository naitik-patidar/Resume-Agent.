import React, { useState } from 'react';
import { Briefcase, Building, Sparkles, ArrowRight, ArrowLeft, AlertCircle, Loader2, Target } from 'lucide-react';
import { submitJobDescription } from '../services/api';
import { JobDescriptionData } from '../types';

interface Step2JobDescriptionInputProps {
  sessionId: string;
  onBack: () => void;
  onJobSubmitted: (data: JobDescriptionData) => void;
}

export const Step2JobDescriptionInput: React.FC<Step2JobDescriptionInputProps> = ({
  sessionId,
  onBack,
  onJobSubmitted,
}) => {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobText, setJobText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (jobText.trim().length < 50) {
      setErrorMessage('Please paste at least 50 characters of the target job description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await submitJobDescription(sessionId, jobText, jobTitle, company);
      onJobSubmitted({
        title: jobTitle.trim() || undefined,
        company: company.trim() || undefined,
        rawText: jobText,
        wordCount: resp.word_count,
        detectedCompetencies: resp.detected_competencies,
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Job submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Intro Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#FEF08A] border-2 border-black text-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 2 of 6 • Target Job Description</span>
        </div>

        <div>
          <div className="inline-block bg-[#C9B7F5] border-2 border-black rounded-xl px-5 py-2 shadow-[3px_3px_0px_0px_#000]">
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Target Job Description
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-xl mx-auto">
          Paste the authoritative job listing from any company career page. Our 7 hiring agents will test your resume against its exact requirements.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#FFCCD5] border-2 border-black text-rose-950 text-xs sm:text-sm font-bold flex items-start space-x-3 shadow-[2px_2px_0px_0px_#000]">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-900 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 space-y-5 shadow-[5px_5px_0px_0px_#000]">
        {/* Optional Title & Company Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-2 flex items-center space-x-1.5">
              <Briefcase className="w-3.5 h-3.5 text-black" />
              <span>Target Role / Title (Optional)</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full bg-[#FAF6F0] border-2 border-black rounded-xl px-4 py-2.5 text-sm text-black placeholder-slate-400 font-medium focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-2 flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-black" />
              <span>Target Company (Optional)</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe, OpenAI, Google"
              className="w-full bg-[#FAF6F0] border-2 border-black rounded-xl px-4 py-2.5 text-sm text-black placeholder-slate-400 font-medium focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000] transition-all"
            />
          </div>
        </div>

        {/* Job Description Textarea */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
            <label className="font-black uppercase tracking-wider text-black flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-black" />
              <span>Job Description Requirements (Mandatory)</span>
            </label>
            <span className="font-mono font-bold">{jobText.length} characters (min 50)</span>
          </div>

          <textarea
            rows={10}
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the complete job post including responsibilities, minimum qualifications, preferred tech stack, and experience levels..."
            className="w-full bg-[#FAF6F0] border-2 border-black rounded-xl p-4 text-sm font-mono text-black placeholder-slate-400 focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000] resize-y"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t-2 border-black/10">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border-2 border-black text-black text-xs font-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Candidate Profile</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || jobText.trim().length < 50}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3 rounded-xl bg-black hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-black border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#FEF08A]" />
                <span>Processing Requirements...</span>
              </>
            ) : (
              <>
                <span>Review & Confirm</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

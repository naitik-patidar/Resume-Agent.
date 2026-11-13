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
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 2 of 6 • Target Job Description</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Target Job Description
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Paste the authoritative job listing from any company career page. Our 7 hiring agents will test your resume against its exact requirements.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        {/* Optional Title & Company Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Role / Title (Optional)</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Company (Optional)</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe, OpenAI, Google"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Job Description Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Paste Job Description Copy</span>
            </span>
            <span>{jobText.length} characters (min 50)</span>
          </div>

          <textarea
            rows={10}
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste full job description including responsibilities, requirements, qualifications, and preferred skills..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-mono transition-all resize-y"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Candidate Input</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || jobText.trim().length < 50}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/30"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Job...</span>
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

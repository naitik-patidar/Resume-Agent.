import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Header } from './Header';
import { ErrorBoundary } from './ErrorBoundary';
import { Step1CandidateInput } from './Step1CandidateInput';
import { Step2JobDescriptionInput } from './Step2JobDescriptionInput';
import { Step3ConfirmationScreen } from './Step3ConfirmationScreen';
import { Step4SequentialDashboard } from './Step4SequentialDashboard';
import { Step5RejectionReport } from './Step5RejectionReport';
import { Step6RewriteDiffAndExport } from './Step6RewriteDiffAndExport';
import { startAudit, getAuditReport, rewriteResume, getUserSettings } from '../services/api';
import {
  AuditReport,
  CandidateData,
  JobDescriptionData,
  RewriteResponse,
  UserSettings,
  VerificationResult,
} from '../types';

export interface ResumeAuditWidgetProps {
  compactMode?: boolean;
  onAuditFinished?: (report: AuditReport) => void;
  hideHeader?: boolean;
  onOpenSettings?: () => void;
}

export const ResumeAuditWidget: React.FC<ResumeAuditWidgetProps> = ({
  compactMode = false,
  onAuditFinished,
  hideHeader = false,
  onOpenSettings,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [jobData, setJobData] = useState<JobDescriptionData | null>(null);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [rewriteData, setRewriteData] = useState<RewriteResponse | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>(() => getUserSettings());

  useEffect(() => {
    setUserSettings(getUserSettings());
  }, [currentStep]);

  const [isStartingAudit, setIsStartingAudit] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Reset entire flow
  const handleReset = () => {
    setCurrentStep(1);
    setCandidateData(null);
    setJobData(null);
    setAuditReport(null);
    setRewriteData(null);
    setVerificationResult(null);
    setGeneralError(null);
  };

  // Step 1 Completed -> Go to Step 2
  const handleCandidateSubmitted = (data: CandidateData) => {
    setCandidateData(data);
    setCurrentStep(2);
  };

  // Step 2 Completed -> Go to Step 3
  const handleJobSubmitted = (data: JobDescriptionData) => {
    setJobData(data);
    setCurrentStep(3);
  };

  // Step 3 CTA: Start Sequential Audit -> Go to Step 4
  const handleStartAudit = async () => {
    if (!candidateData?.sessionId) return;
    setIsStartingAudit(true);
    setGeneralError(null);
    try {
      await startAudit(candidateData.sessionId);
      setCurrentStep(4);
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : 'Failed to launch audit');
    } finally {
      setIsStartingAudit(false);
    }
  };

  // Step 4 Completed -> Fetch Report -> Go to Step 5
  const handleAuditCompleted = async () => {
    if (!candidateData?.sessionId) return;
    try {
      const report = await getAuditReport(candidateData.sessionId);
      setAuditReport(report);
      if (onAuditFinished) {
        onAuditFinished(report);
      }
      setCurrentStep(5);
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : 'Failed to load report');
    }
  };

  // Step 5 CTA: Rewrite Resume -> Run Rewriter Agent -> Go to Step 6
  const handleProceedToRewrite = async () => {
    if (!candidateData?.sessionId) return;
    setIsRewriting(true);
    setGeneralError(null);
    try {
      const resp = await rewriteResume(candidateData.sessionId);
      setRewriteData(resp);
      setCurrentStep(6);
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : 'Rewrite generation failed');
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className={`w-full ${hideHeader ? '' : 'min-h-screen bg-[#FAF6F0]'} text-slate-900 flex flex-col font-sans ${compactMode ? 'p-2' : ''}`}>
      {!hideHeader && (
        <Header
          hasActiveSession={Boolean(candidateData?.sessionId)}
          onReset={handleReset}
          userSettings={userSettings}
          onTabChange={onOpenSettings ? () => onOpenSettings() : undefined}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Banner if no API key is configured and on early steps */}
        {currentStep <= 3 && !userSettings.apiKey && onOpenSettings && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-[#FEF08A] border-2 border-black text-black text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-black shrink-0" />
              <span>
                Want live AI evaluations? Connect your personal Google Gemini or Ollama API key.
              </span>
            </div>
            <button
              onClick={onOpenSettings}
              className="px-4 py-1.5 rounded-xl bg-black text-white hover:bg-slate-800 border-2 border-black text-xs font-black whitespace-nowrap shadow-[2px_2px_0px_0px_#000] transition-all"
            >
              Configure API Key →
            </button>
          </div>
        )}

        {generalError && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <span>{generalError}</span>
            <button
              onClick={() => setGeneralError(null)}
              className="text-xs uppercase font-bold text-rose-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        <ErrorBoundary onReset={handleReset}>
          {currentStep === 1 && (
            <Step1CandidateInput onCandidateSubmitted={handleCandidateSubmitted} />
          )}

          {currentStep === 2 && candidateData && (
            <Step2JobDescriptionInput
              sessionId={candidateData.sessionId}
              onBack={() => setCurrentStep(1)}
              onJobSubmitted={handleJobSubmitted}
            />
          )}

          {currentStep === 3 && candidateData && jobData && (
            <Step3ConfirmationScreen
              candidate={candidateData}
              job={jobData}
              onBackToCandidate={() => setCurrentStep(1)}
              onBackToJob={() => setCurrentStep(2)}
              onStartAudit={handleStartAudit}
              isStarting={isStartingAudit}
            />
          )}

          {currentStep === 4 && candidateData && (
            <Step4SequentialDashboard
              sessionId={candidateData.sessionId}
              onAuditCompleted={handleAuditCompleted}
            />
          )}

          {currentStep === 5 && auditReport && (
            <Step5RejectionReport
              report={auditReport}
              onProceedToRewrite={handleProceedToRewrite}
              isRewriting={isRewriting}
            />
          )}

          {currentStep === 6 && candidateData && rewriteData && (
            <Step6RewriteDiffAndExport
              sessionId={candidateData.sessionId}
              candidate={candidateData}
              rewrite={rewriteData}
              verification={verificationResult}
              onSessionDeleted={handleReset}
            />
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
};

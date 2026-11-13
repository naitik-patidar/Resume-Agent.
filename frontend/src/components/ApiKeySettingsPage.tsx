import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  ClipboardPaste,
  Sparkles,
  Server,
  Zap,
  RotateCcw,
  Cpu,
  ArrowRight,
  Check,
} from 'lucide-react';
import {
  getUserSettings,
  saveUserSettings,
  clearUserSettings,
  verifyApiKey,
  testBackendHealth,
  DEFAULT_SETTINGS,
} from '../services/api';
import { UserSettings, VerifyKeyResponse } from '../types';

interface ApiKeySettingsPageProps {
  onNavigateToAudit?: () => void;
}

export const ApiKeySettingsPage: React.FC<ApiKeySettingsPageProps> = ({ onNavigateToAudit }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [showKey, setShowKey] = useState<boolean>(false);

  // Advanced backend URL setting (for Vercel + remote backend setups)
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  const [backendTestStatus, setBackendTestStatus] = useState<{
    testing: boolean;
    success?: boolean;
    message?: string;
  }>({ testing: false });

  // Verification state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<VerifyKeyResponse | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Load existing settings on mount
  useEffect(() => {
    const current = getUserSettings();
    setSettings({
      ...current,
      provider: 'gemini',
      model: 'gemini-2.5-flash',
    });
    setApiBaseUrl(current.apiBaseUrl || '');
  }, []);

  const handlePasteKey = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSettings((prev) => ({ ...prev, apiKey: text.trim(), isVerified: false }));
        setVerificationResult(null);
      }
    } catch {
      // ignore clipboard error
    }
  };

  const handleVerifyKey = async () => {
    if (!settings.apiKey || !settings.apiKey.trim()) {
      setVerificationResult({
        valid: false,
        provider: 'gemini',
        message: 'Please enter your Google Gemini API key to test.',
        error: 'Empty API key',
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const result = await verifyApiKey(
        'gemini',
        settings.apiKey.trim(),
        'gemini-2.5-flash',
        settings.baseUrl
      );
      setVerificationResult(result);
      if (result.valid) {
        const updated: UserSettings = {
          ...settings,
          provider: 'gemini',
          model: 'gemini-2.5-flash',
          isVerified: true,
          lastVerifiedAt: new Date().toLocaleTimeString(),
        };
        setSettings(updated);
        saveUserSettings(updated);
      }
    } catch (err: unknown) {
      setVerificationResult({
        valid: false,
        provider: 'gemini',
        message: err instanceof Error ? err.message : 'Connection test failed',
        error: String(err),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTestBackend = async () => {
    setBackendTestStatus({ testing: true });
    try {
      const res = await testBackendHealth(apiBaseUrl.trim() || undefined);
      setBackendTestStatus({
        testing: false,
        success: true,
        message: `Connected successfully: ${res.project || 'AI Resume Platform'} (Health: ${res.status})`,
      });
    } catch (err: unknown) {
      setBackendTestStatus({
        testing: false,
        success: false,
        message: err instanceof Error ? err.message : 'Failed to reach backend endpoint',
      });
    }
  };

  const handleSave = () => {
    const updated: UserSettings = {
      ...settings,
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      apiBaseUrl: apiBaseUrl.trim() || undefined,
    };
    saveUserSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetToDefaults = () => {
    clearUserSettings();
    setSettings(DEFAULT_SETTINGS);
    setApiBaseUrl('');
    setVerificationResult(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 animate-fade-in font-sans">
      {/* Top Banner / Heading */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Google Gemini Cloud Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Enter Your API Key
        </h1>
        <p className="mt-3 text-base text-slate-300 leading-relaxed">
          Provide your personal <span className="text-indigo-400 font-semibold">Google Gemini API key</span> to unlock
          live, high-depth evaluation by all 7 adversarial hiring agents directly on the web.
        </p>
      </div>

      {/* Active Model Status Card */}
      <div className="mb-8 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 ring-white/10 ${
              settings.apiKey
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Active Model:</span>
              <span className="text-base font-bold text-white tracking-tight">
                Google Gemini (gemini-2.5-flash)
              </span>
              {settings.apiKey ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Key Connected</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                  <span>No Key Entered (Offline Fallback)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {settings.apiKey
                ? 'All 7 sequential review agents and the Resume Rewriter Agent will use your key.'
                : 'Enter your free Gemini key below to enable full AI model capability.'}
            </p>
          </div>
        </div>

        {onNavigateToAudit && (
          <button
            onClick={onNavigateToAudit}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <span>Proceed to Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card: Enter API Key */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-base font-bold text-slate-100 flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <span>Enter Your API Key</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Paste your Google Gemini API key below. You can obtain a free key from Google AI Studio in less than a minute.
            </p>

            {/* Input Field with Show/Hide and Paste */}
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                <Key className="w-4 h-4" />
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(e) => {
                  setSettings({ ...settings, apiKey: e.target.value, isVerified: false });
                  setVerificationResult(null);
                }}
                placeholder="AIzaSy..."
                className="w-full pl-10 pr-24 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-wider shadow-inner"
              />
              <div className="absolute right-2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handlePasteKey}
                  title="Paste from clipboard"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <ClipboardPaste className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  title={showKey ? 'Hide key' : 'Show key'}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Verify & Test Button */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleVerifyKey}
                disabled={isVerifying}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-indigo-400' : 'text-amber-400'}`} />
                <span>{isVerifying ? 'Testing Connection...' : 'Test Connection / Verify Key'}</span>
              </button>
              <span className="text-xs text-slate-500">
                Performs a lightweight 1-token handshake with Google Gemini.
              </span>
            </div>

            {/* Verification Result Feedback */}
            {verificationResult && (
              <div
                className={`mt-4 p-4 rounded-xl border text-xs flex items-start space-x-3 animate-fade-in ${
                  verificationResult.valid
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {verificationResult.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{verificationResult.message}</p>
                  {verificationResult.latency_ms !== undefined && (
                    <p className="text-[11px] text-emerald-400/80 mt-0.5">
                      Handshake latency: {verificationResult.latency_ms}ms • Model: {verificationResult.model || 'gemini-2.5-flash'}
                    </p>
                  )}
                  {verificationResult.error && (
                    <p className="text-[11px] text-rose-400/80 mt-1 font-mono">
                      Error details: {verificationResult.error}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* "Your data will be safe here" - Green Privacy Box */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 shadow-sm">
              <div className="flex items-center space-x-2.5 text-emerald-400 font-bold text-sm mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 text-sm font-bold tracking-wide">
                  Your data will be safe here
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                Your API key and resume data remain strictly private and secure. Your key is stored exclusively on your device in your browser&apos;s{' '}
                <code className="bg-emerald-900/40 px-1.5 py-0.5 rounded text-emerald-200 font-mono text-[11px] border border-emerald-600/30">
                  localStorage
                </code>
                . It is never saved to any database, never written to server logs, and never shared with third parties. All requests are securely transmitted over end-to-end encrypted TLS connections.
              </p>
            </div>
          </div>

          {/* Advanced Vercel / Remote Backend Settings (Optional Collapsible) */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>Advanced: Backend API Endpoint (For Vercel Deployments)</span>
              </div>
              <span className="text-[11px] underline">
                {showAdvanced ? 'Hide Options' : 'Configure Custom Backend'}
              </span>
            </button>

            {showAdvanced && (
              <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-3 animate-fade-in text-xs">
                <p className="text-slate-400">
                  If this frontend is hosted on Vercel and your backend is running separately (e.g. Render, Railway, or localhost), specify the base URL here:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    placeholder="e.g. https://my-resume-backend.onrender.com/api (Leave blank for default /api)"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleTestBackend}
                    disabled={backendTestStatus.testing}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium shrink-0"
                  >
                    {backendTestStatus.testing ? 'Testing...' : 'Test Backend'}
                  </button>
                </div>
                {backendTestStatus.message && (
                  <p
                    className={`text-[11px] font-mono ${
                      backendTestStatus.success ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {backendTestStatus.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Key</span>
            </button>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                <Check className="w-4 h-4" />
                <span>{saveSuccess ? 'Saved & Activated!' : 'Save & Activate'}</span>
              </button>

              {onNavigateToAudit && (
                <button
                  type="button"
                  onClick={onNavigateToAudit}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  <span>Start Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info & How-to Guide */}
        <div className="space-y-6">
          {/* Quick Guide: How to get a free Gemini Key */}
          <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-indigo-900/40 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Get a Free Google Gemini Key in 60s</span>
            </div>
            <ol className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Visit{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 underline font-semibold"
                  >
                    Google AI Studio
                  </a>{' '}
                  and sign in with your Google account.
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <span>Click <strong>&quot;Create API Key&quot;</strong> in a new or existing project.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <span>Copy the key starting with <code>AIzaSy...</code> and paste it here.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  4
                </span>
                <span>Click <strong>&quot;Test Connection&quot;</strong> and start auditing!</span>
              </li>
            </ol>

            <div className="mt-4 pt-3 border-t border-indigo-900/40">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
              >
                <span>Open Google AI Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Model Capability Note */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Why use your own Gemini Key?
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>Live evaluation by all 7 adversarial hiring agents</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>High context window for full-length resumes and JDs</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>Automated anti-hallucination provenance rewrite</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>Completely free tier available from Google AI Studio</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

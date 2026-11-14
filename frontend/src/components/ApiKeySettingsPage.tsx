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
  Zap,
  RotateCcw,
  ArrowRight,
  Check,
  Terminal,
} from 'lucide-react';
import {
  getUserSettings,
  saveUserSettings,
  clearUserSettings,
  verifyApiKey,
  DEFAULT_SETTINGS,
} from '../services/api';
import { UserSettings, VerifyKeyResponse } from '../types';

interface ApiKeySettingsPageProps {
  onNavigateToProject?: () => void;
  onOpenLegal?: (tab?: 'terms' | 'privacy' | 'permissions' | 'cookies' | 'ai-ethics') => void;
}

export const ApiKeySettingsPage: React.FC<ApiKeySettingsPageProps> = ({ onNavigateToProject, onOpenLegal }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [keyType, setKeyType] = useState<'public' | 'ollama'>('public');
  const [showKey, setShowKey] = useState<boolean>(false);

  // Verification state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<VerifyKeyResponse | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Load existing settings on mount
  useEffect(() => {
    const current = getUserSettings();
    setSettings(current);
    if (current.provider === 'ollama') {
      setKeyType('ollama');
    } else {
      setKeyType('public');
    }
  }, []);

  const handleKeyTypeChange = (type: 'public' | 'ollama') => {
    setKeyType(type);
    setVerificationResult(null);
    if (type === 'ollama') {
      setSettings((prev) => ({
        ...prev,
        provider: 'ollama',
        model: prev.model && prev.provider === 'ollama' ? prev.model : 'gemma4:latest',
        baseUrl: prev.baseUrl || 'http://127.0.0.1:11434',
        isVerified: false,
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        isVerified: false,
      }));
    }
  };

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
    if (settings.provider !== 'ollama' && (!settings.apiKey || !settings.apiKey.trim())) {
      setVerificationResult({
        valid: false,
        provider: settings.provider,
        message: 'Please enter your API key to test.',
        error: 'Empty API key',
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const result = await verifyApiKey(
        settings.provider,
        settings.apiKey.trim(),
        settings.model || (settings.provider === 'ollama' ? 'gemma4:latest' : 'gemini-2.5-flash'),
        settings.baseUrl
      );
      setVerificationResult(result);
      if (result.valid) {
        const updated: UserSettings = {
          ...settings,
          isVerified: true,
          lastVerifiedAt: new Date().toLocaleTimeString(),
        };
        setSettings(updated);
        saveUserSettings(updated);
      }
    } catch (err: unknown) {
      setVerificationResult({
        valid: false,
        provider: settings.provider,
        message: err instanceof Error ? err.message : 'Connection test failed',
        error: String(err),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = () => {
    saveUserSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onNavigateToProject) {
        onNavigateToProject();
      }
    }, 1200);
  };

  const handleResetToDefaults = () => {
    clearUserSettings();
    setSettings(DEFAULT_SETTINGS);
    setKeyType('public');
    setVerificationResult(null);
  };

  const isGemini = settings.provider === 'gemini';
  const isOpenAI = settings.provider === 'openai';

  return (
    <div className="w-full bg-[#FAF6F0] text-slate-900 font-sans pb-20 selection:bg-[#c9b7f5] selection:text-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        
        {/* Top Header Card */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FEF08A] border-2 border-black rounded-lg text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] mb-3">
            <Key className="w-3.5 h-3.5 text-black" />
            <span>SUBMIT YOUR API KEY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
            Connect Your AI Engine
          </h1>
          <p className="mt-2 text-sm text-slate-700 font-medium">
            Submit your personal <strong>Public API Key</strong> (Google Gemini or OpenAI) or connect your <strong>Local Ollama API</strong> to run evaluations directly from your browser.
          </p>
        </div>

        {/* Main Form Container (Neo-Brutalist Folder Style) */}
        <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_0px_#000] relative">
          
          {/* Key Type Selector Tabs */}
          <div className="mb-6 pb-6 border-b-2 border-black">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-2.5">
              1. Choose API Type:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Public API */}
              <button
                type="button"
                onClick={() => handleKeyTypeChange('public')}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start space-x-3 ${
                  keyType === 'public'
                    ? 'bg-[#C9B7F5] border-black shadow-[3px_3px_0px_0px_#000]'
                    : 'bg-[#FAF6F0] border-black/40 hover:border-black text-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0">
                  <Key className="w-4 h-4 text-black" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-sm text-black">Public Cloud API</span>
                    <span className="px-1.5 py-0.2 bg-[#FEF08A] border border-black rounded text-[9px] font-black uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-1">
                    Google Gemini (Free tier) or OpenAI. Fastest and most thorough evaluation.
                  </p>
                </div>
              </button>

              {/* Option B: Local Ollama */}
              <button
                type="button"
                onClick={() => handleKeyTypeChange('ollama')}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start space-x-3 ${
                  keyType === 'ollama'
                    ? 'bg-[#DDF282] border-black shadow-[3px_3px_0px_0px_#000]'
                    : 'bg-[#FAF6F0] border-black/40 hover:border-black text-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0">
                  <Terminal className="w-4 h-4 text-black" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-sm text-black">Local Ollama API</span>
                    <span className="px-1.5 py-0.2 bg-white border border-black rounded text-[9px] font-black uppercase">
                      100% Offline
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-1">
                    Runs on your own machine. No external cloud calls or subscriptions required.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Form Fields: Public API */}
          {keyType === 'public' ? (
            <div className="space-y-5">
              {/* Sub-selector: Gemini vs OpenAI */}
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-2">
                  2. Select Provider:
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSettings({ ...settings, provider: 'gemini', model: 'gemini-2.5-flash', isVerified: false });
                      setVerificationResult(null);
                    }}
                    className={`px-4 py-2 rounded-xl border-2 font-bold text-xs transition-all flex items-center space-x-2 ${
                      isGemini
                        ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white text-black border-black/60 hover:border-black'
                    }`}
                  >
                    <span>Google Gemini (Free)</span>
                    {isGemini && <Check className="w-3.5 h-3.5 text-[#FEF08A]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSettings({ ...settings, provider: 'openai', model: 'gpt-4o-mini', isVerified: false });
                      setVerificationResult(null);
                    }}
                    className={`px-4 py-2 rounded-xl border-2 font-bold text-xs transition-all flex items-center space-x-2 ${
                      isOpenAI
                        ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white text-black border-black/60 hover:border-black'
                    }`}
                  >
                    <span>OpenAI (GPT-4o)</span>
                    {isOpenAI && <Check className="w-3.5 h-3.5 text-[#FEF08A]" />}
                  </button>
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Enter {isGemini ? 'Google Gemini' : 'OpenAI'} API Key:
                  </label>
                  {isGemini && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-700 hover:underline"
                    >
                      <span>Get Free Gemini Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={(e) => {
                      setSettings({ ...settings, apiKey: e.target.value, isVerified: false });
                      setVerificationResult(null);
                    }}
                    placeholder={isGemini ? 'AIzaSy...' : 'sk-proj-...'}
                    className="w-full pl-4 pr-24 py-3 bg-[#FAF6F0] border-2 border-black rounded-xl text-sm font-mono text-black placeholder-slate-400 focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000]"
                  />
                  <div className="absolute right-2 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={handlePasteKey}
                      title="Paste from clipboard"
                      className="p-1.5 text-slate-700 hover:text-black rounded-lg hover:bg-black/5"
                    >
                      <ClipboardPaste className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      title={showKey ? 'Hide key' : 'Show key'}
                      className="p-1.5 text-slate-700 hover:text-black rounded-lg hover:bg-black/5"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Form Fields: Local Ollama */
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-800 block mb-1.5">
                  Ollama Base Endpoint:
                </label>
                <input
                  type="text"
                  value={settings.baseUrl || 'http://127.0.0.1:11434'}
                  onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value, isVerified: false })}
                  placeholder="http://127.0.0.1:11434"
                  className="w-full px-4 py-2.5 bg-[#FAF6F0] border-2 border-black rounded-xl text-sm font-mono text-black shadow-[2px_2px_0px_0px_#000]"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-800 block mb-1.5">
                  Local Model Name:
                </label>
                <input
                  type="text"
                  value={settings.model || 'gemma4:latest'}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value, isVerified: false })}
                  placeholder="gemma4:latest or llama3.2"
                  className="w-full px-4 py-2.5 bg-[#FAF6F0] border-2 border-black rounded-xl text-sm font-mono text-black shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
            </div>
          )}

          {/* Test Connection Button */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleVerifyKey}
              disabled={isVerifying}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl border-2 border-black text-xs font-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-[#FEF08A]' : 'text-[#FEF08A]'}`} />
              <span>{isVerifying ? 'Testing Connection...' : 'Test Connection / Verify Key'}</span>
            </button>
            <span className="text-xs text-slate-600 font-medium">
              Performs a quick 1-token handshake with {settings.provider === 'ollama' ? 'Local Ollama' : settings.provider}.
            </span>
          </div>

          {/* Verification Feedback Banner */}
          {verificationResult && (
            <div
              className={`mt-4 p-4 rounded-xl border-2 text-xs font-medium flex items-start space-x-3 ${
                verificationResult.valid
                  ? 'bg-[#DDF282] border-black text-lime-950 shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-[#FFCCD5] border-black text-rose-950 shadow-[2px_2px_0px_0px_#000]'
              }`}
            >
              {verificationResult.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-black text-sm">{verificationResult.message}</p>
                {verificationResult.latency_ms !== undefined && (
                  <p className="text-[11px] font-mono mt-0.5">
                    Latency: {verificationResult.latency_ms}ms • Model: {verificationResult.model || settings.model}
                  </p>
                )}
                {verificationResult.error && (
                  <p className="text-[11px] font-mono mt-1 text-rose-900">
                    Details: {verificationResult.error}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* "YOUR DATA WILL BE SAFE HERE" - GREEN BOX (USER ASK)     */}
          {/* ======================================================== */}
          <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-[#DDF282]/50 border-2 border-emerald-700 shadow-[4px_4px_0px_0px_#059669]">
            <div className="flex items-center space-x-2 text-emerald-900 font-black text-base mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0" />
              <span>Your data will be safe here</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
              Your API key and resume data remain strictly private and secure. Your key is stored exclusively on your device in your browser&apos;s{' '}
              <code className="bg-emerald-900/15 px-1.5 py-0.5 rounded border border-emerald-700/40 text-emerald-950 font-bold font-mono text-xs">
                localStorage
              </code>
              . It is never saved to our database, never written to server logs, and never shared with third parties. All requests are securely transmitted over end-to-end encrypted TLS connections.
            </p>
          </div>

          {/* BYOK Privacy & Storage Disclosure */}
          <div className="mt-6 p-4 bg-[#FAF6F0] border-2 border-black rounded-2xl text-xs space-y-1.5 shadow-[2px_2px_0px_0px_#000]">
            <div className="flex items-center justify-between">
              <span className="font-black text-black uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Zero Server-Side Key Retention</span>
              </span>
              <span className="px-2 py-0.5 bg-[#DDF282] border border-black rounded text-[10px] font-black uppercase">
                Client-Side Only
              </span>
            </div>
            <p className="text-slate-700 font-medium">
              Your API key is stored exclusively in your personal browser&apos;s <code>localStorage</code>. It is never logged or written to our backend database. You maintain complete sovereignty and can clear it at any time.
            </p>
            <div className="flex items-center space-x-3 pt-1 font-bold">
              <button
                type="button"
                onClick={() => onOpenLegal?.('privacy')}
                className="text-black underline hover:text-purple-700 text-[11px]"
              >
                Read Privacy Policy
              </button>
              <span className="text-slate-400">•</span>
              <button
                type="button"
                onClick={() => onOpenLegal?.('cookies')}
                className="text-black underline hover:text-purple-700 text-[11px]"
              >
                Cookie & Storage Policy
              </button>
            </div>
          </div>

          {/* Action Buttons: Save & Reset */}
          <div className="mt-8 pt-6 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-black text-xs font-bold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSave}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3 bg-[#DDF282] hover:bg-[#d5ed70] text-black font-black text-sm rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{saveSuccess ? 'Saved & Activated!' : 'Save & Activate Key'}</span>
              </button>

              {onNavigateToProject && (
                <button
                  type="button"
                  onClick={onNavigateToProject}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-black hover:bg-slate-800 text-white font-black text-sm rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] transition-all"
                >
                  <span>Go to Workplace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

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
  Info,
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
import { LLMProviderId, UserSettings, VerifyKeyResponse } from '../types';

interface ApiKeySettingsPageProps {
  onNavigateToAudit?: () => void;
}

interface ProviderOption {
  id: LLMProviderId;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  recommendedModel: string;
  availableModels: { id: string; name: string; tag: string }[];
  keyHelpUrl: string;
  keyHelpText: string;
  keyPlaceholder: string;
}

const PROVIDERS: ProviderOption[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Recommended • Free Tier',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    description: 'High-speed multimodal intelligence with large context windows and official free tier from Google AI Studio.',
    recommendedModel: 'gemini-2.5-flash',
    availableModels: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: 'Fastest & Smartest • Recommended' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tag: 'Ultra-Low Latency' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tag: 'Deep Complex Analysis' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tag: 'High Throughput' },
    ],
    keyHelpUrl: 'https://aistudio.google.com/app/apikey',
    keyHelpText: 'Get a free API key from Google AI Studio. No credit card required.',
    keyPlaceholder: 'AIzaSy...',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    badge: 'Popular',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Industry standard foundation models powering GPT-4o and GPT-4o-mini.',
    recommendedModel: 'gpt-4o-mini',
    availableModels: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tag: 'Fast & Economical • Recommended' },
      { id: 'gpt-4o', name: 'GPT-4o', tag: 'Flagship Multimodal' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', tag: 'Advanced' },
    ],
    keyHelpUrl: 'https://platform.openai.com/api-keys',
    keyHelpText: 'Create a secret key from your OpenAI platform dashboard.',
    keyPlaceholder: 'sk-proj-...',
  },
  {
    id: 'ollama',
    name: 'Local Ollama',
    badge: 'Offline • 100% Free',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description: 'Run completely offline on your own hardware without external cloud API calls.',
    recommendedModel: 'gemma4:latest',
    availableModels: [
      { id: 'gemma4:latest', name: 'Gemma 4', tag: 'Default Local Model' },
      { id: 'llama3.2:latest', name: 'Llama 3.2', tag: 'Alternative' },
      { id: 'mistral:latest', name: 'Mistral', tag: 'Alternative' },
    ],
    keyHelpUrl: 'https://ollama.ai',
    keyHelpText: 'Install and start Ollama locally (`ollama serve`).',
    keyPlaceholder: 'No key needed for local Ollama',
  },
];

export const ApiKeySettingsPage: React.FC<ApiKeySettingsPageProps> = ({ onNavigateToAudit }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isCustomModel, setIsCustomModel] = useState<boolean>(false);
  const [customModelName, setCustomModelName] = useState<string>('');

  // Advanced backend URL setting
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
    setSettings(current);
    setApiBaseUrl(current.apiBaseUrl || '');

    const activeProvider = PROVIDERS.find((p) => p.id === current.provider);
    if (activeProvider) {
      const isPredefined = activeProvider.availableModels.some((m) => m.id === current.model);
      if (!isPredefined && current.model) {
        setIsCustomModel(true);
        setCustomModelName(current.model);
      }
    }
  }, []);

  const activeProviderConfig = PROVIDERS.find((p) => p.id === settings.provider) || PROVIDERS[0];

  const handleProviderChange = (providerId: LLMProviderId) => {
    const provider = PROVIDERS.find((p) => p.id === providerId) || PROVIDERS[0];
    const newSettings: UserSettings = {
      ...settings,
      provider: providerId,
      model: provider.recommendedModel,
      isVerified: false,
    };
    setSettings(newSettings);
    setIsCustomModel(false);
    setCustomModelName('');
    setVerificationResult(null);
  };

  const handleModelChange = (modelId: string) => {
    setIsCustomModel(false);
    setSettings({ ...settings, model: modelId, isVerified: false });
    setVerificationResult(null);
  };

  const handleCustomModelSubmit = (name: string) => {
    setCustomModelName(name);
    setSettings({ ...settings, model: name.trim(), isVerified: false });
    setVerificationResult(null);
  };

  const handlePasteKey = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSettings({ ...settings, apiKey: text.trim(), isVerified: false });
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
        message: 'Please enter an API key to test.',
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
        settings.model,
        settings.baseUrl
      );
      setVerificationResult(result);
      if (result.valid) {
        const updated = {
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
    setIsCustomModel(false);
    setCustomModelName('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 animate-fade-in font-sans">
      {/* Top Banner / Heading */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cloud Intelligence & BYOK (Bring Your Own Key)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          AI Model & API Key Configuration
        </h1>
        <p className="mt-3 text-base text-slate-300 leading-relaxed">
          Supply your personal <span className="text-indigo-400 font-semibold">Google Gemini</span> or{' '}
          <span className="text-emerald-400 font-semibold">OpenAI</span> API key to run evaluations
          with live cloud AI models directly from your browser.
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
              <span className="text-sm text-slate-400">Current Model:</span>
              <span className="text-base font-bold text-white tracking-tight">
                {activeProviderConfig.name} ({settings.model})
              </span>
              {settings.apiKey ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Custom Key Active</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                  <span>Using Built-in Fallbacks</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {settings.apiKey
                ? 'All 7 sequential review agents and the Rewriter Agent will use your key.'
                : 'No custom key entered. Platform runs on local Ollama or deterministic heuristics.'}
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
        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Provider */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs">
                  1
                </span>
                <span>Select AI Provider</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PROVIDERS.map((provider) => {
                const isSelected = settings.provider === provider.id;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleProviderChange(provider.id)}
                    className={`relative p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500/80 ring-2 ring-indigo-500/20'
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white text-base">{provider.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${provider.badgeColor}`}
                      >
                        {provider.badge}
                      </span>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                        {provider.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Choose Model */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs">
                  2
                </span>
                <span>Choose Model for {activeProviderConfig.name}</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {activeProviderConfig.availableModels.map((m) => {
                const isSelected = !isCustomModel && settings.model === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModelChange(m.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/30'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{m.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">{m.tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Model Toggle */}
            <div className="pt-2 border-t border-slate-800/60">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="customModelToggle"
                  checked={isCustomModel}
                  onChange={(e) => {
                    setIsCustomModel(e.target.checked);
                    if (!e.target.checked) {
                      setSettings({ ...settings, model: activeProviderConfig.recommendedModel });
                    }
                  }}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="customModelToggle" className="text-xs text-slate-300 font-medium">
                  Use custom model identifier
                </label>
              </div>

              {isCustomModel && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={customModelName}
                    onChange={(e) => handleCustomModelSubmit(e.target.value)}
                    placeholder="e.g. gemini-2.0-pro-exp-02-05 or gpt-4o-2024-08-06"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Enter API Key */}
          {settings.provider !== 'ollama' ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs">
                    3
                  </span>
                  <span>Enter {activeProviderConfig.name} API Key</span>
                </label>
                <a
                  href={activeProviderConfig.keyHelpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-xs text-slate-400 mb-4">{activeProviderConfig.keyHelpText}</p>

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
                  placeholder={activeProviderConfig.keyPlaceholder}
                  className="w-full pl-10 pr-24 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-wider"
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
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
                >
                  <Zap className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-indigo-400' : 'text-amber-400'}`} />
                  <span>{isVerifying ? 'Testing Connection...' : 'Test Connection / Verify Key'}</span>
                </button>
                <span className="text-xs text-slate-500">
                  Performs a lightweight 1-token handshake with {activeProviderConfig.name}.
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
                        Handshake latency: {verificationResult.latency_ms}ms • Model:{' '}
                        {verificationResult.model || settings.model}
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
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <label className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-400 flex items-center justify-center text-xs">
                  3
                </span>
                <span>Ollama Endpoint Configuration</span>
              </label>
              <p className="text-xs text-slate-400 mb-3">
                Local Ollama requires no API key. Ensure Ollama is running on your machine.
              </p>
              <input
                type="text"
                value={settings.baseUrl || 'http://127.0.0.1:11434'}
                onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                placeholder="http://127.0.0.1:11434"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-xs"
              />
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleVerifyKey}
                  disabled={isVerifying}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs"
                >
                  <Zap className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : 'text-amber-400'}`} />
                  <span>{isVerifying ? 'Checking Ollama...' : 'Test Local Ollama'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Advanced Vercel / Remote Backend Settings */}
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
                  If this frontend is deployed on Vercel and your backend is hosted separately (e.g. on
                  Render, Railway, Fly.io, or localhost), specify the base URL here:
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
              <span>Reset to Defaults</span>
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

          {/* Privacy & Security Guarantee */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm mb-2.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Storage Privacy Guarantee</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your API keys and credentials are stored strictly in your browser&apos;s{' '}
              <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">localStorage</code>.
              They are never logged to public databases, saved in server telemetry, or shared with third
              parties.
            </p>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>All communications use end-to-end TLS encryption.</span>
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

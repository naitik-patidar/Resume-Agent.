import React from 'react';
import {
  ShieldAlert,
  RotateCcw,
  Key,
  FileText,
  Sparkles,
} from 'lucide-react';
import { UserSettings } from '../types';

interface HeaderProps {
  onReset?: () => void;
  hasActiveSession?: boolean;
  activeTab?: 'audit' | 'settings';
  onTabChange?: (tab: 'audit' | 'settings') => void;
  userSettings?: UserSettings | null;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  hasActiveSession,
  activeTab = 'audit',
  onTabChange,
  userSettings,
}) => {
  const hasKey = Boolean(userSettings?.apiKey && userSettings.apiKey.trim());
  const providerLabel = userSettings?.provider === 'openai' ? 'OpenAI' : userSettings?.provider === 'ollama' ? 'Ollama' : 'Gemini';
  const modelLabel = userSettings?.model || 'gemini-2.5-flash';

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand & Title */}
        <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => onTabChange?.('audit')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                ADVERSARIAL RESUME AUDIT
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                7 Agents
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Hostile hiring simulation with strict anti-hallucination provenance
            </p>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        {onTabChange && (
          <nav className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onTabChange('audit')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'audit'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resume Audit</span>
            </button>

            <button
              onClick={() => onTabChange('settings')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>AI Models & API Keys</span>
              {hasKey && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
              )}
            </button>
          </nav>
        )}

        {/* Right: Active Model Badge & Session Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Active Model Indicator Badge */}
          {onTabChange && (
            <button
              onClick={() => onTabChange('settings')}
              title="Click to configure AI models and API keys"
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                hasKey
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="font-semibold">
                {hasKey ? `${providerLabel}: ${modelLabel}` : 'Add API Key'}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${hasKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>
          )}

          {hasActiveSession && onReset && (
            <button
              onClick={onReset}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-all shadow-sm"
              title="Start over with a new candidate resume"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Audit</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

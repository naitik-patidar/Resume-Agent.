import { useState, useEffect } from 'react';
import { Header, NavigationTab } from './components/Header';
import { HomePage } from './components/HomePage';
import { ResumeAuditWidget } from './components/ResumeAuditWidget';
import { ApiKeySettingsPage } from './components/ApiKeySettingsPage';
import { ApiKeyPromptModal } from './components/ApiKeyPromptModal';
import { LegalCenterModal, LegalTab } from './components/LegalCenterModal';
import { getUserSettings } from './services/api';
import { UserSettings } from './types';
import {
  ShieldAlert,
  ShieldCheck,
  Scale,
  Lock,
  FileText,
  UserCheck,
  Cookie,
  Cpu,
  ExternalLink,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [userSettings, setUserSettings] = useState<UserSettings>(() => getUserSettings());
  const [isLegalOpen, setIsLegalOpen] = useState<boolean>(false);
  const [legalInitialTab, setLegalInitialTab] = useState<LegalTab>('terms');
  const [isApiKeyPromptOpen, setIsApiKeyPromptOpen] = useState<boolean>(false);

  // Refresh settings when switching tabs
  const handleTabChange = (tab: NavigationTab, bypassKeyCheck: boolean = false) => {
    const currentSettings = getUserSettings();
    setUserSettings(currentSettings);

    // Prompt for API key when navigating to Workplace without a configured key
    if (tab === 'project' && !bypassKeyCheck) {
      const hasKey = Boolean(currentSettings?.apiKey && currentSettings.apiKey.trim());
      if (!hasKey) {
        setIsApiKeyPromptOpen(true);
        return;
      }
    }

    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLegal = (tab: LegalTab = 'terms') => {
    setLegalInitialTab(tab);
    setIsLegalOpen(true);
  };

  useEffect(() => {
    setUserSettings(getUserSettings());
  }, [activeTab]);

  return (
    <div className="w-full min-h-screen bg-[#FAF6F0] text-slate-900 flex flex-col font-sans selection:bg-[#C9B7F5] selection:text-black overflow-x-hidden">
      {/* Neo-brutalist navigation header */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userSettings={userSettings}
      />

      <div className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            onNavigateToProject={() => handleTabChange('project')}
            onNavigateToApiKey={() => handleTabChange('api-key')}
            hasKey={Boolean(userSettings?.apiKey || userSettings?.provider === 'ollama')}
          />
        )}

        {activeTab === 'project' && (
          <div className="animate-fade-in">
            {/* Context bar inside the projects section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000]">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#FEF08A] border border-black text-[10px] font-black uppercase">
                      ACTIVE WORKPLACE
                    </span>
                    <h2 className="text-base font-black text-black">
                      Adversarial Resume Audit & Improvement Workplace
                    </h2>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">
                    Follow the 6 steps below to submit your resume, run all 7 agents, and inspect the verified rewrite.
                  </p>
                </div>

                <button
                  onClick={() => handleTabChange('api-key')}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#FFE2C8] border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] transition-all whitespace-nowrap"
                >
                  {userSettings.apiKey ? '✓ Key Configured' : '+ Configure API Key'}
                </button>
              </div>
            </div>

            <ResumeAuditWidget
              hideHeader={true}
              onOpenSettings={() => handleTabChange('api-key')}
              onOpenLegal={handleOpenLegal}
            />
          </div>
        )}

        {activeTab === 'api-key' && (
          <div className="animate-fade-in">
            <ApiKeySettingsPage
              onNavigateToProject={() => handleTabChange('project')}
              onOpenLegal={handleOpenLegal}
            />
          </div>
        )}
      </div>

      {/* Comprehensive Neo-Brutalist Legal & Navigation Footer */}
      <footer className="mt-16 border-t-2 sm:border-t-3 border-black bg-white text-slate-900">
        {/* Main Footer Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Column 1: Brand & Compliance Mission */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 bg-[#FEF08A] rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-black" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-tight text-black block leading-tight">
                    ADVERSARIAL RESUME
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold">
                    7-Agent Rejection Audit
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Empowering candidates through hostile hiring simulations and truthful factual resume rewrites with verified evidence.
              </p>

              {/* Compliance Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 bg-[#DDF282] border border-black rounded-md text-[10px] font-black uppercase text-lime-950">
                  GDPR & CCPA Aligned
                </span>
                <span className="px-2 py-0.5 bg-[#FFE2C8] border border-black rounded-md text-[10px] font-black uppercase text-amber-950">
                  Zero Tracking Cookies
                </span>
                <span className="px-2 py-0.5 bg-[#C9B7F5] border border-black rounded-md text-[10px] font-black uppercase text-purple-950">
                  BYOK Privacy
                </span>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-black border-b-2 border-black pb-1 inline-block">
                Platform Navigation
              </h3>
              <ul className="space-y-2 text-xs font-bold text-slate-700">
                <li>
                  <button
                    onClick={() => handleTabChange('home')}
                    className="hover:text-black hover:underline flex items-center space-x-1.5 transition-colors"
                  >
                    <span>Home & Architecture</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('project')}
                    className="hover:text-black hover:underline flex items-center space-x-1.5 transition-colors"
                  >
                    <span>Workplace (6-Step Audit)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTabChange('api-key')}
                    className="hover:text-black hover:underline flex items-center space-x-1.5 transition-colors"
                  >
                    <span>Submit API Key (BYOK)</span>
                  </button>
                </li>
                <li>
                  <a
                    href="https://github.com/naitik-patidar/Resume-Agent..git"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black hover:underline flex items-center space-x-1.5 transition-colors"
                  >
                    <span>GitHub Repository</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Regulatory Policies */}
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-black" />
                <h3 className="text-xs font-black uppercase tracking-wider text-black border-b-2 border-black pb-1 inline-block">
                  Legal & Compliance
                </h3>
              </div>

              <ul className="space-y-2 text-xs font-bold text-slate-700">
                <li>
                  <button
                    onClick={() => handleOpenLegal('terms')}
                    className="hover:text-black hover:underline flex items-center space-x-1.5 transition-colors text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                    <span>Terms & Conditions</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleOpenLegal('privacy')}
                    className="hover:text-black hover:underline flex items-center space-x-1.5 transition-colors text-left"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                    <span>Privacy Policy (GDPR / CCPA)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleOpenLegal('permissions')}
                    className="hover:text-black hover:underline flex items-center space-x-1.5 transition-colors text-left"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                    <span>User Permissions & Consent</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleOpenLegal('cookies')}
                    className="hover:text-black hover:underline flex items-center space-x-1.5 transition-colors text-left"
                  >
                    <Cookie className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                    <span>Cookie & Storage Policy</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleOpenLegal('ai-ethics')}
                    className="hover:text-black hover:underline flex items-center space-x-1.5 transition-colors text-left"
                  >
                    <Cpu className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                    <span>AI Ethics & Fair Hiring</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Candidate Data Sovereignty */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-black border-b-2 border-black pb-1 inline-block">
                Candidate Sovereignty
              </h3>
              <div className="p-3 bg-[#FAF6F0] border-2 border-black rounded-xl text-xs space-y-1.5 shadow-[2px_2px_0px_0px_#000]">
                <div className="flex items-center space-x-1 text-black font-black">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Zero Public Model Training</span>
                </div>
                <p className="text-[11px] text-slate-700 font-medium">
                  Candidate resumes and API keys are processed ephemerally. Keys stay in your browser. We never sell or train on your career records.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => handleTabChange('api-key')}
                    className="text-[10px] font-black uppercase text-black hover:underline"
                  >
                    Manage Storage & Keys →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory Legal & Regulatory Disclaimer Callout */}
          <div className="p-4 bg-[#FAF0E6] border-2 border-black rounded-2xl mb-8 shadow-[3px_3px_0px_0px_#000]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-black flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-black" />
                <span>Regulatory Notice & Employment Law Disclaimer</span>
              </span>
              <span className="text-[10px] font-bold text-slate-600">
                Candidate Advisory Only
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              This platform provides automated adversarial resume simulation, algorithmic critique, and factual rewriting solely for educational, self-assessment, and career preparation purposes. The platform is not an employment agency, staffing firm, recruiter, or official employer. We do not make hiring decisions, do not act as an Automated Employment Decision Tool (AEDT) for employers, and do not guarantee interview invitations, callbacks, job placement, or passage of any corporate Applicant Tracking System.
            </p>
          </div>

          {/* Sub-Footer Bottom Bar */}
          <div className="pt-6 border-t-2 border-black/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-700">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black inline-block animate-pulse" />
              <span>
                © {new Date().getFullYear()} AI Multi-Agent Resume Rejection & Truthful Improvement Platform.
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px]">
              <button
                onClick={() => handleOpenLegal('terms')}
                className="hover:text-black hover:underline"
              >
                Terms
              </button>
              <span>•</span>
              <button
                onClick={() => handleOpenLegal('privacy')}
                className="hover:text-black hover:underline"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                onClick={() => handleOpenLegal('permissions')}
                className="hover:text-black hover:underline"
              >
                User Permission
              </button>
              <span>•</span>
              <button
                onClick={() => handleOpenLegal('cookies')}
                className="hover:text-black hover:underline"
              >
                Cookies
              </button>
              <span>•</span>
              <button
                onClick={() => handleOpenLegal('ai-ethics')}
                className="hover:text-black hover:underline"
              >
                AI Ethics
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Neo-Brutalist Legal Center Modal */}
      <LegalCenterModal
        isOpen={isLegalOpen}
        initialTab={legalInitialTab}
        onClose={() => setIsLegalOpen(false)}
      />

      {/* Small Square-Shaped API Key Prompt Window */}
      <ApiKeyPromptModal
        isOpen={isApiKeyPromptOpen}
        onClose={() => setIsApiKeyPromptOpen(false)}
        onSubmitApiKey={() => {
          setIsApiKeyPromptOpen(false);
          handleTabChange('api-key');
        }}
        onContinueWithoutKey={() => {
          setIsApiKeyPromptOpen(false);
          handleTabChange('project', true);
        }}
      />
    </div>
  );
}

export default App;

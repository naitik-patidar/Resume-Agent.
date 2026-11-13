import { useState, useEffect } from 'react';
import { Header, NavigationTab } from './components/Header';
import { HomePage } from './components/HomePage';
import { ResumeAuditWidget } from './components/ResumeAuditWidget';
import { ApiKeySettingsPage } from './components/ApiKeySettingsPage';
import { getUserSettings } from './services/api';
import { UserSettings } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [userSettings, setUserSettings] = useState<UserSettings>(() => getUserSettings());

  // Refresh settings when switching tabs
  const handleTabChange = (tab: NavigationTab) => {
    setUserSettings(getUserSettings());
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setUserSettings(getUserSettings());
  }, [activeTab]);

  return (
    <div className="w-full min-h-screen bg-[#FAF6F0] text-slate-900 flex flex-col font-sans selection:bg-[#C9B7F5] selection:text-black">
      {/* Neo-brutalist navigation header (Matching Reference Image 1) */}
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
                      ACTIVE PROJECT
                    </span>
                    <h2 className="text-base font-black text-black">
                      Adversarial Resume Audit & Improvement Pipeline
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
            />
          </div>
        )}

        {activeTab === 'api-key' && (
          <div className="animate-fade-in">
            <ApiKeySettingsPage
              onNavigateToProject={() => handleTabChange('project')}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t-2 border-black bg-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-700">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#DDF282] border border-black inline-block" />
            <span>AI Multi-Agent Resume Rejection & Improvement Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => handleTabChange('home')} className="hover:text-black hover:underline">
              Home
            </button>
            <button onClick={() => handleTabChange('project')} className="hover:text-black hover:underline">
              Project Application
            </button>
            <button onClick={() => handleTabChange('api-key')} className="hover:text-black hover:underline">
              Submit API Key
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

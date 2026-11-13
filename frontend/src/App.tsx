import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ResumeAuditWidget } from './components/ResumeAuditWidget';
import { ApiKeySettingsPage } from './components/ApiKeySettingsPage';
import { getUserSettings } from './services/api';
import { UserSettings } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'audit' | 'settings'>('audit');
  const [userSettings, setUserSettings] = useState<UserSettings>(() => getUserSettings());

  // Refresh settings when switching tabs
  const handleTabChange = (tab: 'audit' | 'settings') => {
    setUserSettings(getUserSettings());
    setActiveTab(tab);
  };

  useEffect(() => {
    setUserSettings(getUserSettings());
  }, [activeTab]);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userSettings={userSettings}
      />

      <div className="flex-1">
        {activeTab === 'audit' ? (
          <ResumeAuditWidget
            hideHeader={true}
            onOpenSettings={() => handleTabChange('settings')}
          />
        ) : (
          <ApiKeySettingsPage
            onNavigateToAudit={() => handleTabChange('audit')}
          />
        )}
      </div>
    </div>
  );
}

export default App;

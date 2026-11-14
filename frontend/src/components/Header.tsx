import React from 'react';
import {
  ShieldAlert,
  Flame,
  Key,
  FolderGit2,
  Home,
} from 'lucide-react';
import { UserSettings } from '../types';

export type NavigationTab = 'home' | 'project' | 'api-key';

interface HeaderProps {
  onReset?: () => void;
  hasActiveSession?: boolean;
  activeTab?: NavigationTab;
  onTabChange?: (tab: NavigationTab) => void;
  userSettings?: UserSettings | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'home',
  onTabChange,
  userSettings,
}) => {
  const hasKey = Boolean(userSettings?.apiKey && userSettings.apiKey.trim());
  const isOllama = userSettings?.provider === 'ollama';

  return (
    <header className="sticky top-0 z-50 bg-[#FAF6F0]/90 backdrop-blur-md pt-3.5 pb-2.5 px-4 sm:px-6 border-b border-black/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Brand Icon Box (Image 1 Style) */}
        <div
          onClick={() => onTabChange?.('home')}
          className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#FEF08A] rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] flex items-center justify-center group-hover:rotate-6 group-hover:scale-105 transition-all">
            <ShieldAlert className="w-5 h-5 text-black" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black tracking-tight text-black uppercase">
                ADVERSARIAL RESUME
              </span>
              <span className="px-1.5 py-0.2 bg-[#FFCCD5] border border-black rounded text-[9px] font-black uppercase">
                7 AGENTS
              </span>
            </div>
            <p className="text-[10px] text-slate-600 font-semibold leading-none mt-0.5">
              Hostile hiring simulation
            </p>
          </div>
        </div>

        {/* Center: Neo-Brutalist Pill Navbar (Image 1 Style) */}
        {onTabChange && (
          <nav className="bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] p-1 sm:p-1.5 flex items-center space-x-0.5 sm:space-x-1.5 overflow-x-auto">
            {/* Tab 1: Home */}
            <button
              onClick={() => onTabChange('home')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'home'
                  ? 'bg-[#C9B7F5] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>home</span>
            </button>

            {/* Tab 2: Projects (The Agent Application) */}
            <button
              onClick={() => onTabChange('project')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'project'
                  ? 'bg-[#C9B7F5] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>workplace</span>
              <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Tab 3: Submit API Key */}
            <button
              onClick={() => onTabChange('api-key')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'api-key'
                  ? 'bg-[#C9B7F5] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]'
                  : 'text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline whitespace-nowrap">submit api key</span>
              <span className="sm:hidden whitespace-nowrap">api key</span>
              {(hasKey || isOllama) && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 border border-black ml-0.5" />
              )}
            </button>
          </nav>
        )}

        {/* Right: Action Button (Image 1 Style: "join us." / "audit now.") */}
        <div className="flex items-center space-x-2 shrink-0">
          {onTabChange && (
            <button
              onClick={() => onTabChange('project')}
              className="px-3 sm:px-5 py-1.5 sm:py-2 bg-black hover:bg-slate-800 text-white rounded-2xl border-2 border-black text-xs font-black tracking-wide shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center space-x-1.5 select-none"
            >
              <Flame className="w-3.5 h-3.5 text-[#FEF08A] fill-[#FEF08A]" />
              <span className="hidden sm:inline">audit now.</span>
              <span className="sm:hidden">audit.</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

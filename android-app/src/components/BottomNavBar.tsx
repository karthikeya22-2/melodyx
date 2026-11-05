import React from 'react';
import { Home, Search, Library, Settings } from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';

export const BottomNavBar: React.FC = () => {
  const { currentTab, setCurrentTab } = useMobilePlayerStore();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] as const;

  return (
    <nav className="shrink-0 w-full bg-[#0A0A0C] border-t border-[#1C1C22] flex items-center justify-around px-2 z-40 select-none pt-2 pb-[max(env(safe-area-inset-bottom,0px),8px)]">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all"
          >
            <Icon
              className={`w-5 h-5 transition-transform ${
                isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] scale-105' : 'text-[#8A8A96]'
              }`}
            />
            <span
              className={`text-[10px] mt-1 font-semibold tracking-tight transition-colors ${
                isActive ? 'text-white font-bold drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]' : 'text-[#8A8A96]'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

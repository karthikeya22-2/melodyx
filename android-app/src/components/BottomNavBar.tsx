import React from 'react';
import { Home, Search, Library } from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';

export const BottomNavBar: React.FC = () => {
  const { currentTab, setCurrentTab } = useMobilePlayerStore();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library }
  ] as const;

  return (
    <nav className="h-16 bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-lg border-t border-white/5 flex items-center justify-around px-2 z-40 select-none pb-[env(safe-area-inset-bottom)]">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className="flex flex-col items-center justify-center w-20 py-1 transition-colors"
          >
            <Icon
              className={`w-6 h-6 transition-transform ${
                isActive ? 'text-white scale-110' : 'text-neutral-400 hover:text-white'
              }`}
            />
            <span
              className={`text-[10px] mt-1 font-medium transition-colors ${
                isActive ? 'text-white font-bold' : 'text-neutral-400'
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


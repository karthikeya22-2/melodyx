import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { RightSidebar } from './components/RightSidebar';
import { BottomPlayer } from './components/BottomPlayer';
import { SearchPage } from './components/SearchPage';
import { SettingsPage } from './components/SettingsPage';
import { LyricsModal } from './components/LyricsModal';
import { AppLoadingScreen } from './components/AppLoadingScreen';
import { CompulsoryAuthScreen } from './components/CompulsoryAuthScreen';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { usePlayerStore } from './store/usePlayerStore';
import { useAuthStore } from './store/useAuthStore';

export const App: React.FC = () => {
  const { currentView, togglePlay, nextTrack, previousTrack } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();
  const [isIntroLoading, setIsIntroLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsIntroLoading(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight' && e.ctrlKey) {
        nextTrack();
      } else if (e.code === 'ArrowLeft' && e.ctrlKey) {
        previousTrack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextTrack, previousTrack]);

  if (isIntroLoading) {
    return <AppLoadingScreen />;
  }

  // Compulsory Google Authentication Gate
  if (!isAuthenticated) {
    return <CompulsoryAuthScreen />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0A0A0C] text-white overflow-hidden select-none">
      {/* 3-Section Desktop Body */}
      <div className="flex flex-1 overflow-hidden p-2 gap-2">
        {/* 1. Left Sidebar */}
        <Sidebar />

        {/* 2. Main Content Area */}
        {currentView === 'search' ? (
          <SearchPage />
        ) : currentView === 'settings' ? (
          <SettingsPage />
        ) : (
          <MainContent />
        )}

        {/* 3. Right Sidebar */}
        <RightSidebar />
      </div>

      {/* Persistent Bottom Playback Bar */}
      <BottomPlayer />

      {/* Synchronized Lyrics Modal */}
      <LyricsModal />

      {/* Global Google Authentication Gate Modal */}
      <GoogleAuthModal />
    </div>
  );
};

export default App;

import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { RightSidebar } from './components/RightSidebar';
import { BottomPlayer } from './components/BottomPlayer';
import { SearchPage } from './components/SearchPage';
import { LyricsModal } from './components/LyricsModal';
import { usePlayerStore } from './store/usePlayerStore';

export const App: React.FC = () => {
  const { currentView, togglePlay, nextTrack, previousTrack, currentTrack } = usePlayerStore();

  // Desktop Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside an input
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

  return (
    <div className="flex flex-col h-screen w-screen bg-black overflow-hidden select-none">
      {/* 3-Section Desktop Body */}
      <div className="flex flex-1 overflow-hidden p-2 gap-2">
        {/* 1. Left Sidebar */}
        <Sidebar />

        {/* 2. Main Content Area */}
        {currentView === 'search' ? <SearchPage /> : <MainContent />}

        {/* 3. Optional Expandable Right Sidebar */}
        <RightSidebar />
      </div>

      {/* Persistent Bottom Playback Bar */}
      <BottomPlayer />

      {/* Synchronized Fullscreen Lyrics Modal */}
      <LyricsModal />
    </div>
  );
};

export default App;


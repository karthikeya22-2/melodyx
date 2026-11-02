import React from 'react';
import { HomeScreen } from './components/HomeScreen';
import { SearchScreen } from './components/SearchScreen';
import { LibraryScreen } from './components/LibraryScreen';
import { MiniPlayer } from './components/MiniPlayer';
import { BottomNavBar } from './components/BottomNavBar';
import { FullScreenPlayer } from './components/FullScreenPlayer';
import { BottomSheetMenu } from './components/BottomSheetMenu';
import { useMobilePlayerStore } from './store/useMobilePlayerStore';

export const App: React.FC = () => {
  const { currentTab } = useMobilePlayerStore();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#090909] text-white overflow-hidden select-none relative max-w-md mx-auto border-x border-[#181818] shadow-2xl">
      {/* Active Screen Tab */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {currentTab === 'home' && <HomeScreen />}
        {currentTab === 'search' && <SearchScreen />}
        {currentTab === 'library' && <LibraryScreen />}
      </div>

      {/* Floating Mini Player (directly above bottom nav) */}
      <MiniPlayer />

      {/* Fixed Bottom Navigation Bar */}
      <BottomNavBar />

      {/* Full-Screen Now Playing Drawer with Waveform Scrubber */}
      <FullScreenPlayer />

      {/* Bottom Sheet Menu */}
      <BottomSheetMenu />
    </div>
  );
};

export default App;

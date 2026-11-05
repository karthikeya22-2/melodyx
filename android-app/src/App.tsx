import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { SearchScreen } from './components/SearchScreen';
import { LibraryScreen } from './components/LibraryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { MiniPlayer } from './components/MiniPlayer';
import { BottomNavBar } from './components/BottomNavBar';
import { FullScreenPlayer } from './components/FullScreenPlayer';
import { BottomSheetMenu } from './components/BottomSheetMenu';
import { AppLoadingScreen } from './components/AppLoadingScreen';
import { CompulsoryAuthScreen } from './components/CompulsoryAuthScreen';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { useMobilePlayerStore } from './store/useMobilePlayerStore';
import { useAuthStore } from './store/useAuthStore';

export const App: React.FC = () => {
  const { currentTab } = useMobilePlayerStore();
  const { isAuthenticated } = useAuthStore();
  const [isIntroLoading, setIsIntroLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsIntroLoading(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  if (isIntroLoading) {
    return <AppLoadingScreen />;
  }

  // Compulsory Google Authentication Gate
  if (!isAuthenticated) {
    return <CompulsoryAuthScreen />;
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-[#0A0A0C] text-white overflow-hidden select-none relative shadow-2xl border-x border-white/5">
      {/* Active Screen Tab with min-h-0 so flexbox allows scrolling rather than overflowing */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        {currentTab === 'home' && <HomeScreen />}
        {currentTab === 'search' && <SearchScreen />}
        {currentTab === 'library' && <LibraryScreen />}
        {currentTab === 'settings' && <SettingsScreen />}
      </div>

      {/* Floating Mini Player (directly above bottom nav) */}
      <MiniPlayer />

      {/* Fixed Bottom Navigation Bar */}
      <BottomNavBar />

      {/* Full-Screen Now Playing Drawer with Waveform Scrubber */}
      <FullScreenPlayer />

      {/* Bottom Sheet Menu */}
      <BottomSheetMenu />

      {/* Global Google Authentication Gate Modal */}
      <GoogleAuthModal />
    </div>
  );
};

export default App;

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
import { UpdateModal, UpdateInfo } from './components/UpdateModal';
import { useMobilePlayerStore } from './store/useMobilePlayerStore';
import { useAuthStore } from './store/useAuthStore';
import { api } from './services/api';
import { MelodyxMedia } from './services/melodyxNativeMedia';

export const App: React.FC = () => {
  const { currentTab, setCurrentTab, isFullScreenOpen, setFullScreenOpen, isOptionsMenuOpen, closeOptionsMenu, selectedPlaylist, setSelectedPlaylist } = useMobilePlayerStore();
  const { isAuthenticated } = useAuthStore();
  const [isIntroLoading, setIsIntroLoading] = useState(true);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsIntroLoading(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  // Check for updates on startup
  useEffect(() => {
    const checkUpdatesOnStart = async () => {
      try {
        let currentVer = '2.0.0';
        let currentCode = 1;
        try {
          const verInfo = await MelodyxMedia.getAppVersion();
          if (verInfo && verInfo.versionName) {
            currentVer = verInfo.versionName;
            currentCode = Number(verInfo.versionCode) || 1;
          }
        } catch (e) { }

        const res = await api.checkForUpdates(currentVer, currentCode);
        if (res && res.isUpdateAvailable) {
          setUpdateInfo(res);
        }
      } catch (e) { }
    };

    const timer = setTimeout(checkUpdatesOnStart, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Native Android Hardware Back Navigation Integration
  useEffect(() => {
    const handleBack = (): boolean => {
      const state = useMobilePlayerStore.getState();

      // 1. If Full-Screen Player is open, close it
      if (state.isFullScreenOpen) {
        state.setFullScreenOpen(false);
        return true;
      }

      // 2. If Options BottomSheet is open, close it
      if (state.isOptionsMenuOpen) {
        state.closeOptionsMenu();
        return true;
      }

      // 3. If in Playlist detail view, return to Library
      if (state.selectedPlaylist) {
        state.setSelectedPlaylist(null);
        return true;
      }

      // 4. If on Search, Library, or Settings, navigate back to Home
      if (state.currentTab !== 'home') {
        state.setCurrentTab('home');
        return true;
      }

      // 5. Already on Home tab with nothing open
      return false;
    };

    (window as any).__handleHardwareBack = handleBack;

    const onBackButton = (e: Event) => {
      if (handleBack()) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('backbutton', onBackButton);
    window.addEventListener('popstate', onBackButton);

    return () => {
      document.removeEventListener('backbutton', onBackButton);
      window.removeEventListener('popstate', onBackButton);
      delete (window as any).__handleHardwareBack;
    };
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

      {/* In-App Release Update Modal */}
      <UpdateModal updateInfo={updateInfo} onClose={() => setUpdateInfo(null)} />
    </div>
  );
};

export default App;

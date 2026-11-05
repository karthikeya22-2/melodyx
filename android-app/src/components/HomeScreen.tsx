import React, { useEffect, useState } from 'react';
import { Settings, History, Heart } from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import { Track } from '../types';
import { recommendationEngine } from '../services/recommendationEngine';
import { GoogleAuthModal } from './GoogleAuthModal';
import { AppLoadingScreen } from './AppLoadingScreen';

export const HomeScreen: React.FC = () => {
  const { playTrack, currentTrack, isPlaying, togglePlay, setCurrentTab, likedTrackIds } = useMobilePlayerStore();
  const { user, isAuthenticated } = useAuthStore();
  const [feed, setFeed] = useState<any>(() => api.getInitialHomeFeed());
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'telugu' | 'hindi' | 'english'>('all');

  useEffect(() => {
    api.getHomeFeed().then(data => {
      if (data) setFeed(data);
    });
  }, []);

  if (!feed) {
    return <AppLoadingScreen />;
  }

  const allTracks: Track[] = [
    ...(feed.trendingTelugu || []),
    ...(feed.trendingHindi || []),
    ...(feed.trendingEnglish || [])
  ];

  const recommendations = recommendationEngine.getRecommendations(allTracks, likedTrackIds);

  // Dynamic Spotify Top 6 Quick Access Shortcuts:
  // Shows songs the user actually listened to and liked, refreshing as new tracks are played
  const dynamicShortcuts: Track[] = [];
  const seenShortcutIds = new Set<string>();

  // 1. Add user's recently played songs first
  for (const t of (recommendations.recentlyPlayed || [])) {
    if (!seenShortcutIds.has(t.id)) {
      seenShortcutIds.add(t.id);
      dynamicShortcuts.push(t);
      if (dynamicShortcuts.length >= 6) break;
    }
  }

  // 2. Add user's favorite songs
  if (dynamicShortcuts.length < 6) {
    for (const t of (recommendations.favorites || [])) {
      if (!seenShortcutIds.has(t.id)) {
        seenShortcutIds.add(t.id);
        dynamicShortcuts.push(t);
        if (dynamicShortcuts.length >= 6) break;
      }
    }
  }

  // 3. Fill remaining slots from catalog if fewer than 6
  if (dynamicShortcuts.length < 6) {
    for (const t of allTracks) {
      if (!seenShortcutIds.has(t.id)) {
        seenShortcutIds.add(t.id);
        dynamicShortcuts.push(t);
        if (dynamicShortcuts.length >= 6) break;
      }
    }
  }

  const quickShortcuts = dynamicShortcuts;

  const renderCarousel = (title: string, tracks: Track[], subtitle?: string, icon?: React.ReactNode) => (
    <section className="space-y-2.5">
      <div className="px-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#F8FAFC] tracking-tight flex items-center space-x-2">
            {icon}
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">{title}</span>
          </h2>
          {subtitle && <p className="text-[11px] text-[#94A3B8]">{subtitle}</p>}
        </div>
      </div>

      <div className="flex overflow-x-auto space-x-3 px-4 no-scrollbar touch-scroll pb-1">
        {tracks.map(track => {
          const isThisPlaying = currentTrack?.id === track.id && isPlaying;
          return (
            <div
              key={track.id}
              onClick={() => {
                if (currentTrack?.id === track.id) togglePlay();
                else playTrack(track, tracks);
              }}
              className="w-32 shrink-0 cursor-pointer active:scale-95 transition-transform"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden mb-2 relative bg-[#141418] border border-white/5 shadow-lg">
                <img
                  src={track.artwork}
                  alt={track.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {isThisPlaying && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] animate-pulse" />
                  </div>
                )}
              </div>
              <h4
                className={`text-xs font-bold truncate ${
                  currentTrack?.id === track.id ? 'text-white underline decoration-slate-400' : 'text-[#F8FAFC]'
                }`}
              >
                {track.title}
              </h4>
              <p className="text-[10px] text-[#94A3B8] truncate mt-0.5">{track.artist}</p>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#0A0A0C] select-none pb-28 touch-scroll">
      {/* 1. Header Bar: Avatar, Greeting, Actions */}
      <div className="px-4 pt-4 pb-2 space-y-3">
        <div className="flex items-center justify-between">
          <div
            onClick={() => useAuthStore.getState().openAuthModal()}
            className="flex items-center space-x-2.5 cursor-pointer active:scale-95 transition-transform"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-lg"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 flex items-center justify-center text-xs font-bold text-black shadow-lg">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
              {user?.displayName
                ? `${feed.greeting}, ${user.displayName.split(' ')[0]}!`
                : `${feed.greeting}!`}
            </h1>
          </div>

          <div className="flex items-center space-x-2.5 text-[#94A3B8]">
            <img
              src="/logo.png"
              alt="Melodyx"
              className="w-7 h-7 rounded-lg object-cover shadow-md ring-1 ring-white/10"
            />
            <button
              onClick={() => setCurrentTab('settings')}
              className="p-1 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Google Authentication Callout if not signed in */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-[#181820] via-[#1E1E26] to-[#181820] border border-white/10 p-3 rounded-xl flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Sign In with Google</p>
                <p className="text-[10px] text-[#94A3B8]">Required to play & stream songs</p>
              </div>
            </div>
            <button
              onClick={() => useAuthStore.getState().openAuthModal('Sign in with Google to play songs.')}
              className="px-3 py-1.5 bg-gradient-to-r from-white via-slate-100 to-slate-300 text-black font-extrabold text-[11px] rounded-full shadow-md active:scale-95 transition-all"
            >
              Sign In
            </button>
          </div>
        )}

        {/* 100% Functional Language Filter Pills */}
        <div className="flex items-center space-x-2">
          {(['all', 'telugu', 'hindi', 'english'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedFilter(lang)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                selectedFilter === lang
                  ? 'bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black font-extrabold shadow-md shadow-white/10 scale-105'
                  : 'bg-[#141418] text-[#94A3B8] border border-white/5 active:bg-[#1A1A20]'
              }`}
            >
              {lang === 'all' ? 'All' : lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 space-y-6">
        {/* 2. Top Quick Access Grid (Shown on 'all' or filtered) */}
        {selectedFilter === 'all' && (
          <div className="grid grid-cols-2 gap-2 px-4">
            {quickShortcuts.map(t => {
              const isThisPlaying = currentTrack?.id === t.id && isPlaying;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    if (currentTrack?.id === t.id) togglePlay();
                    else playTrack(t, quickShortcuts);
                  }}
                  className="bg-[#131316] active:bg-[#1C1C22] border border-white/5 rounded-xl flex items-center overflow-hidden cursor-pointer shadow-sm relative pr-2 transition-colors"
                >
                  <img src={t.artwork} alt={t.title} className="w-12 h-12 object-cover shrink-0" loading="lazy" />
                  <div className="px-2.5 flex-1 truncate">
                    <p className="font-bold text-xs text-[#F8FAFC] truncate">{t.title}</p>
                    <p className="text-[10px] text-[#94A3B8] truncate">{t.artist}</p>
                  </div>
                  {isThisPlaying && (
                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] shrink-0 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Real History / Favorites Sections (Shown when user has actual history or likes) */}
        {selectedFilter === 'all' && recommendations.recentlyPlayed.length > 0 &&
          renderCarousel(
            'Recently Played',
            recommendations.recentlyPlayed,
            'Jump back in',
            <History className="w-4 h-4 text-slate-300" />
          )}

        {selectedFilter === 'all' && recommendations.favorites.length > 0 &&
          renderCarousel(
            'Your Favorites',
            recommendations.favorites,
            'Liked and most played songs',
            <Heart className="w-4 h-4 text-slate-300 fill-slate-300" />
          )}

        {/* 4. Curated Music Hits (Filtered by selected language) */}
        {(selectedFilter === 'all' || selectedFilter === 'telugu') &&
          renderCarousel('Popular Telugu Songs', feed.trendingTelugu || [])}

        {(selectedFilter === 'all' || selectedFilter === 'hindi') &&
          renderCarousel('Hindi Hits', feed.trendingHindi || [])}

        {(selectedFilter === 'all' || selectedFilter === 'english') &&
          renderCarousel('Global Pop Anthems', feed.trendingEnglish || [])}

        {/* 5. Trending Albums: Clickable to play immediately */}
        <section className="space-y-3">
          <div className="px-4">
            <h2 className="text-base font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
              Trending Albums
            </h2>
          </div>
          <div className="flex overflow-x-auto space-x-3 px-4 no-scrollbar touch-scroll pb-1">
            {(feed.trendingAlbums || []).map((alb: any) => (
              <div
                key={alb.id}
                onClick={() => {
                  const baseTitle = alb.title.toLowerCase().split('(')[0].trim();
                  const albumTracks = allTracks.filter(t => t.album.toLowerCase().includes(baseTitle));
                  const queueToPlay = albumTracks.length > 0 ? albumTracks : allTracks.slice(0, 4);
                  playTrack(queueToPlay[0], queueToPlay);
                }}
                className="w-32 shrink-0 cursor-pointer active:scale-95 transition-transform"
              >
                <div className="aspect-square w-full rounded-xl overflow-hidden mb-2 bg-[#141418] border border-white/5 shadow-lg relative group">
                  <img src={alb.artwork} alt={alb.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 active:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg text-black font-bold">
                      ▶
                    </div>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-[#F8FAFC] truncate">{alb.title}</h4>
                <p className="text-[10px] text-[#94A3B8] truncate mt-0.5">{alb.artist}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

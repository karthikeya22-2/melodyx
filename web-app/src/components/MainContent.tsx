import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Heart,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shuffle,
  MoreHorizontal,
  Music,
  ListMusic,
  Sparkles,
  History,
  Radio,
  Plus,
  Trash2
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { api, playlistStorage } from '../services/api';
import { Track, Playlist } from '../types';
import { recommendationEngine } from '../services/recommendationEngine';
import { ImportPlaylistModal } from './ImportPlaylistModal';
import { GoogleAuthModal } from './GoogleAuthModal';
import { AppLoadingScreen } from './AppLoadingScreen';

function formatDuration(sec: number): string {
  if (isNaN(sec) || sec <= 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const MainContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    likedTrackIds,
    toggleLike,
    selectedPlaylist
  } = usePlayerStore();

  const { user, isAuthenticated } = useAuthStore();
  const [feed, setFeed] = useState<any>(() => api.getInitialHomeFeed());
  const [activeCategory, setActiveCategory] = useState<'all' | 'telugu' | 'hindi' | 'english'>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>(() => playlistStorage.getPlaylists());

  useEffect(() => {
    api.getHomeFeed().then(data => {
      if (data) setFeed(data);
    });
  }, []);

  useEffect(() => {
    setCustomPlaylists(playlistStorage.getPlaylists());
  }, [currentView]);

  if (!feed) {
    return <AppLoadingScreen />;
  }

  // Find all liked tracks from feed
  const allCatalogTracks: Track[] = [
    ...(feed.trendingTelugu || []),
    ...(feed.trendingHindi || []),
    ...(feed.trendingEnglish || [])
  ];
  const likedTracks = allCatalogTracks.filter(t => likedTrackIds.includes(t.id));

  // Compute Spotify-like recommendation engine results
  const recommendations = recommendationEngine.getRecommendations(allCatalogTracks, likedTrackIds);

  // Determine tracks for playlist view
  const currentPlaylistTracks: Track[] = selectedPlaylist?.tracks && selectedPlaylist.tracks.length > 0
    ? selectedPlaylist.tracks
    : selectedPlaylist?.id?.includes('telugu')
    ? feed.trendingTelugu || []
    : selectedPlaylist?.id?.includes('hindi')
    ? feed.trendingHindi || []
    : selectedPlaylist?.id?.includes('pop')
    ? feed.trendingEnglish || []
    : feed.trendingTelugu || [];

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
    for (const t of allCatalogTracks) {
      if (!seenShortcutIds.has(t.id)) {
        seenShortcutIds.add(t.id);
        dynamicShortcuts.push(t);
        if (dynamicShortcuts.length >= 6) break;
      }
    }
  }

  const shortcutTracks = dynamicShortcuts;

  // Helper to render standard Spotify track card
  const renderCard = (track: Track, queueList: Track[]) => {
    const isThisPlaying = currentTrack?.id === track.id && isPlaying;
    const isLiked = likedTrackIds.includes(track.id);

    return (
      <div
        key={track.id}
        onClick={() => {
          if (currentTrack?.id === track.id) togglePlay();
          else playTrack(track, queueList);
        }}
        className="group relative bg-[#131316] hover:bg-[#1C1C22] border border-white/5 p-3.5 rounded-xl transition-all duration-300 cursor-pointer flex flex-col shadow-sm"
      >
        {/* Artwork + Floating Shiny Silver Play Button */}
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#1A1A20] mb-3 shadow-md">
          <img
            src={track.artwork}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          <button
            onClick={e => {
              e.stopPropagation();
              if (currentTrack?.id === track.id) togglePlay();
              else playTrack(track, queueList);
            }}
            className={`spotify-play-btn absolute bottom-2 right-2 w-11 h-11 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ${
              isThisPlaying ? 'opacity-100 translate-y-0 shadow-white/30' : ''
            }`}
          >
            {isThisPlaying ? (
              <Pause className="w-5 h-5 fill-black text-black" />
            ) : (
              <Play className="w-5 h-5 fill-black text-black ml-0.5" />
            )}
          </button>
        </div>

        {/* Info */}
        <div className="flex items-start justify-between">
          <div className="truncate pr-1">
            <h4
              className={`font-bold text-sm truncate ${
                currentTrack?.id === track.id ? 'text-white underline decoration-slate-400' : 'text-[#F8FAFC]'
              }`}
            >
              {track.title}
            </h4>
            <p className="text-xs text-[#94A3B8] truncate mt-1">{track.artist}</p>
          </div>

          <button
            onClick={e => {
              e.stopPropagation();
              toggleLike(track);
            }}
            className="p-1 text-[#94A3B8] hover:text-white transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                isLiked ? 'text-white fill-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]' : 'opacity-0 group-hover:opacity-100'
              }`}
            />
          </button>
        </div>
      </div>
    );
  };

  // Helper for Spotify track table row
  const renderTrackRow = (track: Track, index: number, list: Track[]) => {
    const isThisTrack = currentTrack?.id === track.id;
    const isThisPlaying = isThisTrack && isPlaying;
    const isLiked = likedTrackIds.includes(track.id);

    return (
      <div
        key={track.id}
        onClick={() => {
          if (isThisTrack) togglePlay();
          else playTrack(track, list);
        }}
        className={`group grid grid-cols-[16px_1fr_1fr_48px_80px] gap-4 px-4 py-2.5 rounded-lg items-center cursor-pointer text-sm transition-colors ${
          isThisTrack ? 'bg-[#1C1C22] border border-white/10' : 'hover:bg-[#131316]'
        }`}
      >
        {/* Number or Play icon */}
        <div className="flex items-center justify-center text-xs text-[#94A3B8]">
          {isThisPlaying ? (
            <div className="w-3.5 h-3.5 flex items-end justify-between gap-[2px]">
              <span className="w-1 bg-white h-full animate-bounce"></span>
              <span className="w-1 bg-slate-300 h-2/3 animate-bounce delay-75"></span>
              <span className="w-1 bg-slate-400 h-4/5 animate-bounce delay-150"></span>
            </div>
          ) : (
            <>
              <span className="group-hover:hidden">{index + 1}</span>
              <Play className="w-3.5 h-3.5 fill-white text-white hidden group-hover:block ml-0.5" />
            </>
          )}
        </div>

        {/* Title & Artist */}
        <div className="flex items-center space-x-3 truncate">
          <img
            src={track.artwork}
            alt={track.title}
            className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-md ring-1 ring-white/5"
          />
          <div className="truncate">
            <p
              className={`font-semibold truncate text-sm ${
                isThisTrack ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-slate-100'
              }`}
            >
              {track.title}
            </p>
            <p className="text-xs text-[#94A3B8] truncate mt-0.5 group-hover:text-white">
              {track.artist}
            </p>
          </div>
        </div>

        {/* Album */}
        <p className="text-xs text-[#94A3B8] truncate hover:text-white">
          {track.album}
        </p>

        {/* Like */}
        <button
          onClick={e => {
            e.stopPropagation();
            toggleLike(track);
          }}
          className="text-[#94A3B8] hover:text-white"
        >
          <Heart
            className={`w-4 h-4 ${
              isLiked ? 'text-white fill-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]' : 'opacity-0 group-hover:opacity-100'
            }`}
          />
        </button>

        {/* Duration */}
        <p className="text-xs text-[#94A3B8] text-right font-mono">
          {formatDuration(track.duration)}
        </p>
      </div>
    );
  };

  // ==========================================
  // VIEW 1: LIKED SONGS
  // ==========================================
  if (currentView === 'liked') {
    return (
      <main className="flex-1 bg-[#0A0A0C] rounded-xl overflow-y-auto select-none border border-white/5">
        {/* Hero Banner: Matte Black Silver Gradient */}
        <div className="p-8 bg-gradient-to-b from-slate-800/80 via-slate-900/60 to-[#0A0A0C] flex items-end space-x-6 pb-6">
          <div className="w-52 h-52 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-300 to-slate-600 flex items-center justify-center shrink-0 shadow-2xl ring-1 ring-white/20">
            <Heart className="w-24 h-24 text-[#0A0A0C] fill-[#0A0A0C] drop-shadow-md" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Playlist</p>
            <h1 className="text-5xl lg:text-7xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">Liked Songs</h1>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 pt-2">
              <span className="font-bold text-white">Melodyx User</span>
              <span>•</span>
              <span>{likedTracks.length} {likedTracks.length === 1 ? 'song' : 'songs'}</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-8 py-5 flex items-center space-x-6">
          <button
            disabled={likedTracks.length === 0}
            onClick={() => {
              if (likedTracks.length > 0) playTrack(likedTracks[0], likedTracks);
            }}
            className="w-14 h-14 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black flex items-center justify-center shadow-xl shadow-white/10 hover:scale-105 active:scale-95 disabled:opacity-40 transition-transform"
          >
            <Play className="w-7 h-7 fill-black text-black ml-0.5" />
          </button>

          <button
            disabled={likedTracks.length === 0}
            className="text-[#94A3B8] hover:text-white transition-colors"
          >
            <Shuffle className="w-7 h-7" />
          </button>
        </div>

        {/* Table Content */}
        <div className="px-8 pb-10">
          {likedTracks.length > 0 ? (
            <div className="space-y-1">
              <div className="grid grid-cols-[16px_1fr_1fr_48px_80px] gap-4 px-4 py-2 border-b border-[#282828] text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">
                <span>#</span>
                <span>Title</span>
                <span>Album</span>
                <span></span>
                <span className="flex justify-end"><Clock className="w-4 h-4" /></span>
              </div>
              {likedTracks.map((t, idx) => renderTrackRow(t, idx, likedTracks))}
            </div>
          ) : (
            <div className="text-center py-20 text-[#B3B3B3] space-y-3">
              <Heart className="w-12 h-12 mx-auto stroke-1 text-neutral-600" />
              <h3 className="text-base font-bold text-white">Songs you like will appear here</h3>
              <p className="text-xs text-neutral-400">Save songs by tapping the heart icon on any track.</p>
              <button
                onClick={() => setCurrentView('home')}
                className="mt-4 px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:scale-105 transition-transform"
              >
                Find songs
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ==========================================
  // VIEW 2: PLAYLIST VIEW
  // ==========================================
  if (currentView === 'playlist' && selectedPlaylist) {
    return (
      <main className="flex-1 bg-[#0A0A0C] rounded-xl overflow-y-auto select-none border border-white/5">
        {/* Hero Banner: Matte Black Silver Gradient */}
        <div className="p-8 bg-gradient-to-b from-slate-800/80 via-slate-900/60 to-[#0A0A0C] flex items-end space-x-6 pb-6">
          <img
            src={selectedPlaylist.coverUrl}
            alt={selectedPlaylist.title}
            className="w-52 h-52 rounded-2xl object-cover shrink-0 shadow-2xl ring-1 ring-white/10"
          />

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Playlist</p>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">{selectedPlaylist.title}</h1>
            <p className="text-xs text-[#94A3B8]">{selectedPlaylist.description}</p>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 pt-1">
              <span className="font-bold text-white">Melodyx Curated</span>
              <span>•</span>
              <span>{currentPlaylistTracks.length} tracks</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-8 py-5 flex items-center space-x-6">
          <button
            onClick={() => {
              if (currentPlaylistTracks.length > 0) playTrack(currentPlaylistTracks[0], currentPlaylistTracks);
            }}
            className="w-14 h-14 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black flex items-center justify-center shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition-transform"
          >
            <Play className="w-7 h-7 fill-black text-black ml-0.5" />
          </button>
          <button className="text-[#94A3B8] hover:text-white transition-colors">
            <Shuffle className="w-7 h-7" />
          </button>
        </div>

        {/* Table Content */}
        <div className="px-8 pb-10 space-y-1">
          <div className="grid grid-cols-[16px_1fr_1fr_48px_80px] gap-4 px-4 py-2 border-b border-[#282828] text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span></span>
            <span className="flex justify-end"><Clock className="w-4 h-4" /></span>
          </div>
          {currentPlaylistTracks.map((t, idx) => renderTrackRow(t, idx, currentPlaylistTracks))}
        </div>
      </main>
    );
  }

  // ==========================================
  // VIEW 3: YOUR LIBRARY VIEW
  // ==========================================
  if (currentView === 'library') {
    return (
      <main className="flex-1 bg-[#0A0A0C] rounded-xl overflow-y-auto p-6 space-y-6 select-none border border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Your Library</h1>
            <p className="text-xs text-[#94A3B8] mt-1">Playlists, favorites, and imported music from other platforms</p>
          </div>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-extrabold bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black shadow-lg shadow-white/10 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Import Playlist</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* 1. Import Playlist Card */}
          <div
            onClick={() => setIsImportModalOpen(true)}
            className="bg-[#131316] hover:bg-[#1C1C22] border-2 border-dashed border-white/20 hover:border-white/50 p-4 rounded-xl cursor-pointer transition-all space-y-3 group flex flex-col justify-between"
          >
            <div className="aspect-square rounded-lg bg-[#1A1A20] group-hover:bg-white/10 flex items-center justify-center transition-colors">
              <Plus className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-1.5">
                <span>Import Playlist</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-300" />
              </h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">Spotify, JioSaavn or YouTube</p>
            </div>
          </div>

          {/* 2. Liked Songs Tile */}
          <div
            onClick={() => setCurrentView('liked')}
            className="bg-[#131316] hover:bg-[#1C1C22] border border-white/5 p-4 rounded-xl cursor-pointer transition-colors space-y-3 group"
          >
            <div className="aspect-square rounded-lg bg-gradient-to-br from-slate-700 via-slate-800 to-[#131316] flex items-center justify-center shadow-lg ring-1 ring-white/10">
              <Heart className="w-12 h-12 text-white fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Liked Songs</h3>
              <p className="text-xs text-[#94A3B8] mt-1">{likedTracks.length} saved songs</p>
            </div>
          </div>

          {/* 3. Custom Imported Playlists */}
          {customPlaylists.map(pl => (
            <div
              key={pl.id}
              onClick={() => {
                usePlayerStore.getState().setSelectedPlaylist(pl);
                setCurrentView('playlist');
              }}
              className="bg-[#131316] hover:bg-[#1C1C22] border border-white/5 p-4 rounded-xl cursor-pointer transition-colors space-y-3 group relative"
            >
              <div className="aspect-square rounded-lg overflow-hidden shadow-md ring-1 ring-white/5">
                <img src={pl.coverUrl} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white truncate group-hover:text-slate-200 transition-colors">{pl.title}</h3>
                <p className="text-xs text-[#94A3B8] mt-1 truncate">
                  📥 {pl.tracks?.length || pl.trackCount || 0} songs • Imported
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Remove "${pl.title}" from library?`)) {
                    const updated = playlistStorage.deletePlaylist(pl.id);
                    setCustomPlaylists(updated);
                  }
                }}
                className="absolute top-6 right-6 p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                title="Remove playlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* 4. Curated Playlists */}
          {(feed.genrePlaylists || []).map((pl: any) => (
            <div
              key={pl.id}
              onClick={() => {
                usePlayerStore.getState().setSelectedPlaylist(pl);
                setCurrentView('playlist');
              }}
              className="bg-[#131316] hover:bg-[#1C1C22] border border-white/5 p-4 rounded-xl cursor-pointer transition-colors space-y-3 group"
            >
              <div className="aspect-square rounded-lg overflow-hidden shadow-md ring-1 ring-white/5">
                <img src={pl.coverUrl} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white truncate">{pl.title}</h3>
                <p className="text-xs text-[#94A3B8] mt-1 truncate">{pl.description}</p>
              </div>
            </div>
          ))}
        </div>

        <ImportPlaylistModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={() => setCustomPlaylists(playlistStorage.getPlaylists())}
        />
      </main>
    );
  }

  // ==========================================
  // VIEW 4: MELODYX HOME VIEW
  // ==========================================
  return (
    <main className="flex-1 bg-[#0A0A0C] rounded-xl overflow-y-auto p-6 space-y-7 select-none border border-white/5">
      {/* Top Header Bar with Language Category Chips & User Profile */}
      <header className="flex items-center justify-between pb-1">
        <div className="flex items-center space-x-2">
          {(['all', 'telugu', 'hindi', 'english'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-white via-slate-100 to-slate-300 text-black shadow-md shadow-white/20 scale-105'
                  : 'bg-[#131316] text-slate-300 hover:text-white hover:bg-[#1C1C22] border border-white/5'
              }`}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* User Pill with Google Auth */}
        <div
          onClick={() => useAuthStore.getState().openAuthModal()}
          className="flex items-center space-x-2 bg-[#131316] hover:bg-[#1C1C22] px-3.5 py-1.5 rounded-full cursor-pointer transition-colors border border-white/10 shadow-sm"
          title="Manage Google Account"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-white flex items-center justify-center text-xs font-black text-black shadow">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <span className="text-xs font-bold text-white">
            {user?.displayName ? user.displayName.split(' ')[0] : 'Sign In'}
          </span>
        </div>
      </header>

      {/* Greeting Header with Shiny Silver Gradient */}
      <div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
          {user?.displayName
            ? `${feed.greeting}, ${user.displayName.split(' ')[0]}!`
            : `${feed.greeting}!`}
        </h1>
      </div>

      {/* Google Authentication Callout if not signed in */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-[#181820] via-[#1F1F28] to-[#181820] border border-white/10 p-3.5 rounded-xl flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Sign In with Google to Play Songs</p>
              <p className="text-[11px] text-[#94A3B8]">Streaming, playlists, and recommendations unlock immediately after sign in.</p>
            </div>
          </div>
          <button
            onClick={() => useAuthStore.getState().openAuthModal('Sign in with Google to play songs.')}
            className="px-4 py-2 bg-gradient-to-r from-white via-slate-100 to-slate-300 text-black font-extrabold text-xs rounded-full shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            Sign In with Google
          </button>
        </div>
      )}

      {/* Top 6 Quick Shortcut Cards */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {shortcutTracks.map(t => {
          const isThisPlaying = currentTrack?.id === t.id && isPlaying;
          return (
            <div
              key={t.id}
              onClick={() => {
                if (currentTrack?.id === t.id) togglePlay();
                else playTrack(t, shortcutTracks);
              }}
              className="group bg-[#131316] hover:bg-[#1C1C22] border border-white/5 rounded-xl flex items-center overflow-hidden cursor-pointer transition-colors relative shadow-sm"
            >
              <img src={t.artwork} alt={t.title} className="w-16 h-16 object-cover shrink-0" />
              <div className="px-3.5 flex-1 truncate">
                <p className="font-bold text-sm text-white truncate">{t.title}</p>
                <p className="text-xs text-[#94A3B8] truncate">{t.artist}</p>
              </div>

              {/* Shiny Silver Hover Play Button */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  if (currentTrack?.id === t.id) togglePlay();
                  else playTrack(t, shortcutTracks);
                }}
                className={`mr-3 w-10 h-10 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black flex items-center justify-center shadow-lg transition-all duration-200 ${
                  isThisPlaying
                    ? 'opacity-100 scale-100 shadow-white/20'
                    : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 hover:scale-105'
                }`}
              >
                {isThisPlaying ? (
                  <Pause className="w-5 h-5 fill-black text-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                )}
              </button>
            </div>
          );
        })}
      </section>

      {/* Section: Recently Played */}
      {recommendations.recentlyPlayed.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <History className="w-5 h-5 text-slate-300" />
              <span>Recently Played</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recommendations.recentlyPlayed.slice(0, 6).map((t: Track) =>
              renderCard(t, recommendations.recentlyPlayed)
            )}
          </div>
        </section>
      )}

      {/* Section: Your Favorites (Shown only when user actually has liked/favorite tracks) */}
      {recommendations.favorites.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
                <Heart className="w-5 h-5 text-white fill-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
                <span>Your Favorites</span>
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">Tracks you've liked and play on repeat</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recommendations.favorites.slice(0, 6).map((t: Track) =>
              renderCard(t, recommendations.favorites)
            )}
          </div>
        </section>
      )}

      {/* Section 1: Popular Telugu Songs */}
      {(activeCategory === 'all' || activeCategory === 'telugu') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Popular Telugu Songs</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {(feed.trendingTelugu || []).slice(0, 6).map((t: Track) => renderCard(t, feed.trendingTelugu))}
          </div>
        </section>
      )}

      {/* Section 2: Hindi Hits */}
      {(activeCategory === 'all' || activeCategory === 'hindi') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Hindi Hits</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {(feed.trendingHindi || []).slice(0, 6).map((t: Track) => renderCard(t, feed.trendingHindi))}
          </div>
        </section>
      )}

      {/* Section 3: English Hits */}
      {(activeCategory === 'all' || activeCategory === 'english') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">English & Global Hits</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {(feed.trendingEnglish || []).slice(0, 6).map((t: Track) => renderCard(t, feed.trendingEnglish))}
          </div>
        </section>
      )}

      {/* Section 4: Trending Albums */}
      {activeCategory === 'all' && (
        <section className="space-y-3 pb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Trending Albums</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(feed.trendingAlbums || []).map((alb: any) => (
              <div
                key={alb.id}
                onClick={async () => {
                  try {
                    const tracks = await api.getAlbumTracks(alb.id);
                    if (tracks && tracks.length > 0) {
                      playTrack(tracks[0], tracks);
                    } else {
                      usePlayerStore.getState().setSelectedPlaylist({
                        id: alb.id,
                        title: alb.title,
                        description: `${alb.artist} • ${alb.releaseDate}`,
                        coverUrl: alb.artwork
                      });
                      setCurrentView('playlist');
                    }
                  } catch (e) {
                    usePlayerStore.getState().setSelectedPlaylist({
                      id: alb.id,
                      title: alb.title,
                      description: `${alb.artist} • ${alb.releaseDate}`,
                      coverUrl: alb.artwork
                    });
                    setCurrentView('playlist');
                  }
                }}
                className="group bg-[#131316] hover:bg-[#1C1C22] border border-white/5 p-3.5 rounded-xl cursor-pointer transition-colors relative"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-[#1A1A20] mb-3 relative shadow-md">
                  <img src={alb.artwork} alt={alb.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <button className="spotify-play-btn absolute bottom-2 right-2 w-11 h-11 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black flex items-center justify-center shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition-transform">
                    <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                  </button>
                </div>
                <h4 className="font-bold text-sm text-white truncate">{alb.title}</h4>
                <p className="text-xs text-[#94A3B8] truncate mt-1">{alb.artist} • {alb.releaseDate}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

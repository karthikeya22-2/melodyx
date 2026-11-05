import React, { useState, useEffect } from 'react';
import {
  Heart,
  Plus,
  Search,
  ArrowUpDown,
  Grid,
  ChevronLeft,
  Play,
  Pause,
  Shuffle,
  Trash2,
  Sparkles,
  Music2
} from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';
import { api, playlistStorage } from '../services/api';
import { Playlist, Track } from '../types';
import { ImportPlaylistModal } from './ImportPlaylistModal';

function formatDuration(sec: number): string {
  if (isNaN(sec) || sec <= 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const LibraryScreen: React.FC = () => {
  const {
    likedTrackIds,
    selectedPlaylist,
    setSelectedPlaylist,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay
  } = useMobilePlayerStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'playlists' | 'artists'>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>(() => playlistStorage.getPlaylists());
  const [feed, setFeed] = useState<any>(null);

  useEffect(() => {
    api.getHomeFeed().then(setFeed);
    setCustomPlaylists(playlistStorage.getPlaylists());
  }, []);

  const curatedPlaylists = [
    {
      id: 'gen-telugu',
      title: 'Telugu Chartbusters',
      subtitle: 'Playlist • SoundWave',
      coverUrl: 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg'
    },
    {
      id: 'gen-hindi',
      title: 'Bollywood Romance',
      subtitle: 'Playlist • SoundWave',
      coverUrl: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg'
    },
    {
      id: 'gen-pop',
      title: 'Global Pop Anthems',
      subtitle: 'Playlist • SoundWave',
      coverUrl: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg'
    }
  ];

  // ==========================================
  // PLAYLIST DETAIL VIEW
  // ==========================================
  if (selectedPlaylist) {
    const isCurated = curatedPlaylists.some(p => p.id === selectedPlaylist.id);
    const playlistTracks: Track[] = selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0
      ? selectedPlaylist.tracks
      : selectedPlaylist.id?.includes('telugu')
      ? feed?.trendingTelugu || []
      : selectedPlaylist.id?.includes('hindi')
      ? feed?.trendingHindi || []
      : selectedPlaylist.id?.includes('pop')
      ? feed?.trendingEnglish || []
      : feed?.trendingTelugu || [];

    const isPlaylistCurrentlyPlaying =
      isPlaying && currentTrack && playlistTracks.some(t => t.id === currentTrack.id);

    return (
      <div className="flex-1 overflow-y-auto bg-[#0A0A0C] select-none pb-28 touch-scroll">
        {/* Sticky Header with Back Button */}
        <div className="sticky top-0 z-20 bg-[#0A0A0C]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/10">
          <button
            onClick={() => setSelectedPlaylist(null)}
            className="flex items-center space-x-1 p-1 -ml-1 text-white hover:text-slate-300 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-xs font-bold">Library</span>
          </button>

          {!isCurated && (
            <button
              onClick={() => {
                if (confirm(`Remove "${selectedPlaylist.title}" from library?`)) {
                  const updated = playlistStorage.deletePlaylist(selectedPlaylist.id);
                  setCustomPlaylists(updated);
                  setSelectedPlaylist(null);
                }
              }}
              className="p-1.5 text-[#888] hover:text-rose-400 active:scale-95 transition-transform"
              title="Delete Playlist"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Hero Artwork & Metadata */}
        <div className="px-4 pt-4 pb-2 flex flex-col items-center text-center space-y-3">
          <div className="w-48 h-48 rounded-xl overflow-hidden shadow-2xl bg-[#131316] border border-white/10 relative">
            <img
              src={selectedPlaylist.coverUrl}
              alt={selectedPlaylist.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              {selectedPlaylist.title}
            </h1>
            <p className="text-xs text-[#888]">
              {selectedPlaylist.description || 'Playlist • SoundWave'}
            </p>
            <p className="text-[11px] text-[#666]">
              {playlistTracks.length} {playlistTracks.length === 1 ? 'song' : 'songs'} • Full-Length & Free
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-center space-x-4 pt-1">
            <button
              onClick={() => {
                if (playlistTracks.length === 0) return;
                if (isPlaylistCurrentlyPlaying) togglePlay();
                else playTrack(playlistTracks[0], playlistTracks);
              }}
              className="w-12 h-12 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-300 flex items-center justify-center text-black shadow-lg shadow-white/20 active:scale-95 transition-transform"
            >
              {isPlaylistCurrentlyPlaying ? (
                <Pause className="w-6 h-6 fill-black text-black" />
              ) : (
                <Play className="w-6 h-6 fill-black text-black ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                if (playlistTracks.length === 0) return;
                const shuffled = [...playlistTracks].sort(() => Math.random() - 0.5);
                playTrack(shuffled[0], shuffled);
              }}
              className="p-2.5 rounded-full bg-[#131316] border border-white/10 text-white active:scale-95 transition-transform"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Track List */}
        <div className="px-4 pt-3 space-y-1">
          {playlistTracks.map((track, idx) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <div
                key={track.id}
                onClick={() => {
                  if (currentTrack?.id === track.id) togglePlay();
                  else playTrack(track, playlistTracks);
                }}
                className={`flex items-center space-x-3 p-2 rounded-xl active:bg-[#1A1A20] cursor-pointer transition-colors ${
                  isThisPlaying ? 'bg-[#131316] border border-white/5' : ''
                }`}
              >
                <span className="text-xs font-mono text-[#666] w-4 text-center shrink-0">
                  {idx + 1}
                </span>

                <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-[#1A1A20] relative shadow-sm ring-1 ring-white/5">
                  <img
                    src={track.artwork}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  {isThisPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    </div>
                  )}
                </div>

                <div className="truncate flex-1">
                  <h4 className={`text-xs font-bold truncate ${isThisPlaying ? 'text-white font-extrabold drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]' : 'text-white'}`}>
                    {track.title}
                  </h4>
                  <p className="text-[10px] text-[#94A3B8] truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>

                <span className="text-[10px] text-[#666] font-mono shrink-0">
                  {formatDuration(track.duration)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN LIBRARY OVERVIEW
  // ==========================================
  return (
    <div className="flex-1 overflow-y-auto bg-[#0A0A0C] select-none px-4 pt-4 pb-28 touch-scroll">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-white flex items-center justify-center text-xs font-black text-black shadow">
            U
          </div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">Your Library</h1>
        </div>

        <div className="flex items-center space-x-2 text-[#94A3B8]">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1 px-3.5 py-1.5 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black font-bold text-xs shadow-md active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
        <button
          onClick={() => setActiveFilter(activeFilter === 'playlists' ? 'all' : 'playlists')}
          className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
            activeFilter === 'playlists'
              ? 'bg-gradient-to-r from-white via-slate-100 to-slate-300 text-black font-extrabold shadow-sm'
              : 'bg-[#131316] text-[#94A3B8] border border-white/5'
          }`}
        >
          Playlists
        </button>
        <button
          onClick={() => setActiveFilter(activeFilter === 'artists' ? 'all' : 'artists')}
          className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
            activeFilter === 'artists'
              ? 'bg-gradient-to-r from-white via-slate-100 to-slate-300 text-black font-extrabold shadow-sm'
              : 'bg-[#131316] text-[#94A3B8] border border-white/5'
          }`}
        >
          Artists
        </button>
      </div>

      {/* 3. Sort / View Mode */}
      <div className="flex items-center justify-between py-2 text-xs text-[#94A3B8]">
        <div className="flex items-center space-x-1 font-medium">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Recents</span>
        </div>
        <button className="p-1 hover:text-white">
          <Grid className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Library List */}
      <div className="space-y-2 mt-1">
        {/* Import Playlist Quick Action Card */}
        <div
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center space-x-3 p-2.5 rounded-xl bg-[#131316] border border-dashed border-white/20 active:bg-[#1A1A20] cursor-pointer transition-colors"
        >
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div className="truncate flex-1">
            <h3 className="font-bold text-xs text-white flex items-center space-x-1.5">
              <span>Import Playlist</span>
              <Sparkles className="w-3.5 h-3.5 text-slate-300" />
            </h3>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">
              Paste Spotify, JioSaavn or YouTube playlist link
            </p>
          </div>
        </div>

        {/* Liked Songs Tile */}
        <div
          onClick={() => {
            const allTracks = [
              ...(feed?.trendingTelugu || []),
              ...(feed?.trendingHindi || []),
              ...(feed?.trendingEnglish || [])
            ];
            const liked = allTracks.filter(t => likedTrackIds.includes(t.id));
            setSelectedPlaylist({
              id: 'liked-songs',
              title: 'Liked Songs',
              description: 'Your favorite tracks',
              coverUrl: 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg',
              trackCount: liked.length,
              tracks: liked
            });
          }}
          className="flex items-center space-x-3 p-1.5 rounded-xl active:bg-[#1A1A20] cursor-pointer transition-colors"
        >
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-[#131316] flex items-center justify-center shrink-0 shadow-md ring-1 ring-white/10">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="truncate flex-1">
            <h3 className="font-bold text-xs text-white">Liked Songs</h3>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">
              📌 Playlist • {likedTrackIds.length} {likedTrackIds.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
        </div>

        {/* Custom Imported Playlists */}
        {customPlaylists.map(pl => (
          <div
            key={pl.id}
            onClick={() => setSelectedPlaylist(pl)}
            className="flex items-center space-x-3 p-1.5 rounded-xl active:bg-[#1A1A20] cursor-pointer transition-colors"
          >
            <img
              src={pl.coverUrl}
              alt={pl.title}
              className="w-14 h-14 rounded-xl object-cover shrink-0 shadow border border-white/10"
            />
            <div className="truncate flex-1">
              <h3 className="font-bold text-xs text-white truncate">{pl.title}</h3>
              <p className="text-[10px] text-[#888] mt-0.5 truncate">
                📥 Imported • {pl.tracks?.length || pl.trackCount || 0} songs
              </p>
            </div>
          </div>
        ))}

        {/* Curated Playlists */}
        {curatedPlaylists.map(pl => (
          <div
            key={pl.id}
            onClick={() => {
              const tracks = pl.id.includes('telugu')
                ? feed?.trendingTelugu || []
                : pl.id.includes('hindi')
                ? feed?.trendingHindi || []
                : feed?.trendingEnglish || [];

              setSelectedPlaylist({
                id: pl.id,
                title: pl.title,
                description: pl.subtitle,
                coverUrl: pl.coverUrl,
                trackCount: tracks.length,
                tracks
              });
            }}
            className="flex items-center space-x-3 p-1.5 rounded-xl active:bg-[#1A1A20] cursor-pointer transition-colors"
          >
            <img
              src={pl.coverUrl}
              alt={pl.title}
              className="w-14 h-14 rounded-xl object-cover shrink-0 shadow"
            />
            <div className="truncate flex-1">
              <h3 className="font-bold text-xs text-white truncate">{pl.title}</h3>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">{pl.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Import Modal */}
      <ImportPlaylistModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => setCustomPlaylists(playlistStorage.getPlaylists())}
      />
    </div>
  );
};

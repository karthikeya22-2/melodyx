import React, { useEffect, useState } from 'react';
import { X, Mic2, ListMusic, Heart, Disc, Sparkles } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { api } from '../services/api';
import { SyncedLyrics } from '../types';

export const RightSidebar: React.FC = () => {
  const { currentTrack, isRightSidebarOpen, toggleRightSidebar, likedTrackIds, toggleLike, queue, playTrack } = usePlayerStore();
  const [lyrics, setLyrics] = useState<SyncedLyrics | null>(null);

  useEffect(() => {
    if (currentTrack) {
      api.getLyrics(currentTrack).then(setLyrics);
    }
  }, [currentTrack]);

  if (!isRightSidebarOpen) return null;

  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;

  return (
    <aside className="w-80 bg-[#121212] rounded-xl flex flex-col h-full select-none border border-white/5 p-4 overflow-y-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <h3 className="text-sm font-bold text-white tracking-wide">Now Playing</h3>
        <button
          onClick={toggleRightSidebar}
          className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {currentTrack ? (
        <>
          {/* Large Artwork */}
          <div className="aspect-square w-full rounded-xl overflow-hidden shadow-2xl bg-neutral-900 border border-white/10">
            <img src={currentTrack.artwork} alt={currentTrack.title} className="w-full h-full object-cover" />
          </div>

          {/* Track Info & Like */}
          <div className="flex items-start justify-between">
            <div className="truncate pr-3">
              <h2 className="text-lg font-extrabold text-white truncate">{currentTrack.title}</h2>
              <p className="text-sm text-neutral-400 truncate mt-0.5">{currentTrack.artist}</p>
              <p className="text-xs text-neutral-500 truncate mt-1">
                {currentTrack.album} • {currentTrack.language || 'Global'}
              </p>
            </div>
            <button
              onClick={() => toggleLike(currentTrack)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Heart
                className={`w-6 h-6 ${
                  isLiked ? 'text-[#1DB954] fill-[#1DB954]' : 'text-neutral-400 hover:text-white'
                }`}
              />
            </button>
          </div>

          {/* About the Artist Card */}
          <div className="bg-[#181818] p-4 rounded-xl space-y-2 border border-white/5">
            <div className="flex items-center space-x-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#1DB954]" />
              <span>Artist Insight</span>
            </div>
            <h4 className="font-bold text-sm text-white">{currentTrack.artist}</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Top streaming artist with millions of monthly listeners. Featured in popular soundtracks, chartbusters, and global playlists.
            </p>
          </div>

          {/* Live Lyrics Preview */}
          {lyrics && lyrics.lines.length > 0 && (
            <div className="bg-gradient-to-br from-[#1e3a29] to-[#121212] p-4 rounded-xl border border-[#1DB954]/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#1DB954] uppercase tracking-wider">
                  <Mic2 className="w-4 h-4" />
                  <span>Lyrics</span>
                </div>
                <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-neutral-300">Synchronized</span>
              </div>
              <div className="space-y-1.5 text-xs text-neutral-200 font-medium">
                {lyrics.lines.slice(0, 4).map((line, idx) => (
                  <p key={idx} className={idx === 1 ? 'text-[#1DB954] font-bold text-sm' : 'opacity-70'}>
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Up Next in Queue */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                <ListMusic className="w-4 h-4" />
                <span>Next in Queue</span>
              </div>
            </div>
            <div className="space-y-2">
              {queue.slice(1, 4).map((qTrack, i) => (
                <div
                  key={i}
                  onClick={() => playTrack(qTrack)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <img src={qTrack.artwork} alt={qTrack.title} className="w-10 h-10 rounded object-cover" />
                  <div className="truncate flex-1">
                    <p className="text-xs font-bold text-white truncate">{qTrack.title}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{qTrack.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-neutral-500">
          <Disc className="w-12 h-12 stroke-1 mb-3 text-neutral-600 animate-spin-slow" />
          <p className="text-sm font-semibold">Select a track to start playback</p>
          <p className="text-xs mt-1">High quality, ad-free streaming in all languages</p>
        </div>
      )}
    </aside>
  );
};


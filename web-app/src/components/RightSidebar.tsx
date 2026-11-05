import React, { useEffect, useState } from 'react';
import { X, Mic2, ListMusic, Heart, Disc } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { api } from '../services/api';
import { SyncedLyrics } from '../types';

export const RightSidebar: React.FC = () => {
  const {
    currentTrack,
    isRightSidebarOpen,
    toggleRightSidebar,
    likedTrackIds,
    toggleLike,
    queue,
    playTrack,
    toggleLyrics
  } = usePlayerStore();
  const [lyrics, setLyrics] = useState<SyncedLyrics | null>(null);

  useEffect(() => {
    if (currentTrack) {
      api.getLyrics(currentTrack).then(setLyrics);
    }
  }, [currentTrack]);

  if (!isRightSidebarOpen) return null;

  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;

  return (
    <aside className="w-80 bg-[#0A0A0C] border border-white/5 rounded-xl flex flex-col h-full select-none p-4 overflow-y-auto space-y-5 shrink-0">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-sm font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent truncate max-w-[200px]">
          {currentTrack ? currentTrack.title : 'Now playing'}
        </h3>
        <button
          onClick={toggleRightSidebar}
          className="p-1 rounded-full text-[#94A3B8] hover:text-white hover:bg-[#131316] transition-colors"
          title="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {currentTrack ? (
        <>
          {/* Large Artwork */}
          <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#1A1A20] shadow-xl ring-1 ring-white/10">
            <img
              src={currentTrack.artwork}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Track Info & Like */}
          <div className="flex items-start justify-between">
            <div className="truncate pr-2">
              <h2 className="text-xl font-extrabold text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </h2>
              <p className="text-sm text-[#94A3B8] truncate hover:underline hover:text-white cursor-pointer mt-0.5">
                {currentTrack.artist}
              </p>
              <p className="text-xs text-neutral-500 truncate mt-0.5">
                {currentTrack.album}
              </p>
            </div>
            <button
              onClick={() => toggleLike(currentTrack)}
              className="p-1.5 text-[#94A3B8] hover:text-white transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? 'text-white fill-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]' : ''
                }`}
              />
            </button>
          </div>

          {/* About The Artist Card */}
          <div className="bg-[#131316] rounded-xl p-4 space-y-2 border border-white/10">
            <p className="text-xs font-bold text-white uppercase tracking-wider">About the artist</p>
            <div className="flex items-center space-x-3 pt-1">
              <img
                src={currentTrack.artwork}
                alt={currentTrack.artist}
                className="w-12 h-12 rounded-full object-cover shadow ring-1 ring-white/10"
              />
              <div className="truncate">
                <p className="text-sm font-bold text-white truncate">{currentTrack.artist}</p>
                <p className="text-xs text-[#94A3B8]">{currentTrack.language || 'Music'} Artist</p>
              </div>
            </div>
          </div>

          {/* Lyrics Preview */}
          {lyrics && lyrics.lines.length > 0 && (
            <div
              onClick={toggleLyrics}
              className="bg-[#131316] hover:bg-[#1A1A20] p-4 rounded-xl cursor-pointer transition-colors space-y-3 border border-white/10 group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                <div className="flex items-center space-x-1.5">
                  <Mic2 className="w-4 h-4" />
                  <span>Lyrics</span>
                </div>
                <span className="text-[10px] text-[#94A3B8] group-hover:text-white">Fullscreen</span>
              </div>
              <div className="space-y-1.5 text-sm text-[#94A3B8]">
                {lyrics.lines.slice(0, 3).map((line, idx) => (
                  <p key={idx} className={idx === 1 ? 'text-white font-bold' : ''}>
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Up Next in Queue */}
          <div className="bg-[#131316] rounded-xl p-4 space-y-3 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-white uppercase tracking-wider">
                <ListMusic className="w-4 h-4 text-slate-300" />
                <span>Next in queue</span>
              </div>
              <span className="text-xs text-[#94A3B8]">{queue.length} in queue</span>
            </div>

            <div className="space-y-2">
              {queue.slice(1, 5).map((qTrack, i) => (
                <div
                  key={i}
                  onClick={() => playTrack(qTrack)}
                  className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-[#1A1A20] cursor-pointer transition-colors"
                >
                  <img
                    src={qTrack.artwork}
                    alt={qTrack.title}
                    className="w-10 h-10 rounded-lg object-cover shrink-0 ring-1 ring-white/5"
                  />
                  <div className="truncate flex-1">
                    <p className="text-xs font-semibold text-white truncate">{qTrack.title}</p>
                    <p className="text-[11px] text-[#94A3B8] truncate">{qTrack.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-[#757575]">
          <Disc className="w-10 h-10 stroke-1 mb-2 text-[#4D4D4D]" />
          <p className="text-xs">No song playing right now</p>
        </div>
      )}
    </aside>
  );
};

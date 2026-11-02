import React, { useEffect, useState } from 'react';
import { X, Mic2, ListMusic, Heart, Disc } from 'lucide-react';
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
    <aside className="w-72 bg-[#151515] rounded-lg flex flex-col h-full select-none border border-[#222222] p-4 overflow-y-auto space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#252525]">
        <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Now Playing</h3>
        <button
          onClick={toggleRightSidebar}
          className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {currentTrack ? (
        <>
          {/* Artwork */}
          <div className="aspect-square w-full rounded overflow-hidden bg-neutral-900 border border-neutral-800">
            <img src={currentTrack.artwork} alt={currentTrack.title} className="w-full h-full object-cover" />
          </div>

          {/* Track Info */}
          <div className="flex items-start justify-between">
            <div className="truncate pr-2">
              <h2 className="text-sm font-bold text-white truncate">{currentTrack.title}</h2>
              <p className="text-xs text-neutral-400 truncate mt-0.5">{currentTrack.artist}</p>
              <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                {currentTrack.album}
              </p>
            </div>
            <button
              onClick={() => toggleLike(currentTrack)}
              className="p-1 text-neutral-400 hover:text-white"
            >
              <Heart
                className={`w-4 h-4 ${
                  isLiked ? 'text-[#E50914] fill-[#E50914]' : ''
                }`}
              />
            </button>
          </div>

          {/* Real Lyrics Preview */}
          {lyrics && lyrics.lines.length > 0 && (
            <div className="bg-[#1D1D1D] p-3 rounded border border-[#282828] space-y-2">
              <div className="flex items-center space-x-1.5 text-[10px] font-bold text-[#E50914] uppercase tracking-wider">
                <Mic2 className="w-3.5 h-3.5" />
                <span>Lyrics</span>
              </div>
              <div className="space-y-1 text-xs text-neutral-300">
                {lyrics.lines.slice(0, 3).map((line, idx) => (
                  <p key={idx} className={idx === 1 ? 'text-white font-semibold' : 'text-neutral-400'}>
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Up Next in Queue */}
          <div className="space-y-2 pt-1 border-t border-[#252525]">
            <div className="flex items-center space-x-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              <ListMusic className="w-3.5 h-3.5" />
              <span>Next in Queue</span>
            </div>
            <div className="space-y-1.5">
              {queue.slice(1, 4).map((qTrack, i) => (
                <div
                  key={i}
                  onClick={() => playTrack(qTrack)}
                  className="flex items-center space-x-2.5 p-1.5 rounded hover:bg-[#202020] cursor-pointer transition-colors"
                >
                  <img src={qTrack.artwork} alt={qTrack.title} className="w-8 h-8 rounded object-cover" />
                  <div className="truncate flex-1">
                    <p className="text-xs font-medium text-white truncate">{qTrack.title}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{qTrack.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-neutral-500">
          <Disc className="w-8 h-8 stroke-1 mb-2 text-neutral-600" />
          <p className="text-xs">No track currently active</p>
        </div>
      )}
    </aside>
  );
};

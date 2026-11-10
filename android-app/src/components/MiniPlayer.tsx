import React from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    togglePlay,
    setFullScreenOpen,
    likedTrackIds,
    toggleLike
  } = useMobilePlayerStore();

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      onClick={() => setFullScreenOpen(true)}
      className="mx-2 mb-1.5 h-14 bg-[#131316] rounded-xl flex items-center justify-between px-3 cursor-pointer shadow-2xl border border-white/10 relative overflow-hidden select-none z-30 shrink-0"
    >
      {/* Track Info */}
      <div className="flex items-center space-x-3 truncate flex-1 pr-2">
        <img
          src={currentTrack.artwork || '/logo.png'}
          alt={currentTrack.title}
          className="w-10 h-10 rounded-lg object-cover shadow-md shrink-0 ring-1 ring-white/10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.png';
          }}
        />
        <div className="truncate">
          <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
          <p className="text-[11px] text-[#94A3B8] truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => toggleLike(currentTrack)}
          className="p-1.5 text-[#94A3B8] hover:text-white transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${
              isLiked ? 'text-white fill-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]' : ''
            }`}
          />
        </button>

        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black flex items-center justify-center shadow-md shadow-white/20 active:scale-95 transition-transform"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-black text-black" />
          ) : (
            <Play className="w-4 h-4 fill-black text-black ml-0.5" />
          )}
        </button>
      </div>

      {/* Shiny Silver Progress Indicator Line at the Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-slate-200 to-white shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

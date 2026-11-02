import React from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';

export const MiniPlayer: React.FC = () => {
  const { currentTrack, isPlaying, progress, duration, togglePlay, setFullScreenOpen, likedTrackIds, toggleLike } =
    useMobilePlayerStore();

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      onClick={() => setFullScreenOpen(true)}
      className="mx-2 mb-1 h-13 bg-[#1D1D1D] rounded-lg flex items-center justify-between px-3 cursor-pointer shadow-lg border border-[#2B2B2B] relative overflow-hidden select-none z-30"
    >
      {/* Track Info */}
      <div className="flex items-center space-x-2.5 truncate flex-1 pr-2">
        <img
          src={currentTrack.artwork}
          alt={currentTrack.title}
          className="w-9 h-9 rounded object-cover shadow"
        />
        <div className="truncate">
          <p className="text-xs font-semibold text-white truncate">{currentTrack.title}</p>
          <p className="text-[10px] text-neutral-400 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1.5" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => toggleLike(currentTrack)}
          className="p-1.5 text-neutral-400 hover:text-white transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${
              isLiked ? 'text-[#E50914] fill-[#E50914]' : ''
            }`}
          />
        </button>

        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow active:scale-95 transition-transform"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-black" />
          ) : (
            <Play className="w-4 h-4 fill-black ml-0.5" />
          )}
        </button>
      </div>

      {/* Red Progress Indicator Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#333333]">
        <div
          className="h-full bg-[#E50914] transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

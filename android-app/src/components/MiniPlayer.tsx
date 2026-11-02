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
      className="mx-2 mb-1 h-14 bg-[#282828] rounded-lg flex items-center justify-between px-3 cursor-pointer shadow-2xl border border-white/10 relative overflow-hidden select-none z-30"
    >
      {/* Track Info */}
      <div className="flex items-center space-x-3 truncate flex-1 pr-2">
        <img
          src={currentTrack.artwork}
          alt={currentTrack.title}
          className="w-10 h-10 rounded-md object-cover shadow"
        />
        <div className="truncate">
          <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
          <p className="text-[11px] text-neutral-400 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => toggleLike(currentTrack)}
          className="p-2 text-neutral-400 hover:text-white transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${
              isLiked ? 'text-[#1DB954] fill-[#1DB954]' : ''
            }`}
          />
        </button>

        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow transition-transform active:scale-95"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-black" />
          ) : (
            <Play className="w-5 h-5 fill-black ml-0.5" />
          )}
        </button>
      </div>

      {/* Mini Progress Bar Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
        <div
          className="h-full bg-white transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};


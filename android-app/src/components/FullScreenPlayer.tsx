import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  MoreVertical,
  Heart,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Mic2,
  Share2
} from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';
import { api } from '../services/api';
import { SyncedLyrics } from '../types';
import { MobileWaveformProgressBar } from './MobileWaveformProgressBar';

export const FullScreenPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    shuffle,
    repeatMode,
    isFullScreenOpen,
    setFullScreenOpen,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    toggleShuffle,
    toggleRepeat,
    likedTrackIds,
    toggleLike,
    openOptionsMenu
  } = useMobilePlayerStore();

  const [lyrics, setLyrics] = useState<SyncedLyrics | null>(null);
  const [showLyricsCard, setShowLyricsCard] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      api.getLyrics(currentTrack).then(setLyrics);
    }
  }, [currentTrack]);

  if (!isFullScreenOpen || !currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);

  return (
    <div className="fixed inset-0 z-50 bg-[#090909] flex flex-col justify-between p-5 select-none transition-transform duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setFullScreenOpen(false)}
          className="p-2 text-neutral-400 hover:text-white"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center truncate px-4">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
            Playing Track
          </p>
          <p className="text-xs font-semibold text-white truncate">{currentTrack.album}</p>
        </div>

        <button
          onClick={() => openOptionsMenu(currentTrack)}
          className="p-2 text-neutral-400 hover:text-white"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Album Artwork or Synced Lyrics Card */}
      <div className="my-auto py-2">
        {showLyricsCard ? (
          <div className="h-72 bg-[#151515] rounded-xl p-5 overflow-y-auto space-y-4 border border-[#242424]">
            <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
              <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider">Lyrics</span>
              <button
                onClick={() => setShowLyricsCard(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Show Artwork
              </button>
            </div>
            {lyrics && lyrics.lines.length > 0 ? (
              lyrics.lines.map((line, idx) => {
                const isActive =
                  progress >= line.time &&
                  (idx === lyrics.lines.length - 1 || progress < lyrics.lines[idx + 1].time);
                return (
                  <p
                    key={idx}
                    onClick={() => seek(line.time)}
                    className={`text-base font-bold transition-all ${
                      isActive ? 'text-[#E50914]' : 'text-neutral-500'
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })
            ) : (
              <p className="text-xs text-neutral-400">No synchronized lyrics available.</p>
            )}
          </div>
        ) : (
          <div className="aspect-square w-full max-w-[310px] mx-auto rounded-xl overflow-hidden shadow-xl bg-[#151515] border border-[#242424] relative">
            <img
              src={currentTrack.artwork}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
            {currentTrack.isPreview && (
              <div className="absolute top-2 left-2 bg-[#E50914] text-white text-[9px] font-bold px-2 py-0.5 rounded">
                30s Preview
              </div>
            )}
          </div>
        )}
      </div>

      {/* Track Info & Like */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="truncate pr-3">
            <h1 className="text-xl font-bold text-white truncate tracking-tight">
              {currentTrack.title}
            </h1>
            <p className="text-xs font-medium text-neutral-400 truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>
          <button
            onClick={() => toggleLike(currentTrack)}
            className="p-1.5 transition-transform active:scale-125"
          >
            <Heart
              className={`w-6 h-6 ${
                isLiked ? 'text-[#E50914] fill-[#E50914]' : 'text-neutral-400'
              }`}
            />
          </button>
        </div>

        {/* Waveform-Style Progress Player */}
        <div className="mb-4">
          <MobileWaveformProgressBar
            progress={progress}
            duration={duration}
            onSeek={seek}
            trackId={currentTrack.id}
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between px-3 mb-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${
              shuffle ? 'text-[#E50914]' : 'text-neutral-400'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button onClick={previousTrack} className="p-2 text-white">
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-black" />
            ) : (
              <Play className="w-6 h-6 fill-black ml-0.5" />
            )}
          </button>

          <button onClick={nextTrack} className="p-2 text-white">
            <SkipForward className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 transition-colors ${
              repeatMode !== 'off' ? 'text-[#E50914]' : 'text-neutral-400'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom Bar: Lyrics & Share */}
        <div className="flex items-center justify-between text-neutral-400 pt-2 border-t border-[#202020]">
          <button
            onClick={() => setShowLyricsCard(!showLyricsCard)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold ${
              showLyricsCard ? 'bg-[#E50914] text-white' : 'bg-[#1D1D1D] text-neutral-300'
            }`}
          >
            <Mic2 className="w-3 h-3" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => openOptionsMenu(currentTrack)}
            className="p-1.5 text-neutral-400 hover:text-white"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

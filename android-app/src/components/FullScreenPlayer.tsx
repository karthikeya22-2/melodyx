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
  Share2,
  ListMusic
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
    <div className="fixed inset-0 z-50 bg-[#0A0A0C] flex flex-col justify-between p-6 select-none transition-transform duration-300">
      {/* 1. Top Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setFullScreenOpen(false)}
          className="p-2 text-[#94A3B8] hover:text-white"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center truncate px-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-[#94A3B8]">
            PLAYING FROM ALBUM
          </p>
          <p className="text-xs font-bold text-white truncate">{currentTrack.album}</p>
        </div>

        <button
          onClick={() => openOptionsMenu(currentTrack)}
          className="p-2 text-[#94A3B8] hover:text-white"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Album Artwork OR Synced Lyrics Card */}
      <div className="my-auto py-2">
        {showLyricsCard ? (
          <div className="h-72 bg-[#131316] rounded-2xl p-5 overflow-y-auto space-y-4 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Lyrics</span>
              <button
                onClick={() => setShowLyricsCard(false)}
                className="text-xs text-[#94A3B8] hover:text-white font-semibold"
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
                    className={`text-lg font-bold transition-all cursor-pointer ${
                      isActive ? 'text-white font-extrabold scale-102 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-[#666666]'
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })
            ) : (
              <p className="text-xs text-[#94A3B8]">No synchronized lyrics available for this song.</p>
            )}
          </div>
        ) : (
          <div className="aspect-square w-full max-w-[320px] mx-auto rounded-2xl overflow-hidden shadow-2xl bg-[#131316] border border-white/10 relative">
            <img
              src={currentTrack.artwork}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* 3. Track Info, Waveform & Playback Controls */}
      <div className="space-y-4">
        {/* Title, Artist & Like Heart */}
        <div className="flex items-center justify-between">
          <div className="truncate pr-3">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent truncate tracking-tight">
              {currentTrack.title}
            </h1>
            <p className="text-sm font-medium text-[#94A3B8] truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>
          <button
            onClick={() => toggleLike(currentTrack)}
            className="p-1.5 transition-transform active:scale-125"
          >
            <Heart
              className={`w-7 h-7 ${
                isLiked ? 'text-white fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'text-[#94A3B8]'
              }`}
            />
          </button>
        </div>

        {/* Animated Shiny Silver Waveform Scrubber */}
        <div>
          <MobileWaveformProgressBar
            progress={progress}
            duration={duration}
            onSeek={seek}
            trackId={currentTrack.id}
            isPlaying={isPlaying}
          />
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors relative ${
              shuffle ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]' : 'text-[#94A3B8]'
            }`}
          >
            <Shuffle className="w-5 h-5" />
            {shuffle && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>}
          </button>

          <button onClick={previousTrack} className="p-2 text-white">
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black flex items-center justify-center shadow-2xl shadow-white/20 active:scale-95 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black text-black" />
            ) : (
              <Play className="w-7 h-7 fill-black text-black ml-0.5" />
            )}
          </button>

          <button onClick={nextTrack} className="p-2 text-white">
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 transition-colors relative ${
              repeatMode !== 'off' ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]' : 'text-[#94A3B8]'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            {repeatMode !== 'off' && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>}
          </button>
        </div>

        {/* Bottom Utility Bar: Lyrics Toggle & Share */}
        <div className="flex items-center justify-between text-[#94A3B8] pt-2 border-t border-white/10">
          <button
            onClick={() => setShowLyricsCard(!showLyricsCard)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              showLyricsCard ? 'bg-gradient-to-r from-white via-slate-100 to-slate-300 text-black shadow-md' : 'bg-[#1A1A20] text-[#94A3B8]'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => openOptionsMenu(currentTrack)}
            className="p-1.5 text-[#94A3B8] hover:text-white"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

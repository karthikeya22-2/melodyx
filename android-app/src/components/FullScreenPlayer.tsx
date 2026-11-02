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
  ListMusic,
  Share2
} from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';
import { api } from '../services/api';
import { SyncedLyrics } from '../types';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

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
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#3a2010] via-[#1a120e] to-[#121212] flex flex-col justify-between p-6 select-none transition-transform duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setFullScreenOpen(false)}
          className="p-2 text-white/80 hover:text-white"
        >
          <ChevronDown className="w-7 h-7" />
        </button>

        <div className="text-center truncate px-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
            Playing from Album
          </p>
          <p className="text-xs font-bold text-white truncate">{currentTrack.album}</p>
        </div>

        <button
          onClick={() => openOptionsMenu(currentTrack)}
          className="p-2 text-white/80 hover:text-white"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Album Artwork or Synced Lyrics */}
      <div className="my-auto py-4">
        {showLyricsCard ? (
          <div className="h-80 bg-black/40 backdrop-blur-md rounded-2xl p-6 overflow-y-auto space-y-4 border border-white/10">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-[#1DB954] uppercase tracking-wider">Synchronized Lyrics</span>
              <button
                onClick={() => setShowLyricsCard(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Show Artwork
              </button>
            </div>
            {lyrics && lyrics.lines.length > 0 ? (
              lyrics.lines.map((line, idx) => {
                const isActive = progress >= line.time && (idx === lyrics.lines.length - 1 || progress < lyrics.lines[idx + 1].time);
                return (
                  <p
                    key={idx}
                    onClick={() => seek(line.time)}
                    className={`text-lg font-bold transition-all ${
                      isActive ? 'text-[#1DB954] scale-105' : 'text-white/40'
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })
            ) : (
              <p className="text-sm text-neutral-400">Enjoy the music streaming with zero ads.</p>
            )}
          </div>
        ) : (
          <div className="aspect-square w-full max-w-[340px] mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/5">
            <img
              src={currentTrack.artwork}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Track Info & Like */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="truncate pr-4">
            <h1 className="text-2xl font-black text-white truncate tracking-tight">
              {currentTrack.title}
            </h1>
            <p className="text-sm font-semibold text-neutral-400 truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>
          <button
            onClick={() => toggleLike(currentTrack)}
            className="p-2 transition-transform active:scale-125"
          >
            <Heart
              className={`w-7 h-7 ${
                isLiked ? 'text-[#1DB954] fill-[#1DB954]' : 'text-white'
              }`}
            />
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="space-y-1 mb-4">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={e => seek(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-semibold text-neutral-400">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between px-2 mb-6">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${
              shuffle ? 'text-[#1DB954]' : 'text-neutral-400'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button onClick={previousTrack} className="p-2 text-white">
            <SkipBack className="w-8 h-8 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transition-transform active:scale-90"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-black" />
            ) : (
              <Play className="w-8 h-8 fill-black ml-1" />
            )}
          </button>

          <button onClick={nextTrack} className="p-2 text-white">
            <SkipForward className="w-8 h-8 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 transition-colors ${
              repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-neutral-400'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Bottom Utility Icons */}
        <div className="flex items-center justify-between text-neutral-400 pt-2 border-t border-white/5">
          <button
            onClick={() => setShowLyricsCard(!showLyricsCard)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              showLyricsCard ? 'bg-[#1DB954] text-black' : 'bg-white/10 text-white'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>

          <div className="flex items-center space-x-4">
            <button className="p-1.5 hover:text-white">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-1.5 hover:text-white">
              <ListMusic className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


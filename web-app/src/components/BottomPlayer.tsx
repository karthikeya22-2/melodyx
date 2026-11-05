import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Mic2,
  ListMusic,
  Maximize2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { WaveformProgressBar } from './WaveformProgressBar';

export const BottomPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    playbackError,
    progress,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    likedTrackIds,
    isRightSidebarOpen,
    isLyricsOpen,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    toggleRightSidebar,
    toggleLyrics
  } = usePlayerStore();

  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;

  return (
    <footer className="h-20 bg-[#0A0A0C] border-t border-white/10 px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* 1. LEFT: Current Track Info */}
      <div className="flex items-center space-x-3.5 w-[30%] min-w-[180px]">
        {currentTrack ? (
          <>
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#1A1A20] shadow-md ring-1 ring-white/10 shrink-0 relative">
              <img
                src={currentTrack.artwork}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="truncate max-w-[200px]">
              <h4 className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-[#94A3B8] truncate hover:underline hover:text-white cursor-pointer mt-0.5">
                {currentTrack.artist}
              </p>
              {playbackError ? (
                <p className="text-[10px] text-red-400 truncate flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" /> Error
                </p>
              ) : isBuffering ? (
                <p className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                  <Loader2 className="w-3 h-3 animate-spin text-white" /> Buffering...
                </p>
              ) : null}
            </div>

            <button
              onClick={() => toggleLike(currentTrack)}
              className="p-1 text-[#94A3B8] hover:text-white transition-colors"
              title={isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? 'text-white fill-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]' : 'hover:scale-110'
                }`}
              />
            </button>
          </>
        ) : (
          <div className="text-xs text-[#757575]">No track selected</div>
        )}
      </div>

      {/* 2. CENTER: Transport Controls & Waveform Scrubber */}
      <div className="flex flex-col items-center justify-center max-w-[722px] w-[40%]">
        {/* Buttons Row */}
        <div className="flex items-center space-x-5 mb-1">
          <button
            onClick={toggleShuffle}
            className={`transition-colors relative ${
              shuffle ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]' : 'text-[#94A3B8] hover:text-white'
            }`}
            title="Enable shuffle"
          >
            <Shuffle className="w-4 h-4" />
            {shuffle && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>}
          </button>

          <button
            onClick={previousTrack}
            className="text-[#94A3B8] hover:text-white transition-colors"
            title="Previous track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-9 h-9 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black shadow-lg shadow-white/20 hover:scale-105 active:scale-95 flex items-center justify-center transition-all disabled:opacity-40"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black text-black" />
            ) : (
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="text-[#94A3B8] hover:text-white transition-colors"
            title="Next track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`transition-colors relative ${
              repeatMode !== 'off' ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]' : 'text-[#94A3B8] hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            {repeatMode !== 'off' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>}
          </button>
        </div>

        {/* Shiny Silver Animated Waveform Scrubber */}
        <WaveformProgressBar
          progress={progress}
          duration={duration}
          onSeek={seek}
          trackId={currentTrack?.id || 'empty'}
          isPlaying={isPlaying}
        />
      </div>

      {/* 3. RIGHT: Lyrics, Queue Panel & Volume */}
      <div className="flex items-center justify-end space-x-3 w-[30%] min-w-[180px]">
        {/* Lyrics Button */}
        <button
          onClick={toggleLyrics}
          className={`p-1.5 rounded transition-colors ${
            isLyricsOpen ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]' : 'text-[#94A3B8] hover:text-white'
          }`}
          title="Lyrics"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Queue / Now Playing Panel Button */}
        <button
          onClick={toggleRightSidebar}
          className={`p-1.5 rounded transition-colors ${
            isRightSidebarOpen ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]' : 'text-[#94A3B8] hover:text-white'
          }`}
          title="Now playing view"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Volume Slider */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="text-[#94A3B8] hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1 rounded appearance-none cursor-pointer bg-white/20 accent-slate-200"
          />
        </div>
      </div>
    </footer>
  );
};

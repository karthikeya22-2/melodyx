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
  SidebarClose,
  SidebarOpen,
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
    <footer className="h-24 bg-[#151515] border-t border-[#262626] px-5 flex items-center justify-between select-none z-30">
      {/* LEFT: Current Track Details */}
      <div className="flex items-center space-x-3 w-1/4 min-w-[200px]">
        {currentTrack ? (
          <>
            <div className="w-14 h-14 rounded overflow-hidden bg-[#1D1D1D] shadow shrink-0 border border-neutral-800 relative">
              <img src={currentTrack.artwork} alt={currentTrack.title} className="w-full h-full object-cover" />
              {currentTrack.isPreview && (
                <div className="absolute top-0 right-0 bg-[#E50914] text-[8px] font-bold text-white px-1 rounded-bl">
                  PREVIEW
                </div>
              )}
            </div>
            <div className="truncate max-w-[190px]">
              <div className="flex items-center space-x-1.5">
                <h4 className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
                  {currentTrack.title}
                </h4>
              </div>
              <p className="text-xs text-neutral-400 truncate hover:underline cursor-pointer mt-0.5">
                {currentTrack.artist}
              </p>
              {playbackError ? (
                <p className="text-[10px] text-[#E50914] truncate flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" /> {playbackError}
                </p>
              ) : isBuffering ? (
                <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                  <Loader2 className="w-3 h-3 animate-spin text-[#E50914]" /> Buffering...
                </p>
              ) : null}
            </div>
            <button
              onClick={() => toggleLike(currentTrack)}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              title={isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? 'text-[#E50914] fill-[#E50914]' : 'hover:scale-110'
                }`}
              />
            </button>
          </>
        ) : (
          <div className="text-xs text-neutral-500">No track selected</div>
        )}
      </div>

      {/* CENTER: Transport Controls & Waveform Progress Display */}
      <div className="flex flex-col items-center justify-center max-w-[620px] w-2/4">
        {/* Buttons */}
        <div className="flex items-center space-x-6 mb-1">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${
              shuffle ? 'text-[#E50914]' : 'text-neutral-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={previousTrack}
            className="text-neutral-400 hover:text-white transition-colors"
            title="Previous track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-9 h-9 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center shadow transition-transform active:scale-95 disabled:opacity-40"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="text-neutral-400 hover:text-white transition-colors"
            title="Next track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`transition-colors ${
              repeatMode !== 'off' ? 'text-[#E50914]' : 'text-neutral-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Waveform Scrubber Display */}
        <WaveformProgressBar
          progress={progress}
          duration={duration}
          onSeek={seek}
          trackId={currentTrack?.id || 'empty'}
        />
      </div>

      {/* RIGHT: Volume, Lyrics & Panel Toggles */}
      <div className="flex items-center justify-end space-x-3 w-1/4 min-w-[200px]">
        <button
          onClick={toggleLyrics}
          className={`p-1.5 rounded transition-colors ${
            isLyricsOpen ? 'text-[#E50914]' : 'text-neutral-400 hover:text-white'
          }`}
          title="Lyrics"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        <button
          onClick={toggleRightSidebar}
          className={`p-1.5 rounded transition-colors ${
            isRightSidebarOpen ? 'text-[#E50914]' : 'text-neutral-400 hover:text-white'
          }`}
          title="Toggle Info Panel"
        >
          {isRightSidebarOpen ? <SidebarClose className="w-4 h-4" /> : <SidebarOpen className="w-4 h-4" />}
        </button>

        {/* Volume */}
        <div className="flex items-center space-x-2">
          <button onClick={toggleMute} className="text-neutral-400 hover:text-white transition-colors">
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
            className="w-20 h-1 bg-[#333333] rounded appearance-none cursor-pointer"
          />
        </div>
      </div>
    </footer>
  );
};

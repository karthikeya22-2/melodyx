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
  SidebarClose,
  SidebarOpen
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const BottomPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
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
    <footer className="h-24 bg-black border-t border-white/10 px-4 flex items-center justify-between select-none z-30">
      {/* LEFT: Current Track Details */}
      <div className="flex items-center space-x-3 w-1/4 min-w-[200px]">
        {currentTrack ? (
          <>
            <div className="w-14 h-14 rounded-md overflow-hidden bg-neutral-900 shadow-md shrink-0">
              <img src={currentTrack.artwork} alt={currentTrack.title} className="w-full h-full object-cover" />
            </div>
            <div className="truncate max-w-[180px]">
              <h4 className="text-sm font-bold text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-neutral-400 truncate hover:underline cursor-pointer mt-0.5">
                {currentTrack.artist}
              </p>
            </div>
            <button
              onClick={() => toggleLike(currentTrack)}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              title={isLiked ? 'Remove from your Liked Songs' : 'Save to your Liked Songs'}
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? 'text-[#1DB954] fill-[#1DB954]' : 'hover:scale-110'
                }`}
              />
            </button>
          </>
        ) : (
          <div className="text-xs text-neutral-500">No song currently loaded</div>
        )}
      </div>

      {/* CENTER: Playback Controls & Timeline */}
      <div className="flex flex-col items-center justify-center max-w-[650px] w-2/4">
        {/* Control Buttons */}
        <div className="flex items-center space-x-6 mb-1.5">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${
              shuffle ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'
            }`}
            title="Enable shuffle"
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
            className="w-9 h-9 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
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
              repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Timeline Slider */}
        <div className="w-full flex items-center space-x-2 text-[11px] text-neutral-400 font-medium">
          <span className="w-9 text-right">{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={e => seek(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer hover:h-1.5 transition-all"
          />
          <span className="w-9 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* RIGHT: Volume, Lyrics & Panel Toggles */}
      <div className="flex items-center justify-end space-x-3 w-1/4 min-w-[200px]">
        <button
          onClick={toggleLyrics}
          className={`p-1.5 rounded-full transition-colors ${
            isLyricsOpen ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'
          }`}
          title="Lyrics"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        <button
          onClick={toggleRightSidebar}
          className={`p-1.5 rounded-full transition-colors ${
            isRightSidebarOpen ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'
          }`}
          title="Toggle Now Playing Panel"
        >
          {isRightSidebarOpen ? <SidebarClose className="w-4 h-4" /> : <SidebarOpen className="w-4 h-4" />}
        </button>

        {/* Volume Slider */}
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
            className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer hover:h-1.5 transition-all"
          />
        </div>
      </div>
    </footer>
  );
};


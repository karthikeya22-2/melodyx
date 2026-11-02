import { create } from 'zustand';
import { Track } from '../types';

interface MobilePlayerStore {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Track[];
  likedTrackIds: string[];

  // Mobile Navigation & View
  currentTab: 'home' | 'search' | 'library';
  isFullScreenOpen: boolean;
  isLyricsActive: boolean;
  isOptionsMenuOpen: boolean;
  selectedTrackForOptions: Track | null;

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seek: (seconds: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (track: Track) => void;

  // Mobile Modal Actions
  setCurrentTab: (tab: 'home' | 'search' | 'library') => void;
  setFullScreenOpen: (open: boolean) => void;
  toggleLyricsActive: () => void;
  openOptionsMenu: (track: Track) => void;
  closeOptionsMenu: () => void;
}

const audioElement = new Audio();
audioElement.preload = 'auto';

// Android Native MediaSession Integration
function updateMediaSession(track: Track, isPlaying: boolean, seekAction: (sec: number) => void, toggleAction: () => void, nextAction: () => void, prevAction: () => void) {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork: [
        { src: track.artwork, sizes: '96x96', type: 'image/jpeg' },
        { src: track.artwork, sizes: '256x256', type: 'image/jpeg' },
        { src: track.artwork, sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play', toggleAction);
    navigator.mediaSession.setActionHandler('pause', toggleAction);
    navigator.mediaSession.setActionHandler('nexttrack', nextAction);
    navigator.mediaSession.setActionHandler('previoustrack', prevAction);
    navigator.mediaSession.setActionHandler('seekto', details => {
      if (details.seekTime !== undefined) seekAction(details.seekTime);
    });
  }
}

export const useMobilePlayerStore = create<MobilePlayerStore>((set, get) => {
  audioElement.addEventListener('timeupdate', () => {
    set({ progress: audioElement.currentTime });
    if ('mediaSession' in navigator && audioElement.duration) {
      try {
        navigator.mediaSession.setPositionState({
          duration: audioElement.duration,
          playbackRate: audioElement.playbackRate,
          position: audioElement.currentTime
        });
      } catch (e) {}
    }
  });

  audioElement.addEventListener('loadedmetadata', () => {
    set({ duration: audioElement.duration || get().currentTrack?.duration || 0 });
  });

  audioElement.addEventListener('ended', () => {
    const { repeatMode, nextTrack } = get();
    if (repeatMode === 'one') {
      audioElement.currentTime = 0;
      audioElement.play();
    } else {
      nextTrack();
    }
  });

  return {
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    shuffle: false,
    repeatMode: 'off',
    queue: [],
    likedTrackIds: ['telugu-1'],

    currentTab: 'home',
    isFullScreenOpen: false,
    isLyricsActive: false,
    isOptionsMenuOpen: false,
    selectedTrackForOptions: null,

    playTrack: (track: Track, newQueue?: Track[]) => {
      const state = get();
      if (newQueue) {
        set({ queue: newQueue });
      } else if (!state.queue.some(t => t.id === track.id)) {
        set({ queue: [track, ...state.queue] });
      }

      set({
        currentTrack: track,
        isPlaying: true,
        progress: 0,
        duration: track.duration
      });

      const streamSrc = track.audioUrl || `http://localhost:5000/api/stream/play/${encodeURIComponent(track.id)}`;
      audioElement.src = streamSrc;
      audioElement.play().catch(console.warn);

      updateMediaSession(
        track,
        true,
        sec => get().seek(sec),
        () => get().togglePlay(),
        () => get().nextTrack(),
        () => get().previousTrack()
      );
    },

    togglePlay: () => {
      const { isPlaying, currentTrack, queue, playTrack } = get();
      if (!currentTrack && queue.length > 0) {
        playTrack(queue[0]);
        return;
      }
      if (isPlaying) {
        audioElement.pause();
        set({ isPlaying: false });
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
      } else {
        audioElement.play().catch(console.warn);
        set({ isPlaying: true });
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
      }
    },

    pause: () => {
      audioElement.pause();
      set({ isPlaying: false });
    },

    resume: () => {
      audioElement.play().catch(console.warn);
      set({ isPlaying: true });
    },

    nextTrack: () => {
      const { queue, currentTrack, shuffle, playTrack, repeatMode } = get();
      if (!queue.length) return;
      const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
      let nextIndex = 0;

      if (shuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
      } else if (currentIndex >= 0 && currentIndex < queue.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
        return;
      }

      playTrack(queue[nextIndex]);
    },

    previousTrack: () => {
      const { queue, currentTrack, playTrack } = get();
      if (audioElement.currentTime > 3) {
        audioElement.currentTime = 0;
        set({ progress: 0 });
        return;
      }
      if (!queue.length) return;
      const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
      playTrack(queue[prevIndex]);
    },

    seek: (seconds: number) => {
      audioElement.currentTime = seconds;
      set({ progress: seconds });
    },

    toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),

    toggleRepeat: () => {
      set(s => {
        const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
        const next = modes[(modes.indexOf(s.repeatMode) + 1) % modes.length];
        return { repeatMode: next };
      });
    },

    toggleLike: (track: Track) => {
      set(s => {
        const isLiked = s.likedTrackIds.includes(track.id);
        const newLikes = isLiked
          ? s.likedTrackIds.filter(id => id !== track.id)
          : [...s.likedTrackIds, track.id];
        return { likedTrackIds: newLikes };
      });
    },

    setCurrentTab: tab => set({ currentTab: tab }),
    setFullScreenOpen: open => set({ isFullScreenOpen: open }),
    toggleLyricsActive: () => set(s => ({ isLyricsActive: !s.isLyricsActive })),
    openOptionsMenu: track => set({ isOptionsMenuOpen: true, selectedTrackForOptions: track }),
    closeOptionsMenu: () => set({ isOptionsMenuOpen: false, selectedTrackForOptions: null })
  };
});


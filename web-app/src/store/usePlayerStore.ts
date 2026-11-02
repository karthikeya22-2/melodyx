import { create } from 'zustand';
import { Track, Playlist } from '../types';

interface PlayerStore {
  // Current playback state
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Track[];
  history: Track[];
  likedTrackIds: string[];

  // Navigation & UI state
  currentView: 'home' | 'search' | 'library' | 'playlist' | 'liked';
  selectedPlaylist: Playlist | null;
  searchQuery: string;
  isRightSidebarOpen: boolean;
  isLyricsOpen: boolean;

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;

  // UI Actions
  setCurrentView: (view: 'home' | 'search' | 'library' | 'playlist' | 'liked') => void;
  setSelectedPlaylist: (playlist: Playlist | null) => void;
  setSearchQuery: (query: string) => void;
  toggleRightSidebar: () => void;
  toggleLyrics: () => void;
}

// Global HTML5 Audio instance for seamless background streaming
const audioElement = new Audio();
audioElement.preload = 'auto';

export const usePlayerStore = create<PlayerStore>((set, get) => {
  // Audio element listeners
  audioElement.addEventListener('timeupdate', () => {
    set({ progress: audioElement.currentTime });
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
    volume: 0.8,
    isMuted: false,
    shuffle: false,
    repeatMode: 'off',
    queue: [],
    history: [],
    likedTrackIds: ['telugu-1', 'hindi-1'],

    currentView: 'home',
    selectedPlaylist: null,
    searchQuery: '',
    isRightSidebarOpen: true,
    isLyricsOpen: false,

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
        duration: track.duration,
        history: state.currentTrack ? [state.currentTrack, ...state.history] : state.history
      });

      // Point audio element to direct stream or proxy
      const streamSrc = track.audioUrl || `http://localhost:5000/api/stream/play/${encodeURIComponent(track.id)}`;
      audioElement.src = streamSrc;
      audioElement.volume = state.isMuted ? 0 : state.volume;
      audioElement.play().catch(e => {
        console.warn('Autoplay prevented or stream loading:', e.message);
      });
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
      } else {
        audioElement.play().catch(console.warn);
        set({ isPlaying: true });
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

    setVolume: (val: number) => {
      const cleanVal = Math.max(0, Math.min(1, val));
      audioElement.volume = cleanVal;
      set({ volume: cleanVal, isMuted: cleanVal === 0 });
    },

    toggleMute: () => {
      const { isMuted, volume } = get();
      if (isMuted) {
        audioElement.volume = volume || 0.8;
        set({ isMuted: false });
      } else {
        audioElement.volume = 0;
        set({ isMuted: true });
      }
    },

    toggleShuffle: () => {
      set(s => ({ shuffle: !s.shuffle }));
    },

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

    addToQueue: (track: Track) => {
      set(s => ({ queue: [...s.queue, track] }));
    },

    removeFromQueue: (index: number) => {
      set(s => ({ queue: s.queue.filter((_, i) => i !== index) }));
    },

    setCurrentView: view => set({ currentView: view }),
    setSelectedPlaylist: playlist => set({ selectedPlaylist: playlist }),
    setSearchQuery: query => set({ searchQuery: query }),
    toggleRightSidebar: () => set(s => ({ isRightSidebarOpen: !s.isRightSidebarOpen })),
    toggleLyrics: () => set(s => ({ isLyricsOpen: !s.isLyricsOpen }))
  };
});


import { create } from 'zustand';
import { Track, Playlist } from '../types';
import { recommendationEngine } from '../services/recommendationEngine';
import { useAuthStore } from './useAuthStore';

interface PlayerStore {
  // Current playback state
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  playbackError: string | null;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Track[];
  history: Track[];
  likedTrackIds: string[];
  playbackSource: 'search' | 'playlist' | 'library' | 'home' | null;

  // Navigation & UI state
  currentView: 'home' | 'search' | 'library' | 'playlist' | 'liked' | 'settings';
  selectedPlaylist: Playlist | null;
  searchQuery: string;
  isRightSidebarOpen: boolean;
  isLyricsOpen: boolean;

  // Actions
  playTrack: (track: Track, newQueue?: Track[], source?: 'search' | 'playlist' | 'library' | 'home') => void;
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
  redirectToUserPlaylist: () => boolean;

  // UI Actions
  setCurrentView: (view: 'home' | 'search' | 'library' | 'playlist' | 'liked' | 'settings') => void;
  setSelectedPlaylist: (playlist: Playlist | null) => void;
  setSearchQuery: (query: string) => void;
  toggleRightSidebar: () => void;
  toggleLyrics: () => void;
}

const audioElement = new Audio();
audioElement.preload = 'auto';

export const usePlayerStore = create<PlayerStore>((set, get) => {
  // Precise time update
  audioElement.addEventListener('timeupdate', () => {
    set({ progress: audioElement.currentTime });
  });

  // Verify real audio duration once audio headers arrive
  audioElement.addEventListener('loadedmetadata', () => {
    const realDuration = audioElement.duration;
    if (realDuration && !isNaN(realDuration) && isFinite(realDuration)) {
      set({ duration: realDuration, isBuffering: false, playbackError: null });
    }
  });

  audioElement.addEventListener('canplay', () => {
    set({ isBuffering: false });
  });

  audioElement.addEventListener('waiting', () => {
    set({ isBuffering: true });
  });

  audioElement.addEventListener('stalled', () => {
    set({ isBuffering: true });
  });

  audioElement.addEventListener('playing', () => {
    set({ isBuffering: false, isPlaying: true, playbackError: null });
  });

  // Detect and handle playback errors cleanly
  audioElement.addEventListener('error', () => {
    console.error('Audio stream playback error encountered on:', audioElement.src);
    set({
      isBuffering: false,
      isPlaying: false,
      playbackError: 'Audio stream currently unavailable or format unsupported.'
    });
  });

  // Track completion: triggers next song only after full playback
  audioElement.addEventListener('ended', () => {
    const { repeatMode, nextTrack } = get();
    if (repeatMode === 'one') {
      audioElement.currentTime = 0;
      audioElement.play().catch(console.warn);
    } else {
      nextTrack();
    }
  });

  return {
    currentTrack: null,
    isPlaying: false,
    isBuffering: false,
    playbackError: null,
    progress: 0,
    duration: 0,
    volume: 0.85,
    isMuted: false,
    shuffle: false,
    repeatMode: 'off',
    queue: [],
    history: [],
    likedTrackIds: (() => {
      try {
        const raw = localStorage.getItem('melodyx_liked_ids') || localStorage.getItem('soundwave_liked_ids');
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    })(),
    playbackSource: null,

    currentView: 'home',
    selectedPlaylist: null,
    searchQuery: '',
    isRightSidebarOpen: false, // Clean minimalist desktop view by default
    isLyricsOpen: false,

    playTrack: (track: Track, newQueue?: Track[], source?: 'search' | 'playlist' | 'library' | 'home') => {
      // Must be logged in with Google to stream and play songs
      if (!useAuthStore.getState().isAuthenticated) {
        useAuthStore.getState().openAuthModal('Sign in with Google to play songs and access full music playback.');
        return;
      }

      if (source) {
        set({ playbackSource: source });
      }

      const state = get();
      if (newQueue) {
        set({ queue: newQueue });
      } else if (!state.queue.some(t => t.id === track.id)) {
        set({ queue: [track, ...state.queue] });
      }

      // Record play in recommendation engine
      try {
        recommendationEngine.recordPlay(track);
      } catch (e) { }

      set({
        currentTrack: track,
        isPlaying: true,
        isBuffering: true,
        playbackError: null,
        progress: 0,
        duration: track.duration,
        history: state.currentTrack ? [state.currentTrack, ...state.history] : state.history
      });

      // Stream via robust backend proxy or verified direct link
      let streamSrc = track.audioUrl || `/api/stream/play/${encodeURIComponent(track.id)}`;
      if (streamSrc.includes('soundhelix.com')) {
        streamSrc = `/api/stream/play/${encodeURIComponent(track.id)}`;
      }
      if (streamSrc.startsWith('/')) {
        streamSrc = `http://localhost:5000${streamSrc}`;
      }
      audioElement.src = streamSrc;
      audioElement.volume = state.isMuted ? 0 : state.volume;
      audioElement.play().catch(e => {
        console.warn('Playback initiation note:', e.message);
      });
    },

    togglePlay: () => {
      if (!useAuthStore.getState().isAuthenticated) {
        useAuthStore.getState().openAuthModal('Sign in with Google to play songs and access full music playback.');
        return;
      }

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

    redirectToUserPlaylist: (): boolean => {
      const { playTrack } = get();

      // 1. Check user imported or created custom playlists
      try {
        const rawCustom = localStorage.getItem('melodyx_custom_playlists') || localStorage.getItem('soundwave_custom_playlists');
        const customPlaylists: Playlist[] = rawCustom ? JSON.parse(rawCustom) : [];
        const validPlaylist = customPlaylists.find(p => p.tracks && p.tracks.length > 0);
        if (validPlaylist && validPlaylist.tracks && validPlaylist.tracks.length > 0) {
          set({
            currentView: 'playlist',
            selectedPlaylist: validPlaylist,
            playbackSource: 'playlist'
          });
          playTrack(validPlaylist.tracks[0], validPlaylist.tracks, 'playlist');
          return true;
        }
      } catch (e) { }

      // 2. Check Liked Songs
      try {
        const rawLiked = localStorage.getItem('melodyx_liked_tracks') || localStorage.getItem('soundwave_liked_tracks');
        const likedTracks: Track[] = rawLiked ? JSON.parse(rawLiked) : [];
        if (likedTracks.length > 0) {
          const likedPlaylist: Playlist = {
            id: 'liked-songs',
            title: 'Liked Songs',
            description: 'Your favorite tracks',
            coverUrl: likedTracks[0]?.artwork || 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg',
            trackCount: likedTracks.length,
            tracks: likedTracks
          };
          set({
            currentView: 'playlist',
            selectedPlaylist: likedPlaylist,
            playbackSource: 'playlist'
          });
          playTrack(likedPlaylist.tracks[0], likedPlaylist.tracks, 'playlist');
          return true;
        }
      } catch (e) { }

      // 3. Fallback: Recently Played
      try {
        const history = recommendationEngine.getRecentlyPlayed();
        if (history.length > 0) {
          const recentPlaylist: Playlist = {
            id: 'recently-played',
            title: 'Recently Played',
            description: 'Songs you listened to recently',
            coverUrl: history[0]?.artwork || 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg',
            trackCount: history.length,
            tracks: history
          };
          set({
            currentView: 'playlist',
            selectedPlaylist: recentPlaylist,
            playbackSource: 'playlist'
          });
          playTrack(history[0], history, 'playlist');
          return true;
        }
      } catch (e) { }

      return false;
    },

    nextTrack: () => {
      const { queue, currentTrack, shuffle, playTrack, repeatMode, playbackSource, redirectToUserPlaylist } = get();
      if (!queue.length) return;

      const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
      let nextIndex = 0;

      // Special User Rule: If a searched song finishes or reaches end of search queue, redirect to user's playlist (imported, created, or liked)
      if (playbackSource === 'search') {
        const isEndOfSearch = currentIndex === -1 || currentIndex >= queue.length - 1;
        if (isEndOfSearch) {
          const redirected = redirectToUserPlaylist();
          if (redirected) return;
        }
      }

      if (shuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
      } else if (currentIndex >= 0 && currentIndex < queue.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // Queue is finished: if from search, redirect
        if (playbackSource === 'search') {
          const redirected = redirectToUserPlaylist();
          if (redirected) return;
        }

        // Seamless recommendation autoplay: Continue playing songs from recent searches, playlists & favorites
        try {
          const autoplayTracks = recommendationEngine.getNextAutoplayTracks(currentTrack, queue);
          if (autoplayTracks.length > 0) {
            const updatedQueue = [...queue, ...autoplayTracks];
            set({ queue: updatedQueue });
            playTrack(autoplayTracks[0], updatedQueue);
            return;
          }
        } catch (e) {
          console.warn('Autoplay error:', e);
        }

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
      if (isNaN(seconds) || seconds < 0) return;
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
        audioElement.volume = volume || 0.85;
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
        try {
          localStorage.setItem('soundwave_liked_ids', JSON.stringify(newLikes));
        } catch (e) { }
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

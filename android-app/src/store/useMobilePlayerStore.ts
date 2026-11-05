import { create } from 'zustand';
import { Track, Playlist } from '../types';
import { recommendationEngine } from '../services/recommendationEngine';
import { getApiHost, api } from '../services/api';
import { useAuthStore } from './useAuthStore';

interface MobilePlayerStore {
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  playbackError: string | null;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Track[];
  likedTrackIds: string[];
  playbackSource: 'search' | 'playlist' | 'library' | 'home' | null;

  // Mobile Navigation & View
  currentTab: 'home' | 'search' | 'library' | 'settings';
  selectedPlaylist: Playlist | null;
  isFullScreenOpen: boolean;
  isLyricsActive: boolean;
  isOptionsMenuOpen: boolean;
  selectedTrackForOptions: Track | null;

  // Actions
  playTrack: (track: Track, newQueue?: Track[], source?: 'search' | 'playlist' | 'library' | 'home') => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seek: (seconds: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (track: Track) => void;
  redirectToUserPlaylist: () => boolean;

  // Mobile Modal Actions
  setCurrentTab: (tab: 'home' | 'search' | 'library' | 'settings') => void;
  setSelectedPlaylist: (playlist: Playlist | null) => void;
  setFullScreenOpen: (open: boolean) => void;
  toggleLyricsActive: () => void;
  openOptionsMenu: (track: Track) => void;
  closeOptionsMenu: () => void;
}

const audioElement = new Audio();
audioElement.preload = 'auto';

// Android Native MediaSession & Background Keep-Alive Integration
let wakeLockSentinel: any = null;

async function acquireWakeLock() {
  if ('wakeLock' in navigator && !wakeLockSentinel) {
    try {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
    } catch (e) { }
  }
}

function releaseWakeLock() {
  if (wakeLockSentinel) {
    try {
      wakeLockSentinel.release();
    } catch (e) { }
    wakeLockSentinel = null;
  }
}

function updateMediaSession(
  track: Track,
  isPlaying: boolean,
  seekAction: (sec: number) => void,
  toggleAction: () => void,
  nextAction: () => void,
  prevAction: () => void
) {
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

    try {
      navigator.mediaSession.setActionHandler('seekbackward', details => {
        const offset = details.seekOffset || 10;
        seekAction(Math.max(0, audioElement.currentTime - offset));
      });
      navigator.mediaSession.setActionHandler('seekforward', details => {
        const offset = details.seekOffset || 10;
        seekAction(Math.min(audioElement.duration || 0, audioElement.currentTime + offset));
      });
    } catch (e) { }
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
      } catch (e) { }
    }
  });

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
    acquireWakeLock();
    set({ isBuffering: false, isPlaying: true, playbackError: null });
  });

  audioElement.addEventListener('pause', () => {
    releaseWakeLock();
  });

  audioElement.addEventListener('error', () => {
    const state = get();
    const track = state.currentTrack;
    if (track && (track as any).directStreamUrl && audioElement.src !== (track as any).directStreamUrl) {
      audioElement.src = (track as any).directStreamUrl;
      audioElement.play().catch(() => {
        // Try on-the-fly resolution
        api.resolveTrackStream(track).then(stream => {
          if (stream && audioElement.src !== stream) {
            (track as any).directStreamUrl = stream;
            audioElement.src = stream;
            audioElement.play().catch(console.warn);
          }
        }).catch(console.warn);
      });
      return;
    }

    if (track && track.title) {
      // Dynamic on-the-fly resolution for any track
      api.resolveTrackStream(track).then(stream => {
        if (stream && audioElement.src !== stream) {
          (track as any).directStreamUrl = stream;
          audioElement.src = stream;
          audioElement.play().catch(() => {
            set({ isBuffering: false, isPlaying: false, playbackError: 'Audio stream currently unavailable.' });
          });
          return;
        }
        set({
          isBuffering: false,
          isPlaying: false,
          playbackError: 'Audio stream currently unavailable.'
        });
      }).catch(() => {
        set({
          isBuffering: false,
          isPlaying: false,
          playbackError: 'Audio stream currently unavailable.'
        });
      });
      return;
    }

    set({
      isBuffering: false,
      isPlaying: false,
      playbackError: 'Audio stream currently unavailable.'
    });
  });

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
    shuffle: false,
    repeatMode: 'off',
    queue: [],
    likedTrackIds: (() => {
      try {
        const raw = localStorage.getItem('soundwave_liked_ids') || localStorage.getItem('melodyx_liked_ids');
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    })(),
    playbackSource: null,

    currentTab: 'home',
    selectedPlaylist: null,
    isFullScreenOpen: false,
    isLyricsActive: false,
    isOptionsMenuOpen: false,
    selectedTrackForOptions: null,

    setSelectedPlaylist: (playlist: Playlist | null) => set({ selectedPlaylist: playlist }),

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
        duration: track.duration
      });

      let streamSrc = (track as any).directStreamUrl || track.audioUrl || '';
      if (!streamSrc || streamSrc.includes('soundhelix.com') || streamSrc.startsWith('/')) {
        // Asynchronously resolve direct 320kbps Akamai CDN stream
        api.resolveTrackStream(track).then(resolved => {
          if (resolved) {
            (track as any).directStreamUrl = resolved;
            track.audioUrl = resolved;
            const cur = get().currentTrack;
            if (cur && cur.id === track.id) {
              audioElement.src = resolved;
              audioElement.play().catch(console.warn);
            }
          }
        }).catch(console.warn);

        const host = getApiHost();
        streamSrc = streamSrc ? `${host}${streamSrc}` : `https://aac.saavncdn.com/683/000ab54759049a8451ffcdc6412a0ef6_320.mp4`;
      } else if (streamSrc.startsWith('http://localhost:5000')) {
        const host = getApiHost();
        streamSrc = streamSrc.replace('http://localhost:5000', host);
      }

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

    redirectToUserPlaylist: (): boolean => {
      const { playTrack } = get();

      // 1. Check user imported or created custom playlists
      try {
        const rawCustom = localStorage.getItem('melodyx_custom_playlists') || localStorage.getItem('soundwave_custom_playlists');
        const customPlaylists: Playlist[] = rawCustom ? JSON.parse(rawCustom) : [];
        const validPlaylist = customPlaylists.find(p => p.tracks && p.tracks.length > 0);
        if (validPlaylist && validPlaylist.tracks && validPlaylist.tracks.length > 0) {
          set({
            currentTab: 'library',
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
            currentTab: 'library',
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
            currentTab: 'library',
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
        try {
          localStorage.setItem('soundwave_liked_ids', JSON.stringify(newLikes));
          localStorage.setItem('melodyx_liked_ids', JSON.stringify(newLikes));

          // Also save full Track object so Liked Songs always has playable audio & metadata
          const rawLikedTracks = localStorage.getItem('melodyx_liked_tracks') || localStorage.getItem('soundwave_liked_tracks');
          let likedTracks: Track[] = rawLikedTracks ? JSON.parse(rawLikedTracks) : [];
          if (isLiked) {
            likedTracks = likedTracks.filter(t => t.id !== track.id);
          } else {
            likedTracks = [track, ...likedTracks.filter(t => t.id !== track.id)];
          }
          localStorage.setItem('melodyx_liked_tracks', JSON.stringify(likedTracks));
          localStorage.setItem('soundwave_liked_tracks', JSON.stringify(likedTracks));
        } catch (e) { }
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

// Keep audio playing in background when app is minimized or screen locks
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      const state = useMobilePlayerStore.getState();
      if (state.isPlaying && audioElement.paused) {
        audioElement.play().catch(console.warn);
      }
    }
  });
}

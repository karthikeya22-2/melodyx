import { Track, Playlist, Artist, Album, SyncedLyrics } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL
  ? `${(import.meta as any).env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';

// Fallback tracks with full-length streaming endpoints
const fallbackTelugu: Track[] = [
  {
    id: 'telugu-1',
    title: 'Naatu Naatu',
    artist: 'Rahul Sipligunj, Kaala Bhairava, M.M. Keeravaani',
    album: 'RRR',
    duration: 215,
    language: 'Telugu',
    genre: 'Tollywood Folk / Dance',
    artwork: 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg',
    audioUrl: `${API_BASE}/stream/play/telugu-1`,
    isPreview: false
  },
  {
    id: 'telugu-2',
    title: 'Kurchi Madathapetti',
    artist: 'S. Thaman, Sahithi Chaganti, Sri Krishna',
    album: 'Guntur Kaaram',
    duration: 235,
    language: 'Telugu',
    genre: 'Tollywood Party',
    artwork: 'https://c.saavncdn.com/000/Guntur-Kaaram-Telugu-2023-20240126145901-500x500.jpg',
    audioUrl: `${API_BASE}/stream/play/telugu-2`,
    isPreview: false
  },
  {
    id: 'telugu-3',
    title: 'Chuttamalle',
    artist: 'Anirudh Ravichander, Shilpa Rao',
    album: 'Devara Part 1',
    duration: 223,
    language: 'Telugu',
    genre: 'Melody / Romantic',
    artwork: 'https://c.saavncdn.com/313/Devara-Part-1-Telugu-Telugu-2024-20240926171010-500x500.jpg',
    audioUrl: `${API_BASE}/stream/play/telugu-3`,
    isPreview: false
  },
  {
    id: 'telugu-4',
    title: 'Samajavaragamana',
    artist: 'Sid Sriram, Thaman S',
    album: 'Ala Vaikunthapurramuloo',
    duration: 230,
    language: 'Telugu',
    genre: 'Romantic Melody',
    artwork: 'https://c.saavncdn.com/517/Ala-Vaikunthapurramuloo-Telugu-2019-20200116144338-500x500.jpg',
    audioUrl: `${API_BASE}/stream/play/telugu-4`,
    isPreview: false
  }
];

const fallbackHindi: Track[] = [
  {
    id: 'hindi-1',
    title: 'Kesariya',
    artist: 'Arijit Singh, Pritam',
    album: 'Brahmastra',
    duration: 268,
    language: 'Hindi',
    genre: 'Bollywood Romance',
    artwork: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    audioUrl: `${API_BASE}/stream/play/hindi-1`,
    isPreview: false
  },
  {
    id: 'hindi-2',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh, Sachin-Jigar',
    album: 'Bhediya',
    duration: 272,
    language: 'Hindi',
    genre: 'Sufi Romantic',
    artwork: 'https://c.saavncdn.com/815/Bhediya-Hindi-2023-20230927155213-500x500.jpg',
    audioUrl: `${API_BASE}/stream/play/hindi-2`,
    isPreview: false
  },
  {
    id: 'hindi-3',
    title: 'Chaleya',
    artist: 'Arijit Singh, Shilpa Rao, Anirudh',
    album: 'Jawan',
    duration: 188,
    language: 'Hindi',
    genre: 'Bollywood Pop',
    artwork: 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg',
    audioUrl: `${API_BASE}/stream/play/hindi-3`,
    isPreview: false
  }
];

const fallbackEnglish: Track[] = [
  {
    id: 'eng-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 203,
    language: 'English',
    genre: 'Synthwave / Pop',
    artwork: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
    audioUrl: `${API_BASE}/stream/play/eng-1`,
    isPreview: false
  },
  {
    id: 'eng-2',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: 'Divide (÷)',
    duration: 235,
    language: 'English',
    genre: 'Dance Pop',
    artwork: 'https://c.saavncdn.com/126/Shape-of-You-English-2017-500x500.jpg',
    audioUrl: `${API_BASE}/stream/play/eng-2`,
    isPreview: false
  },
  {
    id: 'eng-3',
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    album: 'Starboy',
    duration: 231,
    language: 'English',
    genre: 'R&B / Electro',
    artwork: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
    audioUrl: `${API_BASE}/stream/play/eng-3`,
    isPreview: false
  }
];

// Performance & Data Saver Cache
let cachedHomeFeed: any = null;
let lastHomeFeedFetch = 0;
const HOME_CACHE_TTL = 3 * 60 * 1000; // 3 minutes

const searchCache = new Map<string, { timestamp: number; data: any }>();
const SEARCH_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export const api = {
  getInitialHomeFeed() {
    return {
      greeting: 'Good evening',
      trendingTelugu: fallbackTelugu,
      trendingHindi: fallbackHindi,
      trendingEnglish: fallbackEnglish,
      trendingAlbums: [
        { id: 'alb-devara', title: 'Devara Part 1', artist: 'Anirudh Ravichander', artwork: 'https://c.saavncdn.com/313/Devara-Part-1-Telugu-Telugu-2024-20240926171010-500x500.jpg', releaseDate: '2024', totalTracks: 6 },
        { id: 'alb-after-hours', title: 'After Hours', artist: 'The Weeknd', artwork: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg', releaseDate: '2020', totalTracks: 14 }
      ],
      recommendedArtists: [
        { id: 'artist-anirudh', name: 'Anirudh Ravichander', artwork: 'https://c.saavncdn.com/313/Devara-Part-1-Telugu-Telugu-2024-20240926171010-500x500.jpg', genres: ['Tamil Pop', 'Tollywood'], monthlyListeners: 24500000 },
        { id: 'artist-arijit', name: 'Arijit Singh', artwork: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg', genres: ['Bollywood Soul'], monthlyListeners: 42100000 },
        { id: 'artist-the-weeknd', name: 'The Weeknd', artwork: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg', genres: ['R&B', 'Pop'], monthlyListeners: 108000000 }
      ],
      genrePlaylists: [
        { id: 'gen-telugu', title: 'Telugu Chartbusters', description: 'Top streaming Tollywood hits and melodies', coverUrl: 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg', trackCount: fallbackTelugu.length },
        { id: 'gen-hindi', title: 'Bollywood Hits', description: 'Soulful romance, popular singles and soundtracks', coverUrl: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg', trackCount: fallbackHindi.length }
      ]
    };
  },

  async getHomeFeed() {
    if (cachedHomeFeed && Date.now() - lastHomeFeedFetch < HOME_CACHE_TTL) {
      return cachedHomeFeed;
    }
    try {
      const res = await fetch(`${API_BASE}/catalog/home`);
      if (res.ok) {
        const data = await res.json();
        cachedHomeFeed = data;
        lastHomeFeedFetch = Date.now();
        return data;
      }
    } catch (e) {
      // Fallback
    }
    return this.getInitialHomeFeed();
  },

  async search(query: string) {
    const qKey = query.trim().toLowerCase();
    const cached = searchCache.get(qKey);
    if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL) {
      return cached.data;
    }

    try {
      const res = await fetch(`${API_BASE}/catalog/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        searchCache.set(qKey, { timestamp: Date.now(), data });
        return data;
      }
    } catch (e) {
      // Fallback
    }
    const all = [...fallbackTelugu, ...fallbackHindi, ...fallbackEnglish];
    const q = query.toLowerCase();
    const tracks = all.filter(t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
    const fallbackResult = {
      query,
      tracks: tracks.slice(0, 3),
      artists: [],
      albums: [],
      playlists: []
    };
    searchCache.set(qKey, { timestamp: Date.now(), data: fallbackResult });
    return fallbackResult;
  },

  async getLyrics(track: Track): Promise<SyncedLyrics> {
    try {
      const res = await fetch(`${API_BASE}/lyrics/${track.id}?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`);
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }
    return {
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      isSynced: true,
      lines: [
        { time: 0, text: '♪ Instrumental Intro ♪' },
        { time: 5, text: `Listening to ${track.title}` },
        { time: 10, text: `By ${track.artist}` },
        { time: 20, text: '♪ Pure high-quality ad-free streaming ♪' }
      ]
    };
  },

  async getLikedSongs(): Promise<Track[]> {
    try {
      const res = await fetch(`${API_BASE}/library/likes`);
      if (res.ok) {
        const data = await res.json();
        return data.tracks || [];
      }
    } catch (e) {}
    return [fallbackTelugu[0], fallbackHindi[0]];
  },

  async toggleLike(track: Track, isCurrentlyLiked: boolean) {
    try {
      if (isCurrentlyLiked) {
        await fetch(`${API_BASE}/library/likes/${track.id}`, { method: 'DELETE' });
      } else {
        await fetch(`${API_BASE}/library/likes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ track })
        });
      }
    } catch (e) {}
  },

  async getPlaylists(): Promise<Playlist[]> {
    try {
      const res = await fetch(`${API_BASE}/library/playlists`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [
      { id: 'pl-1', title: 'My Top Telugu Hits', description: 'Best Tollywood melodies and beats', coverUrl: 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg', trackCount: 12 },
      { id: 'pl-2', title: 'Bollywood Romance', description: 'Arijit Singh & soulful lyrics', coverUrl: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg', trackCount: 18 }
    ];
  },

  async importPlaylist(url: string): Promise<Playlist> {
    const res = await fetch(`${API_BASE}/catalog/import-playlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim() })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to import playlist (HTTP ${res.status})`);
    }
    return await res.json();
  },

  async loginWithGoogle(payload: { credential?: string; googleUser?: any }) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Google authentication failed (HTTP ${res.status})`);
    }
    return await res.json();
  },

  async getGoogleConfig() {
    try {
      const res = await fetch(`${API_BASE}/auth/google-config`);
      if (res.ok) return await res.json();
    } catch (e) { }
    return {
      clientId: '631547173450-qhn4t4kvqcsrokeih374q9d8kipnrlla.apps.googleusercontent.com',
      webClientId: '631547173450-qhn4t4kvqcsrokeih374q9d8kipnrlla.apps.googleusercontent.com',
      androidClientId: '631547173450-22lcvhvb8rq7lbsqsi3smucidv2mluh9.apps.googleusercontent.com',
      projectId: 'second-zephyr-468711-r5',
      projectNumber: '631547173450'
    };
  },

  async checkForUpdates(currentVersion: string = '2.0.0') {
    try {
      const res = await fetch(`${API_BASE}/updates/check?version=${encodeURIComponent(currentVersion)}`);
      if (res.ok) return await res.json();
    } catch (e) { }
    return {
      isUpdateAvailable: false,
      clientVersion: currentVersion,
      latestVersion: currentVersion,
      title: 'Melodyx',
      changelog: [],
      checkedAt: new Date().toISOString()
    };
  }
};

const PLAYLIST_STORAGE_KEY = 'melodyx_custom_playlists';
const LEGACY_STORAGE_KEY = 'soundwave_custom_playlists';

export const playlistStorage = {
  getPlaylists(): Playlist[] {
    try {
      const raw = localStorage.getItem(PLAYLIST_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed reading custom playlists:', e);
      return [];
    }
  },

  savePlaylist(playlist: Playlist): Playlist[] {
    try {
      const current = this.getPlaylists();
      const updated = [playlist, ...current.filter(p => p.id !== playlist.id)];
      localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Failed saving custom playlist:', e);
      return [];
    }
  },

  deletePlaylist(id: string): Playlist[] {
    try {
      const current = this.getPlaylists();
      const updated = current.filter(p => p.id !== id);
      localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Failed deleting custom playlist:', e);
      return [];
    }
  }
};

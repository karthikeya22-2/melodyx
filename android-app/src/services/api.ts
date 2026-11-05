import { Track, Playlist, SyncedLyrics } from '../types';

// Multi-host resolver for Android Native / Emulator / Browser
const ENV_API_HOST = (import.meta as any).env?.VITE_API_URL || 'https://melodyx-zday.onrender.com';

let cachedWorkingHost = typeof localStorage !== 'undefined'
  ? localStorage.getItem('melodyx_api_host') || localStorage.getItem('soundwave_api_host') || ENV_API_HOST
  : ENV_API_HOST;

export function setCustomApiHost(host: string) {
  cachedWorkingHost = host;
  try {
    localStorage.setItem('melodyx_api_host', host);
  } catch (e) { }
}

export function getApiHost(): string {
  if (cachedWorkingHost) return cachedWorkingHost;
  if (ENV_API_HOST) return ENV_API_HOST;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Standard web browser or direct IP access
    if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.includes('capacitor')) {
      return `http://${host}:5000`;
    }
  }

  return 'https://melodyx-zday.onrender.com';
}

export async function detectActiveHost(): Promise<string> {
  if (cachedWorkingHost) return cachedWorkingHost;

  const defaultHost = getApiHost();
  const hosts = [
    defaultHost,
    'https://melodyx-zday.onrender.com',
    'http://192.168.29.151:5000',
    'http://10.0.2.2:5000',
    'http://localhost:5000'
  ];
  const uniqueHosts = [...new Set(hosts)];

  try {
    const winner = await Promise.any(
      uniqueHosts.map(async host => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 900);
        const res = await fetch(`${host}/api/health`, { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) return host;
        throw new Error('Not reachable');
      })
    );
    cachedWorkingHost = winner;
    try {
      localStorage.setItem('melodyx_api_host', winner);
    } catch (e) { }
    return winner;
  } catch (e) {
    return defaultHost;
  }
}

// Background discovery
detectActiveHost().catch(() => {});

const fallbackTelugu: Track[] = [
  {
    id: 'telugu-1',
    title: 'Naatu Naatu',
    artist: 'Rahul Sipligunj, Kaala Bhairava, M.M. Keeravaani',
    album: 'RRR',
    duration: 215,
    language: 'Telugu',
    artwork: 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg',
    audioUrl: '/api/stream/play/telugu-1',
    isPreview: false
  },
  {
    id: 'telugu-2',
    title: 'Kurchi Madathapetti',
    artist: 'S. Thaman, Sahithi Chaganti, Sri Krishna',
    album: 'Guntur Kaaram',
    duration: 235,
    language: 'Telugu',
    artwork: 'https://c.saavncdn.com/000/Guntur-Kaaram-Telugu-2023-20240126145901-500x500.jpg',
    audioUrl: '/api/stream/play/telugu-2',
    isPreview: false
  },
  {
    id: 'telugu-3',
    title: 'Chuttamalle',
    artist: 'Anirudh Ravichander, Shilpa Rao',
    album: 'Devara Part 1',
    duration: 223,
    language: 'Telugu',
    artwork: 'https://c.saavncdn.com/313/Devara-Part-1-Telugu-Telugu-2024-20240926171010-500x500.jpg',
    audioUrl: '/api/stream/play/telugu-3',
    isPreview: false
  },
  {
    id: 'telugu-4',
    title: 'Samajavaragamana',
    artist: 'Sid Sriram, Thaman S',
    album: 'Ala Vaikunthapurramuloo',
    duration: 230,
    language: 'Telugu',
    artwork: 'https://c.saavncdn.com/517/Ala-Vaikunthapurramuloo-Telugu-2019-20200116144338-500x500.jpg',
    audioUrl: '/api/stream/play/telugu-4',
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
    artwork: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    audioUrl: '/api/stream/play/hindi-1',
    isPreview: false
  },
  {
    id: 'hindi-2',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh, Sachin-Jigar',
    album: 'Bhediya',
    duration: 272,
    language: 'Hindi',
    artwork: 'https://c.saavncdn.com/815/Bhediya-Hindi-2023-20230927155213-500x500.jpg',
    audioUrl: '/api/stream/play/hindi-2',
    isPreview: false
  },
  {
    id: 'hindi-3',
    title: 'Chaleya',
    artist: 'Arijit Singh, Shilpa Rao, Anirudh',
    album: 'Jawan',
    duration: 188,
    language: 'Hindi',
    artwork: 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg',
    audioUrl: '/api/stream/play/hindi-3',
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
    artwork: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
    audioUrl: '/api/stream/play/eng-1',
    isPreview: false
  },
  {
    id: 'eng-2',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: 'Divide (÷)',
    duration: 235,
    language: 'English',
    artwork: 'https://c.saavncdn.com/126/Shape-of-You-English-2017-500x500.jpg',
    audioUrl: '/api/stream/play/eng-2',
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
        { id: 'alb-devara', title: 'Devara Part 1', artist: 'Anirudh Ravichander', artwork: 'https://c.saavncdn.com/313/Devara-Part-1-Telugu-Telugu-2024-20240926171010-500x500.jpg' },
        { id: 'alb-after-hours', title: 'After Hours', artist: 'The Weeknd', artwork: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg' }
      ],
      recommendedArtists: [
        { id: 'artist-anirudh', name: 'Anirudh Ravichander', artwork: 'https://c.saavncdn.com/313/Devara-Part-1-Telugu-Telugu-2024-20240926171010-500x500.jpg' },
        { id: 'artist-arijit', name: 'Arijit Singh', artwork: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg' },
        { id: 'artist-the-weeknd', name: 'The Weeknd', artwork: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg' }
      ],
      genrePlaylists: [
        { id: 'gen-telugu', title: 'Telugu Chartbusters', coverUrl: 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg' },
        { id: 'gen-hindi', title: 'Bollywood Hits', coverUrl: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg' }
      ]
    };
  },

  async getHomeFeed() {
    if (cachedHomeFeed && Date.now() - lastHomeFeedFetch < HOME_CACHE_TTL) {
      return cachedHomeFeed;
    }

    try {
      const host = await detectActiveHost();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(`${host}/api/catalog/home`, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        cachedHomeFeed = data;
        lastHomeFeedFetch = Date.now();
        return data;
      }
    } catch (e) {
      console.warn('[API] Home feed network note:', e);
    }

    return this.getInitialHomeFeed();
  },

  async search(query: string) {
    const q = (query || '').trim();
    if (!q) {
      return { query: '', tracks: [] };
    }

    const qKey = q.toLowerCase();
    const cached = searchCache.get(qKey);
    if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL) {
      return cached.data;
    }

    // 1. Try active server host
    const host = await detectActiveHost();
    try {
      const res = await fetch(`${host}/api/catalog/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        searchCache.set(qKey, { timestamp: Date.now(), data });
        return data;
      }
    } catch (e) {
      console.warn('[API] Search request error:', e);
    }

    // 2. Local fallback matching ONLY (STRICT: never return irrelevant tracks)
    const all = [...fallbackTelugu, ...fallbackHindi, ...fallbackEnglish];
    const qLower = q.toLowerCase();
    const matched = all.filter(
      t =>
        t.title.toLowerCase().includes(qLower) ||
        t.artist.toLowerCase().includes(qLower) ||
        t.album.toLowerCase().includes(qLower)
    );

    const fallbackResult = { query: q, tracks: matched.slice(0, 3) };
    searchCache.set(qKey, { timestamp: Date.now(), data: fallbackResult });
    return fallbackResult;
  },

  async getLyrics(track: Track): Promise<SyncedLyrics> {
    const host = await detectActiveHost();
    try {
      const res = await fetch(`${host}/api/lyrics/${track.id}?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`);
      if (res.ok) return await res.json();
    } catch (e) { }

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

  async importPlaylist(url: string): Promise<any> {
    const host = getApiHost();
    const res = await fetch(`${host}/api/catalog/import-playlist`, {
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
    const host = getApiHost();
    const res = await fetch(`${host}/api/auth/google`, {
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
      const host = getApiHost();
      const res = await fetch(`${host}/api/auth/google-config`);
      if (res.ok) return await res.json();
    } catch (e) { }
    return {
      clientId: '631547173450-22lcvhvb8rq7lbsqsi3smucidv2mluh9.apps.googleusercontent.com',
      androidClientId: '631547173450-22lcvhvb8rq7lbsqsi3smucidv2mluh9.apps.googleusercontent.com',
      webClientId: '631547173450-qhn4t4kvqcsrokeih374q9d8kipnrlla.apps.googleusercontent.com',
      projectId: 'second-zephyr-468711-r5',
      projectNumber: '631547173450'
    };
  },

  async checkForUpdates(currentVersion: string = '2.0.0') {
    try {
      const host = getApiHost();
      const res = await fetch(`${host}/api/updates/check?version=${encodeURIComponent(currentVersion)}`);
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
  getPlaylists(): any[] {
    try {
      const raw = localStorage.getItem(PLAYLIST_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed reading custom playlists:', e);
      return [];
    }
  },

  savePlaylist(playlist: any): any[] {
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

  deletePlaylist(id: string): any[] {
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

import { Track, Playlist } from '../types';

const STORAGE_KEYS = {
  HISTORY: 'melodyx_listening_history',
  PLAY_COUNTS: 'melodyx_play_counts',
  SEARCH_HISTORY: 'melodyx_search_history',
  LIKED: 'melodyx_liked_ids',
  SETTINGS: 'melodyx_user_settings',
  RECENT_SEARCH_TRACKS: 'melodyx_recent_search_tracks',
  CUSTOM_PLAYLISTS: 'melodyx_custom_playlists'
};

// Legacy keys for backward compatibility
const LEGACY_KEYS = {
  HISTORY: 'soundwave_listening_history',
  PLAY_COUNTS: 'soundwave_play_counts',
  SEARCH_HISTORY: 'soundwave_search_history',
  LIKED: 'soundwave_liked_ids',
  CUSTOM_PLAYLISTS: 'soundwave_custom_playlists'
};

export interface PlayCountMap {
  [trackId: string]: {
    count: number;
    track: Track;
    lastPlayed: number;
  };
}

export interface RecommendationResult {
  recentlyPlayed: Track[];
  madeForYou: Track[];
  becauseYouListenedTo: {
    seedTrack: Track;
    tracks: Track[];
  } | null;
  similarArtists: {
    seedArtist: string;
    tracks: Track[];
  } | null;
  discoverMore: Track[];
  favorites: Track[];
}

export const recommendationEngine = {
  /**
   * Record a song play event
   */
  recordPlay(track: Track): void {
    if (!track || !track.id) return;
    try {
      // 1. Update recently played list (max 30, deduplicated, most recent first)
      const rawHistory = localStorage.getItem(STORAGE_KEYS.HISTORY) || localStorage.getItem(LEGACY_KEYS.HISTORY);
      let history: Track[] = rawHistory ? JSON.parse(rawHistory) : [];
      history = [track, ...history.filter(t => t.id !== track.id)].slice(0, 30);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

      // 2. Update play counts
      const rawCounts = localStorage.getItem(STORAGE_KEYS.PLAY_COUNTS) || localStorage.getItem(LEGACY_KEYS.PLAY_COUNTS);
      const counts: PlayCountMap = rawCounts ? JSON.parse(rawCounts) : {};
      const current = counts[track.id] || { count: 0, track, lastPlayed: Date.now() };
      counts[track.id] = {
        count: current.count + 1,
        track,
        lastPlayed: Date.now()
      };
      localStorage.setItem(STORAGE_KEYS.PLAY_COUNTS, JSON.stringify(counts));
    } catch (e) {
      console.warn('Failed to record play event to localStorage:', e);
    }
  },

  /**
   * Get recently played tracks
   */
  getRecentlyPlayed(fallbackCatalog: Track[] = []): Track[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HISTORY) || localStorage.getItem(LEGACY_KEYS.HISTORY);
      if (raw) {
        const history: Track[] = JSON.parse(raw);
        if (Array.isArray(history) && history.length > 0) {
          // Reconcile with latest catalog data if available for fresh artwork / stream URLs
          return history.map(h => fallbackCatalog.find(c => c.id === h.id) || h);
        }
      }
    } catch (e) {
      console.warn('Failed reading history from localStorage:', e);
    }
    return [];
  },

  /**
   * Save tracks from the latest search results so they can be seamlessly queued on completion
   */
  saveSearchResults(tracks: Track[]): void {
    if (!Array.isArray(tracks) || tracks.length === 0) return;
    try {
      const existing = this.getRecentSearchTracks();
      const existingIds = new Set(existing.map(t => t.id));
      const newItems = tracks.filter(t => !existingIds.has(t.id));
      const combined = [...newItems, ...existing].slice(0, 25);
      localStorage.setItem(STORAGE_KEYS.RECENT_SEARCH_TRACKS, JSON.stringify(combined));
    } catch (e) {
      console.warn('Failed saving recent search tracks:', e);
    }
  },

  /**
   * Retrieve tracks from recent searches
   */
  getRecentSearchTracks(): Track[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCH_TRACKS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Record a search query text
   */
  recordSearch(query: string): void {
    const clean = query.trim();
    if (!clean || clean.length < 2) return;
    try {
      const history = this.getSearchHistory();
      const updated = [clean, ...history.filter(q => q.toLowerCase() !== clean.toLowerCase())].slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to record search query:', e);
    }
  },

  /**
   * Get search query text history
   */
  getSearchHistory(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || localStorage.getItem(LEGACY_KEYS.SEARCH_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Remove a single search history item
   */
  removeSearchItem(query: string): string[] {
    try {
      const history = this.getSearchHistory();
      const updated = history.filter(q => q.toLowerCase() !== query.toLowerCase());
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  },

  /**
   * Clear all search history
   */
  clearSearchHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
      localStorage.removeItem(LEGACY_KEYS.SEARCH_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCH_TRACKS);
    } catch (e) { }
  },

  /**
   * Clear listening history and play counts
   */
  clearListeningHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      localStorage.removeItem(LEGACY_KEYS.HISTORY);
      localStorage.removeItem(STORAGE_KEYS.PLAY_COUNTS);
      localStorage.removeItem(LEGACY_KEYS.PLAY_COUNTS);
    } catch (e) { }
  },

  /**
   * Get trending and recommended search queries
   */
  getTrendingSearches(): string[] {
    return [
      'Naatu Naatu',
      'Kesariya',
      'Chuttamalle',
      'Starboy',
      'Believer',
      'Anirudh Ravichander',
      'Arijit Singh',
      'The Weeknd',
      'Guntur Kaaram',
      'Tollywood Mass'
    ];
  },

  /**
   * Smart Autoplay Continuation Engine:
   * When a searched song finishes, this automatically returns next tracks from:
   * 1. Recent search result songs
   * 2. User's playlist songs & liked favorites
   * 3. Related catalog tracks matching artist/genre
   */
  getNextAutoplayTracks(
    currentTrack: Track | null,
    currentQueue: Track[] = [],
    fallbackCatalog: Track[] = []
  ): Track[] {
    const queueIds = new Set(currentQueue.map(t => t.id));
    if (currentTrack) queueIds.add(currentTrack.id);

    const candidates: Track[] = [];

    // 1. Next songs from recent searches
    const searchTracks = this.getRecentSearchTracks();
    for (const t of searchTracks) {
      if (!queueIds.has(t.id)) {
        candidates.push(t);
        queueIds.add(t.id);
        if (candidates.length >= 3) break;
      }
    }

    // 2. Next songs from user's custom playlists and favorites
    try {
      const rawPlaylists = localStorage.getItem(STORAGE_KEYS.CUSTOM_PLAYLISTS) || localStorage.getItem(LEGACY_KEYS.CUSTOM_PLAYLISTS);
      const playlists: Playlist[] = rawPlaylists ? JSON.parse(rawPlaylists) : [];
      for (const pl of playlists) {
        if (Array.isArray(pl.tracks)) {
          for (const t of pl.tracks) {
            if (!queueIds.has(t.id)) {
              candidates.push(t);
              queueIds.add(t.id);
              if (candidates.length >= 6) break;
            }
          }
        }
        if (candidates.length >= 6) break;
      }
    } catch (e) { }

    // 3. Songs from user's history and play count favorites
    const history = this.getRecentlyPlayed(fallbackCatalog);
    for (const t of history) {
      if (!queueIds.has(t.id)) {
        candidates.push(t);
        queueIds.add(t.id);
        if (candidates.length >= 8) break;
      }
    }

    // 4. If current track has a specific artist or language, find matching songs in catalog
    if (currentTrack && fallbackCatalog.length > 0) {
      const curArtist = (currentTrack.artist || '').toLowerCase().split(/[,&]/)[0].trim();
      const curLang = (currentTrack.language || '').toLowerCase();

      const matchedCatalog = fallbackCatalog.filter(
        t => !queueIds.has(t.id) && (
          (curArtist && t.artist.toLowerCase().includes(curArtist)) ||
          (curLang && t.language && t.language.toLowerCase() === curLang)
        )
      );

      for (const t of matchedCatalog) {
        candidates.push(t);
        queueIds.add(t.id);
        if (candidates.length >= 10) break;
      }
    }

    // 5. Fallback remaining catalog songs
    if (candidates.length < 5 && fallbackCatalog.length > 0) {
      for (const t of fallbackCatalog) {
        if (!queueIds.has(t.id)) {
          candidates.push(t);
          queueIds.add(t.id);
          if (candidates.length >= 8) break;
        }
      }
    }

    return candidates;
  },

  /**
   * Compute Spotify-like recommendations based purely on user history, searches & liked tracks
   */
  getRecommendations(catalogTracks: Track[], likedTrackIds: string[] = []): RecommendationResult {
    const recentlyPlayed = this.getRecentlyPlayed(catalogTracks);
    const recentSearchTracks = this.getRecentSearchTracks();

    let playCounts: PlayCountMap = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PLAY_COUNTS) || localStorage.getItem(LEGACY_KEYS.PLAY_COUNTS);
      if (raw) playCounts = JSON.parse(raw);
    } catch (e) { }

    // Aggregate pool of all known tracks
    const allKnownTracks = new Map<string, Track>();
    catalogTracks.forEach(t => allKnownTracks.set(t.id, t));
    recentlyPlayed.forEach(t => allKnownTracks.set(t.id, t));
    recentSearchTracks.forEach(t => allKnownTracks.set(t.id, t));
    Object.values(playCounts).forEach(e => {
      if (e.track) allKnownTracks.set(e.track.id, e.track);
    });

    // Favorites: Include liked songs (even from search) + songs played 2+ times
    const favoritesMap = new Map<string, Track>();
    likedTrackIds.forEach(id => {
      const t = allKnownTracks.get(id);
      if (t) favoritesMap.set(t.id, t);
    });

    Object.values(playCounts).forEach(entry => {
      if (entry.count >= 2 && entry.track) {
        favoritesMap.set(entry.track.id, entry.track);
      }
    });

    const favorites = Array.from(favoritesMap.values());

    // Compute artist affinity for recommendations
    const artistAffinity: { [artist: string]: number } = {};
    recentlyPlayed.forEach((t, index) => {
      const weight = Math.max(1, 10 - index);
      const artist = t.artist.split(/[,&]/)[0].trim();
      artistAffinity[artist] = (artistAffinity[artist] || 0) + weight;
    });

    likedTrackIds.forEach(id => {
      const track = allKnownTracks.get(id);
      if (track) {
        const artist = track.artist.split(/[,&]/)[0].trim();
        artistAffinity[artist] = (artistAffinity[artist] || 0) + 15;
      }
    });

    const sortedArtists = Object.keys(artistAffinity).sort(
      (a, b) => artistAffinity[b] - artistAffinity[a]
    );
    const topArtist = sortedArtists[0] || null;

    const playedTrackIds = new Set(recentlyPlayed.map(t => t.id));
    let madeForYou: Track[] = [];

    if (sortedArtists.length > 0) {
      madeForYou = catalogTracks.filter(t => {
        const primary = t.artist.split(/[,&]/)[0].trim();
        return sortedArtists.includes(primary);
      });
    }

    if (madeForYou.length < 6) {
      catalogTracks.forEach(t => {
        if (!madeForYou.some(m => m.id === t.id)) {
          madeForYou.push(t);
        }
      });
    }
    madeForYou = madeForYou.slice(0, 8);

    let becauseYouListenedTo: { seedTrack: Track; tracks: Track[] } | null = null;
    const seedTrack = recentlyPlayed[0] || catalogTracks[0];
    if (seedTrack) {
      const seedArtist = seedTrack.artist.split(/[,&]/)[0].trim().toLowerCase();
      const related = catalogTracks.filter(
        t =>
          t.id !== seedTrack.id &&
          (t.artist.toLowerCase().includes(seedArtist) ||
           t.album?.toLowerCase() === seedTrack.album?.toLowerCase())
      );
      const supplemented = [...related];
      catalogTracks.forEach(t => {
        if (t.id !== seedTrack.id && !supplemented.some(s => s.id === t.id)) {
          supplemented.push(t);
        }
      });
      becauseYouListenedTo = {
        seedTrack,
        tracks: supplemented.slice(0, 6)
      };
    }

    let similarArtists: { seedArtist: string; tracks: Track[] } | null = null;
    if (topArtist) {
      const artistTracks = catalogTracks.filter(
        t => !t.artist.toLowerCase().includes(topArtist.toLowerCase())
      );
      similarArtists = {
        seedArtist: topArtist,
        tracks: artistTracks.slice(0, 6)
      };
    } else if (catalogTracks.length > 0) {
      const defaultSeed = catalogTracks[0].artist.split(/[,&]/)[0].trim();
      similarArtists = {
        seedArtist: defaultSeed,
        tracks: catalogTracks.slice(1, 7)
      };
    }

    const discoverMore = catalogTracks
      .filter(t => !playedTrackIds.has(t.id) && !likedTrackIds.includes(t.id))
      .slice(0, 8);

    if (discoverMore.length < 5) {
      catalogTracks.forEach(t => {
        if (!discoverMore.some(d => d.id === t.id)) {
          discoverMore.push(t);
        }
      });
    }

    return {
      recentlyPlayed: recentlyPlayed.slice(0, 10),
      madeForYou,
      becauseYouListenedTo,
      similarArtists,
      discoverMore: discoverMore.slice(0, 8),
      favorites: favorites.slice(0, 10)
    };
  }
};

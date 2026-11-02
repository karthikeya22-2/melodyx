// Shared types and data models across Android, Web, and Backend

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album: string;
  albumId?: string;
  artwork: string;
  duration: number; // in seconds
  audioUrl?: string;
  language?: 'Telugu' | 'Hindi' | 'English' | 'Punjabi' | 'Tamil' | 'Global' | string;
  genre?: string;
  isrc?: string;
  releaseYear?: number;
  plays?: number;
}

export interface Artist {
  id: string;
  name: string;
  artwork: string;
  genres: string[];
  monthlyListeners: number;
  bio?: string;
  topTracks?: Track[];
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  artwork: string;
  releaseDate: string;
  totalTracks: number;
  tracks?: Track[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  userId: string;
  isPublic: boolean;
  trackCount: number;
  tracks?: Track[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  preferredLanguages: string[];
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LyricsLine {
  time: number; // in seconds
  text: string;
}

export interface SyncedLyrics {
  trackId: string;
  title: string;
  artist: string;
  lines: LyricsLine[];
  plainText?: string;
}

export interface ListeningHistoryItem {
  id: string;
  userId: string;
  track: Track;
  playedAt: string;
  completionRate: number; // 0.0 to 1.0
  skipped: boolean;
}

export interface RecommendationProfile {
  userId: string;
  topGenres: { genre: string; weight: number }[];
  topLanguages: { language: string; weight: number }[];
  topArtists: { artist: string; weight: number }[];
}

export interface SearchResults {
  query: string;
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // in seconds
  duration: number; // in seconds
  volume: number; // 0 to 1
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Track[];
  history: Track[];
}


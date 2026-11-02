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
  language?: string;
  genre?: string;
  isrc?: string;
  releaseYear?: number;
  isPreview?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  artwork: string;
  genres: string[];
  topTracks?: Track[];
}

export interface Album {
  id: string;
  title: string;
  artist: string;
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

export interface LyricsLine {
  time: number;
  text: string;
}

export interface SyncedLyrics {
  trackId: string;
  title: string;
  artist: string;
  lines: LyricsLine[];
  plainText?: string;
  isSynced: boolean;
}

export interface PlayerState {
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
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  duration: number; // in seconds
  audioUrl?: string;
  language?: string;
  genre?: string;
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
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  userId?: string;
  trackCount?: number;
  tracks?: Track[];
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

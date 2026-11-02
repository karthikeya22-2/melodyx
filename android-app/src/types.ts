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

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  trackCount?: number;
  tracks?: Track[];
}

export interface SyncedLyrics {
  trackId: string;
  title: string;
  artist: string;
  lines: { time: number; text: string }[];
  isSynced: boolean;
}

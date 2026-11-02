import { Track, Playlist, SyncedLyrics } from '../types';

const API_BASE = 'http://localhost:5000/api';

const fallbackTelugu: Track[] = [
  {
    id: 'telugu-1',
    title: 'Naatu Naatu',
    artist: 'Rahul Sipligunj, Kaala Bhairava, M.M. Keeravaani',
    album: 'RRR',
    duration: 215,
    language: 'Telugu',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'telugu-2',
    title: 'Kurchi Madathapetti',
    artist: 'S. Thaman, Sahithi Chaganti, Sri Krishna',
    album: 'Guntur Kaaram',
    duration: 218,
    language: 'Telugu',
    artwork: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'telugu-3',
    title: 'Chuttamalle',
    artist: 'Anirudh Ravichander, Shilpa Rao',
    album: 'Devara Part 1',
    duration: 228,
    language: 'Telugu',
    artwork: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'telugu-4',
    title: 'Samajavaragamana',
    artist: 'Sid Sriram, Thaman S',
    album: 'Ala Vaikunthapurramuloo',
    duration: 222,
    language: 'Telugu',
    artwork: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
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
    artwork: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
  },
  {
    id: 'hindi-2',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh, Sachin-Jigar',
    album: 'Bhediya',
    duration: 261,
    language: 'Hindi',
    artwork: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  },
  {
    id: 'hindi-3',
    title: 'Chaleya',
    artist: 'Arijit Singh, Shilpa Rao, Anirudh',
    album: 'Jawan',
    duration: 200,
    language: 'Hindi',
    artwork: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'
  }
];

const fallbackEnglish: Track[] = [
  {
    id: 'eng-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    language: 'English',
    artwork: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3'
  },
  {
    id: 'eng-2',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: 'Divide (÷)',
    duration: 233,
    language: 'English',
    artwork: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3'
  }
];

export const api = {
  async getHomeFeed() {
    try {
      const res = await fetch(`${API_BASE}/catalog/home`);
      if (res.ok) return await res.json();
    } catch (e) {}

    return {
      greeting: 'Good evening',
      recentlyPlayed: [...fallbackTelugu.slice(0, 3), ...fallbackHindi.slice(0, 3)],
      madeForYou: [fallbackTelugu[0], fallbackHindi[0], fallbackEnglish[0], fallbackTelugu[2]],
      teluguHits: fallbackTelugu,
      hindiHits: fallbackHindi,
      englishHits: fallbackEnglish,
      trendingAlbums: [
        { id: 'alb-devara', title: 'Devara Part 1', artist: 'Anirudh Ravichander', artwork: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600' },
        { id: 'alb-after-hours', title: 'After Hours', artist: 'The Weeknd', artwork: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600' }
      ],
      recommendedArtists: [
        { id: 'artist-anirudh', name: 'Anirudh Ravichander', artwork: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500' },
        { id: 'artist-arijit', name: 'Arijit Singh', artwork: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500' },
        { id: 'artist-the-weeknd', name: 'The Weeknd', artwork: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500' }
      ],
      moodPlaylists: [
        { id: 'mood-gym', title: 'Workout Energy', coverUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600' },
        { id: 'mood-chill', title: 'Lo-Fi Chill', coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600' }
      ]
    };
  },

  async search(query: string) {
    try {
      const res = await fetch(`${API_BASE}/catalog/search?q=${encodeURIComponent(query)}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    const all = [...fallbackTelugu, ...fallbackHindi, ...fallbackEnglish];
    const q = query.toLowerCase();
    const tracks = all.filter(t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
    return { query, tracks: tracks.length ? tracks : all };
  },

  async getLyrics(track: Track): Promise<SyncedLyrics> {
    try {
      const res = await fetch(`${API_BASE}/lyrics/${track.id}?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`);
      if (res.ok) return await res.json();
    } catch (e) {}

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
  }
};


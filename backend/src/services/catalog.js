// Music Catalog Service: Telugu, Hindi, English, Global Hits, Albums, Artists, & Search

const teluguHits = [
  {
    id: 'telugu-1',
    title: 'Naatu Naatu',
    artist: 'Rahul Sipligunj, Kaala Bhairava, M.M. Keeravaani',
    artistId: 'artist-mmk',
    album: 'RRR (Original Motion Picture Soundtrack)',
    albumId: 'alb-rrr',
    duration: 215,
    language: 'Telugu',
    genre: 'Tollywood Folk / Dance',
    releaseYear: 2022,
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'telugu-2',
    title: 'Kurchi Madathapetti',
    artist: 'S. Thaman, Sahithi Chaganti, Sri Krishna',
    artistId: 'artist-thaman',
    album: 'Guntur Kaaram',
    albumId: 'alb-guntur-kaaram',
    duration: 218,
    language: 'Telugu',
    genre: 'Tollywood Party',
    releaseYear: 2024,
    artwork: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'telugu-3',
    title: 'Chuttamalle',
    artist: 'Anirudh Ravichander, Shilpa Rao',
    artistId: 'artist-anirudh',
    album: 'Devara Part 1',
    albumId: 'alb-devara',
    duration: 228,
    language: 'Telugu',
    genre: 'Melody / Romantic',
    releaseYear: 2024,
    artwork: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'telugu-4',
    title: 'Samajavaragamana',
    artist: 'Sid Sriram, Thaman S',
    artistId: 'artist-sid',
    album: 'Ala Vaikunthapurramuloo',
    albumId: 'alb-avpl',
    duration: 222,
    language: 'Telugu',
    genre: 'Romantic Melody',
    releaseYear: 2020,
    artwork: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 'telugu-5',
    title: 'Oo Antava Mava.. Oo Oo Antava',
    artist: 'Indravathi Chauhan, Devi Sri Prasad',
    artistId: 'artist-dsp',
    album: 'Pushpa: The Rise',
    albumId: 'alb-pushpa-1',
    duration: 223,
    language: 'Telugu',
    genre: 'Item Song / Folk Beat',
    releaseYear: 2021,
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
  {
    id: 'telugu-6',
    title: 'Inkem Inkem Inkem Kaavaale',
    artist: 'Sid Sriram, Gopi Sundar',
    artistId: 'artist-sid',
    album: 'Geetha Govindam',
    albumId: 'alb-geetha-govindam',
    duration: 267,
    language: 'Telugu',
    genre: 'Acoustic Love',
    releaseYear: 2018,
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
  }
];

const hindiHits = [
  {
    id: 'hindi-1',
    title: 'Kesariya',
    artist: 'Arijit Singh, Pritam, Amitabh Bhattacharya',
    artistId: 'artist-arijit',
    album: 'Brahmastra',
    albumId: 'alb-brahmastra',
    duration: 268,
    language: 'Hindi',
    genre: 'Bollywood Romance',
    releaseYear: 2022,
    artwork: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
  },
  {
    id: 'hindi-2',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh, Sachin-Jigar',
    artistId: 'artist-arijit',
    album: 'Bhediya',
    albumId: 'alb-bhediya',
    duration: 261,
    language: 'Hindi',
    genre: 'Sufi Romantic',
    releaseYear: 2022,
    artwork: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  },
  {
    id: 'hindi-3',
    title: 'Chaleya',
    artist: 'Arijit Singh, Shilpa Rao, Anirudh Ravichander',
    artistId: 'artist-anirudh',
    album: 'Jawan',
    albumId: 'alb-jawan',
    duration: 200,
    language: 'Hindi',
    genre: 'Bollywood Pop',
    releaseYear: 2023,
    artwork: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'
  },
  {
    id: 'hindi-4',
    title: 'Pehle Bhi Main',
    artist: 'Vishal Mishra, Raj Shekhar',
    artistId: 'artist-vishal',
    album: 'Animal',
    albumId: 'alb-animal',
    duration: 250,
    language: 'Hindi',
    genre: 'Intense Romantic',
    releaseYear: 2023,
    artwork: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'
  },
  {
    id: 'hindi-5',
    title: 'Raataan Lambiyan',
    artist: 'Jubin Nautiyal, Asees Kaur, Tanishk Bagchi',
    artistId: 'artist-jubin',
    album: 'Shershaah',
    albumId: 'alb-shershaah',
    duration: 230,
    language: 'Hindi',
    genre: 'Melodic Ballad',
    releaseYear: 2021,
    artwork: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3'
  }
];

const englishHits = [
  {
    id: 'eng-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    artistId: 'artist-the-weeknd',
    album: 'After Hours',
    albumId: 'alb-after-hours',
    duration: 200,
    language: 'English',
    genre: 'Synthwave / Pop',
    releaseYear: 2020,
    artwork: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3'
  },
  {
    id: 'eng-2',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    artistId: 'artist-ed-sheeran',
    album: 'Divide (÷)',
    albumId: 'alb-divide',
    duration: 233,
    language: 'English',
    genre: 'Dance Pop',
    releaseYear: 2017,
    artwork: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3'
  },
  {
    id: 'eng-3',
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    artistId: 'artist-the-weeknd',
    album: 'Starboy',
    albumId: 'alb-starboy',
    duration: 230,
    language: 'English',
    genre: 'R&B / Electro',
    releaseYear: 2016,
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3'
  },
  {
    id: 'eng-4',
    title: 'As It Was',
    artist: 'Harry Styles',
    artistId: 'artist-harry-styles',
    album: "Harry's House",
    albumId: 'alb-harrys-house',
    duration: 167,
    language: 'English',
    genre: 'Indie Pop',
    releaseYear: 2022,
    artwork: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3'
  },
  {
    id: 'eng-5',
    title: 'Levitating',
    artist: 'Dua Lipa',
    artistId: 'artist-dua-lipa',
    album: 'Future Nostalgia',
    albumId: 'alb-future-nostalgia',
    duration: 203,
    language: 'English',
    genre: 'Nu-Disco / Pop',
    releaseYear: 2020,
    artwork: 'https://images.unsplash.com/photo-1445985543468-7944e99500be?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3'
  }
];

const trendingAlbums = [
  {
    id: 'alb-devara',
    title: 'Devara Part 1',
    artist: 'Anirudh Ravichander',
    artistId: 'artist-anirudh',
    artwork: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600',
    releaseDate: '2024-09-27',
    totalTracks: 6
  },
  {
    id: 'alb-animal',
    title: 'Animal (Original Soundtrack)',
    artist: 'Various Artists',
    artistId: 'artist-various',
    artwork: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600',
    releaseDate: '2023-12-01',
    totalTracks: 8
  },
  {
    id: 'alb-after-hours',
    title: 'After Hours',
    artist: 'The Weeknd',
    artistId: 'artist-the-weeknd',
    artwork: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
    releaseDate: '2020-03-20',
    totalTracks: 14
  },
  {
    id: 'alb-guntur-kaaram',
    title: 'Guntur Kaaram',
    artist: 'Thaman S',
    artistId: 'artist-thaman',
    artwork: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
    releaseDate: '2024-01-12',
    totalTracks: 5
  }
];

const recommendedArtists = [
  {
    id: 'artist-anirudh',
    name: 'Anirudh Ravichander',
    artwork: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
    genres: ['Tamil Pop', 'Tollywood Commercial', 'Electronic EDM'],
    monthlyListeners: 24500000
  },
  {
    id: 'artist-arijit',
    name: 'Arijit Singh',
    artwork: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    genres: ['Bollywood Soul', 'Acoustic Romantic', 'Sufi'],
    monthlyListeners: 42100000
  },
  {
    id: 'artist-sid',
    name: 'Sid Sriram',
    artwork: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
    genres: ['Carnatic Classical', 'South Indie Pop', 'Soul'],
    monthlyListeners: 18200000
  },
  {
    id: 'artist-the-weeknd',
    name: 'The Weeknd',
    artwork: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500',
    genres: ['Contemporary R&B', 'Synth-pop', 'Alternative'],
    monthlyListeners: 108000000
  },
  {
    id: 'artist-thaman',
    name: 'S. Thaman',
    artwork: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500',
    genres: ['Tollywood Beats', 'EDM Fusion', 'Melody'],
    monthlyListeners: 15400000
  }
];

const moodPlaylists = [
  {
    id: 'mood-gym',
    title: 'High-Energy Workout',
    description: 'BPM 130+ high voltage beats for high-performance training',
    coverUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
    trackCount: 35
  },
  {
    id: 'mood-chill',
    title: 'Late Night Lo-Fi & Chill',
    description: 'Mellow acoustic strums, soft vocals, and gentle beats',
    coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600',
    trackCount: 42
  },
  {
    id: 'mood-focus',
    title: 'Deep Focus & Flow State',
    description: 'Ambient instrumental rhythms for distraction-free coding & work',
    coverUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600',
    trackCount: 50
  },
  {
    id: 'mood-party',
    title: 'Friday Party Anthems',
    description: 'Massive club bangers, regional chartbusters, and remixes',
    coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
    trackCount: 60
  }
];

const allTracks = [...teluguHits, ...hindiHits, ...englishHits];

class CatalogService {
  getHomeFeed(userPreferredLanguages = ['Telugu', 'Hindi', 'English']) {
    // Generate greeting based on current server hour
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour >= 5 && hour < 12) greeting = 'Good morning';
    else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';

    return {
      greeting,
      recentlyPlayed: allTracks.slice(0, 6),
      madeForYou: [
        allTracks[0], // Naatu Naatu
        allTracks[6], // Kesariya
        allTracks[11], // Blinding Lights
        allTracks[2], // Chuttamalle
        allTracks[7], // Apna Bana Le
        allTracks[12] // Shape of You
      ],
      teluguHits,
      hindiHits,
      englishHits,
      trendingAlbums,
      recommendedArtists,
      moodPlaylists
    };
  }

  getTrackById(id) {
    return allTracks.find(t => t.id === id) || null;
  }

  getArtistById(id) {
    const artist = recommendedArtists.find(a => a.id === id);
    if (!artist) return null;
    const tracks = allTracks.filter(t => t.artistId === id || t.artist.includes(artist.name));
    return {
      ...artist,
      topTracks: tracks
    };
  }

  getAlbumById(id) {
    const album = trendingAlbums.find(a => a.id === id);
    if (!album) return null;
    const tracks = allTracks.filter(t => t.albumId === id);
    return {
      ...album,
      tracks: tracks.length ? tracks : [allTracks[0], allTracks[1]]
    };
  }

  async search(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      return {
        query: '',
        tracks: allTracks.slice(0, 10),
        artists: recommendedArtists,
        albums: trendingAlbums,
        playlists: moodPlaylists
      };
    }

    const matchedTracks = allTracks.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        (t.language && t.language.toLowerCase().includes(q))
    );

    const matchedArtists = recommendedArtists.filter(
      a => a.name.toLowerCase().includes(q) || a.genres.some(g => g.toLowerCase().includes(q))
    );

    const matchedAlbums = trendingAlbums.filter(
      alb => alb.title.toLowerCase().includes(q) || alb.artist.toLowerCase().includes(q)
    );

    const matchedPlaylists = moodPlaylists.filter(
      p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );

    // Online search fallback (iTunes Search API for global real-time catalog discovery if online)
    if (matchedTracks.length === 0) {
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=10`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length) {
            const externalTracks = data.results.map((item, index) => ({
              id: 'ext-' + item.trackId,
              title: item.trackName || 'Unknown Title',
              artist: item.artistName || 'Unknown Artist',
              album: item.collectionName || 'Single',
              duration: Math.round((item.trackTimeMillis || 200000) / 1000),
              artwork: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
              audioUrl: item.previewUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
              genre: item.primaryGenreName || 'Pop',
              language: 'Global',
              releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear() : 2023
            }));
            return {
              query,
              tracks: externalTracks,
              artists: matchedArtists,
              albums: matchedAlbums,
              playlists: matchedPlaylists
            };
          }
        }
      } catch (e) {
        // Fallback silently if offline
      }
    }

    return {
      query,
      tracks: matchedTracks,
      artists: matchedArtists,
      albums: matchedAlbums,
      playlists: matchedPlaylists
    };
  }
}

module.exports = new CatalogService();


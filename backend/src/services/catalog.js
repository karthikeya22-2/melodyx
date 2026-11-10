// Music Catalog Service with Verified Full-Length Official Tracks & High-Precision Search Engine

const ytSearch = require('yt-search');
const spotifyService = require('./spotifyService');
const jioSaavnService = require('./jioSaavnService');

const teluguHits = [
  {
    id: 'telugu-1',
    videoId: 'AbaAxgufFA8',
    title: 'Naatu Naatu',
    artist: 'Rahul Sipligunj, Kaala Bhairava, M.M. Keeravaani',
    album: 'RRR',
    duration: 215,
    language: 'Telugu',
    genre: 'Tollywood Dance',
    releaseYear: 2022,
    artwork: 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg',
    audioUrl: '/api/stream/play/telugu-1',
    isPreview: false
  },
  {
    id: 'telugu-2',
    videoId: 'j5v7lMwsBNY',
    title: 'Kurchi Madathapetti',
    artist: 'S. Thaman, Sahithi Chaganti, Sri Krishna',
    album: 'Guntur Kaaram',
    duration: 235,
    language: 'Telugu',
    genre: 'Tollywood Commercial',
    releaseYear: 2024,
    artwork: 'https://c.saavncdn.com/000/Guntur-Kaaram-Telugu-2023-20240126145901-500x500.jpg',
    audioUrl: '/api/stream/play/telugu-2',
    isPreview: false
  },
  {
    id: 'telugu-3',
    videoId: '9jY8PItvMxo',
    title: 'Chuttamalle',
    artist: 'Anirudh Ravichander, Shilpa Rao',
    album: 'Devara Part 1',
    duration: 223,
    language: 'Telugu',
    genre: 'Melody',
    releaseYear: 2024,
    artwork: 'https://c.saavncdn.com/313/Devara-Part-1-Telugu-Telugu-2024-20240926171010-500x500.jpg',
    audioUrl: '/api/stream/play/telugu-3',
    isPreview: false
  },
  {
    id: 'telugu-4',
    videoId: 'Thf60JU8E98',
    title: 'Samajavaragamana',
    artist: 'Sid Sriram, Thaman S',
    album: 'Ala Vaikunthapurramuloo',
    duration: 230,
    language: 'Telugu',
    genre: 'Romantic Melody',
    releaseYear: 2020,
    artwork: 'https://c.saavncdn.com/517/Ala-Vaikunthapurramuloo-Telugu-2019-20200116144338-500x500.jpg',
    audioUrl: '/api/stream/play/telugu-4',
    isPreview: false
  },
  {
    id: 'telugu-5',
    videoId: 'u_wB6byrl5k',
    title: 'Oo Antava Mava',
    artist: 'Indravathi Chauhan, Devi Sri Prasad',
    album: 'Pushpa: The Rise',
    duration: 229,
    language: 'Telugu',
    genre: 'Folk Beat',
    releaseYear: 2021,
    artwork: 'https://c.saavncdn.com/blob/056/Pushpa-The-Rise-Telugu-2021-20211216115409-500x500.jpg',
    audioUrl: '/api/stream/play/telugu-5',
    isPreview: false
  },
  {
    id: 'telugu-6',
    videoId: 'rTNAIm6h1xo',
    title: 'Inkem Inkem Inkem Kaavaale',
    artist: 'Sid Sriram, Gopi Sundar',
    album: 'Geetha Govindam',
    duration: 267,
    language: 'Telugu',
    genre: 'Acoustic Melody',
    releaseYear: 2018,
    artwork: 'https://c.saavncdn.com/237/Geetha-Govindam-Telugu-2018-20180921-500x500.jpg',
    audioUrl: '/api/stream/play/telugu-6',
    isPreview: false
  },
  {
    id: 'telugu-7',
    videoId: '8yaQB0O0tnM',
    title: 'Fear Song',
    artist: 'Anirudh Ravichander',
    album: 'Devara Part 1',
    duration: 195,
    language: 'Telugu',
    genre: 'Mass Hero Beat',
    releaseYear: 2024,
    artwork: 'https://c.saavncdn.com/313/Devara-Part-1-Telugu-Telugu-2024-20240926171010-500x500.jpg',
    audioUrl: '/api/stream/play/telugu-7',
    isPreview: false
  },
  {
    id: 'telugu-8',
    videoId: 'uFpDexeZsG8',
    title: 'Dum Masala',
    artist: 'Sanjith Hegde, Thaman S',
    album: 'Guntur Kaaram',
    duration: 206,
    language: 'Telugu',
    genre: 'Mass Beat',
    releaseYear: 2024,
    artwork: 'https://c.saavncdn.com/000/Guntur-Kaaram-Telugu-2023-20240126145901-500x500.jpg',
    audioUrl: '/api/stream/play/telugu-8',
    isPreview: false
  }
];

const hindiHits = [
  {
    id: 'hindi-1',
    videoId: 'LIHABJUqZ7s',
    title: 'Kesariya',
    artist: 'Arijit Singh, Pritam',
    album: 'Brahmastra',
    duration: 268,
    language: 'Hindi',
    genre: 'Bollywood Romance',
    releaseYear: 2022,
    artwork: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    audioUrl: '/api/stream/play/hindi-1',
    isPreview: false
  },
  {
    id: 'hindi-2',
    videoId: 'u2NAuswnTKs',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh, Sachin-Jigar',
    album: 'Bhediya',
    duration: 272,
    language: 'Hindi',
    genre: 'Romantic',
    releaseYear: 2022,
    artwork: 'https://c.saavncdn.com/815/Bhediya-Hindi-2023-20230927155213-500x500.jpg',
    audioUrl: '/api/stream/play/hindi-2',
    isPreview: false
  },
  {
    id: 'hindi-3',
    videoId: 'VAdGW7QDJiU',
    title: 'Chaleya',
    artist: 'Arijit Singh, Shilpa Rao, Anirudh',
    album: 'Jawan',
    duration: 188,
    language: 'Hindi',
    genre: 'Pop Romance',
    releaseYear: 2023,
    artwork: 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg',
    audioUrl: '/api/stream/play/hindi-3',
    isPreview: false
  },
  {
    id: 'hindi-4',
    videoId: 'QKMTreKTpug',
    title: 'Pehle Bhi Main',
    artist: 'Vishal Mishra, Raj Shekhar',
    album: 'Animal',
    duration: 250,
    language: 'Hindi',
    genre: 'Romantic',
    releaseYear: 2023,
    artwork: 'https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20260724191152-500x500.jpg',
    audioUrl: '/api/stream/play/hindi-4',
    isPreview: false
  },
  {
    id: 'hindi-5',
    videoId: 'orYf6VDtj_k',
    title: 'Raataan Lambiyan',
    artist: 'Jubin Nautiyal, Asees Kaur',
    album: 'Shershaah',
    duration: 234,
    language: 'Hindi',
    genre: 'Ballad',
    releaseYear: 2021,
    artwork: 'https://c.saavncdn.com/238/Shershaah-Original-Motion-Picture-Soundtrack--Hindi-2021-20210815181610-500x500.jpg',
    audioUrl: '/api/stream/play/hindi-5',
    isPreview: false
  },
  {
    id: 'hindi-6',
    videoId: '0hYehuznQac',
    title: 'Arjan Vailly',
    artist: 'Bhupinder Babbal, Manan Bhardwaj',
    album: 'Animal',
    duration: 182,
    language: 'Hindi',
    genre: 'Punjabi Power',
    releaseYear: 2023,
    artwork: 'https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20260724191152-500x500.jpg',
    audioUrl: '/api/stream/play/hindi-6',
    isPreview: false
  },
  {
    id: 'hindi-7',
    videoId: 'HrnrqYxYrbk',
    title: 'Satranga',
    artist: 'Arijit Singh, Shreyas Puranik',
    album: 'Animal',
    duration: 272,
    language: 'Hindi',
    genre: 'Soulful Ballad',
    releaseYear: 2023,
    artwork: 'https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20260724191152-500x500.jpg',
    audioUrl: '/api/stream/play/hindi-7',
    isPreview: false
  }
];

const englishHits = [
  {
    id: 'eng-1',
    videoId: 'fHI8X4OXluQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 203,
    language: 'English',
    genre: 'Synthwave',
    releaseYear: 2020,
    artwork: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
    audioUrl: '/api/stream/play/eng-1',
    isPreview: false
  },
  {
    id: 'eng-2',
    videoId: '_dK2tDK9grQ',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: 'Divide (÷)',
    duration: 235,
    language: 'English',
    genre: 'Pop',
    releaseYear: 2017,
    artwork: 'https://c.saavncdn.com/126/Shape-of-You-English-2017-500x500.jpg',
    audioUrl: '/api/stream/play/eng-2',
    isPreview: false
  },
  {
    id: 'eng-3',
    videoId: 'Rif-RTvmmss',
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    album: 'Starboy',
    duration: 231,
    language: 'English',
    genre: 'R&B / Electro',
    releaseYear: 2016,
    artwork: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
    audioUrl: '/api/stream/play/eng-3',
    isPreview: false
  },
  {
    id: 'eng-4',
    videoId: 'V1Z586zoeeE',
    title: 'As It Was',
    artist: 'Harry Styles',
    album: "Harry's House",
    duration: 166,
    language: 'English',
    genre: 'Indie Pop',
    releaseYear: 2022,
    artwork: 'https://c.saavncdn.com/720/As-It-Was-English-2022-20220401035858-500x500.jpg',
    audioUrl: '/api/stream/play/eng-4',
    isPreview: false
  },
  {
    id: 'eng-5',
    videoId: 'WHuBW3qKm9g',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 221,
    language: 'English',
    genre: 'Pop',
    releaseYear: 2020,
    artwork: 'https://c.saavncdn.com/207/Dua-Lipa-Live-From-Mexico-English-2026-20260526161014-500x500.jpg',
    audioUrl: '/api/stream/play/eng-5',
    isPreview: false
  },
  {
    id: 'eng-6',
    videoId: 'u6lihZAcy4s',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 216,
    language: 'English',
    genre: 'Synthpop',
    releaseYear: 2020,
    artwork: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
    audioUrl: '/api/stream/play/eng-6',
    isPreview: false
  },
  {
    id: 'eng-7',
    videoId: '7wtfhZwyrcc',
    title: 'Believer',
    artist: 'Imagine Dragons',
    album: 'Evolve',
    duration: 204,
    language: 'English',
    genre: 'Alternative Rock / Pop',
    releaseYear: 2017,
    artwork: 'https://c.saavncdn.com/248/Evolve-English-2018-20260605220036-500x500.jpg',
    audioUrl: '/api/stream/play/eng-7',
    isPreview: false
  }
];

const trendingAlbums = [
  {
    id: 'alb-devara',
    title: 'Devara Part 1',
    artist: 'Anirudh Ravichander',
    artwork: 'https://c.saavncdn.com/313/Devara-Part-1-Telugu-Telugu-2024-20240926171010-500x500.jpg',
    releaseDate: '2024-09-27',
    totalTracks: 6
  },
  {
    id: 'alb-animal',
    title: 'Animal (Original Soundtrack)',
    artist: 'Various Artists',
    artwork: 'https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20260724191152-500x500.jpg',
    releaseDate: '2023-12-01',
    totalTracks: 8
  },
  {
    id: 'alb-after-hours',
    title: 'After Hours',
    artist: 'The Weeknd',
    artwork: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
    releaseDate: '2020-03-20',
    totalTracks: 14
  },
  {
    id: 'alb-guntur-kaaram',
    title: 'Guntur Kaaram',
    artist: 'Thaman S',
    artwork: 'https://c.saavncdn.com/000/Guntur-Kaaram-Telugu-2023-20240126145901-500x500.jpg',
    releaseDate: '2024-01-12',
    totalTracks: 5
  }
];

const recommendedArtists = [
  {
    id: 'artist-anirudh',
    name: 'Anirudh Ravichander',
    artwork: 'https://c.saavncdn.com/313/Devara-Part-1-Telugu-Telugu-2024-20240926171010-500x500.jpg',
    genres: ['Tamil Pop', 'Tollywood Commercial']
  },
  {
    id: 'artist-arijit',
    name: 'Arijit Singh',
    artwork: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    genres: ['Bollywood Soul', 'Romantic']
  },
  {
    id: 'artist-sid',
    name: 'Sid Sriram',
    artwork: 'https://c.saavncdn.com/517/Ala-Vaikunthapurramuloo-Telugu-2019-20200116144338-500x500.jpg',
    genres: ['Carnatic Classical', 'South Indie Pop']
  },
  {
    id: 'artist-the-weeknd',
    name: 'The Weeknd',
    artwork: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
    genres: ['R&B', 'Pop']
  },
  {
    id: 'artist-thaman',
    name: 'S. Thaman',
    artwork: 'https://c.saavncdn.com/000/Guntur-Kaaram-Telugu-2023-20240126145901-500x500.jpg',
    genres: ['Tollywood Beats', 'Melody']
  }
];

const genrePlaylists = [
  {
    id: 'gen-telugu',
    title: 'Telugu Chartbusters',
    description: 'Top streaming Tollywood hits and melodies',
    coverUrl: 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg',
    trackCount: teluguHits.length
  },
  {
    id: 'gen-hindi',
    title: 'Bollywood Hits',
    description: 'Soulful romance, popular singles and soundtracks',
    coverUrl: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    trackCount: hindiHits.length
  },
  {
    id: 'gen-pop',
    title: 'Global Pop Anthems',
    description: 'International chart leaders and modern hits',
    coverUrl: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
    trackCount: englishHits.length
  },
  {
    id: 'gen-acoustic',
    title: 'Acoustic & Chill',
    description: 'Unplugged melodies, soft vocals and gentle rhythms',
    coverUrl: 'https://c.saavncdn.com/237/Geetha-Govindam-Telugu-2018-20180921-500x500.jpg',
    trackCount: 18
  }
];

const allTracks = [...teluguHits, ...hindiHits, ...englishHits];

// Clean strings for fuzzy comparison
function cleanString(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanSongTitle(title) {
  return (title || '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\b(official|audio|video|lyrics|lyric|full song|song|telugu|hindi|english|4k|hd|remastered|promo|track)\b/gi, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Strict filter to eliminate all multi-song jukeboxes, full album compilations, and long video medleys
function isJukeboxOrCompilation(title, duration) {
  const t = (title || '').toLowerCase();
  const jukeboxKeywords = [
    'jukebox',
    'audio jukebox',
    'video jukebox',
    'full album',
    'all songs',
    'all song',
    'non stop',
    'nonstop',
    'mega jukebox',
    'album songs',
    'jukebox songs',
    'hit songs collection',
    'full movie songs',
    'songs mashup'
  ];

  if (jukeboxKeywords.some(kw => t.includes(kw))) {
    return true;
  }

  // Any audio/video longer than 10 minutes (600s) is a jukebox compilation, not a single song
  if (duration && duration > 600) {
    return true;
  }

  return false;
}

// Calculate high-precision relevance score
function scoreRelevance(track, query) {
  const q = cleanString(query);

  // Disqualify any jukebox or compilation unless the user specifically typed 'jukebox'
  if (!q.includes('jukebox') && isJukeboxOrCompilation(track.title, track.duration)) {
    return 0;
  }

  const qTokens = q.split(' ').filter(Boolean);
  const rawTitle = cleanString(track.title);
  const cleanTitle = cleanSongTitle(track.title).toLowerCase();
  const rawArtist = cleanString(track.artist);
  const album = cleanString(track.album);

  let score = 0;

  // 1. Exact title match
  if (cleanTitle === q || rawTitle === q) {
    score += 120;
  } else if (cleanTitle.startsWith(q) || q.startsWith(cleanTitle)) {
    score += 85;
  } else if (cleanTitle.includes(q)) {
    score += 70;
  }

  // 2. Exact Title + Artist combined match
  const artistMatches = qTokens.filter(tok => rawArtist.includes(tok));
  const titleMatches = qTokens.filter(tok => cleanTitle.includes(tok));
  if (artistMatches.length > 0 && titleMatches.length > 0) {
    score += 150;
  } else if (rawArtist === q || rawArtist.includes(q)) {
    score += 75;
  }

  // 3. Album match
  if (album && album.includes(q)) {
    score += 45;
  }

  // 4. Token overlap ratio
  const matchedTokens = qTokens.filter(tok => rawTitle.includes(tok) || rawArtist.includes(tok));
  const matchRatio = matchedTokens.length / (qTokens.length || 1);
  if (matchRatio < 0.4 && score < 50) {
    return 0; // Filter out irrelevant
  }
  score += Math.round(matchRatio * 30);

  // Curated catalog priority boost (guarantees highest audio fidelity)
  if (!track.id.startsWith('yt-')) {
    score += 20;
  }

  // Penalize covers, reactions, karaoke unless user searched for them
  if (!q.includes('cover') && rawTitle.includes('cover')) score -= 60;
  if (!q.includes('reaction') && rawTitle.includes('reaction')) score -= 70;
  if (!q.includes('karaoke') && rawTitle.includes('karaoke')) score -= 60;
  if (!q.includes('remix') && rawTitle.includes('remix')) score -= 25;

  return score;
}

// High-precision filter & deduplication: returns top 2-3 genuinely relevant tracks
function filterAndRankResults(tracks, query, maxResults = 3) {
  const scored = tracks
    .map(t => ({ track: t, score: scoreRelevance(t, query) }))
    .filter(item => item.score >= 35)
    .sort((a, b) => b.score - a.score);

  const results = [];
  const seenSignatures = new Set();

  for (const item of scored) {
    const normTitle = cleanSongTitle(item.track.title).slice(0, 14);
    const normArtist = cleanString(item.track.artist).slice(0, 10);
    const sig = `${normTitle}_${normArtist}`;

    if (seenSignatures.has(sig)) continue;
    seenSignatures.add(sig);

    results.push(item.track);
    if (results.length >= maxResults) break;
  }

  return results;
}

// In-memory high speed search cache for instant sub-millisecond retrieval
const searchCache = new Map();
const SEARCH_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const inFlightSearches = new Map();

class CatalogService {
  getHomeFeed() {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour >= 5 && hour < 12) greeting = 'Good morning';
    else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';

    return {
      greeting,
      trendingTelugu: teluguHits,
      trendingHindi: hindiHits,
      trendingEnglish: englishHits,
      trendingAlbums,
      recommendedArtists,
      genrePlaylists
    };
  }

  getTrackById(id) {
    if (id && id.startsWith('sp-')) {
      const sp = spotifyService.getTrackById(id);
      if (sp) return sp;
    }
    if (id && id.startsWith('saavn-')) {
      const saavn = jioSaavnService.trackCache.get(id);
      if (saavn) return saavn;
    }
    return allTracks.find(t => t.id === id) || null;
  }

  getArtistById(id) {
    const artist = recommendedArtists.find(a => a.id === id);
    if (!artist) return null;
    const tracks = allTracks.filter(t => t.artist.toLowerCase().includes(artist.name.toLowerCase()));
    return {
      ...artist,
      topTracks: tracks
    };
  }

  getAlbumById(id) {
    const album = trendingAlbums.find(a => a.id === id);
    if (!album) return null;
    const baseTitle = album.title.toLowerCase().split('(')[0].trim();
    const tracks = allTracks.filter(t => t.album.toLowerCase().includes(baseTitle));
    return {
      ...album,
      tracks: tracks.length ? tracks : [teluguHits[0], teluguHits[1]]
    };
  }

  async search(query) {
    const rawQ = (query || '').trim();
    const q = rawQ.toLowerCase();
    if (!q) {
      return {
        query: '',
        tracks: allTracks,
        artists: recommendedArtists,
        albums: trendingAlbums,
        playlists: genrePlaylists
      };
    }

    // 1. Instant Cache Hit: Return cached result in 0ms
    const cached = searchCache.get(q);
    if (cached && (Date.now() - cached.timestamp < SEARCH_CACHE_TTL_MS)) {
      return cached.data;
    }

    // 2. In-flight Promise sharing: prevent duplicate upstream calls for concurrent identical requests
    if (inFlightSearches.has(q)) {
      return inFlightSearches.get(q);
    }

    const searchExecution = (async () => {
      try {
    const matchedCuratedTracks = allTracks.filter(
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

    const matchedPlaylists = genrePlaylists.filter(
      p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );

    // 3. Parallel Remote Engine: JioSaavn + Spotify + YouTube executed concurrently
    const saavnPromise = jioSaavnService.searchTracks(q, 6).catch(err => {
      console.warn('[SEARCH] JioSaavn lookup note:', err.message);
      return [];
    });

    const spotifyPromise = (spotifyService.isConfigured() && !spotifyService.isPremiumRequired)
      ? spotifyService.searchTracks(q, 5).catch(err => {
          console.warn('[SEARCH] Spotify search note:', err.message);
          return [];
        })
      : Promise.resolve([]);

    const ytPromise = ytSearch(`${q} official song audio`)
      .then(searchRes => {
        return (searchRes.videos || [])
          .filter(v => !isJukeboxOrCompilation(v.title, v.seconds))
          .slice(0, 10)
          .map(v => {
            let title = v.title;
            let artist = v.author?.name || 'Artist';

            if (title.includes(' - ')) {
              const parts = title.split(' - ');
              artist = parts[0].trim();
              title = parts[1].trim();
            }

            title = title
              .replace(/\[.*?\]/g, '')
              .replace(/\(Official Video\)/gi, '')
              .replace(/\(Official Audio\)/gi, '')
              .replace(/\(Audio\)/gi, '')
              .replace(/\(Lyric Video\)/gi, '')
              .replace(/\(Lyrics\)/gi, '')
              .trim();

            return {
              id: `yt-${v.videoId}`,
              videoId: v.videoId,
              title: title || v.title,
              artist: artist,
              album: 'Single',
              duration: v.seconds || 210,
              artwork: v.thumbnail || (v.videoId ? `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg` : '/logo.png'),
              audioUrl: `/api/stream/play/yt-${v.videoId}`,
              genre: 'Music',
              language: 'Universal',
              releaseYear: new Date().getFullYear(),
              isPreview: false
            };
          });
      })
      .catch(err => {
        console.warn('[SEARCH] YouTube lookup note:', err.message);
        return [];
      });

    // Enforce an aggressive 1800ms timeout for external network so UI never waits or lags
    const timeoutPromise = new Promise(resolve => setTimeout(() => resolve('TIMEOUT'), 1800));

    let saavnTracks = [];
    let spotifyTracks = [];
    let externalVideos = [];

    try {
      const settled = await Promise.race([
        Promise.allSettled([saavnPromise, spotifyPromise, ytPromise]),
        timeoutPromise.then(() => null)
      ]);

      if (settled) {
        saavnTracks = settled[0]?.status === 'fulfilled' ? settled[0].value || [] : [];
        spotifyTracks = settled[1]?.status === 'fulfilled' ? settled[1].value || [] : [];
        externalVideos = settled[2]?.status === 'fulfilled' ? settled[2].value || [] : [];
      }
    } catch (e) {
      console.warn('[SEARCH] Concurrent search execution note:', e.message);
    }

    // 4. Score, filter out compilations/jukeboxes, and rank top 2-3 single tracks
    const pool = [...matchedCuratedTracks, ...saavnTracks, ...spotifyTracks, ...externalVideos];
    const topRankedTracks = filterAndRankResults(pool, q, 3);

    const result = {
      query: rawQ,
      tracks: topRankedTracks,
      artists: matchedArtists.slice(0, 2),
      albums: matchedAlbums.slice(0, 2),
      playlists: matchedPlaylists.slice(0, 2)
    };

      // Store in cache for blazing fast repeated or sequential keystroke queries
      if (searchCache.size > 200) {
        const firstKey = searchCache.keys().next().value;
        searchCache.delete(firstKey);
      }
      searchCache.set(q, { timestamp: Date.now(), data: result });

      return result;
    } finally {
      inFlightSearches.delete(q);
    }
  })();

  inFlightSearches.set(q, searchExecution);
  return searchExecution;
}
}

module.exports = new CatalogService();

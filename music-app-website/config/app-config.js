// Melodyx Official Application & Website Configuration
// Change values here to update version, download URLs, and metadata across the entire website.

window.APP_CONFIG = {
  name: 'Melodyx',
  tagline: 'Your Music. Your World.',
  version: '2.1.0',
  releaseDate: 'November 2026',
  apkSize: '6.35 MB',
  minAndroid: 'Android 8.0+ (Oreo, Pie, 10, 11, 12, 13, 14, 15)',
  targetSdk: 'Android 14 (API 34)',
  packageName: 'com.spotube.soundwave',
  architecture: 'Universal (arm64-v8a, armeabi-v7a, x86_64)',
  license: 'Free & Open Music Experience',
  
  // Download URLs
  downloadUrl: 'apk/Melodyx.apk',
  fallbackDownloadUrl: 'https://melodyx-zday.onrender.com/api/updates/download',
  githubUrl: 'https://github.com',
  webAppStatus: 'Coming Soon',

  // What's New in v2.1.0
  changelog: [
    'Universal Playlist Importer – Import playlists from Spotify, JioSaavn, YouTube, and Apple Music directly.',
    'Curated Search Engine – Returns strictly 3–4 results max with smart Exact Match identification.',
    'Seamless Autoplay Redirection – Automatically transitions from search into your imported playlists or liked songs.',
    'Pure 320kbps Akamai CDN Streaming – High-fidelity lossless audio streaming with zero ads and zero lag.',
    'Android Hardware Back Button Fix – Natural home navigation without accidental app exits.',
    'Synced Lyrics Engine – Real-time synchronized lyrics support.'
  ],

  // Legally Available Free Music Preview Tracks (Creative Commons CC-BY / Free Music Archive / Jamendo)
  // All streams are verified, high-quality, legally permissible for streaming with public attribution.
  previewTracks: [
    {
      id: 'cc-1',
      title: 'Acoustic Breeze',
      artist: 'Benjamin Tissot',
      album: 'Acoustic Memories',
      duration: 157, // 2:37
      artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
      audioUrl: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
      genre: 'Acoustic',
      license: 'Creative Commons CC-BY',
      licenseUrl: 'https://www.bensound.com',
      attribution: 'Music by Bensound.com / Benjamin Tissot (Licensed under Creative Commons)'
    },
    {
      id: 'cc-2',
      title: 'Sunny Days',
      artist: 'Benjamin Tissot',
      album: 'Summer Moods',
      duration: 140, // 2:20
      artwork: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
      audioUrl: 'https://www.bensound.com/bensound-music/bensound-sunny.mp3',
      genre: 'Folk / Pop',
      license: 'Creative Commons CC-BY',
      licenseUrl: 'https://www.bensound.com',
      attribution: 'Music by Bensound.com (Licensed under Creative Commons)'
    },
    {
      id: 'cc-3',
      title: 'Slow Motion',
      artist: 'Benjamin Tissot',
      album: 'Cinematic Soundscapes',
      duration: 206, // 3:26
      artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
      audioUrl: 'https://www.bensound.com/bensound-music/bensound-slowmotion.mp3',
      genre: 'Cinematic',
      license: 'Creative Commons CC-BY',
      licenseUrl: 'https://www.bensound.com',
      attribution: 'Music by Bensound.com (Licensed under Creative Commons)'
    },
    {
      id: 'cc-4',
      title: 'Memories',
      artist: 'Benjamin Tissot',
      album: 'Acoustic Journeys',
      duration: 230, // 3:50
      artwork: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=500&auto=format&fit=crop&q=80',
      audioUrl: 'https://www.bensound.com/bensound-music/bensound-memories.mp3',
      genre: 'Acoustic Piano',
      license: 'Creative Commons CC-BY',
      licenseUrl: 'https://www.bensound.com',
      attribution: 'Music by Bensound.com (Licensed under Creative Commons)'
    },
    {
      id: 'cc-5',
      title: 'Better Days',
      artist: 'Benjamin Tissot',
      album: 'Chill Reflections',
      duration: 153, // 2:33
      artwork: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
      audioUrl: 'https://www.bensound.com/bensound-music/bensound-betterdays.mp3',
      genre: 'Lo-Fi / Chill',
      license: 'Creative Commons CC-BY',
      licenseUrl: 'https://www.bensound.com',
      attribution: 'Music by Bensound.com (Licensed under Creative Commons)'
    }
  ]
};


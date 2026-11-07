// Melodyx Official Application & Website Configuration
// Change values here to update version, download URLs, and metadata across the entire website.

window.APP_CONFIG = {
  name: 'Melodyx',
  tagline: 'Your Music. Your World.',
  version: '2.1.0',
  releaseDate: 'November 2026',
  apkSize: '6.42 MB',
  minAndroid: 'Android 8.0+ (Oreo, Pie, 10, 11, 12, 13, 14, 15)',
  targetSdk: 'Android 15 (API 35)',
  packageName: 'com.spotube.soundwave',
  architecture: 'Universal (arm64-v8a, armeabi-v7a, x86_64)',
  license: 'Free & Open Music Experience',
  
  // Download URLs
  downloadUrl: './apk/Melodyx.apk',
  fallbackDownloadUrl: 'https://github.com/karthikeya22-2/download-melodyx/raw/main/apk/Melodyx.apk',
  githubUrl: 'https://github.com/karthikeya22-2/download-melodyx',
  webAppStatus: 'Coming Soon',

  // What's New in v2.1.0
  changelog: [
    'Fixed Missing Music Notification – Real-time media notification with play/pause, next/previous buttons, and album artwork.',
    'Android Lock-Screen Controls – Full lock-screen media player and timeline scrubber support via AndroidX MediaSession.',
    'Enhanced Background Playback – Uninterrupted low-power audio streaming with screen off.',
    'In-App Auto Updater – Direct one-tap update download and package installation.',
    'Universal Playlist Importer – Import playlists from Spotify, JioSaavn, YouTube, and Apple Music directly.',
    'Curated Search Engine – Returns strictly 3–4 results max with smart Exact Match identification.',
    'Seamless Autoplay Redirection – Transitions from search directly to your imported or liked playlists.'
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


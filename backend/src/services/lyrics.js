// Synchronized Lyrics Service (LRCLIB Integration & Fallbacks)

const sampleLyrics = {
  'telugu-1': [
    { time: 5.2, text: 'Polam gattu dhummu lo na...' },
    { time: 10.4, text: 'Potla gittha dhookinattu...' },
    { time: 15.1, text: 'Polo polo thakadhimi dhanchinattu...' },
    { time: 20.3, text: 'Naatu Naatu Naatu Naatu...' },
    { time: 25.8, text: 'Naatu Naatu Naatu Veera Naatu!' },
    { time: 35.0, text: 'Gundeladhipe dharuvu laaga...' },
    { time: 42.1, text: 'Dhummu lepe aatamidhe ra!' }
  ],
  'hindi-1': [
    { time: 4.0, text: 'Mujhko itna bataye koi...' },
    { time: 8.5, text: 'Kaise tujhse dil na lagaye koi...' },
    { time: 14.2, text: 'Rabba ne tujhko banane me...' },
    { time: 18.0, text: 'Kar di hai husn ki khaali tijoriyan...' },
    { time: 23.5, text: 'Kajal ki siyahi se likhi...' },
    { time: 27.2, text: 'Hai tune jaane kitno ki love storiyan...' },
    { time: 32.0, text: 'Kesariya tera ishq hai piya...' },
    { time: 36.5, text: 'Rang jaaun jo main haath lagaun...' }
  ],
  'eng-1': [
    { time: 3.5, text: "Yeah..." },
    { time: 7.2, text: "I've been on my own for long enough" },
    { time: 12.0, text: "Maybe you can show me how to love, maybe" },
    { time: 17.5, text: "I'm going through withdrawals" },
    { time: 22.0, text: "You don't even have to do too much" },
    { time: 26.8, text: "You can turn me on with just a touch, baby" },
    { time: 32.0, text: "I look around and Sin City's cold and empty" },
    { time: 37.4, text: "No one's around to judge me" },
    { time: 42.1, text: "I can't see clearly when you're gone" },
    { time: 47.0, text: "I said, ooh, I'm blinded by the lights!" }
  ]
};

function parseLrc(lrcText) {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{2,3})?\](.*)/;

  for (const line of lines) {
    const match = timeRegex.exec(line.trim());
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
      const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;
      const text = match[4].trim();
      if (text) {
        result.push({ time: parseFloat(totalSeconds.toFixed(2)), text });
      }
    }
  }
  return result;
}

class LyricsService {
  async getLyrics(trackId, title, artist) {
    // 1. Check local pre-synced dictionary
    if (sampleLyrics[trackId]) {
      return {
        trackId,
        title,
        artist,
        isSynced: true,
        lines: sampleLyrics[trackId]
      };
    }

    // 2. Fetch from LRCLIB
    if (title && artist) {
      try {
        const cleanTitle = title.split('(')[0].split('-')[0].trim();
        const cleanArtist = artist.split(',')[0].trim();
        const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.syncedLyrics) {
            const parsed = parseLrc(data.syncedLyrics);
            if (parsed.length > 0) {
              return {
                trackId,
                title,
                artist,
                isSynced: true,
                lines: parsed
              };
            }
          }
          if (data.plainLyrics) {
            return {
              trackId,
              title,
              artist,
              isSynced: false,
              plainText: data.plainLyrics,
              lines: []
            };
          }
        }
      } catch (err) {
        // Fall through
      }
    }

    // Default placeholder synced rhythm
    return {
      trackId,
      title: title || 'Song Lyrics',
      artist: artist || '',
      isSynced: true,
      lines: [
        { time: 0.0, text: '♪ Instrumental Intro ♪' },
        { time: 10.0, text: `Singing along to ${title || 'the track'}...` },
        { time: 20.0, text: `Feel the rhythm and beat...` },
        { time: 30.0, text: '♪ Enjoying the music with zero ads ♪' }
      ]
    };
  }
}

module.exports = new LyricsService();


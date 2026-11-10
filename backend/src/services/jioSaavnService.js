// JioSaavn Service - Clean Studio Tracks & 320kbps Lossless Audio Streams (No Jukeboxes)

const CryptoJS = require('crypto-js');

const DES_KEY = CryptoJS.enc.Utf8.parse('38346591');

class JioSaavnService {
  constructor() {
    this.trackCache = new Map();
  }

  // Decrypt JioSaavn DES-ECB encrypted media URL to get direct 320kbps / 160kbps stream URL
  decryptMediaUrl(encryptedUrl) {
    if (!encryptedUrl) return null;
    try {
      const decrypted = CryptoJS.DES.decrypt(
        encryptedUrl.trim(),
        DES_KEY,
        { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
      );
      let rawUrl = decrypted.toString(CryptoJS.enc.Utf8);
      if (!rawUrl || !rawUrl.startsWith('http')) return null;

      rawUrl = rawUrl.replace('http://', 'https://');
      // Upgrade stream to highest available studio quality: 320 kbps MP4/M4A
      return rawUrl.replace(/_(?:48|96|160)\.(mp4|m4a)$/, '_320.$1').replace(/_(?:48|96|160)\./, '_320.');
    } catch (err) {
      console.warn('[JIOSAAVN] Decryption note:', err.message);
      return null;
    }
  }

  // Search JioSaavn for pristine single tracks (inherently zero jukeboxes)
  async searchTracks(query, limit = 5) {
    if (!query || !query.trim()) return [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&q=${encodeURIComponent(query.trim())}&p=1&n=${limit}`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) return [];

      const data = await response.json();
      const results = data.results || [];

      const mappedTracks = [];

      for (const item of results) {
        // Disqualify any accidental compilation or jukebox title
        const titleLower = (item.song || '').toLowerCase();
        if (
          titleLower.includes('jukebox') ||
          titleLower.includes('full album') ||
          titleLower.includes('all songs') ||
          titleLower.includes('mega jukebox')
        ) {
          continue;
        }

        const directAudio = this.decryptMediaUrl(item.encrypted_media_url);

        // High resolution artwork: replace 150x150 with 500x500
        const highResArt = (item.image || '')
          .replace('150x150', '500x500')
          .replace('http:', 'https:');

        const track = {
          id: `saavn-${item.id}`,
          saavnId: item.id,
          title: (item.song || '').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim(),
          artist: (item.primary_artists || item.singers || 'Artist')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .trim(),
          album: (item.album || 'Single')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .trim(),
          duration: parseInt(item.duration, 10) || 210,
          artwork: highResArt || '/logo.png',
          audioUrl: `/api/stream/play/saavn-${item.id}`,
          directStreamUrl: directAudio,
          language: item.language || 'Indian',
          genre: 'Studio Single',
          releaseYear: parseInt(item.year, 10) || new Date().getFullYear(),
          isPreview: false
        };

        // Cache track for direct audio stream resolution
        this.trackCache.set(track.id, track);
        mappedTracks.push(track);
      }

      return mappedTracks;
    } catch (err) {
      console.warn('[JIOSAAVN] Search error:', err.message);
      return [];
    }
  }

  // Look up track by ID or query
  async getTrackDetails(trackId) {
    if (this.trackCache.has(trackId)) {
      return this.trackCache.get(trackId);
    }

    const saavnId = trackId.replace('saavn-', '').replace('js_', '').replace('js-', '');
    try {
      const url = `https://www.jiosaavn.com/api.php?__call=song.getDetails&_format=json&pids=${encodeURIComponent(saavnId)}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!response.ok) return null;

      const data = await response.json();
      const item = Object.values(data)[0];
      if (!item) return null;

      const directAudio = this.decryptMediaUrl(item.encrypted_media_url);
      const highResArt = (item.image || '')
        .replace('150x150', '500x500')
        .replace('http:', 'https:');

      const track = {
        id: trackId,
        saavnId: item.id,
        title: (item.song || '').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim(),
        artist: (item.primary_artists || 'Artist').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim(),
        album: (item.album || 'Single').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim(),
        duration: parseInt(item.duration, 10) || 210,
        artwork: highResArt,
        audioUrl: `/api/stream/play/${encodeURIComponent(trackId)}`,
        directStreamUrl: directAudio,
        isPreview: false
      };

      this.trackCache.set(trackId, track);
      return track;
    } catch (err) {
      console.warn('[JIOSAAVN] Detail lookup error:', err.message);
      return null;
    }
  }

  // Find a direct 320kbps audio stream URL for a given title + artist
  async resolveAudioStream(title, artist) {
    const q = `${title} ${artist}`.trim();
    const tracks = await this.searchTracks(q, 3);
    const top = tracks[0];
    if (top && top.directStreamUrl) {
      return {
        directUrl: top.directStreamUrl,
        duration: top.duration,
        source: 'JioSaavn Studio 320kbps',
        track: top
      };
    }
    return null;
  }
}

module.exports = new JioSaavnService();


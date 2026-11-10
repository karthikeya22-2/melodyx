// Spotify Web API Integration Service with Automatic Token Refresh & Graceful Fallback

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    this.accessToken = null;
    this.tokenExpiresAt = 0;
    this.isPremiumRequired = false;
    this.trackCache = new Map();
  }

  isConfigured() {
    return Boolean(this.clientId && this.clientSecret);
  }

  async getAccessToken() {
    if (!this.isConfigured()) return null;

    // Return cached token if still valid (with 60s buffer)
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    try {
      const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[SPOTIFY] Token fetch failed (${response.status}):`, errorText);
        return null;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
      return this.accessToken;
    } catch (err) {
      console.warn('[SPOTIFY] Token network error:', err.message);
      return null;
    }
  }

  async searchTracks(query, limit = 5) {
    if (!query || !query.trim()) return [];

    const token = await this.getAccessToken();
    if (!token) return [];

    try {
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query.trim())}&type=track&limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 403) {
          this.isPremiumRequired = true;
          console.warn('[SPOTIFY] Notice: Spotify requires the developer account to have an active Spotify Premium subscription for Web API catalog search.');
        } else {
          console.warn(`[SPOTIFY] Search query failed (${response.status}):`, errText);
        }
        return [];
      }

      const data = await response.json();
      const items = data.tracks?.items || [];

      const mappedTracks = items.map(t => {
        const track = {
          id: `sp-${t.id}`,
          spotifyId: t.id,
          title: t.name,
          artist: t.artists.map(a => a.name).join(', '),
          album: t.album?.name || 'Single',
          duration: Math.round((t.duration_ms || 210000) / 1000),
          artwork: t.album?.images?.[0]?.url || '/logo.png',
          audioUrl: `/api/stream/play/sp-${t.id}`,
          genre: 'Spotify Official',
          language: 'Universal',
          releaseYear: t.album?.release_date ? parseInt(t.album.release_date.slice(0, 4), 10) : new Date().getFullYear(),
          isPreview: false
        };

        // Cache track info so stream resolver can look up title + artist for streaming
        this.trackCache.set(track.id, track);
        return track;
      });

      return mappedTracks;
    } catch (err) {
      console.warn('[SPOTIFY] Search request error:', err.message);
      return [];
    }
  }

  getTrackById(id) {
    return this.trackCache.get(id) || null;
  }
}

module.exports = new SpotifyService();


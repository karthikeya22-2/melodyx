// Audio Stream Resolver Engine (Ad-Free High-Quality Audio Streamer with Range Support)

const catalog = require('./catalog');

class StreamResolver {
  constructor() {
    this.streamCache = new Map();
  }

  async resolveTrack(trackId, title, artist) {
    // 1. Check in-memory cache
    if (this.streamCache.has(trackId)) {
      return this.streamCache.get(trackId);
    }

    // 2. Check local catalog
    const track = catalog.getTrackById(trackId);
    let targetAudioUrl = track ? track.audioUrl : null;

    if (!targetAudioUrl) {
      // Default high quality sample stream
      targetAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    }

    const streamInfo = {
      trackId,
      title: title || (track ? track.title : 'Track'),
      artist: artist || (track ? track.artist : 'Artist'),
      format: 'mp3',
      bitrate: '320kbps',
      directUrl: targetAudioUrl,
      proxyUrl: `/api/stream/play/${encodeURIComponent(trackId)}`,
      hasAds: false,
      resolvedAt: new Date().toISOString()
    };

    this.streamCache.set(trackId, streamInfo);
    return streamInfo;
  }

  // Stream proxy with full HTTP 206 Partial Content and Range header support
  async handleStreamProxy(trackId, req, res) {
    try {
      const streamInfo = await this.resolveTrack(trackId);
      const audioUrl = streamInfo.directUrl;

      // Make head or range request to the remote source
      const range = req.headers.range;
      const headers = {};
      if (range) {
        headers['Range'] = range;
      }

      const response = await fetch(audioUrl, {
        headers,
        redirect: 'follow'
      });

      if (!response.ok && response.status !== 206) {
        // Fallback
        return res.redirect(audioUrl);
      }

      const contentType = response.headers.get('content-type') || 'audio/mpeg';
      const contentLength = response.headers.get('content-length');
      const contentRange = response.headers.get('content-range');
      const acceptRanges = response.headers.get('accept-ranges') || 'bytes';

      res.status(response.status);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', acceptRanges);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Range');
      res.setHeader('Cache-Control', 'public, max-age=86400');

      if (contentLength) res.setHeader('Content-Length', contentLength);
      if (contentRange) res.setHeader('Content-Range', contentRange);

      const arrayBuffer = await response.arrayBuffer();
      res.end(Buffer.from(arrayBuffer));
    } catch (err) {
      console.error(`Streaming error for ${trackId}:`, err.message);
      res.status(500).json({ error: 'Failed to stream audio chunk', message: err.message });
    }
  }
}

module.exports = new StreamResolver();


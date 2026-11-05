// Universal Full-Length Audio Stream Resolver Engine (JioSaavn 320kbps Studio & Verified Audio Streams)

const { Readable } = require('stream');
const { Ytdl } = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const catalog = require('./catalog');
const jioSaavnService = require('./jioSaavnService');

const ytdlClient = new Ytdl();

class StreamResolver {
  constructor() {
    this.streamCache = new Map();
  }

  async resolveTrack(trackId, title, artist, forceRefresh = false) {
    // 1. In-memory cache check (cached for 2 hours; YouTube direct links last ~6 hours)
    if (!forceRefresh && this.streamCache.has(trackId)) {
      const cached = this.streamCache.get(trackId);
      if (Date.now() - cached.cachedAt < 2 * 60 * 60 * 1000) {
        return cached;
      }
    }

    // 1. Direct JioSaavn Studio 320kbps Stream Check
    if (trackId && (trackId.startsWith('saavn-') || trackId.startsWith('js_') || trackId.startsWith('js-'))) {
      const saavnTrack = await jioSaavnService.getTrackDetails(trackId);
      if (saavnTrack && saavnTrack.directStreamUrl) {
        const streamInfo = {
          trackId,
          title: saavnTrack.title,
          artist: saavnTrack.artist,
          format: 'mp4',
          bitrate: '320kbps',
          directUrl: saavnTrack.directStreamUrl,
          proxyUrl: `/api/stream/play/${encodeURIComponent(trackId)}`,
          duration: saavnTrack.duration,
          source: 'JioSaavn Studio 320kbps',
          cachedAt: Date.now()
        };
        this.streamCache.set(trackId, streamInfo);
        return streamInfo;
      }
    }

    const localTrack = catalog.getTrackById(trackId);
    const songTitle = title || (localTrack ? localTrack.title : 'Track');
    const songArtist = artist || (localTrack ? localTrack.artist : '');

    // 2. Try JioSaavn 320kbps studio stream first if title is available
    if (songTitle && songTitle !== 'Track') {
      try {
        const saavnResults = await jioSaavnService.searchTracks(`${songTitle} ${songArtist}`.trim(), 1);
        if (saavnResults && saavnResults.length > 0 && saavnResults[0].directStreamUrl) {
          const best = saavnResults[0];
          const streamInfo = {
            trackId,
            title: best.title || songTitle,
            artist: best.artist || songArtist,
            format: 'mp4',
            bitrate: '320kbps',
            directUrl: best.directStreamUrl,
            proxyUrl: `/api/stream/play/${encodeURIComponent(trackId)}?title=${encodeURIComponent(songTitle)}&artist=${encodeURIComponent(songArtist)}`,
            duration: best.duration || 210,
            source: 'JioSaavn Studio 320kbps',
            cachedAt: Date.now()
          };
          this.streamCache.set(trackId, streamInfo);
          return streamInfo;
        }
      } catch (e) {
        // Fall back to YouTube
      }
    }

    // 3. Determine YouTube Video ID
    let videoId = null;

    if (trackId && (trackId.startsWith('yt-') || trackId.startsWith('yt_'))) {
      videoId = trackId.replace('yt-', '').replace('yt_', '');
    } else if (localTrack && localTrack.videoId) {
      videoId = localTrack.videoId;
    }

    // If no video ID found directly, perform full-length YouTube search (strictly filtered against jukeboxes)
    if (!videoId) {
      try {
        const query = `${songTitle} ${songArtist} official audio`.trim();
        const searchRes = await ytSearch(query);
        const cleanVideos = (searchRes.videos || []).filter(v => {
          const t = (v.title || '').toLowerCase();
          const isJuke = [
            'jukebox',
            'full album',
            'all songs',
            'all song',
            'non stop',
            'nonstop',
            'mega jukebox',
            'album songs',
            'hit songs collection'
          ].some(kw => t.includes(kw));
          const dur = v.seconds || 0;
          return !isJuke && dur >= 60 && dur <= 600;
        });

        const topVideo = cleanVideos[0] || searchRes.videos?.[0];
        if (topVideo) {
          videoId = topVideo.videoId;
        }
      } catch (err) {
        console.warn(`[RESOLVER] Search lookup error for "${songTitle}":`, err.message);
      }
    }

    if (!videoId) {
      throw new Error(`Unable to find streaming source for track: ${songTitle}`);
    }

    // 3. Resolve Full-Length Audio Stream Format via YouTube Engine
    try {
      const info = await ytdlClient.getInfo(videoId);

      // Prefer AAC in MP4 container (itag 140) for universal browser & mobile audio playback,
      // or highest bitrate audio format
      const audioFormats = info.formats
        .filter(f => f.hasAudio && !f.hasVideo && f.url)
        .sort((a, b) => {
          // If both have itag 140, prioritize it
          if (a.itag === 140) return -1;
          if (b.itag === 140) return 1;
          return (b.audioBitrate || 0) - (a.audioBitrate || 0);
        });

      const bestAudio = audioFormats[0];

      if (!bestAudio || !bestAudio.url) {
        throw new Error(`No compatible audio stream format available for video: ${videoId}`);
      }

      const streamInfo = {
        trackId,
        videoId,
        title: songTitle,
        artist: songArtist,
        format: bestAudio.container || 'mp4',
        bitrate: `${bestAudio.audioBitrate || 128}kbps`,
        directUrl: bestAudio.url,
        proxyUrl: `/api/stream/play/${encodeURIComponent(trackId)}`,
        duration: parseInt(info.videoDetails.lengthSeconds, 10) || (localTrack ? localTrack.duration : 210),
        isPreview: false,
        cachedAt: Date.now()
      };

      this.streamCache.set(trackId, streamInfo);
      return streamInfo;
    } catch (err) {
      console.error(`[RESOLVER] Extraction failure for ${songTitle} (${videoId}):`, err.message);
      throw err;
    }
  }

  // True HTTP Streaming Proxy with Range (206 Partial Content) support
  async handleStreamProxy(trackId, req, res) {
    try {
      const { title, artist } = req.query;
      let streamInfo = await this.resolveTrack(trackId, title, artist);
      let audioUrl = streamInfo.directUrl;

      const rangeHeader = req.headers.range;
      const fetchHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SoundWave/2.0'
      };
      if (rangeHeader) {
        fetchHeaders['Range'] = rangeHeader;
      }

      let response = await fetch(audioUrl, {
        headers: fetchHeaders,
        redirect: 'follow'
      });

      // If YouTube direct URL expired (403), invalidate cache and re-resolve fresh stream
      if (response.status === 403 || response.status === 410) {
        console.log(`[STREAM] Direct URL expired for ${trackId}, refreshing stream...`);
        this.streamCache.delete(trackId);
        streamInfo = await this.resolveTrack(trackId, title, artist, true);
        audioUrl = streamInfo.directUrl;

        response = await fetch(audioUrl, {
          headers: fetchHeaders,
          redirect: 'follow'
        });
      }

      if (!response.ok && response.status !== 206) {
        throw new Error(`Upstream audio provider returned HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || (streamInfo.format === 'mp4' ? 'audio/mp4' : 'audio/webm');
      const contentLength = response.headers.get('content-length');
      const contentRange = response.headers.get('content-range');
      const acceptRanges = response.headers.get('accept-ranges') || 'bytes';

      res.status(response.status);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', acceptRanges);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Range, Content-Length');
      res.setHeader('Cache-Control', 'public, max-age=86400');

      if (contentLength) res.setHeader('Content-Length', contentLength);
      if (contentRange) res.setHeader('Content-Range', contentRange);

      if (response.body) {
        const nodeReadable = Readable.fromWeb(response.body);
        nodeReadable.on('error', err => {
          if (!res.headersSent) res.status(500).end();
        });
        req.on('close', () => {
          nodeReadable.destroy();
        });
        nodeReadable.pipe(res);
      } else {
        res.end();
      }
    } catch (err) {
      console.error(`[STREAM] Stream proxy error for ${trackId}:`, err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream temporarily unavailable', message: err.message });
      }
    }
  }
}

module.exports = new StreamResolver();

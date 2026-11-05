// SoundWave Universal Playlist Importer Service
// Supports Spotify, JioSaavn, YouTube, YouTube Music, and Generic Playlists

const jioSaavnService = require('./jioSaavnService');

class PlaylistImporter {
  /**
   * Main import entry point
   * @param {string} rawUrl 
   */
  async importPlaylist(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') {
      throw new Error('Please provide a valid playlist link.');
    }

    const url = rawUrl.trim();

    // 1. Spotify Playlist
    if (url.includes('spotify.com')) {
      return await this.importSpotify(url);
    }

    // 2. JioSaavn / Saavn Playlist
    if (url.includes('jiosaavn.com') || url.includes('saavn.com')) {
      return await this.importJioSaavn(url);
    }

    // 3. YouTube or YouTube Music Playlist
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return await this.importYouTube(url);
    }

    // 4. Generic Link / Fallback
    return await this.importGeneric(url);
  }

  /**
   * Import Spotify Playlist via Embed Scraper (No OAuth or Premium required)
   */
  async importSpotify(url) {
    const match = url.match(/playlist[/:]([a-zA-Z0-9]+)/);
    if (!match || !match[1]) {
      throw new Error('Invalid Spotify playlist URL. Please ensure it has /playlist/[id]');
    }

    const playlistId = match[1];
    const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;

    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to load Spotify playlist (HTTP ${res.status}). Make sure the playlist is public.`);
    }

    const html = await res.text();
    const dataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!dataMatch) {
      throw new Error('Could not parse Spotify playlist structure. The playlist might be private or removed.');
    }

    let parsed;
    try {
      parsed = JSON.parse(dataMatch[1]);
    } catch (e) {
      throw new Error('Failed to parse Spotify playlist payload.');
    }

    const entity = parsed?.props?.pageProps?.state?.data?.entity;
    if (!entity) {
      throw new Error('Spotify playlist data was empty or restricted.');
    }

    const title = entity.name || entity.title || 'Imported Spotify Playlist';
    const description = entity.subtitle || 'Imported from Spotify';
    const coverUrl =
      entity.visualIdentity?.image?.[1]?.url ||
      entity.visualIdentity?.image?.[2]?.url ||
      entity.coverArt?.sources?.[0]?.url ||
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';

    const rawTracks = entity.trackList || [];
    const tracks = rawTracks.map((t, idx) => {
      const cleanTitle = (t.title || 'Track').trim();
      const cleanArtist = (t.subtitle || 'Various Artists').trim();
      const spotifyTrackId = t.uri ? t.uri.replace('spotify:track:', '') : `sp_${idx}_${Date.now()}`;
      const durationSec = Math.round((t.duration || 210000) / 1000);

      return {
        id: `sp_${spotifyTrackId}`,
        title: cleanTitle,
        artist: cleanArtist,
        album: title,
        artwork: coverUrl,
        duration: durationSec > 0 ? durationSec : 210,
        audioUrl: `/api/stream/play/${encodeURIComponent(`sp_${spotifyTrackId}`)}?title=${encodeURIComponent(cleanTitle)}&artist=${encodeURIComponent(cleanArtist)}`
      };
    });

    return {
      id: `imported_sp_${playlistId}`,
      title,
      description,
      coverUrl,
      source: 'spotify',
      sourceUrl: url,
      trackCount: tracks.length,
      tracks
    };
  }

  /**
   * Import JioSaavn Playlist
   */
  async importJioSaavn(url) {
    let token = null;
    let listId = null;

    // Check featured token e.g. /featured/[name]/[token]
    const featuredMatch = url.match(/featured\/[^/]+\/([^/?#]+)/);
    if (featuredMatch) {
      token = featuredMatch[1];
    }

    // Check /s/playlist/[id]/[name]/[token] or /s/playlist/[token]
    const sPlaylistMatch = url.match(/s\/playlist\/(?:[^/]+\/)??(?:[^/]+\/)?([^/?#]+)/);
    if (sPlaylistMatch && !token) {
      token = sPlaylistMatch[1];
    }

    // Check listid param
    const listidMatch = url.match(/[?&]listid=([0-9]+)/);
    if (listidMatch) {
      listId = listidMatch[1];
    }

    let apiUrl = '';
    if (token) {
      apiUrl = `https://www.jiosaavn.com/api.php?__call=webapi.get&token=${encodeURIComponent(token)}&type=playlist&p=1&n=50&includeMetaTags=0&ctx=web6dot0&_format=json&_marker=0`;
    } else if (listId) {
      apiUrl = `https://www.jiosaavn.com/api.php?__call=playlist.getDetails&_format=json&_marker=0&cc=in&listid=${encodeURIComponent(listId)}`;
    } else {
      // Fallback: fetch HTML and search for token or listId
      const pageRes = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const html = await pageRes.text();
      const tokenInPage = html.match(/"listid":"([0-9]+)"/) || html.match(/data-listid="([0-9]+)"/);
      if (tokenInPage) {
        apiUrl = `https://www.jiosaavn.com/api.php?__call=playlist.getDetails&_format=json&_marker=0&cc=in&listid=${encodeURIComponent(tokenInPage[1])}`;
      } else {
        throw new Error('Could not identify JioSaavn playlist ID or token from link.');
      }
    }

    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to load JioSaavn playlist (HTTP ${res.status})`);
    }

    const data = await res.json();
    const title = (data.title || data.listname || 'JioSaavn Playlist').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim();
    const description = (data.header_desc || data.subtitle || 'Imported from JioSaavn').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim();
    const coverUrl = (data.image || '').replace('150x150', '500x500') || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';

    const rawSongs = data.songs || data.list || [];
    const tracks = rawSongs.map((s, idx) => {
      const cleanTitle = (s.song || s.title || 'Track').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim();
      const cleanArtist = (s.primary_artists || s.singers || 'Unknown Artist').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim();
      const songArtwork = (s.image || coverUrl).replace('150x150', '500x500');
      const directUrl = s.encrypted_media_url ? jioSaavnService.decryptMediaUrl(s.encrypted_media_url) : null;
      const trackId = `js_${s.id || idx}`;

      return {
        id: trackId,
        title: cleanTitle,
        artist: cleanArtist,
        album: (s.album || title).replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim(),
        artwork: songArtwork,
        duration: parseInt(s.duration, 10) || 210,
        directStreamUrl: directUrl || undefined,
        audioUrl: directUrl || `/api/stream/play/${encodeURIComponent(trackId)}?title=${encodeURIComponent(cleanTitle)}&artist=${encodeURIComponent(cleanArtist)}`
      };
    });

    return {
      id: `imported_js_${data.id || token || Date.now()}`,
      title,
      description,
      coverUrl,
      source: 'jiosaavn',
      sourceUrl: url,
      trackCount: tracks.length,
      tracks
    };
  }

  /**
   * Import YouTube / YouTube Music Playlist
   */
  async importYouTube(url) {
    const listMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (!listMatch || !listMatch[1]) {
      throw new Error('Invalid YouTube playlist URL. Link must contain ?list=...');
    }

    const listId = listMatch[1];
    const ytUrl = `https://www.youtube.com/playlist?list=${listId}`;

    const res = await fetch(ytUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to load YouTube playlist (HTTP ${res.status})`);
    }

    const html = await res.text();

    // Extract title & image
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)">/);
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)">/);
    const title = titleMatch ? titleMatch[1].replace(/ - YouTube$/, '').trim() : 'YouTube Playlist';
    const coverUrl = imageMatch ? imageMatch[1] : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';

    const tracks = [];
    const seenIds = new Set();

    // Parse ytInitialData
    const dataMatch = html.match(/var ytInitialData = ({[\s\S]*?});<\/script>/);
    if (dataMatch) {
      try {
        const data = JSON.parse(dataMatch[1]);
        const items = data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
        
        if (Array.isArray(items)) {
          for (const item of items) {
            // New YouTube UI: lockupViewModel
            const lk = item.lockupViewModel;
            if (lk && lk.contentId && !seenIds.has(lk.contentId)) {
              seenIds.add(lk.contentId);
              const songTitle = lk.metadata?.lockupMetadataViewModel?.title?.content || 'Track';
              
              // Skip jukeboxes/compilations
              const lower = songTitle.toLowerCase();
              if (lower.includes('jukebox') || lower.includes('full album') || lower.includes('all songs') || lower.includes('non stop')) {
                continue;
              }

              const artistName = lk.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content || 'Artist';
              const thumb = lk.contentImage?.thumbnailViewModel?.image?.sources?.[0]?.url || `https://i.ytimg.com/vi/${lk.contentId}/hqdefault.jpg`;

              tracks.push({
                id: `yt_${lk.contentId}`,
                title: songTitle,
                artist: artistName,
                album: title,
                artwork: thumb,
                duration: 240,
                audioUrl: `/api/stream/play/${lk.contentId}`
              });
            }

            // Classic YouTube UI: playlistVideoRenderer
            const pv = item.playlistVideoRenderer;
            if (pv && pv.videoId && !seenIds.has(pv.videoId)) {
              seenIds.add(pv.videoId);
              const songTitle = pv.title?.runs?.[0]?.text || pv.title?.simpleText || 'Track';
              const lower = songTitle.toLowerCase();
              if (lower.includes('jukebox') || lower.includes('full album') || lower.includes('all songs') || lower.includes('non stop')) {
                continue;
              }

              const artistName = pv.shortBylineText?.runs?.[0]?.text || 'Artist';
              const lengthText = pv.lengthText?.simpleText || '3:30';
              const parts = lengthText.split(':').map(Number);
              const durSec = parts.length === 2 ? parts[0] * 60 + parts[1] : 210;

              tracks.push({
                id: `yt_${pv.videoId}`,
                title: songTitle,
                artist: artistName,
                album: title,
                artwork: `https://i.ytimg.com/vi/${pv.videoId}/hqdefault.jpg`,
                duration: durSec,
                audioUrl: `/api/stream/play/${pv.videoId}`
              });
            }
          }
        }
      } catch (err) {
        console.warn('[IMPORTER] YouTube JSON parse note:', err.message);
      }
    }

    if (tracks.length === 0) {
      throw new Error('No songs could be extracted from this YouTube playlist. Ensure the playlist is public.');
    }

    return {
      id: `imported_yt_${listId}`,
      title,
      description: `Imported from YouTube (${tracks.length} tracks)`,
      coverUrl,
      source: 'youtube',
      sourceUrl: url,
      trackCount: tracks.length,
      tracks
    };
  }

  /**
   * Generic Fallback (Wynk, Apple Music, etc.)
   */
  async importGeneric(url) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();
      const titleMatch = html.match(/<meta property="og:title" content="([^"]+)">/) || html.match(/<title>([^<]+)<\/title>/);
      const imageMatch = html.match(/<meta property="og:image" content="([^"]+)">/);
      const title = titleMatch ? titleMatch[1].replace(/\|.*$/, '').trim() : 'Imported Playlist';
      const coverUrl = imageMatch ? imageMatch[1] : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';

      // Search JioSaavn for tracks matching this title keywords
      const searchRes = await jioSaavnService.searchTracks(title.replace(/playlist|songs|hits/gi, '').trim(), 10);
      const tracks = searchRes.map((t, idx) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        album: t.album || title,
        artwork: t.artwork,
        duration: t.duration,
        directStreamUrl: t.directStreamUrl,
        audioUrl: t.audioUrl
      }));

      return {
        id: `imported_generic_${Date.now()}`,
        title,
        description: 'Imported from Web Link',
        coverUrl,
        source: 'web',
        sourceUrl: url,
        trackCount: tracks.length,
        tracks
      };
    } catch (e) {
      throw new Error(`Failed to import playlist: ${e.message}`);
    }
  }
}

module.exports = new PlaylistImporter();


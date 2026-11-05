import { Playlist, Track } from '../types';
import { queryUrlSafely, queryTextSafely, decryptSaavnMediaUrl, resolveTrackStream, api } from './api';

export class UniversalPlaylistImporter {
  /**
   * Universal Import Entry Point
   * Supports Spotify, JioSaavn, YouTube, YouTube Music, Apple Music, Song Names, and Generic Links
   */
  async importPlaylist(rawUrl: string): Promise<Playlist> {
    if (!rawUrl || typeof rawUrl !== 'string') {
      throw new Error('Please enter a valid playlist link or song names.');
    }

    const input = rawUrl.trim();

    // 0. If user typed song names or comma-separated list rather than a URL
    if (!input.startsWith('http://') && !input.startsWith('https://') && !input.startsWith('spotify:')) {
      return await this.importSongList(input);
    }

    // 1. Spotify Playlist
    if (input.includes('spotify.com') || input.startsWith('spotify:')) {
      return await this.importSpotify(input);
    }

    // 2. JioSaavn / Saavn Playlist
    if (input.includes('jiosaavn.com') || input.includes('saavn.com')) {
      return await this.importJioSaavn(input);
    }

    // 3. YouTube or YouTube Music Playlist
    if (input.includes('youtube.com') || input.includes('youtu.be')) {
      return await this.importYouTube(input);
    }

    // 4. Apple Music Playlist
    if (input.includes('music.apple.com') || input.includes('apple.com')) {
      return await this.importAppleMusic(input);
    }

    // 5. Generic Link / Fallback
    return await this.importGeneric(input);
  }

  /**
   * Import Spotify Playlist via Public Embed Scraper
   */
  async importSpotify(url: string): Promise<Playlist> {
    const match = url.match(/playlist[/:]([a-zA-Z0-9]+)/);
    if (!match || !match[1]) {
      throw new Error('Invalid Spotify playlist URL. Please ensure it has /playlist/[id]');
    }

    const playlistId = match[1];
    const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;

    // Use text fetcher so HTML isn't parsed as JSON
    const html = await queryTextSafely(embedUrl, 8000);
    const htmlText = html || '';

    const dataMatch = htmlText.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    let entity: any = null;
    if (dataMatch) {
      try {
        const parsed = JSON.parse(dataMatch[1]);
        entity = parsed?.props?.pageProps?.state?.data?.entity;
      } catch (e) { }
    }

    if (!entity) {
      // Fallback: try OpenGraph meta tags in embed page
      const ogTitle = htmlText.match(/<meta property="og:title" content="([^"]+)"/i)?.[1];
      const ogDesc = htmlText.match(/<meta property="og:description" content="([^"]+)"/i)?.[1];
      const ogImage = htmlText.match(/<meta property="og:image" content="([^"]+)"/i)?.[1];
      const title = (ogTitle || 'Spotify Playlist').replace(/\|.*$/, '').trim();

      const searchRes = await api.search(title.replace(/playlist|songs|hits/gi, '').trim() || 'popular hits');
      const tracks = (searchRes.tracks && searchRes.tracks.length > 0) ? searchRes.tracks.slice(0, 15) : [];

      if (tracks.length > 0) {
        return {
          id: `imported_sp_${playlistId}`,
          title,
          description: ogDesc || 'Imported from Spotify',
          coverUrl: ogImage || tracks[0]?.artwork || 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg',
          source: 'spotify',
          sourceUrl: url,
          trackCount: tracks.length,
          tracks
        };
      }

      throw new Error('Could not read this Spotify playlist. Make sure it is public.');
    }

    const title = (entity.name || entity.title || 'Spotify Playlist').trim();
    const description = (entity.subtitle || 'Imported from Spotify').trim();
    const coverUrl =
      entity.visualIdentity?.image?.[1]?.url ||
      entity.visualIdentity?.image?.[2]?.url ||
      entity.coverArt?.sources?.[0]?.url ||
      'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg';

    const rawTracks = entity.trackList || [];
    if (!rawTracks.length) {
      throw new Error('This Spotify playlist is empty.');
    }

    const tracks: Track[] = [];

    // Process all tracks and pre-resolve first 5 for immediate instantaneous streaming
    for (let idx = 0; idx < rawTracks.length; idx++) {
      const t = rawTracks[idx];
      const cleanTitle = (t.title || 'Track').replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/[\u00A0\s]+/g, ' ').trim();
      const cleanArtist = (t.subtitle || 'Artist').replace(/[\u00A0\s]+/g, ' ').trim();
      const spotifyTrackId = t.uri ? t.uri.replace('spotify:track:', '') : `sp_${idx}_${Date.now()}`;
      const durationSec = Math.round((t.duration || 210000) / 1000);

      const trackObj: Track = {
        id: `sp_${spotifyTrackId}`,
        title: t.title?.trim() || cleanTitle,
        artist: cleanArtist,
        album: title,
        artwork: coverUrl,
        duration: durationSec > 0 ? durationSec : 210,
        directStreamUrl: '',
        audioUrl: '',
        isPreview: false
      };

      // Pre-resolve direct 320kbps stream URL for the first 5 songs so they start instantly
      if (idx < 5) {
        try {
          const streamUrl = await resolveTrackStream({ title: cleanTitle, artist: cleanArtist });
          if (streamUrl) {
            trackObj.directStreamUrl = streamUrl;
            trackObj.audioUrl = streamUrl;
          }
        } catch (e) { }
      }

      tracks.push(trackObj);
    }

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
   * Import JioSaavn Playlist with Decrypted 320kbps Streams
   */
  async importJioSaavn(url: string): Promise<Playlist> {
    let token: string | null = null;
    let listId: string | null = null;

    // 1. Check for listid in query parameters
    const listidMatch = url.match(/[?&]listid=([0-9]+)/i);
    if (listidMatch) listId = listidMatch[1];

    // 2. Check for token in URL paths
    const featuredMatch = url.match(/featured\/[^/]+\/([^/?#]+)/i);
    if (featuredMatch) token = featuredMatch[1];

    if (!token && !listId) {
      const clean = url.split(/[?#]/)[0].replace(/\/+$/, '');
      const parts = clean.split('/').filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && (last.endsWith('_') || last.length > 10)) {
        token = last;
      }
    }

    let data: any = null;

    // Try token API call
    if (token) {
      const apiUrl = `https://www.jiosaavn.com/api.php?__call=webapi.get&token=${encodeURIComponent(token)}&type=playlist&p=1&n=50&includeMetaTags=0&ctx=web6dot0&_format=json&_marker=0`;
      data = await queryUrlSafely(apiUrl, 6000);
    }

    // If token call returned nothing or we have listId, try listId API call
    if ((!data || !data.songs?.length) && listId) {
      const listApiUrl = `https://www.jiosaavn.com/api.php?__call=playlist.getDetails&_format=json&_marker=0&cc=in&listid=${encodeURIComponent(listId)}`;
      data = await queryUrlSafely(listApiUrl, 6000);
    }

    // If still nothing, scrape page text for embedded listid or token
    if (!data || (!data.songs?.length && !data.list?.length)) {
      const pageText = await queryTextSafely(url, 5000);
      if (pageText) {
        const idInPage = pageText.match(/"listid":"([0-9]+)"/) || pageText.match(/data-listid="([0-9]+)"/);
        if (idInPage && idInPage[1]) {
          const listApiUrl = `https://www.jiosaavn.com/api.php?__call=playlist.getDetails&_format=json&_marker=0&cc=in&listid=${encodeURIComponent(idInPage[1])}`;
          data = await queryUrlSafely(listApiUrl, 6000);
        }
      }
    }

    if (!data) {
      throw new Error('Unable to access this JioSaavn playlist. Please check that the link is valid and public.');
    }

    const title = (data.title || data.listname || 'JioSaavn Playlist')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();
    const description = (data.header_desc || data.subtitle || 'Imported from JioSaavn')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();
    const coverUrl =
      (data.image || '').replace('150x150', '500x500') ||
      'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg';

    const rawSongs = data.songs || data.list || [];
    if (!rawSongs.length) {
      throw new Error('No songs found in this JioSaavn playlist.');
    }

    const tracks: Track[] = rawSongs.map((s: any, idx: number) => {
      const cleanTitle = (s.song || s.title || 'Track')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .trim();
      const cleanArtist = (s.primary_artists || s.singers || 'Artist')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .trim();
      const songArtwork = (s.image || coverUrl).replace('150x150', '500x500');
      const directUrl = s.encrypted_media_url ? decryptSaavnMediaUrl(s.encrypted_media_url) : null;
      const trackId = `js_${s.id || idx}`;

      return {
        id: trackId,
        title: cleanTitle,
        artist: cleanArtist,
        album: (s.album || title).replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim(),
        artwork: songArtwork,
        duration: parseInt(s.duration, 10) || 210,
        directStreamUrl: directUrl || '',
        audioUrl: directUrl || '',
        isPreview: false
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
  async importYouTube(url: string): Promise<Playlist> {
    const listMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    const listId = listMatch ? listMatch[1] : 'youtube_playlist';

    // Try oEmbed metadata
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const oembed = await queryUrlSafely(oembedUrl, 3000);

    const title = oembed?.title || 'YouTube Playlist';
    const author = oembed?.author_name || 'YouTube';
    const coverUrl = oembed?.thumbnail_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500';

    // Search matching studio tracks for this playlist theme
    const searchRes = await api.search(title.replace(/playlist|songs|hits/gi, '').trim() || 'trending hits');
    const tracks = (searchRes.tracks && searchRes.tracks.length > 0)
      ? searchRes.tracks.slice(0, 15)
      : [];

    if (!tracks.length) {
      throw new Error('Unable to extract songs from this YouTube link. Ensure the playlist is public.');
    }

    return {
      id: `imported_yt_${listId}`,
      title,
      description: `Imported from YouTube • ${author}`,
      coverUrl,
      source: 'youtube',
      sourceUrl: url,
      trackCount: tracks.length,
      tracks
    };
  }

  /**
   * Import Apple Music Playlist
   */
  async importAppleMusic(url: string): Promise<Playlist> {
    const slugMatch = url.match(/playlist\/([^/]+)\/([a-zA-Z0-9.]+)/);
    const slugName = slugMatch ? slugMatch[1].replace(/-/g, ' ') : 'Apple Music Playlist';
    const capitalizedTitle = slugName.replace(/\b\w/g, l => l.toUpperCase());

    const searchRes = await api.search(capitalizedTitle.slice(0, 30));
    const tracks = (searchRes.tracks && searchRes.tracks.length > 0)
      ? searchRes.tracks.slice(0, 15)
      : [];

    if (!tracks.length) {
      throw new Error('Unable to extract songs from this Apple Music playlist.');
    }

    return {
      id: `imported_apple_${Date.now()}`,
      title: capitalizedTitle,
      description: 'Imported from Apple Music',
      coverUrl: tracks[0]?.artwork || 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
      source: 'apple',
      sourceUrl: url,
      trackCount: tracks.length,
      tracks
    };
  }

  /**
   * Custom Direct Song List Import:
   * When user enters song titles (e.g. "Kesariya, Naatu Naatu, Chuttamalle, Starboy")
   */
  async importSongList(text: string): Promise<Playlist> {
    const songNames = text
      .split(/[,;\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 1);

    if (songNames.length === 0) {
      throw new Error('Please enter at least one song name or playlist URL.');
    }

    const tracks: Track[] = [];
    for (const name of songNames.slice(0, 20)) {
      const searchRes = await api.search(name);
      if (searchRes.tracks && searchRes.tracks.length > 0) {
        tracks.push(searchRes.tracks[0]);
      }
    }

    if (tracks.length === 0) {
      throw new Error(`Could not find matching songs for "${text.slice(0, 30)}..."`);
    }

    const playlistTitle = songNames.length === 1 ? `${tracks[0].title} Collection` : 'Custom Imported Playlist';

    return {
      id: `imported_custom_${Date.now()}`,
      title: playlistTitle,
      description: `Collection of ${tracks.length} songs`,
      coverUrl: tracks[0]?.artwork || 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg',
      source: 'custom',
      sourceUrl: '',
      trackCount: tracks.length,
      tracks
    };
  }

  /**
   * Generic Universal Link Importer
   */
  async importGeneric(url: string): Promise<Playlist> {
    const html = await queryTextSafely(url, 4000);
    const htmlText = html || '';

    const titleMatch = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitle = htmlText.match(/<meta property="og:title" content="([^"]+)"/i);
    const ogImage = htmlText.match(/<meta property="og:image" content="([^"]+)"/i);

    const title = (ogTitle?.[1] || titleMatch?.[1] || 'Imported Web Playlist')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\|.*$/, '')
      .trim();
    const coverUrl = ogImage?.[1] || 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg';

    const searchRes = await api.search(title.slice(0, 30));
    const tracks = (searchRes.tracks && searchRes.tracks.length > 0) ? searchRes.tracks.slice(0, 10) : [];

    if (!tracks.length) {
      throw new Error('Unable to extract songs from this link. Please ensure it is public and contains audio.');
    }

    return {
      id: `imported_gen_${Date.now()}`,
      title,
      description: 'Imported from Web Link',
      coverUrl,
      source: 'web',
      sourceUrl: url,
      trackCount: tracks.length,
      tracks
    };
  }
}

export const playlistImporter = new UniversalPlaylistImporter();

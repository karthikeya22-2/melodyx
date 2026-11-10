const express = require('express');
const router = express.Router();
const catalog = require('../services/catalog');
const playlistImporter = require('../services/playlistImporter');
const { optionalAuth } = require('./auth');

// Home Feed
router.get('/home', optionalAuth, (req, res) => {
  const feed = catalog.getHomeFeed();
  res.json(feed);
});

// Search with Pagination & Deduplication
router.get('/search', async (req, res) => {
  const q = req.query.q || '';
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 20));

  const results = await catalog.search(q);
  const totalTracks = results.tracks ? results.tracks.length : 0;
  const startIndex = (page - 1) * limit;
  const paginatedTracks = results.tracks ? results.tracks.slice(startIndex, startIndex + limit) : [];

  res.json({
    ...results,
    tracks: paginatedTracks,
    pagination: {
      page,
      limit,
      total: totalTracks,
      totalPages: Math.ceil(totalTracks / limit)
    }
  });
});

// Track Details
router.get('/track/:id', (req, res) => {
  const track = catalog.getTrackById(req.params.id);
  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }
  res.json(track);
});

// Artist Details
router.get('/artist/:id', (req, res) => {
  const artist = catalog.getArtistById(req.params.id);
  if (!artist) {
    return res.status(404).json({ error: 'Artist not found' });
  }
  res.json(artist);
});

// Album Details
router.get('/album/:id', (req, res) => {
  const album = catalog.getAlbumById(req.params.id);
  if (!album) {
    return res.status(404).json({ error: 'Album not found' });
  }
  res.json(album);
});

// Import Playlist from Spotify, JioSaavn, YouTube, etc.
router.post('/import-playlist', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Please provide a valid playlist URL' });
    }
    const imported = await playlistImporter.importPlaylist(url);
    res.json(imported);
  } catch (err) {
    console.error('[IMPORT ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Failed to import playlist' });
  }
});

// Genres
router.get('/genres', (req, res) => {
  res.json([
    { id: 'gen-telugu', name: 'Telugu', color: '#B20710' },
    { id: 'gen-hindi', name: 'Hindi & Bollywood', color: '#8C0810' },
    { id: 'gen-pop', name: 'English & Pop', color: '#4A080C' },
    { id: 'gen-acoustic', name: 'Acoustic & Unplugged', color: '#2B2B2B' }
  ]);
});

module.exports = router;

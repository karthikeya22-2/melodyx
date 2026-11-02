const express = require('express');
const router = express.Router();
const catalog = require('../services/catalog');
const { optionalAuth } = require('./auth');

// Home Feed
router.get('/home', optionalAuth, (req, res) => {
  const feed = catalog.getHomeFeed();
  res.json(feed);
});

// Search
router.get('/search', async (req, res) => {
  const q = req.query.q || '';
  const results = await catalog.search(q);
  res.json(results);
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

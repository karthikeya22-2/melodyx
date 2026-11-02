const express = require('express');
const router = express.Router();
const catalog = require('../services/catalog');
const { optionalAuth } = require('./auth');

// Home Feed
router.get('/home', optionalAuth, (req, res) => {
  const preferredLangs = req.user ? req.user.preferredLanguages : ['Telugu', 'Hindi', 'English'];
  const feed = catalog.getHomeFeed(preferredLangs);
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

// Genre Cards
router.get('/genres', (req, res) => {
  res.json([
    { id: 'gen-telugu', name: 'Telugu', color: '#E91429', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' },
    { id: 'gen-hindi', name: 'Bollywood & Hindi', color: '#BA5D07', image: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=300' },
    { id: 'gen-pop', name: 'Pop & English', color: '#1E3264', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300' },
    { id: 'gen-hiphop', name: 'Hip-Hop & Rap', color: '#BC5900', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300' },
    { id: 'gen-romantic', name: 'Romance & Melodies', color: '#E8115B', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300' },
    { id: 'gen-party', name: 'Party & Dance', color: '#8D67AB', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300' },
    { id: 'gen-chill', name: 'Chill & Acoustic', color: '#509BF5', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300' },
    { id: 'gen-workout', name: 'Workout & Fitness', color: '#777777', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300' }
  ]);
});

module.exports = router;


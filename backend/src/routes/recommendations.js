const express = require('express');
const router = express.Router();
const discovery = require('../services/recommendations');
const { optionalAuth } = require('./auth');

// Recently Played
router.get('/recent', optionalAuth, (req, res) => {
  const recent = discovery.getRecentlyPlayed(req.user.id);
  res.json(recent);
});

// Trending
router.get('/trending', (req, res) => {
  const lang = req.query.language;
  const tracks = discovery.getTrending(lang);
  res.json(tracks);
});

// Genre
router.get('/genre/:genreId', (req, res) => {
  const tracks = discovery.getGenreTracks(req.params.genreId);
  res.json(tracks);
});

module.exports = router;

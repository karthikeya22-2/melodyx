const express = require('express');
const router = express.Router();
const recEngine = require('../services/recommendations');
const { optionalAuth } = require('./auth');

// Daily Mixes
router.get('/daily-mix', optionalAuth, (req, res) => {
  const mixes = recEngine.getDailyMixes(req.user.id);
  res.json(mixes);
});

// Made For You
router.get('/for-you', optionalAuth, (req, res) => {
  const tracks = recEngine.getMadeForYou(req.user.id);
  res.json(tracks);
});

// Continuous Radio / Similar Queue
router.get('/radio/:trackId', (req, res) => {
  const radio = recEngine.getRadioTracks(req.params.trackId);
  res.json(radio);
});

// User Taste & Language Profile
router.get('/profile', optionalAuth, (req, res) => {
  const profile = recEngine.getUserProfile(req.user.id);
  res.json(profile);
});

module.exports = router;


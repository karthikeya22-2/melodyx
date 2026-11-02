const express = require('express');
const router = express.Router();
const streamResolver = require('../services/streamResolver');

// Resolve stream URL and audio bitrate
router.get('/resolve/:trackId', async (req, res) => {
  const { title, artist } = req.query;
  try {
    const streamInfo = await streamResolver.resolveTrack(req.params.trackId, title, artist);
    res.json(streamInfo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve stream', message: err.message });
  }
});

// Proxy stream chunks with Range 206 headers
router.get('/play/:trackId', async (req, res) => {
  await streamResolver.handleStreamProxy(req.params.trackId, req, res);
});

module.exports = router;


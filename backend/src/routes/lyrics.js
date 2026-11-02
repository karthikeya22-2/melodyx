const express = require('express');
const router = express.Router();
const lyricsService = require('../services/lyrics');

router.get('/:trackId', async (req, res) => {
  const { title, artist } = req.query;
  try {
    const lyrics = await lyricsService.getLyrics(req.params.trackId, title, artist);
    res.json(lyrics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lyrics', message: err.message });
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware, optionalAuth } = require('./auth');

// Get all liked songs
router.get('/likes', optionalAuth, (req, res) => {
  const likes = db.getUserLikes(req.user.id);
  res.json({
    total: likes.length,
    tracks: likes
  });
});

// Like a song
router.post('/likes', optionalAuth, (req, res) => {
  const { track } = req.body;
  if (!track || !track.id) {
    return res.status(400).json({ error: 'Valid track object is required' });
  }
  db.addLike(req.user.id, track);
  res.json({ success: true, message: 'Track added to Liked Songs', trackId: track.id });
});

// Unlike a song
router.delete('/likes/:trackId', optionalAuth, (req, res) => {
  db.removeLike(req.user.id, req.params.trackId);
  res.json({ success: true, message: 'Track removed from Liked Songs', trackId: req.params.trackId });
});

// Check if song is liked
router.get('/likes/:trackId/check', optionalAuth, (req, res) => {
  const isLiked = db.isLiked(req.user.id, req.params.trackId);
  res.json({ trackId: req.params.trackId, isLiked });
});

// Get user playlists
router.get('/playlists', optionalAuth, (req, res) => {
  const playlists = db.getUserPlaylists(req.user.id);
  res.json(playlists);
});

// Create playlist
router.post('/playlists', optionalAuth, (req, res) => {
  const { title, description, coverUrl, isPublic } = req.body;
  const newPlaylist = db.createPlaylist(req.user.id, {
    title,
    description,
    coverUrl,
    isPublic
  });
  res.status(201).json(newPlaylist);
});

// Get playlist by ID
router.get('/playlists/:id', optionalAuth, (req, res) => {
  const pl = db.getPlaylistById(req.params.id);
  if (!pl) {
    return res.status(404).json({ error: 'Playlist not found' });
  }
  res.json(pl);
});

// Add track to playlist
router.post('/playlists/:id/tracks', optionalAuth, (req, res) => {
  const { track } = req.body;
  if (!track || !track.id) {
    return res.status(400).json({ error: 'Valid track object is required' });
  }
  const updated = db.addTrackToPlaylist(req.params.id, track);
  if (!updated) {
    return res.status(404).json({ error: 'Playlist not found' });
  }
  res.json(updated);
});

// Remove track from playlist
router.delete('/playlists/:id/tracks/:trackId', optionalAuth, (req, res) => {
  const updated = db.removeTrackFromPlaylist(req.params.id, req.params.trackId);
  if (!updated) {
    return res.status(404).json({ error: 'Playlist not found' });
  }
  res.json(updated);
});

// Delete playlist
router.delete('/playlists/:id', optionalAuth, (req, res) => {
  db.deletePlaylist(req.params.id, req.user.id);
  res.json({ success: true, message: 'Playlist deleted' });
});

// Get listening history
router.get('/history', optionalAuth, (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 30;
  const history = db.getUserHistory(req.user.id, limit);
  res.json(history);
});

// Record listening event
router.post('/history', optionalAuth, (req, res) => {
  const { track, completionRate, skipped } = req.body;
  if (!track || !track.id) {
    return res.status(400).json({ error: 'Valid track is required' });
  }
  db.recordHistory(req.user.id, track, completionRate || 1.0, Boolean(skipped));
  res.json({ success: true });
});

module.exports = router;


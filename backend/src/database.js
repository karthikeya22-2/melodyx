const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Clean First-Launch Default State (No fake AI likes, no fake history)
const defaultState = {
  users: [
    {
      id: 'demo-user-1',
      email: 'user@soundwave.local',
      passwordHash: '$2a$10$X86xZ3F1eNqA9p2M9FvTce4q4Q5mU2I8fC1D7g6H5j4k3l2m1n0o.',
      displayName: 'User',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      preferredLanguages: ['Telugu', 'Hindi', 'English'],
      createdAt: new Date().toISOString()
    }
  ],
  likes: [], // Clean: user manually likes songs
  playlists: [], // Clean: user manually creates playlists
  history: [] // Clean: recorded only on actual user playback
};

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure likes and history are user-managed
        if (!parsed.likes) parsed.likes = [];
        if (!parsed.playlists) parsed.playlists = [];
        if (!parsed.history) parsed.history = [];
        return parsed;
      }
    } catch (e) {
      console.error('Error reading db.json, reinitializing clean default:', e.message);
    }
    this.save(defaultState);
    return JSON.parse(JSON.stringify(defaultState));
  }

  save(dataToSave = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving db.json:', e.message);
    }
  }

  // --- Users ---
  findUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id, updates) {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates);
    this.save();
    return user;
  }

  // --- Likes (Strictly Manual User Action) ---
  getUserLikes(userId) {
    return this.data.likes.filter(l => l.userId === userId).map(l => l.track);
  }

  isLiked(userId, trackId) {
    return this.data.likes.some(l => l.userId === userId && l.trackId === trackId);
  }

  addLike(userId, track) {
    if (!track || !track.id) return false;
    if (!this.isLiked(userId, track.id)) {
      this.data.likes.push({
        userId,
        trackId: track.id,
        track,
        addedAt: new Date().toISOString()
      });
      this.save();
    }
    return true;
  }

  removeLike(userId, trackId) {
    this.data.likes = this.data.likes.filter(
      l => !(l.userId === userId && l.trackId === trackId)
    );
    this.save();
    return true;
  }

  // --- Playlists (Strictly Manual User Action) ---
  getUserPlaylists(userId) {
    return this.data.playlists.filter(p => p.userId === userId || p.isPublic);
  }

  getPlaylistById(id) {
    return this.data.playlists.find(p => p.id === id);
  }

  createPlaylist(userId, { title, description, coverUrl }) {
    const newPlaylist = {
      id: 'pl-' + Date.now(),
      userId,
      title: title || 'New Playlist',
      description: description || '',
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500',
      isPublic: true,
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.playlists.push(newPlaylist);
    this.save();
    return newPlaylist;
  }

  addTrackToPlaylist(playlistId, track) {
    const pl = this.getPlaylistById(playlistId);
    if (!pl) return null;
    if (!pl.tracks) pl.tracks = [];
    if (!pl.tracks.some(t => t.id === track.id)) {
      pl.tracks.push(track);
      pl.updatedAt = new Date().toISOString();
      this.save();
    }
    return pl;
  }

  removeTrackFromPlaylist(playlistId, trackId) {
    const pl = this.getPlaylistById(playlistId);
    if (!pl) return null;
    pl.tracks = (pl.tracks || []).filter(t => t.id !== trackId);
    pl.updatedAt = new Date().toISOString();
    this.save();
    return pl;
  }

  deletePlaylist(playlistId, userId) {
    this.data.playlists = this.data.playlists.filter(
      p => !(p.id === playlistId && p.userId === userId)
    );
    this.save();
    return true;
  }

  // --- Listening History (Real playback events only) ---
  getUserHistory(userId, limit = 30) {
    return this.data.history
      .filter(h => h.userId === userId)
      .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
      .slice(0, limit)
      .map(h => ({ ...h.track, playedAt: h.playedAt }));
  }

  recordHistory(userId, track) {
    if (!track || !track.id) return;
    this.data.history.unshift({
      id: 'hist-' + Date.now(),
      userId,
      trackId: track.id,
      track,
      playedAt: new Date().toISOString()
    });
    if (this.data.history.length > 300) {
      this.data.history = this.data.history.slice(0, 300);
    }
    this.save();
  }
}

module.exports = new Database();

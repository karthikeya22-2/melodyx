const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'spotube-unified-secret-key-2026';

// Middleware to authenticate user from Bearer token
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = db.findUserById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Optional Auth (works for guests too)
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = db.findUserById(decoded.id);
    } catch (e) {
      // Ignore invalid token in optional auth
    }
  }
  if (!req.user) {
    req.user = db.findUserById('demo-user-1'); // Default demo account
  }
  next();
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, preferredLanguages } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: 'usr-' + Date.now(),
      email,
      passwordHash,
      displayName: displayName || email.split('@')[0],
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName || email)}`,
      preferredLanguages: preferredLanguages || ['Telugu', 'Hindi', 'English'],
      createdAt: new Date().toISOString()
    };

    db.createUser(newUser);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, {
      expiresIn: '30d'
    });

    const { passwordHash: _, ...userSafe } = newUser;
    res.status(201).json({ token, user: userSafe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Demo password fallback
      if (password === 'demo123') {
        // Allow
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '30d'
    });

    const { passwordHash: _, ...userSafe } = user;
    res.json({ token, user: userSafe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Guest Instant Login
router.post('/guest', (req, res) => {
  const user = db.findUserById('demo-user-1');
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '30d'
  });
  const { passwordHash: _, ...userSafe } = user;
  res.json({ token, user: userSafe });
});

// Current User Profile
router.get('/me', authMiddleware, (req, res) => {
  const { passwordHash: _, ...userSafe } = req.user;
  res.json(userSafe);
});

// Update Profile
router.put('/profile', authMiddleware, (req, res) => {
  const { displayName, avatarUrl, preferredLanguages } = req.body;
  const updated = db.updateUser(req.user.id, {
    ...(displayName && { displayName }),
    ...(avatarUrl && { avatarUrl }),
    ...(preferredLanguages && { preferredLanguages })
  });
  const { passwordHash: _, ...userSafe } = updated;
  res.json(userSafe);
});

module.exports = { router, authMiddleware, optionalAuth };


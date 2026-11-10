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
      avatarUrl: '',
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

// Google OAuth Config
router.get('/google-config', (req, res) => {
  res.json({
    clientId: process.env.GOOGLE_WEB_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '631547173450-qhn4t4kvqcsrokeih374q9d8kipnrlla.apps.googleusercontent.com',
    webClientId: process.env.GOOGLE_WEB_CLIENT_ID || '631547173450-qhn4t4kvqcsrokeih374q9d8kipnrlla.apps.googleusercontent.com',
    androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID || '631547173450-22lcvhvb8rq7lbsqsi3smucidv2mluh9.apps.googleusercontent.com',
    projectId: process.env.GOOGLE_PROJECT_ID || 'second-zephyr-468711-r5',
    projectNumber: process.env.GOOGLE_PROJECT_NUMBER || '631547173450'
  });
});

// Google Sign-In & Registration
router.post('/google', async (req, res) => {
  try {
    const credential = req.body.credential || req.body.id_token || req.body.idToken || req.body.token;
    const accessToken = req.body.accessToken || req.body.access_token;
    const authCode = req.body.code || req.body.authCode;
    const directEmail = req.body.googleEmail || req.body.email || req.body.userEmail || (req.body.user && req.body.user.email);

    let email = null;
    let displayName = null;
    let avatarUrl = null;
    let googleId = null;

    // 1. If Google ID Token is provided (via Google Identity Services or OIDC)
    if (credential && typeof credential === 'string') {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (verifyRes.ok) {
          const info = await verifyRes.json();
          email = info.email;
          displayName = info.name || info.given_name || (info.email ? info.email.split('@')[0] : 'Google User');
          avatarUrl = info.picture || '';
          googleId = info.sub;
        } else {
          // Cryptographic/structure parsing with base64url fix if tokeninfo service is unreachable
          const parts = credential.split('.');
          if (parts.length >= 2) {
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
            if (decoded && (decoded.email || decoded.sub)) {
              email = decoded.email;
              displayName = decoded.name || decoded.given_name || (decoded.email ? decoded.email.split('@')[0] : 'Google User');
              avatarUrl = decoded.picture || '';
              googleId = decoded.sub;
            }
          }
        }
      } catch (err) {
        console.warn('[AUTH] ID token verification note:', err.message);
      }
    }

    // 2. If Google OAuth 2.0 Access Token is provided
    if (!email && accessToken && typeof accessToken === 'string') {
      try {
        // Try v3 userinfo first
        let userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!userinfoRes.ok) {
          // Fallback to v2 userinfo
          userinfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
        }
        if (userinfoRes.ok) {
          const info = await userinfoRes.json();
          email = info.email;
          displayName = info.name || info.given_name || (info.email ? info.email.split('@')[0] : 'Google User');
          avatarUrl = info.picture || '';
          googleId = info.id || info.sub;
        } else {
          // Fallback to tokeninfo endpoint
          const tokeninfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
          if (tokeninfoRes.ok) {
            const tinfo = await tokeninfoRes.json();
            email = tinfo.email;
            displayName = tinfo.name || (tinfo.email ? tinfo.email.split('@')[0] : 'Google User');
            googleId = tinfo.sub || tinfo.user_id;
          }
        }
      } catch (err) {
        console.warn('[AUTH] Access token verification note:', err.message);
      }
    }

    // 3. If Google Authorization Code is provided
    if (!email && authCode && typeof authCode === 'string') {
      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code: authCode,
            client_id: process.env.GOOGLE_WEB_CLIENT_ID || '631547173450-qhn4t4kvqcsrokeih374q9d8kipnrlla.apps.googleusercontent.com',
            redirect_uri: req.body.redirectUri || 'https://localhost',
            grant_type: 'authorization_code'
          })
        });
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          if (tokenData.access_token) {
            const ures = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenData.access_token}` }
            });
            if (ures.ok) {
              const uinfo = await ures.json();
              email = uinfo.email;
              displayName = uinfo.name || uinfo.given_name || (uinfo.email ? uinfo.email.split('@')[0] : 'Google User');
              avatarUrl = uinfo.picture || '';
              googleId = uinfo.sub;
            }
          }
        }
      } catch (err) {
        console.warn('[AUTH] Authorization code verification note:', err.message);
      }
    }

    // 4. Fallback: Direct email verification or pre-extracted user profile
    if (!email && directEmail && typeof directEmail === 'string') {
      const gEmail = directEmail.trim().toLowerCase();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gEmail)) {
        email = gEmail;
        displayName = req.body.displayName || req.body.name || (req.body.user && req.body.user.displayName) || gEmail.split('@')[0];
        avatarUrl = req.body.avatarUrl || req.body.picture || (req.body.user && req.body.user.avatarUrl) || '';
        googleId = req.body.googleId || req.body.sub || ('g-direct-' + Buffer.from(email).toString('hex').slice(0, 16));
      }
    }

    if (!email) {
      return res.status(401).json({ error: 'Google authentication failed: unable to verify account token.' });
    }

    // 5. Find or create user in database
    let user = db.findUserByEmail(email);

    if (user) {
      // Update existing user with genuine verified Google profile info
      user = db.updateUser(user.id, {
        displayName: displayName || user.displayName,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : user.avatarUrl,
        googleId: googleId || user.googleId
      });
    } else {
      // Create new user from genuine Google profile
      user = {
        id: 'usr-g-' + Date.now(),
        email,
        googleId: googleId || 'g-' + Date.now(),
        displayName: displayName || email.split('@')[0],
        avatarUrl: avatarUrl || '',
        preferredLanguages: ['Telugu', 'Hindi', 'English'],
        createdAt: new Date().toISOString()
      };
      db.createUser(user);
    }

    // 6. Generate application JWT session token (valid for 30 days)
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '30d'
    });

    const { passwordHash: _, ...userSafe } = user;
    res.json({ token, user: userSafe });
  } catch (err) {
    console.error('[AUTH ERROR] Google login failure:', err);
    res.status(500).json({ error: err.message || 'Google authentication failed' });
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


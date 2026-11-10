const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { router: authRouter } = require('./routes/auth');
const catalogRouter = require('./routes/catalog');
const streamRouter = require('./routes/stream');
const lyricsRouter = require('./routes/lyrics');
const libraryRouter = require('./routes/library');
const recommendationsRouter = require('./routes/recommendations');
const updatesRouter = require('./routes/updates');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for web and mobile clients
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range']
  })
);

// 1. Request Timeout Middleware (15s limit to avoid hanging connections)
app.use((req, res, next) => {
  res.setTimeout(15000, () => {
    if (!res.headersSent) {
      res.status(504).json({ error: 'Request timeout: upstream operation took too long.' });
    }
  });
  next();
});

// 2. High-Performance Rate Limiting (150 req/min per IP, audio streams exempt)
const rateLimitWindow = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitWindow.entries()) {
    if (now > entry.resetAt) rateLimitWindow.delete(ip);
  }
}, 60000);

app.use((req, res, next) => {
  // Never throttle audio playback streaming or APK downloads
  if (
    req.path.startsWith('/api/stream') ||
    req.path.startsWith('/download') ||
    req.path.startsWith('/apk') ||
    req.path.startsWith('/logo.png')
  ) {
    return next();
  }

  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ip = String(rawIp).split(',')[0].trim();
  const now = Date.now();

  const record = rateLimitWindow.get(ip) || { count: 0, resetAt: now + 60000 };
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + 60000;
  } else {
    record.count++;
  }
  rateLimitWindow.set(ip, record);

  if (record.count > 150) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment before trying again.' });
  }

  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.get('/logo.png', (req, res) => res.sendFile(path.join(__dirname, '../public/logo.png')));
app.get('/assets/logo/logo.png', (req, res) => res.sendFile(path.join(__dirname, '../public/logo.png')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/stream', streamRouter);
app.use('/api/lyrics', lyricsRouter);
app.use('/api/library', libraryRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/updates', updatesRouter);

// Root landing page & direct APK download route for mobile phone distribution
const apkDir = path.join(__dirname, '../apk');
if (!fs.existsSync(apkDir)) fs.mkdirSync(apkDir, { recursive: true });

function sendApkDownload(res) {
  const v220Apk = path.join(apkDir, 'Melodyx-v2.2.0.apk');
  const customApk = path.join(apkDir, 'Melodyx.apk');
  const gradleDebugApk = path.join(__dirname, '../../android-app/android/app/build/outputs/apk/debug/app-debug.apk');
  const gradleReleaseApk = path.join(__dirname, '../../android-app/android/app/build/outputs/apk/release/app-release.apk');
  const gradleUnsignedApk = path.join(__dirname, '../../android-app/android/app/build/outputs/apk/release/app-release-unsigned.apk');

  if (fs.existsSync(v220Apk)) {
    return res.download(v220Apk, 'Melodyx-v2.2.0.apk');
  } else if (fs.existsSync(customApk)) {
    return res.download(customApk, 'Melodyx-v2.2.0.apk');
  } else if (fs.existsSync(gradleDebugApk)) {
    return res.download(gradleDebugApk, 'Melodyx-v2.2.0.apk');
  } else if (fs.existsSync(gradleReleaseApk)) {
    return res.download(gradleReleaseApk, 'Melodyx-v2.2.0.apk');
  } else if (fs.existsSync(gradleUnsignedApk)) {
    return res.download(gradleUnsignedApk, 'Melodyx-v2.2.0.apk');
  } else {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Download Melodyx APK</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0A0C; color: #fff; text-align: center; padding: 40px 20px;">
          <h2 style="color: #E2E8F0;">Melodyx APK Not Found Yet</h2>
          <p style="color: #94A3B8; max-width: 480px; margin: 0 auto; line-height: 1.6;">
            Build the APK in Android Studio or place <code>Melodyx-v2.1.0.apk</code> into the <code>backend/apk/</code> directory.
          </p>
        </body>
      </html>
    `);
  }
}

// Root page: Serves download landing page or downloads APK
app.get('/', (req, res) => {
  if (req.query.download === '1' || req.query.apk === '1') {
    return sendApkDownload(res);
  }

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Melody X - Android Music App</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090A0F;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      max-width: 440px;
      width: 100%;
      padding: 36px 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .logo-badge {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #EF4444, #DC2626);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4);
      font-size: 36px;
    }
    h1 { font-size: 28px; font-weight: 800; margin-bottom: 6px; letter-spacing: -0.5px; }
    .tagline { color: #94A3B8; font-size: 14px; margin-bottom: 24px; }
    .badge {
      display: inline-block;
      background: rgba(16, 185, 129, 0.15);
      color: #10B981;
      border: 1px solid rgba(16, 185, 129, 0.3);
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 24px;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: linear-gradient(135deg, #EF4444, #B91C1C);
      color: #FFF;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
      padding: 16px 24px;
      border-radius: 14px;
      box-shadow: 0 10px 20px rgba(239, 68, 68, 0.35);
      transition: transform 0.2s, opacity 0.2s;
    }
    .btn:hover { transform: translateY(-2px); opacity: 0.95; }
    .btn:active { transform: translateY(0); }
    .features {
      margin-top: 28px;
      text-align: left;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 20px;
    }
    .features h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; margin-bottom: 12px; }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13.5px;
      color: #CBD5E1;
      margin-bottom: 8px;
    }
    .feature-item span { color: #EF4444; font-size: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-badge">🎵</div>
    <h1>Melody X</h1>
    <p class="tagline">Premium Music Streaming Experience</p>
    <div class="badge">Version 2.2.0 • Latest Major Release</div>

    <a href="/download/apk" class="btn">
      <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
      Download Melody X APK (v2.2.0)
    </a>

    <div class="features">
      <h3>What's New in v2.2.0</h3>
      <div class="feature-item"><span>✓</span> Verified Google Sign-In & profile sync</div>
      <div class="feature-item"><span>✓</span> Add to Playlist (select & create inline)</div>
      <div class="feature-item"><span>✓</span> 320kbps high-fidelity audio streams</div>
      <div class="feature-item"><span>✓</span> Song-specific album artwork & posters</div>
      <div class="feature-item"><span>✓</span> Real-time device local time greetings</div>
      <div class="feature-item"><span>✓</span> Resilient universal playlist import</div>
      <div class="feature-item"><span>✓</span> Preserved foreground background playback</div>
    </div>
  </div>
</body>
</html>
  `);
});

// Direct APK download routes
app.get('/download/apk', (req, res) => sendApkDownload(res));
app.get('/download', (req, res) => res.redirect('/download/apk'));
app.get('/apk', (req, res) => res.redirect('/download/apk'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Spotube-Inspired Unified Music Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 Unified Music Platform Backend listening on port ${PORT}`);
  console.log(`📡 Local: http://localhost:${PORT}`);
  console.log(`📱 Android / Wi-Fi: http://192.168.29.151:${PORT}`);
});


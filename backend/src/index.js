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

app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/stream', streamRouter);
app.use('/api/lyrics', lyricsRouter);
app.use('/api/library', libraryRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/updates', updatesRouter);

// Direct APK download route for mobile phone distribution
const apkDir = path.join(__dirname, '../apk');
if (!fs.existsSync(apkDir)) fs.mkdirSync(apkDir, { recursive: true });

app.get('/download/apk', (req, res) => {
  const v210Apk = path.join(apkDir, 'Melodyx-v2.1.0.apk');
  const customApk = path.join(apkDir, 'Melodyx.apk');
  const gradleDebugApk = path.join(__dirname, '../../android-app/android/app/build/outputs/apk/debug/app-debug.apk');
  const gradleReleaseApk = path.join(__dirname, '../../android-app/android/app/build/outputs/apk/release/app-release.apk');
  const gradleUnsignedApk = path.join(__dirname, '../../android-app/android/app/build/outputs/apk/release/app-release-unsigned.apk');

  if (fs.existsSync(v210Apk)) {
    return res.download(v210Apk, 'Melodyx-v2.1.0.apk');
  } else if (fs.existsSync(customApk)) {
    return res.download(customApk, 'Melodyx.apk');
  } else if (fs.existsSync(gradleDebugApk)) {
    return res.download(gradleDebugApk, 'Melodyx.apk');
  } else if (fs.existsSync(gradleReleaseApk)) {
    return res.download(gradleReleaseApk, 'Melodyx.apk');
  } else if (fs.existsSync(gradleUnsignedApk)) {
    return res.download(gradleUnsignedApk, 'Melodyx.apk');
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
            Build the APK in Android Studio (<b>Build &gt; Build APK(s)</b>) or place <code>Melodyx.apk</code> into the <code>backend/apk/</code> directory.
          </p>
        </body>
      </html>
    `);
  }
});

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


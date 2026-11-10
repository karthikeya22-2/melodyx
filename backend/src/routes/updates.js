const express = require('express');
const router = express.Router();

// Melody X Production Remote Release Configuration
const LATEST_RELEASE = {
  latestVersion: '2.2.0',
  latestVersionCode: 3,
  version: '2.2.0', // backwards compatibility
  versionCode: 3,
  releaseDate: 'November 2026',
  minimumSupportedVersion: '1.0.0',
  minimumSupportedVersionCode: 1,
  minSupportedVersion: '1.0.0', // backwards compatibility
  title: 'Melody X 2nd Major Update (v2.2.0)',
  releaseNotes: "What's New in Melody X v2.2.0:\n- Fixed Google Sign-In & verified profile synchronization.\n- Added Add to Playlist (select existing & create new inline).\n- Highest clarity 320kbps audio streaming.\n- Song-specific posters and artwork.\n- Device local time greetings with user name.\n- Resilient playlist import from Spotify, JioSaavn & YouTube.\n- Optimized backend caching and rate limiting.\n- Preserved background music playback.",
  changelog: [
    'Fixed Google Sign-In & verified profile synchronization',
    'Fixed Add to Playlist with library playlists and inline creation',
    'Optimized audio clarity with studio 320kbps streams',
    'Fixed song-specific posters and eliminated duplicate artwork',
    'Dynamic client device time greetings with user name',
    'Improved Spotify, JioSaavn & YouTube playlist imports',
    'Optimized backend with in-flight deduplication and caching',
    'Preserved foreground service background music playback'
  ],
  apkDownloadUrl: '/download/apk',
  downloadUrl: '/download/apk',
  mandatoryUpdate: false
};

function compareVersions(v1, v2) {
  const parts1 = (v1 || '0.0.0').replace(/^v/, '').split('.').map(Number);
  const parts2 = (v2 || '0.0.0').replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

// GET /api/updates/check?version=2.0.0&versionCode=1
router.get('/check', (req, res) => {
  const clientVersion = req.query.version || '2.0.0';
  const clientVersionCode = parseInt(req.query.versionCode || '1', 10);

  let hasUpdate = false;
  if (!isNaN(clientVersionCode) && clientVersionCode > 0) {
    hasUpdate = clientVersionCode < LATEST_RELEASE.latestVersionCode;
  } else {
    hasUpdate = compareVersions(LATEST_RELEASE.latestVersion, clientVersion) > 0;
  }

  const isMandatory = LATEST_RELEASE.mandatoryUpdate ||
    (clientVersionCode < LATEST_RELEASE.minimumSupportedVersionCode) ||
    (compareVersions(LATEST_RELEASE.minimumSupportedVersion, clientVersion) > 0);

  // Compute absolute download URL so existing legacy apps can open it in browser directly
  const host = req.get('host') || 'melodyx-zday.onrender.com';
  const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
  const absoluteDownloadUrl = `${protocol}://${host}/download/apk`;

  res.json({
    isUpdateAvailable: hasUpdate,
    clientVersion,
    clientVersionCode,
    latestVersion: LATEST_RELEASE.latestVersion,
    latestVersionCode: LATEST_RELEASE.latestVersionCode,
    version: LATEST_RELEASE.latestVersion,
    versionCode: LATEST_RELEASE.latestVersionCode,
    releaseDate: LATEST_RELEASE.releaseDate,
    title: LATEST_RELEASE.title,
    releaseNotes: LATEST_RELEASE.releaseNotes,
    changelog: LATEST_RELEASE.changelog,
    apkDownloadUrl: absoluteDownloadUrl,
    downloadUrl: absoluteDownloadUrl,
    websiteUrl: 'https://download-melodyx.vercel.app',
    mandatoryUpdate: isMandatory,
    minimumSupportedVersion: LATEST_RELEASE.minimumSupportedVersion,
    minimumSupportedVersionCode: LATEST_RELEASE.minimumSupportedVersionCode,
    checkedAt: new Date().toISOString()
  });
});

module.exports = router;

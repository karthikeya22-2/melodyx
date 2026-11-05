const express = require('express');
const router = express.Router();

// Current production release configuration
// Update 'latestVersion' here whenever releasing a new Melodyx version
const LATEST_RELEASE = {
  version: '2.0.0',
  releaseDate: 'November 2026',
  minSupportedVersion: '1.0.0',
  title: 'Melodyx Shiny Silver Release',
  changelog: [
    'Matte black UI with shiny silver chrome accents',
    'Full Google Cloud OAuth integration',
    'Ultra-fast multi-source search (JioSaavn + Spotify)',
    'Dynamic autoplay from recent searches and custom playlists',
    'Zero-latency animated waveform scrubber',
    'Background audio playback with screen off & lock-screen media controls'
  ],
  downloadUrl: '/download/apk'
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

// GET /api/updates/check?version=2.0.0
router.get('/check', (req, res) => {
  const clientVersion = req.query.version || '2.0.0';
  const hasUpdate = compareVersions(LATEST_RELEASE.version, clientVersion) > 0;

  res.json({
    isUpdateAvailable: hasUpdate,
    clientVersion,
    latestVersion: LATEST_RELEASE.version,
    releaseDate: LATEST_RELEASE.releaseDate,
    title: LATEST_RELEASE.title,
    changelog: LATEST_RELEASE.changelog,
    downloadUrl: LATEST_RELEASE.downloadUrl,
    checkedAt: new Date().toISOString()
  });
});

module.exports = router;


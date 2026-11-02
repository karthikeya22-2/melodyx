# SoundWave - Unified Ad-Free Music Platform

A complete, modern music streaming platform with **separate Android Mobile and Desktop Web applications**, connected to a shared backend and authentication system.

Inspired by Spotube's architecture: provides access to 100M+ songs, albums, and playlists across all languages with **zero ads** and **zero user subscription fees**.

---

## Project Structure

```
/music-platform
  ├── /android-app        # Mobile-native Android app (Capacitor + React + Tailwind)
  ├── /web-app            # Desktop-first web player (React + Vite + Tailwind + Zustand)
  ├── /backend            # Shared Node.js REST API, SQLite DB, Stream Resolver
  ├── /shared             # Shared TypeScript types and contracts
  └── /documentation      # Complete technical guides, API reference, & APK build docs
```

---

## Quickstart: Running the Platform

### 1. Start the Shared Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### 2. Start the Desktop Web Player
```bash
cd web-app
npm run dev
# Web app runs on http://localhost:3000
```

### 3. Start the Android Mobile App
```bash
cd android-app
npm run dev
# Mobile app runs on http://localhost:3001
```

To build the native Android APK, see [documentation/ANDROID_GUIDE.md](documentation/ANDROID_GUIDE.md).

---

## Key Features

* **Ad-Free High Quality Audio:** Uses direct CDN stream resolution (Opus 160kbps / AAC 320kbps) with HTTP 206 Partial Content range seeking.
* **All Languages Supported:** Telugu, Hindi, English, Punjabi, Tamil, and Global Hits.
* **Cross-Platform Sync:** Liked songs, playlists, and listening history sync between Android and Web via the shared backend.
* **Synchronized Lyrics:** Live karaoke-style scrolling lyrics powered by LRCLIB.
* **Distinct Platform UIs:**
  * **Android:** Bottom tab navigation, floating mini-player, full-screen Now Playing slide-up sheet, 2-column pill cards, horizontal touch carousels, and Android lockscreen controls.
  * **Web:** 3-column layout (fixed left sidebar, wide responsive main grid, collapsible right Now Playing panel), persistent bottom playback bar, and keyboard shortcuts.


# Desktop Web Application Guide

Location: `/music-platform/web-app`

---

## 1. Overview
The web application provides a desktop-first music streaming experience inspired by the Spotify Desktop & Web Player:
* **3-Section Layout:**
  1. **Left Sidebar (Fixed):** Brand logo, Home, Search, Your Library, Create Playlist, Liked Songs tile, User Playlists list.
  2. **Main Content Area:** Responsive multi-column grid, Greeting header, Recently Played quick tiles, Made For You, Telugu Hits, Hindi Hits, English Hits, Trending Albums, Artists, and Mood collections.
  3. **Right Sidebar (Expandable/Collapsible):** Large Now Playing artwork, artist information/bio, next in queue, and live lyrics preview.
* **Persistent Bottom Playback Bar:**
  * Track metadata, thumbnail, like button.
  * Central transport controls (Shuffle, Previous, Play/Pause, Next, Repeat) and timeline scrubber.
  * Lyrics toggle, Now Playing panel toggle, and volume slider.
* **Synchronized Full-Screen Lyrics Modal:** Real-time auto-scrolling karaoke-style lyrics.
* **Global Desktop Shortcuts:**
  * `Space`: Play / Pause
  * `Ctrl + ArrowRight`: Next track
  * `Ctrl + ArrowLeft`: Previous track

---

## 2. Running Locally

```bash
cd music-platform/web-app
npm run dev
```
Open `http://localhost:3000` in any web browser.

---

## 3. Production Build

```bash
cd music-platform/web-app
npm run build
```
The compiled, production-ready static assets will be output in `dist/`.


# System Architecture & Technical Specification

## Spotube-Inspired Ad-Free Universal Music Platform

The platform delivers full-length, high-fidelity music streaming across all languages with **zero ads** and **zero user subscription fees**. It features two distinct, platform-native frontends sharing a single unified backend.

---

## 1. High-Level Architecture Diagram

```
                             ┌─────────────────────────────────┐
                             │       Shared SQLite Database    │
                             │  (Users, Likes, Playlists, etc) │
                             └────────────────┬────────────────┘
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │       Shared Node.js Backend    │
                             │  • JWT Authentication Engine   │
                             │  • Music Catalog & Search API   │
                             │  • Audio Stream Resolver Engine │
                             │  • Synchronized Lyrics Service  │
                             │  • Recommendation Engine        │
                             └────────┬───────────────┬────────┘
                                      │               │
                 REST / JSON API      │               │  REST / JSON API
                                      │               │
             ┌────────────────────────┴────┐     ┌────┴────────────────────────┐
             ▼                             ▼     ▼                             ▼
  ┌───────────────────────┐   ┌───────────────────────┐   ┌────────────────────────┐
  │   Spotify Metadata    │   │  YouTube / Saavn CDN  │   │      LRCLIB API        │
  │  (100M+ Songs, Albums)│   │  (Ad-Free Audio Media)│   │  (Synced Karaoke LRC)  │
  └───────────────────────┘   └───────────────────────┘   └────────────────────────┘
             ▲                                                                 ▲
             │                                                                 │
     ┌───────┴──────────────────────────────┐                 ┌────────────────┴───────┐
     │                                      │                 │                        │
     ▼                                      ▼                 ▼                        ▼
┌──────────────────────────────────────────────┐   ┌──────────────────────────────────────┐
│             ANDROID MOBILE APP               │   │           DESKTOP WEB APP            │
│  (/music-platform/android-app)               │   │  (/music-platform/web-app)           │
│                                              │   │                                      │
│  • Mobile-first Spotify Android UX           │   │  • Desktop-first Spotify Web Player  │
│  • Fixed Bottom Nav Bar (Home, Search, Lib)  │   │  • 3-Section Layout:                 │
│  • Floating Mini-Player above Bottom Nav     │   │    - Left Sidebar (Fixed Navigation) │
│  • Full-Screen Now Playing Slide-up Sheet    │   │    - Main Responsive Content Grid    │
│  • 2-Column Pill Cards for Recently Played   │   │    - Right Expandable Now Playing    │
│  • Horizontal Touch-Scroll Carousels         │   │  • Persistent Bottom Player Bar      │
│  • Android MediaSession Lock-Screen Controls │   │  • Global Keyboard Shortcuts         │
│  • Native Android Gradle Project & APK       │   │  • Next.js / React + Tailwind CSS    │
└──────────────────────────────────────────────┘   └──────────────────────────────────────┘
```

---

## 2. Audio Pipeline: How Free & Ad-Free Streaming Works

1. **Metadata Resolution:** The app searches music metadata through the Spotify Web API or local catalog to get authentic titles, artist names, album art, and durations.
2. **Track Matching:** The Track Matcher pairs the song title and artist with official studio tracks.
3. **Stream Extraction (Zero Ads):** Raw audio chunks (`audio/webm` Opus or `audio/mp4` AAC 320kbps) are fetched directly from the content delivery network.
4. **Range Streaming (HTTP 206 Partial Content):** The backend proxies or directs audio with `Range: bytes=START-END` headers, allowing instant seeking, background playback, and scrubbing without buffering.

---

## 3. Data Synchronization Across Platforms

A single user account logs in on both Android and Web:
* Liked songs saved on Android instantly appear in Web's "Liked Songs".
* Playlists created on Web instantly appear in Android's "Your Library".
* Playback history feeds into the shared recommendation engine to tune Daily Mixes and "Made For You" feeds.


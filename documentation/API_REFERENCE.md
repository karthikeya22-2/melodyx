# Backend API Reference

Base URL: `http://localhost:5000/api`

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Creates a new user account.
* **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword",
    "displayName": "Alex",
    "preferredLanguages": ["Telugu", "Hindi", "English"]
  }
  ```
* **Response:** `{ "token": "JWT_TOKEN", "user": { ... } }`

### `POST /api/auth/login`
Logs in an existing user.
* **Body:** `{ "email": "user@example.com", "password": "yourpassword" }`
* **Response:** `{ "token": "JWT_TOKEN", "user": { ... } }`

### `POST /api/auth/guest`
Instant one-tap login for demo or guest exploration.
* **Response:** `{ "token": "JWT_TOKEN", "user": { ... } }`

---

## 2. Music Catalog & Search (`/api/catalog`)

### `GET /api/catalog/home`
Returns the personalized home feed:
* `greeting`: "Good morning" / "Good afternoon" / "Good evening"
* `recentlyPlayed`: Array of recent tracks
* `madeForYou`: Algorithmic personalized mix
* `teluguHits`: Popular Tollywood tracks
* `hindiHits`: Bollywood romantic & party hits
* `englishHits`: Global pop hits
* `trendingAlbums`: Trending album discographies
* `recommendedArtists`: Top streaming artists
* `moodPlaylists`: Workout, Chill, Focus, Party collections

### `GET /api/catalog/search?q={query}`
Searches tracks, artists, albums, and playlists. Supports real-time online search fallback.

---

## 3. Audio Streaming Engine (`/api/stream`)

### `GET /api/stream/resolve/:trackId`
Resolves a song into its direct streamable audio URL, audio bitrate (`320kbps`), and codec format.

### `GET /api/stream/play/:trackId`
Proxies the raw audio stream with full HTTP `Range: bytes=` support (HTTP 206 Partial Content), enabling smooth seeking, scrubber control, and ad-free playback.

---

## 4. Lyrics Engine (`/api/lyrics`)

### `GET /api/lyrics/:trackId?title={title}&artist={artist}`
Fetches synchronized, timestamped lyrics from LRCLIB.
* **Response:**
  ```json
  {
    "trackId": "telugu-1",
    "title": "Naatu Naatu",
    "artist": "Rahul Sipligunj, Kaala Bhairava",
    "isSynced": true,
    "lines": [
      { "time": 5.2, "text": "Polam gattu dhummu lo na..." },
      { "time": 10.4, "text": "Potla gittha dhookinattu..." }
    ]
  }
  ```

---

## 5. Library & Sync (`/api/library`)

* `GET /api/library/likes`: Fetch liked tracks.
* `POST /api/library/likes`: Like a track (`{ "track": { ... } }`).
* `DELETE /api/library/likes/:trackId`: Remove track from liked list.
* `GET /api/library/playlists`: List playlists.
* `POST /api/library/playlists`: Create new playlist.
* `POST /api/library/playlists/:id/tracks`: Add track to playlist.
* `GET /api/library/history`: Fetch listening history.
* `POST /api/library/history`: Record track completion and skip rates.


// Melodyx Live Music Player Controller
// Plays legally approved Creative Commons CC-BY preview tracks directly on the website

class MelodyxWebPlayer {
  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.tracks = window.APP_CONFIG?.previewTracks || [];
    this.currentIndex = 0;
    this.isPlaying = false;

    this.initElements();
    this.bindEvents();
    if (this.tracks.length > 0) {
      this.loadTrack(0, false);
    }
  }

  initElements() {
    this.disc = document.getElementById('playerDisc');
    this.artworkImg = document.getElementById('playerArtwork');
    this.titleEl = document.getElementById('playerTitle');
    this.artistEl = document.getElementById('playerArtist');
    this.playBtn = document.getElementById('playerPlayBtn');
    this.prevBtn = document.getElementById('playerPrevBtn');
    this.nextBtn = document.getElementById('playerNextBtn');
    this.seekSlider = document.getElementById('playerSeek');
    this.currentTimeEl = document.getElementById('playerCurrentTime');
    this.durationEl = document.getElementById('playerDuration');
    this.trackListEl = document.getElementById('playerTrackList');
    this.attributionEl = document.getElementById('playerAttribution');

    this.renderTrackList();
  }

  renderTrackList() {
    if (!this.trackListEl) return;
    this.trackListEl.innerHTML = this.tracks.map((track, idx) => `
      <div class="track-row ${idx === this.currentIndex ? 'active' : ''}" data-index="${idx}">
        <div class="track-row-left">
          <span class="track-number">${idx + 1}</span>
          <div>
            <div class="track-name">${track.title}</div>
            <div class="track-artist">${track.artist} • ${track.genre}</div>
          </div>
        </div>
        <div class="track-time">${this.formatTime(track.duration)}</div>
      </div>
    `).join('');

    this.trackListEl.querySelectorAll('.track-row').forEach(row => {
      row.addEventListener('click', () => {
        const index = parseInt(row.dataset.index, 10);
        this.loadTrack(index, true);
      });
    });
  }

  loadTrack(index, autoPlay = true) {
    if (index < 0 || index >= this.tracks.length) return;
    this.currentIndex = index;
    const track = this.tracks[index];

    this.audio.src = track.audioUrl;
    if (this.titleEl) this.titleEl.textContent = track.title;
    if (this.artistEl) this.artistEl.textContent = `${track.artist} — ${track.album}`;
    if (this.artworkImg) this.artworkImg.src = track.artwork;
    if (this.attributionEl) this.attributionEl.textContent = track.attribution || '';

    // Update active row
    if (this.trackListEl) {
      this.trackListEl.querySelectorAll('.track-row').forEach((r, i) => {
        r.classList.toggle('active', i === index);
      });
    }

    if (autoPlay) {
      this.play();
    } else {
      this.pause();
    }
  }

  play() {
    this.audio.play()
      .then(() => {
        this.isPlaying = true;
        this.updatePlayBtn(true);
        if (this.disc) this.disc.classList.add('spinning');
      })
      .catch(e => {
        console.warn('Audio play note:', e.message);
      });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayBtn(false);
    if (this.disc) this.disc.classList.remove('spinning');
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  updatePlayBtn(isPlaying) {
    if (!this.playBtn) return;
    if (isPlaying) {
      this.playBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>`;
      this.playBtn.setAttribute('aria-label', 'Pause');
    } else {
      this.playBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>`;
      this.playBtn.setAttribute('aria-label', 'Play');
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  bindEvents() {
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlay());
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        const nextIdx = this.currentIndex > 0 ? this.currentIndex - 1 : this.tracks.length - 1;
        this.loadTrack(nextIdx, true);
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        const nextIdx = (this.currentIndex + 1) % this.tracks.length;
        this.loadTrack(nextIdx, true);
      });
    }

    this.audio.addEventListener('timeupdate', () => {
      const cur = this.audio.currentTime;
      const dur = this.audio.duration;
      if (this.currentTimeEl) this.currentTimeEl.textContent = this.formatTime(cur);
      if (this.durationEl && dur) this.durationEl.textContent = this.formatTime(dur);
      if (this.seekSlider && dur) {
        this.seekSlider.value = (cur / dur) * 100;
      }
    });

    if (this.seekSlider) {
      this.seekSlider.addEventListener('input', () => {
        const dur = this.audio.duration;
        if (dur) {
          this.audio.currentTime = (this.seekSlider.value / 100) * dur;
        }
      });
    }

    this.audio.addEventListener('ended', () => {
      const nextIdx = (this.currentIndex + 1) % this.tracks.length;
      this.loadTrack(nextIdx, true);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('playerPlayBtn')) {
    window.melodyxPlayer = new MelodyxWebPlayer();
  }
});


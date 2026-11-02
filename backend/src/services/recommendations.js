// Personalized Recommendation Engine & Daily Mix Generator

const catalog = require('./catalog');
const db = require('../database');

class RecommendationEngine {
  getUserProfile(userId) {
    const history = db.getUserHistory(userId, 100);
    const likes = db.getUserLikes(userId);

    const langCounts = {};
    const artistCounts = {};
    const genreCounts = {};

    [...history, ...likes].forEach(track => {
      if (track.language) {
        langCounts[track.language] = (langCounts[track.language] || 0) + 1;
      }
      if (track.artist) {
        const primaryArtist = track.artist.split(',')[0].trim();
        artistCounts[primaryArtist] = (artistCounts[primaryArtist] || 0) + 1;
      }
      if (track.genre) {
        genreCounts[track.genre] = (genreCounts[track.genre] || 0) + 1;
      }
    });

    return {
      langCounts,
      artistCounts,
      genreCounts
    };
  }

  getDailyMixes(userId) {
    const feed = catalog.getHomeFeed();
    return [
      {
        id: 'daily-mix-1',
        title: 'Daily Mix 1',
        subtitle: 'Sid Sriram, Anirudh Ravichander, Devi Sri Prasad and more',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
        language: 'Telugu',
        tracks: feed.teluguHits
      },
      {
        id: 'daily-mix-2',
        title: 'Daily Mix 2',
        subtitle: 'Arijit Singh, Sachin-Jigar, Pritam and more',
        coverUrl: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=600',
        language: 'Hindi',
        tracks: feed.hindiHits
      },
      {
        id: 'daily-mix-3',
        title: 'Daily Mix 3',
        subtitle: 'The Weeknd, Ed Sheeran, Harry Styles and more',
        coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
        language: 'English',
        tracks: feed.englishHits
      },
      {
        id: 'daily-mix-4',
        title: 'Daily Mix 4',
        subtitle: 'Acoustic Vibes, Romantic Melodies and Late Night Soul',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
        language: 'Acoustic',
        tracks: [feed.teluguHits[3], feed.hindiHits[1], feed.englishHits[3], feed.teluguHits[5]]
      }
    ];
  }

  getMadeForYou(userId) {
    const feed = catalog.getHomeFeed();
    const likes = db.getUserLikes(userId);

    // Merge likes with curated tracks to create an organic tailored feed
    const blended = [...likes];
    feed.madeForYou.forEach(track => {
      if (!blended.some(b => b.id === track.id)) {
        blended.push(track);
      }
    });

    return blended.slice(0, 12);
  }

  getRadioTracks(trackId) {
    const target = catalog.getTrackById(trackId);
    const feed = catalog.getHomeFeed();
    const all = [...feed.teluguHits, ...feed.hindiHits, ...feed.englishHits];

    if (!target) return all.slice(0, 8);

    // Filter by same language or genre first
    const similar = all.filter(
      t => t.id !== trackId && (t.language === target.language || t.genre === target.genre)
    );

    // Fill with remaining tracks
    all.forEach(t => {
      if (t.id !== trackId && !similar.some(s => s.id === t.id)) {
        similar.push(t);
      }
    });

    return similar.slice(0, 10);
  }
}

module.exports = new RecommendationEngine();


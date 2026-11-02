// Non-AI Music Discovery: Recently Played & Category Trending

const catalog = require('./catalog');
const db = require('../database');

class DiscoveryService {
  getRecentlyPlayed(userId) {
    return db.getUserHistory(userId, 10);
  }

  getTrending(language) {
    const feed = catalog.getHomeFeed();
    if (language === 'Telugu') return feed.trendingTelugu;
    if (language === 'Hindi') return feed.trendingHindi;
    if (language === 'English') return feed.trendingEnglish;
    return [...feed.trendingTelugu.slice(0, 3), ...feed.trendingHindi.slice(0, 3), ...feed.trendingEnglish.slice(0, 3)];
  }

  getGenreTracks(genreId) {
    const feed = catalog.getHomeFeed();
    if (genreId.includes('telugu')) return feed.trendingTelugu;
    if (genreId.includes('hindi')) return feed.trendingHindi;
    if (genreId.includes('pop')) return feed.trendingEnglish;
    return [feed.trendingTelugu[3], feed.trendingHindi[1], feed.trendingEnglish[3]];
  }
}

module.exports = new DiscoveryService();

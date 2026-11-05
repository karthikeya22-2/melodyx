import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Play, Pause, Heart, X, Clock, History, TrendingUp, Sparkles, Music } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { api } from '../services/api';
import { Track } from '../types';
import { recommendationEngine } from '../services/recommendationEngine';

function formatDuration(sec: number): string {
  if (isNaN(sec) || sec <= 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const SearchPage: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, togglePlay, likedTrackIds, toggleLike } = usePlayerStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ tracks: Track[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history
  useEffect(() => {
    setSearchHistory(recommendationEngine.getSearchHistory());
  }, []);

  const trendingSearches = recommendationEngine.getTrendingSearches();

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      api.search(query.trim())
        .then(res => {
          setResults(res);
          setIsLoading(false);
          // Record successful search in history
          recommendationEngine.recordSearch(query.trim());
          if (res?.tracks) {
            recommendationEngine.saveSearchResults(res.tracks);
          }
          setSearchHistory(recommendationEngine.getSearchHistory());
        })
        .catch(err => {
          console.error('Search error:', err);
          setIsLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectSearch = (term: string) => {
    setQuery(term);
  };

  const handleRemoveHistoryItem = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recommendationEngine.removeSearchItem(term);
    setSearchHistory(updated);
  };

  const handleClearAllHistory = () => {
    recommendationEngine.clearSearchHistory();
    setSearchHistory([]);
  };

  // Limit display strictly to top 2-3 most relevant results
  const tracks: Track[] = (results?.tracks || []).slice(0, 3);
  const topResult = tracks[0];

  return (
    <div className="flex-1 bg-[#0A0A0C] rounded-xl overflow-y-auto p-6 space-y-6 select-none border border-white/5">
      {/* 1. Large Search Bar */}
      <div className="relative w-full max-w-xl">
        <SearchIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="What do you want to play?"
          className="w-full bg-[#131316] hover:bg-[#1A1A20] focus:bg-[#1A1A20] border border-white/10 focus:border-white/30 text-white font-medium text-sm rounded-full pl-12 pr-10 py-3 focus:outline-none placeholder-[#757575] transition-all shadow-inner"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-3.5 text-[#94A3B8] hover:text-white transition-colors"
            title="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. When query is empty: Show Recent Searches & Trending Suggestions */}
      {!query && (
        <div className="space-y-8 max-w-3xl">
          {/* Recent Searches */}
          {searchHistory.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
                  <History className="w-4 h-4 text-slate-300" />
                  <span>Recent Searches</span>
                </h2>
                <button
                  onClick={handleClearAllHistory}
                  className="text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, idx) => (
                  <div
                    key={`${item}-${idx}`}
                    onClick={() => handleSelectSearch(item)}
                    className="group flex items-center space-x-2 bg-[#131316] hover:bg-[#1A1A20] px-3.5 py-2 rounded-full cursor-pointer border border-white/10 hover:border-white/20 transition-all"
                  >
                    <SearchIcon className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-white" />
                    <span className="text-xs font-medium text-white">{item}</span>
                    <button
                      onClick={e => handleRemoveHistoryItem(item, e)}
                      className="text-[#888] hover:text-white p-0.5 rounded-full"
                      title="Remove from history"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended / Trending Searches */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-slate-300" />
              <span>Recommended Searches</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {trendingSearches.map(term => (
                <button
                  key={term}
                  onClick={() => handleSelectSearch(term)}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-[#131316] hover:bg-[#1A1A20] text-[#94A3B8] hover:text-white border border-white/10 hover:border-white/30 transition-all flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3 h-3 text-slate-300" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Loading Indicator */}
      {isLoading && (
        <div className="py-12 flex items-center justify-center space-x-3 text-sm text-[#94A3B8]">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
          <span>Searching top relevant songs...</span>
        </div>
      )}

      {/* 4. Filtered & Ranked Results (Strictly Top 2–3 Accurate Matches) */}
      {!isLoading && query && results && (
        <div className="space-y-6">
          {tracks.length > 0 ? (
            <div>
              <div className="flex items-center justify-between pb-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Top Matches ({tracks.length})
                </h2>
                <span className="text-xs text-[#888]">
                  Filtered for relevance • 2–3 best results
                </span>
              </div>

              {/* Grid: Top Result Card + Ranked List */}
              <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
                {/* 1. TOP RESULT CARD */}
                {topResult && (
                  <div
                    onClick={() => {
                      if (currentTrack?.id === topResult.id) togglePlay();
                      else playTrack(topResult, tracks, 'search');
                    }}
                    className="group bg-[#131316] hover:bg-[#1A1A20] p-5 rounded-xl cursor-pointer transition-all relative flex flex-col justify-between border border-white/10 hover:border-white/20"
                  >
                    <div>
                      <img
                        src={topResult.artwork}
                        alt={topResult.title}
                        className="w-28 h-28 rounded-lg object-cover shadow-xl mb-4 ring-1 ring-white/10"
                      />
                      <h3 className="text-xl font-extrabold text-white truncate group-hover:text-white">
                        {topResult.title}
                      </h3>
                      <p className="text-xs text-[#94A3B8] mt-1">
                        <span className="text-white font-medium">{topResult.artist}</span> • {topResult.album || 'Single'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs font-mono text-[#888]">
                        {formatDuration(topResult.duration)}
                      </span>
                      {/* Play Button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (currentTrack?.id === topResult.id) togglePlay();
                          else playTrack(topResult, tracks, 'search');
                        }}
                        className="w-11 h-11 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black flex items-center justify-center shadow-xl shadow-white/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        {currentTrack?.id === topResult.id && isPlaying ? (
                          <Pause className="w-5 h-5 fill-black text-black" />
                        ) : (
                          <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. RELEVANT SONGS LIST (Max 3) */}
                <div className="space-y-1">
                  {tracks.map((t, idx) => {
                    const isThisPlaying = currentTrack?.id === t.id && isPlaying;
                    const isLiked = likedTrackIds.includes(t.id);

                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          if (currentTrack?.id === t.id) togglePlay();
                          else playTrack(t, tracks, 'search');
                        }}
                        className="group flex items-center justify-between p-3 rounded-xl hover:bg-[#131316] cursor-pointer transition-colors border border-transparent hover:border-white/5"
                      >
                        <div className="flex items-center space-x-3.5 truncate">
                          <span className="text-xs font-mono text-[#777] w-4 text-center">
                            {idx + 1}
                          </span>
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-[#1A1A20] ring-1 ring-white/5">
                            <img src={t.artwork} alt={t.title} className="w-full h-full object-cover" />
                            <div className={`absolute inset-0 bg-black/50 items-center justify-center ${isThisPlaying ? 'flex' : 'hidden group-hover:flex'}`}>
                              {isThisPlaying ? (
                                <Pause className="w-4 h-4 fill-white text-white" />
                              ) : (
                                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                              )}
                            </div>
                          </div>
                          <div className="truncate">
                            <p className={`font-semibold text-sm truncate ${currentTrack?.id === t.id ? 'text-white font-extrabold drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]' : 'text-white'}`}>
                              {t.title}
                            </p>
                            <p className="text-xs text-[#94A3B8] truncate mt-0.5">
                              {t.artist} • <span className="text-[#888]">{t.album || 'Single'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 shrink-0">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleLike(t);
                            }}
                            className="text-[#888] hover:text-white transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${isLiked ? 'text-white fill-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]' : 'opacity-0 group-hover:opacity-100'}`} />
                          </button>
                          <span className="text-xs font-mono text-[#888] w-12 text-right">
                            {formatDuration(t.duration)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center space-y-2">
              <p className="text-base font-bold text-white">No songs found for "{query}"</p>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                Please check the spelling or search using another song name or artist.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

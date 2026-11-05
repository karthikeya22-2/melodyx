import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, MoreVertical, History, TrendingUp, Sparkles, Play, Pause } from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';
import { api } from '../services/api';
import { Track } from '../types';
import { recommendationEngine } from '../services/recommendationEngine';

export const SearchScreen: React.FC = () => {
  const { playTrack, currentTrack, isPlaying, togglePlay, openOptionsMenu } = useMobilePlayerStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ tracks: Track[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

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

  // Display all relevant search matches
  const tracks: Track[] = (results?.tracks || []).slice(0, 30);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0A0A0C] select-none px-4 pt-4 pb-28 touch-scroll space-y-5">
      <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">Search</h1>

      {/* 1. Mobile Search Bar */}
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full bg-[#131316] text-white font-medium text-sm rounded-xl pl-11 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500 shadow-md border border-white/10"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. When query is empty: Recent Searches & Recommendations */}
      {!query && (
        <div className="space-y-6 pt-1">
          {/* Recent Searches */}
          {searchHistory.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <History className="w-4 h-4 text-slate-300" />
                  <span>Recent Searches</span>
                </h2>
                <button
                  onClick={handleClearAllHistory}
                  className="text-xs text-[#94A3B8] hover:text-white"
                >
                  Clear all
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, idx) => (
                  <div
                    key={`${term}-${idx}`}
                    onClick={() => handleSelectSearch(term)}
                    className="flex items-center space-x-2 bg-[#131316] active:bg-[#1A1A20] px-3 py-1.5 rounded-full border border-white/10"
                  >
                    <SearchIcon className="w-3 h-3 text-[#94A3B8]" />
                    <span className="text-xs text-white font-medium">{term}</span>
                    <button
                      onClick={e => handleRemoveHistoryItem(term, e)}
                      className="text-[#888] active:text-white p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended & Trending Searches */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-slate-300" />
              <span>Recommended Searches</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {trendingSearches.map(term => (
                <button
                  key={term}
                  onClick={() => handleSelectSearch(term)}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#131316] active:bg-[#1A1A20] text-xs font-semibold text-[#94A3B8] active:text-white rounded-full border border-white/10"
                >
                  <Sparkles className="w-3 h-3 text-slate-300" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Loading State */}
      {isLoading && (
        <div className="py-12 flex items-center justify-center space-x-2 text-xs text-[#94A3B8]">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
          <span>Finding accurate results...</span>
        </div>
      )}

      {/* 4. Filtered & Ranked Results (Strictly Top 2–3 Matches) */}
      {!isLoading && query && results && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Top Matches ({tracks.length})
            </h2>
            <span className="text-[11px] text-[#888]">Ranked by relevance</span>
          </div>

          {tracks.length > 0 ? (
            <div className="space-y-1">
              {tracks.map(track => {
                const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      if (currentTrack?.id === track.id) togglePlay();
                      else playTrack(track, tracks);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl active:bg-[#1A1A20] transition-colors bg-[#131316] border border-white/5"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#1A1A20] ring-1 ring-white/5">
                        <img
                          src={track.artwork}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        {isThisPlaying && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Pause className="w-5 h-5 fill-white text-white" />
                          </div>
                        )}
                      </div>
                      <div className="truncate">
                        <p
                          className={`text-sm font-bold truncate ${
                            isThisPlaying ? 'text-white font-extrabold drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]' : 'text-white'
                          }`}
                        >
                          {track.title}
                        </p>
                        <p className="text-xs text-[#94A3B8] truncate mt-0.5">
                          {track.artist} • <span className="text-[#888]">{track.album || 'Single'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[11px] font-mono text-[#888]">
                        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          openOptionsMenu(track);
                        }}
                        className="p-1.5 text-[#94A3B8] hover:text-white"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center space-y-1">
              <p className="text-sm font-bold text-white">No matches found for "{query}"</p>
              <p className="text-xs text-[#888]">Try searching another song or artist name.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

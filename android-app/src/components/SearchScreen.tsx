import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, MoreVertical, History, TrendingUp, Sparkles, Play, Pause, CheckCircle2 } from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';
import { api } from '../services/api';
import { Track } from '../types';
import { recommendationEngine } from '../services/recommendationEngine';

interface RankedItem {
  track: Track;
  isExact: boolean;
  isRecommended: boolean;
}

function rankSearchTracks(query: string, rawTracks: Track[]): RankedItem[] {
  if (!rawTracks || rawTracks.length === 0) return [];

  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

  let exactMatchIndex = -1;
  let bestExactScore = 0;

  for (let i = 0; i < rawTracks.length; i++) {
    const t = rawTracks[i];
    const cleanTitle = (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();

    // Direct title exact match
    if (cleanTitle === cleanQuery) {
      exactMatchIndex = i;
      break;
    }

    // Title starts with query or query starts with title
    if (cleanTitle.startsWith(cleanQuery) || cleanQuery.startsWith(cleanTitle)) {
      if (bestExactScore < 2) {
        bestExactScore = 2;
        exactMatchIndex = i;
      }
    }

    // All search tokens contained in title
    if (queryTokens.length > 0 && queryTokens.every(tok => cleanTitle.includes(tok))) {
      if (bestExactScore < 1) {
        bestExactScore = 1;
        exactMatchIndex = i;
      }
    }
  }

  // Exact Match: Return 1 exact match + 1 or 2 recommendations (2 to 3 songs total)
  if (exactMatchIndex !== -1) {
    const exactTrack = rawTracks[exactMatchIndex];
    const remaining = rawTracks.filter((_, idx) => idx !== exactMatchIndex);
    const recommended = remaining.slice(0, 2);

    return [
      { track: exactTrack, isExact: true, isRecommended: false },
      ...recommended.map(t => ({ track: t, isExact: false, isRecommended: true }))
    ];
  }

  // Broad / Non-exact Search: Return strictly 3 to 4 songs maximum
  const topMatches = rawTracks.slice(0, 4);
  return topMatches.map((t, idx) => ({
    track: t,
    isExact: false,
    isRecommended: idx > 0
  }));
}

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

  // Rank and limit search results:
  // - If exact match: 1 exact match + 1 or 2 recommendations (2–3 songs total)
  // - If broad/no exact match: strictly 3 to 4 songs maximum
  const rankedItems: RankedItem[] = query.trim() && results?.tracks
    ? rankSearchTracks(query.trim(), results.tracks)
    : [];

  const hasExactMatch = rankedItems.some(i => i.isExact);

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

      {/* 4. Filtered & Ranked Results (Strictly 2–3 if exact match, or 3–4 songs max) */}
      {!isLoading && query && results && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <span>{hasExactMatch ? 'Exact Match & Recommendations' : 'Top Results'}</span>
              <span className="text-[11px] font-normal text-slate-400 font-mono">({rankedItems.length})</span>
            </h2>
            <span className="text-[11px] text-slate-400">
              {hasExactMatch ? 'Exact + Recommended' : 'Curated Top Matches'}
            </span>
          </div>

          {rankedItems.length > 0 ? (
            <div className="space-y-1.5">
              {rankedItems.map(({ track, isExact, isRecommended }, idx) => {
                const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => {
                      if (currentTrack?.id === track.id) {
                        togglePlay();
                      } else {
                        // Play searched song with 'search' as playbackSource so completion redirects to user's library/playlists
                        playTrack(track, rankedItems.map(i => i.track), 'search');
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl active:bg-[#1A1A20] transition-colors bg-[#131316] border ${
                      isExact
                        ? 'border-white/30 bg-gradient-to-r from-white/[0.08] to-transparent shadow-sm'
                        : 'border-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#1A1A20] ring-1 ring-white/10">
                        <img
                          src={track.artwork || '/logo.png'}
                          alt={track.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo.png';
                          }}
                        />
                        {isThisPlaying && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Pause className="w-5 h-5 fill-white text-white" />
                          </div>
                        )}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-1.5">
                          <p
                            className={`text-sm font-bold truncate ${
                              isThisPlaying
                                ? 'text-white font-extrabold drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]'
                                : 'text-white'
                            }`}
                          >
                            {track.title}
                          </p>
                          {isExact && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-gradient-to-r from-slate-200 via-white to-slate-300 text-black shadow-sm flex items-center space-x-1">
                              <CheckCircle2 className="w-2.5 h-2.5 inline stroke-[3]" />
                              <span>Exact Match</span>
                            </span>
                          )}
                          {isRecommended && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-white/10 text-slate-300 border border-white/10 flex items-center space-x-0.5">
                              <Sparkles className="w-2.5 h-2.5 inline text-slate-300" />
                              <span>Recommended</span>
                            </span>
                          )}
                        </div>
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

              <div className="pt-2 px-1 text-center">
                <p className="text-[11px] text-slate-500 font-medium">
                  🎵 Search playback will auto-continue to your imported & liked playlists
                </p>
              </div>
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

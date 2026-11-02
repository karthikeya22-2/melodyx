import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Play, Heart, Disc } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { api } from '../services/api';
import { Track } from '../types';

export const SearchPage: React.FC = () => {
  const { currentTrack, playTrack, likedTrackIds, toggleLike } = usePlayerStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'artists' | 'albums'>('all');

  const genres = [
    { name: 'Telugu', color: 'bg-[#B20710]' },
    { name: 'Bollywood', color: 'bg-[#8C0810]' },
    { name: 'Pop Hits', color: 'bg-[#5A080C]' },
    { name: 'Acoustic', color: 'bg-[#2E2E2E]' },
    { name: 'Romantic', color: 'bg-[#990000]' },
    { name: 'Dance', color: 'bg-[#7A060C]' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      api.search(query).then(setResults);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex-1 bg-[#090909] border border-[#1D1D1D] rounded-lg overflow-y-auto p-6 space-y-6 select-none">
      {/* Search Input */}
      <div className="relative max-w-lg">
        <SearchIcon className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by title, artist, or language..."
          className="w-full bg-[#181818] border border-neutral-700 text-white text-xs rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#E50914] placeholder-neutral-500"
          autoFocus
        />
      </div>

      {/* Tabs */}
      {query && (
        <div className="flex items-center space-x-2 border-b border-[#222222] pb-2">
          {(['all', 'songs', 'artists', 'albums'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-[#E50914] text-white'
                  : 'bg-[#181818] text-neutral-300 hover:bg-[#252525]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {query && results ? (
        <div className="space-y-4">
          <div className="space-y-1">
            {results.tracks.map((track: Track, idx: number) => {
              const isLiked = likedTrackIds.includes(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, results.tracks)}
                  className="flex items-center justify-between p-2 rounded hover:bg-[#1C1C1C] group cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className="w-4 text-center text-xs text-neutral-500 group-hover:hidden">
                      {idx + 1}
                    </span>
                    <Play className="w-4 h-4 text-[#E50914] fill-[#E50914] hidden group-hover:block" />
                    <img src={track.artwork} alt={track.title} className="w-9 h-9 rounded object-cover" />
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <p
                          className={`text-xs font-semibold truncate ${
                            currentTrack?.id === track.id ? 'text-[#E50914]' : 'text-white'
                          }`}
                        >
                          {track.title}
                        </p>
                        {track.isPreview && (
                          <span className="text-[9px] bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/40 px-1 rounded">
                            30s Preview
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleLike(track);
                      }}
                      className="p-1 text-neutral-400 hover:text-white"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isLiked ? 'text-[#E50914] fill-[#E50914]' : ''
                        }`}
                      />
                    </button>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Genres Grid */
        <div>
          <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-3">Browse Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {genres.map(g => (
              <div
                key={g.name}
                onClick={() => setQuery(g.name)}
                className={`h-24 rounded-lg p-3 ${g.color} relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity`}
              >
                <h3 className="font-bold text-sm text-white">{g.name}</h3>
                <Disc className="absolute -bottom-2 -right-2 w-12 h-12 text-black/20" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Search, X, MoreVertical, Disc } from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';
import { api } from '../services/api';
import { Track } from '../types';

export const SearchScreen: React.FC = () => {
  const { playTrack, currentTrack, isPlaying, openOptionsMenu } = useMobilePlayerStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);

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
    <div className="flex-1 overflow-y-auto bg-[#090909] select-none px-4 pt-5 pb-24 touch-scroll">
      <h1 className="text-2xl font-bold text-white tracking-tight mb-3">Search</h1>

      {/* Search Bar */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search songs, artists, or languages..."
          className="w-full bg-[#181818] border border-neutral-700 text-white font-medium text-xs rounded-lg pl-10 pr-9 py-2 focus:outline-none focus:border-[#E50914] placeholder-neutral-500 shadow-inner"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-2.5 p-0.5 text-neutral-400"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results or Categories */}
      {query && results ? (
        <div className="space-y-1">
          {results.tracks.map((track: Track) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, results.tracks)}
                className="flex items-center justify-between p-2 rounded-lg active:bg-[#1D1D1D] transition-colors"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <img src={track.artwork} alt={track.title} className="w-11 h-11 rounded object-cover shadow" />
                  <div className="truncate">
                    <div className="flex items-center space-x-1.5">
                      <p
                        className={`text-xs font-semibold truncate ${
                          isThisPlaying ? 'text-[#E50914]' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </p>
                      {track.isPreview && (
                        <span className="text-[8px] bg-[#E50914]/20 text-[#E50914] px-1 rounded">
                          Preview
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    openOptionsMenu(track);
                  }}
                  className="p-1.5 text-neutral-400 hover:text-white"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5">Categories</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {genres.map(g => (
              <div
                key={g.name}
                onClick={() => setQuery(g.name)}
                className={`h-20 rounded-lg p-3 ${g.color} relative overflow-hidden shadow cursor-pointer active:scale-95 transition-transform`}
              >
                <h3 className="font-bold text-xs text-white">{g.name}</h3>
                <Disc className="absolute -bottom-2 -right-2 w-12 h-12 text-black/20" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

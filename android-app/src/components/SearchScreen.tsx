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
    { name: 'Telugu', color: 'from-red-600 to-amber-700' },
    { name: 'Bollywood', color: 'from-orange-600 to-pink-600' },
    { name: 'Pop Hits', color: 'from-blue-600 to-indigo-800' },
    { name: 'Hip-Hop', color: 'from-emerald-600 to-teal-800' },
    { name: 'Romantic', color: 'from-rose-600 to-pink-600' },
    { name: 'Dance Party', color: 'from-purple-600 to-pink-800' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      api.search(query).then(setResults);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] select-none px-4 pt-6 pb-24 touch-scroll">
      <h1 className="text-3xl font-black text-white tracking-tight mb-4">Search</h1>

      {/* Mobile Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-3 w-5 h-5 text-neutral-800" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full bg-white text-black font-semibold text-sm rounded-lg pl-11 pr-10 py-2.5 focus:outline-none placeholder-neutral-500 shadow-md"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-2.5 p-0.5 text-neutral-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results or Genre Cards */}
      {query && results ? (
        <div className="space-y-2">
          {results.tracks.map((track: Track) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, results.tracks)}
                className="flex items-center justify-between p-2 rounded-lg active:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-3 truncate">
                  <img src={track.artwork} alt={track.title} className="w-12 h-12 rounded object-cover shadow" />
                  <div className="truncate">
                    <p
                      className={`text-sm font-bold truncate ${
                        isThisPlaying ? 'text-[#1DB954]' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </p>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    openOptionsMenu(track);
                  }}
                  className="p-2 text-neutral-400 hover:text-white"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <h2 className="text-base font-bold text-white mb-3">Browse all</h2>
          <div className="grid grid-cols-2 gap-3">
            {genres.map(g => (
              <div
                key={g.name}
                onClick={() => setQuery(g.name)}
                className={`h-24 rounded-lg p-3 bg-gradient-to-br ${g.color} relative overflow-hidden shadow-md cursor-pointer active:scale-95 transition-transform`}
              >
                <h3 className="font-extrabold text-sm text-white">{g.name}</h3>
                <Disc className="absolute -bottom-2 -right-2 w-14 h-14 text-black/20 transform rotate-12" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


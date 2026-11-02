import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Play, Pause, Heart, Disc, Music, User } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { api } from '../services/api';
import { Track } from '../types';

export const SearchPage: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, togglePlay, likedTrackIds, toggleLike } = usePlayerStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'artists' | 'albums'>('all');

  const genres = [
    { name: 'Telugu Hits', color: 'from-red-600 to-amber-700' },
    { name: 'Bollywood Romance', color: 'from-orange-600 to-pink-600' },
    { name: 'Global Pop', color: 'from-blue-600 to-indigo-800' },
    { name: 'Hip-Hop & Rap', color: 'from-emerald-600 to-teal-800' },
    { name: 'Acoustic & Lo-Fi', color: 'from-purple-600 to-pink-800' },
    { name: 'Tollywood Dance', color: 'from-amber-500 to-red-600' },
    { name: 'Punjabi Hits', color: 'from-yellow-600 to-orange-700' },
    { name: 'Late Night Chill', color: 'from-cyan-600 to-blue-900' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      api.search(query).then(setResults);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex-1 bg-[#121212] rounded-xl overflow-y-auto p-6 space-y-6 select-none">
      {/* Search Bar Input */}
      <div className="relative max-w-xl">
        <SearchIcon className="absolute left-4 top-3.5 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="What do you want to play? (e.g. Naatu Naatu, Kesariya, The Weeknd)"
          className="w-full bg-[#242424] text-white text-sm rounded-full pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 placeholder-neutral-400 shadow-inner"
          autoFocus
        />
      </div>

      {/* Tabs if query exists */}
      {query && (
        <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
          {(['all', 'songs', 'artists', 'albums'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
                activeTab === tab ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Search Results */}
      {query && results ? (
        <div className="space-y-6">
          {/* Top Result + Songs Table */}
          {(activeTab === 'all' || activeTab === 'songs') && results.tracks.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Result Card */}
              {activeTab === 'all' && (
                <div className="lg:col-span-1 bg-[#181818] hover:bg-[#282828] p-5 rounded-xl transition-all cursor-pointer group flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Top Result</h3>
                    <img
                      src={results.tracks[0].artwork}
                      alt={results.tracks[0].title}
                      className="w-24 h-24 rounded-lg object-cover shadow-lg mb-4"
                    />
                    <h2 className="text-2xl font-extrabold text-white truncate">{results.tracks[0].title}</h2>
                    <p className="text-sm text-neutral-400 mt-1">{results.tracks[0].artist}</p>
                    <span className="inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-white uppercase">
                      Song • {results.tracks[0].language || 'Hit'}
                    </span>
                  </div>
                  <button
                    onClick={() => playTrack(results.tracks[0], results.tracks)}
                    className="self-end w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                  >
                    <Play className="w-6 h-6 fill-black ml-0.5" />
                  </button>
                </div>
              )}

              {/* Songs List */}
              <div className={`${activeTab === 'all' ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-1`}>
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Songs</h3>
                {results.tracks.slice(0, activeTab === 'all' ? 5 : 20).map((track: Track, idx: number) => {
                  const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                  const isLiked = likedTrackIds.includes(track.id);

                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track, results.tracks)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10 group cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <span className="w-5 text-center text-xs text-neutral-400 group-hover:hidden">{idx + 1}</span>
                        <Play className="w-5 h-5 text-white fill-white hidden group-hover:block" />
                        <img src={track.artwork} alt={track.title} className="w-10 h-10 rounded object-cover" />
                        <div className="truncate">
                          <p className={`text-sm font-bold truncate ${currentTrack?.id === track.id ? 'text-[#1DB954]' : 'text-white'}`}>
                            {track.title}
                          </p>
                          <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleLike(track);
                          }}
                          className="p-1 text-neutral-400 hover:text-white"
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'text-[#1DB954] fill-[#1DB954]' : ''}`} />
                        </button>
                        <span className="text-xs text-neutral-400 w-10 text-right">
                          {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Browse All Genres */
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Browse all genres & languages</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map(g => (
              <div
                key={g.name}
                onClick={() => setQuery(g.name.split(' ')[0])}
                className={`h-36 rounded-xl p-4 bg-gradient-to-br ${g.color} relative overflow-hidden cursor-pointer shadow-md hover:scale-[1.02] transition-transform`}
              >
                <h3 className="font-extrabold text-xl text-white max-w-[70%]">{g.name}</h3>
                <Disc className="absolute -bottom-2 -right-2 w-20 h-20 text-black/20 transform rotate-12" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


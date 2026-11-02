import React from 'react';
import { Heart, Plus, Search, Disc3, ArrowDownCircle } from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';

export const LibraryScreen: React.FC = () => {
  const { likedTrackIds } = useMobilePlayerStore();

  const playlists = [
    { id: 'p1', title: 'Telugu Chartbusters', count: '14 songs', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' },
    { id: 'p2', title: 'Bollywood Romance', count: '22 songs', cover: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=300' },
    { id: 'p3', title: 'Lo-Fi Chill Beats', count: '30 songs', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] select-none px-4 pt-6 pb-24 touch-scroll">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xs font-black text-black">
            M
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Your Library</h1>
        </div>

        <div className="flex items-center space-x-3 text-neutral-400">
          <Search className="w-5 h-5 hover:text-white" />
          <Plus className="w-6 h-6 hover:text-white" />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center space-x-2 mb-4 overflow-x-auto no-scrollbar">
        {['Playlists', 'Artists', 'Albums', 'Downloaded'].map(chip => (
          <button
            key={chip}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white shrink-0 active:bg-white/20"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Liked Songs Tile */}
      <div className="flex items-center space-x-3 p-2 rounded-xl active:bg-white/5 cursor-pointer transition-colors mb-2">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
          <Heart className="w-8 h-8 text-white fill-white" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-white">Liked Songs</h3>
          <p className="text-xs text-neutral-400 mt-1">Playlist • {likedTrackIds.length} songs</p>
        </div>
      </div>

      {/* User Playlists */}
      <div className="space-y-1">
        {playlists.map(pl => (
          <div
            key={pl.id}
            className="flex items-center space-x-3 p-2 rounded-xl active:bg-white/5 cursor-pointer transition-colors"
          >
            <img src={pl.cover} alt={pl.title} className="w-16 h-16 rounded-lg object-cover shadow" />
            <div className="truncate">
              <h3 className="font-bold text-sm text-white truncate">{pl.title}</h3>
              <p className="text-xs text-neutral-400 mt-1 truncate">Playlist • {pl.count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


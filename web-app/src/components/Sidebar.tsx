import React from 'react';
import { Home, Search, Library, PlusSquare, Heart, Music, Disc3, Radio } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, likedTrackIds, setSelectedPlaylist } = usePlayerStore();

  const playlists = [
    { id: 'pl-telugu', title: 'Tollywood Top 50', desc: 'Telugu Chartbusters' },
    { id: 'pl-bollywood', title: 'Bollywood Romantic Melodies', desc: 'Soulful Hindi' },
    { id: 'pl-global', title: 'Today’s Global Hits', desc: 'English & Pop' },
    { id: 'pl-chill', title: 'Midnight Lo-Fi & Chill', desc: 'Relaxing Beats' }
  ];

  return (
    <aside className="w-64 bg-black flex flex-col h-full select-none border-r border-white/5 p-3 space-y-2">
      {/* Brand Header */}
      <div className="bg-[#121212] rounded-xl p-4">
        <div className="flex items-center space-x-3 mb-6 px-2 cursor-pointer" onClick={() => setCurrentView('home')}>
          <div className="w-9 h-9 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg shadow-[#1DB954]/20">
            <Radio className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center">
            Sound<span className="text-[#1DB954]">Wave</span>
          </span>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          <button
            onClick={() => setCurrentView('home')}
            className={`w-full flex items-center space-x-4 px-3 py-3 rounded-lg text-sm font-semibold transition-colors ${
              currentView === 'home'
                ? 'text-white bg-white/10'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setCurrentView('search')}
            className={`w-full flex items-center space-x-4 px-3 py-3 rounded-lg text-sm font-semibold transition-colors ${
              currentView === 'search'
                ? 'text-white bg-white/10'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
        </nav>
      </div>

      {/* Library Section */}
      <div className="bg-[#121212] rounded-xl p-3 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 text-neutral-400 hover:text-white cursor-pointer transition-colors">
          <div className="flex items-center space-x-3" onClick={() => setCurrentView('library')}>
            <Library className="w-5 h-5" />
            <span className="text-sm font-bold">Your Library</span>
          </div>
          <button className="p-1 hover:bg-white/10 rounded-full transition-colors" title="Create playlist">
            <PlusSquare className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tiles */}
        <div className="mt-2 space-y-1 pb-2 border-b border-white/5">
          <button
            onClick={() => setCurrentView('liked')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'liked' ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-xs leading-none">Liked Songs</p>
              <p className="text-[11px] text-neutral-400 mt-1">{likedTrackIds.length} tracks</p>
            </div>
          </button>
        </div>

        {/* User Playlists Scrollable List */}
        <div className="flex-1 overflow-y-auto mt-2 space-y-1 pr-1">
          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-3 py-1">Playlists</p>
          {playlists.map(pl => (
            <button
              key={pl.id}
              onClick={() => {
                setSelectedPlaylist({
                  id: pl.id,
                  title: pl.title,
                  description: pl.desc,
                  coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300'
                });
                setCurrentView('playlist');
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-neutral-300 hover:text-white hover:bg-white/5 transition-colors group"
            >
              <div className="w-7 h-7 rounded bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white">
                <Disc3 className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-medium truncate">{pl.title}</p>
                <p className="text-[10px] text-neutral-500 truncate">{pl.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};


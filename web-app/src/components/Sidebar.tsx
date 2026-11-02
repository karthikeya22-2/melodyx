import React from 'react';
import { Home, Search, Library, PlusSquare, Heart, Disc3, Radio } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, likedTrackIds, setSelectedPlaylist } = usePlayerStore();

  const categories = [
    { id: 'cat-telugu', title: 'Telugu Hits' },
    { id: 'cat-hindi', title: 'Bollywood Hits' },
    { id: 'cat-global', title: 'Global Pop' },
    { id: 'cat-acoustic', title: 'Acoustic' }
  ];

  return (
    <aside className="w-60 bg-[#090909] flex flex-col h-full select-none border-r border-[#1D1D1D] p-3 space-y-2">
      {/* Brand Header */}
      <div className="bg-[#151515] rounded-lg p-4 border border-[#222222]">
        <div
          className="flex items-center space-x-3 mb-5 px-1 cursor-pointer"
          onClick={() => setCurrentView('home')}
        >
          <div className="w-8 h-8 rounded bg-[#E50914] flex items-center justify-center shadow">
            <Radio className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white flex items-center">
            Sound<span className="text-[#E50914]">Wave</span>
          </span>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          <button
            onClick={() => setCurrentView('home')}
            className={`w-full flex items-center space-x-3.5 px-3 py-2.5 rounded text-xs font-semibold transition-colors ${
              currentView === 'home'
                ? 'text-white bg-[#222222] border-l-2 border-[#E50914]'
                : 'text-neutral-400 hover:text-white hover:bg-[#1C1C1C]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setCurrentView('search')}
            className={`w-full flex items-center space-x-3.5 px-3 py-2.5 rounded text-xs font-semibold transition-colors ${
              currentView === 'search'
                ? 'text-white bg-[#222222] border-l-2 border-[#E50914]'
                : 'text-neutral-400 hover:text-white hover:bg-[#1C1C1C]'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </nav>
      </div>

      {/* Library Section */}
      <div className="bg-[#151515] rounded-lg p-3 flex-1 flex flex-col overflow-hidden border border-[#222222]">
        <div className="flex items-center justify-between px-2 py-2 text-neutral-400 hover:text-white cursor-pointer transition-colors">
          <div className="flex items-center space-x-2.5" onClick={() => setCurrentView('library')}>
            <Library className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Your Library</span>
          </div>
          <button className="p-1 hover:bg-[#252525] rounded transition-colors" title="Create playlist">
            <PlusSquare className="w-4 h-4" />
          </button>
        </div>

        {/* Action Tiles */}
        <div className="mt-2 space-y-1 pb-2 border-b border-[#252525]">
          <button
            onClick={() => setCurrentView('liked')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
              currentView === 'liked'
                ? 'bg-[#222222] text-white border-l-2 border-[#E50914]'
                : 'text-neutral-300 hover:bg-[#1C1C1C] hover:text-white'
            }`}
          >
            <div className="w-7 h-7 rounded bg-gradient-to-br from-[#E50914] to-[#7A060C] flex items-center justify-center shrink-0">
              <Heart className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <div className="text-left truncate">
              <p className="font-semibold text-xs leading-none">Liked Songs</p>
              <p className="text-[10px] text-neutral-400 mt-1">{likedTrackIds.length} tracks</p>
            </div>
          </button>
        </div>

        {/* Categories / User Playlists List */}
        <div className="flex-1 overflow-y-auto mt-2 space-y-1 pr-1">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-2 py-1">
            Collections
          </p>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedPlaylist({
                  id: cat.id,
                  title: cat.title,
                  description: 'Curated collection',
                  coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300'
                });
                setCurrentView('playlist');
              }}
              className="w-full flex items-center space-x-2.5 px-2 py-2 rounded text-left text-neutral-400 hover:text-white hover:bg-[#1C1C1C] transition-colors group"
            >
              <Disc3 className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#E50914] shrink-0" />
              <span className="text-xs font-medium truncate">{cat.title}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

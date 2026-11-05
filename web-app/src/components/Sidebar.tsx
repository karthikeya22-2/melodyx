import React, { useState, useEffect } from 'react';
import { Home, Search, Library, Plus, Heart, Music, ListFilter, ArrowUpDown, Disc3, Radio, Settings, Sparkles } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { playlistStorage } from '../services/api';
import { ImportPlaylistModal } from './ImportPlaylistModal';
import { Playlist } from '../types';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, likedTrackIds, setSelectedPlaylist } = usePlayerStore();
  const [filterType, setFilterType] = useState<'all' | 'playlists' | 'artists'>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>(() => playlistStorage.getPlaylists());

  useEffect(() => {
    setCustomPlaylists(playlistStorage.getPlaylists());
  }, [currentView]);

  const curatedPlaylists = [
    {
      id: 'gen-telugu',
      title: 'Telugu Chartbusters',
      subtitle: 'Playlist • Tollywood Hits',
      coverUrl: 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg'
    },
    {
      id: 'gen-hindi',
      title: 'Bollywood Romance',
      subtitle: 'Playlist • Arijit & More',
      coverUrl: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg'
    },
    {
      id: 'gen-pop',
      title: 'Global Pop Anthems',
      subtitle: 'Playlist • Top 50 Global',
      coverUrl: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg'
    },
    {
      id: 'gen-acoustic',
      title: 'Acoustic & Chill',
      subtitle: 'Playlist • Unplugged Melodies',
      coverUrl: 'https://c.saavncdn.com/237/Geetha-Govindam-Telugu-2018-20180921-500x500.jpg'
    }
  ];

  return (
    <aside className="w-[280px] flex flex-col h-full select-none gap-2 shrink-0">
      {/* 1. TOP CARD: Navigation */}
      <div className="bg-[#0A0A0C] border border-white/5 rounded-xl p-4 space-y-4">
        {/* Brand */}
        <div
          className="flex items-center space-x-2.5 px-2 cursor-pointer group"
          onClick={() => setCurrentView('home')}
        >
          <img
            src="/logo.png"
            alt="Melodyx"
            className="w-8 h-8 rounded-lg object-cover shadow-md shadow-black/50 group-hover:scale-105 transition-transform ring-1 ring-white/10"
          />
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Melodyx
          </span>
        </div>

        {/* Primary Links */}
        <nav className="space-y-1">
          <button
            onClick={() => setCurrentView('home')}
            className={`w-full flex items-center space-x-4 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${
              currentView === 'home'
                ? 'text-white bg-[#131316] border border-white/5 shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#131316]/50'
            }`}
          >
            <Home className={`w-5 h-5 ${currentView === 'home' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : ''}`} />
            <span>Home</span>
          </button>

          <button
            onClick={() => setCurrentView('search')}
            className={`w-full flex items-center space-x-4 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${
              currentView === 'search'
                ? 'text-white bg-[#131316] border border-white/5 shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#131316]/50'
            }`}
          >
            <Search className={`w-5 h-5 ${currentView === 'search' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : ''}`} />
            <span>Search</span>
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center space-x-4 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${
              currentView === 'settings'
                ? 'text-white bg-[#131316] border border-white/5 shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#131316]/50'
            }`}
          >
            <Settings className={`w-5 h-5 ${currentView === 'settings' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : ''}`} />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* 2. BOTTOM CARD: Your Library */}
      <div className="bg-[#0A0A0C] border border-white/5 rounded-xl p-3 flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3 py-2">
          <button
            onClick={() => setCurrentView('library')}
            className={`flex items-center space-x-3 font-bold text-sm transition-colors ${
              currentView === 'library' ? 'text-white' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Library className="w-5 h-5" />
            <span>Your Library</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold text-black bg-gradient-to-b from-white via-slate-100 to-slate-300 hover:scale-105 active:scale-95 transition-all shadow-sm"
            title="Import playlist from Spotify, JioSaavn or YouTube"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Import</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 px-3 py-2">
          <button
            onClick={() => setFilterType(filterType === 'playlists' ? 'all' : 'playlists')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              filterType === 'playlists'
                ? 'bg-gradient-to-r from-white via-slate-100 to-slate-300 text-black shadow-sm'
                : 'bg-[#131316] text-[#94A3B8] hover:text-white border border-white/5'
            }`}
          >
            Playlists
          </button>
          <button
            onClick={() => setFilterType(filterType === 'artists' ? 'all' : 'artists')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              filterType === 'artists'
                ? 'bg-gradient-to-r from-white via-slate-100 to-slate-300 text-black shadow-sm'
                : 'bg-[#131316] text-[#94A3B8] hover:text-white border border-white/5'
            }`}
          >
            Artists
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center justify-between px-3 py-1.5 text-xs text-[#94A3B8]">
          <button className="p-1 hover:text-white transition-colors" title="Search in Library">
            <Search className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-1 hover:text-white cursor-pointer transition-colors text-[11px] font-medium">
            <span>Recents</span>
            <ListFilter className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Library Items Scroll List */}
        <div className="flex-1 overflow-y-auto space-y-0.5 mt-1 pr-1">
          {/* Liked Songs Tile */}
          <div
            onClick={() => setCurrentView('liked')}
            className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
              currentView === 'liked' ? 'bg-[#131316] border border-white/5' : 'hover:bg-[#131316]/60'
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-700 via-slate-800 to-[#131316] flex items-center justify-center shrink-0 shadow-md ring-1 ring-white/10">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="truncate flex-1">
              <p className={`text-sm font-semibold truncate ${currentView === 'liked' ? 'text-white font-bold' : 'text-slate-100'}`}>
                Liked Songs
              </p>
              <p className="text-xs text-[#94A3B8] truncate mt-0.5">
                Playlist • {likedTrackIds.length} {likedTrackIds.length === 1 ? 'song' : 'songs'}
              </p>
            </div>
          </div>

          {/* Custom Imported Playlists */}
          {customPlaylists.map(pl => (
            <div
              key={pl.id}
              onClick={() => {
                setSelectedPlaylist(pl);
                setCurrentView('playlist');
              }}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#131316] cursor-pointer transition-colors group"
            >
              <img
                src={pl.coverUrl}
                alt={pl.title}
                className="w-12 h-12 rounded-lg object-cover shrink-0 shadow ring-1 ring-white/5"
              />
              <div className="truncate flex-1">
                <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-white transition-colors">
                  {pl.title}
                </p>
                <p className="text-xs text-[#94A3B8] truncate mt-0.5">
                  📥 Imported • {pl.tracks?.length || pl.trackCount || 0} songs
                </p>
              </div>
            </div>
          ))}

          {/* Curated Playlists */}
          {curatedPlaylists.map(pl => (
            <div
              key={pl.id}
              onClick={() => {
                setSelectedPlaylist({
                  id: pl.id,
                  title: pl.title,
                  description: pl.subtitle,
                  coverUrl: pl.coverUrl
                });
                setCurrentView('playlist');
              }}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#131316] cursor-pointer transition-colors group"
            >
              <img
                src={pl.coverUrl}
                alt={pl.title}
                className="w-12 h-12 rounded-lg object-cover shrink-0 shadow ring-1 ring-white/5"
              />
              <div className="truncate flex-1">
                <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-white">
                  {pl.title}
                </p>
                <p className="text-xs text-[#94A3B8] truncate mt-0.5">{pl.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ImportPlaylistModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={(imported) => {
          setCustomPlaylists(playlistStorage.getPlaylists());
        }}
      />
    </aside>
  );
};

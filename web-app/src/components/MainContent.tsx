import React, { useEffect, useState } from 'react';
import { Play, Pause, Heart, ChevronLeft, ChevronRight, Disc } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { api } from '../services/api';
import { Track } from '../types';

export const MainContent: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, togglePlay, likedTrackIds, toggleLike } = usePlayerStore();
  const [feed, setFeed] = useState<any>(null);

  useEffect(() => {
    api.getHomeFeed().then(setFeed);
  }, []);

  if (!feed) {
    return (
      <div className="flex-1 bg-[#090909] rounded-lg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderTrackCard = (track: Track, queueList: Track[]) => {
    const isThisPlaying = currentTrack?.id === track.id && isPlaying;
    const isLiked = likedTrackIds.includes(track.id);

    return (
      <div
        key={track.id}
        className="group relative bg-[#1D1D1D] hover:bg-[#262626] p-3 rounded-lg border border-[#2A2A2A] transition-all duration-200 cursor-pointer flex flex-col"
        onClick={() => {
          if (currentTrack?.id === track.id) {
            togglePlay();
          } else {
            playTrack(track, queueList);
          }
        }}
      >
        <div className="relative aspect-square w-full rounded overflow-hidden bg-neutral-900 mb-2.5">
          <img
            src={track.artwork}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
            loading="lazy"
          />
          {track.isPreview && (
            <span className="absolute top-1.5 left-1.5 bg-[#E50914] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              30s Preview
            </span>
          )}
          {/* Red Play Button */}
          <button
            onClick={e => {
              e.stopPropagation();
              if (currentTrack?.id === track.id) {
                togglePlay();
              } else {
                playTrack(track, queueList);
              }
            }}
            className={`absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg transition-all duration-200 ${
              isThisPlaying
                ? 'opacity-100 scale-100'
                : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-[#F40612]'
            }`}
          >
            {isThisPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>
        </div>

        <div className="flex items-start justify-between">
          <div className="truncate pr-1">
            <h4
              className={`font-semibold text-xs truncate ${
                currentTrack?.id === track.id ? 'text-[#E50914]' : 'text-white'
              }`}
            >
              {track.title}
            </h4>
            <p className="text-[11px] text-neutral-400 truncate mt-0.5">{track.artist}</p>
          </div>
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
        </div>
      </div>
    );
  };

  return (
    <main className="flex-1 bg-[#090909] border border-[#1D1D1D] rounded-lg overflow-y-auto p-6 space-y-7 select-none">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between pb-2 border-b border-[#1D1D1D]">
        <div className="flex items-center space-x-2">
          <button className="w-7 h-7 rounded bg-[#181818] hover:bg-[#252525] text-neutral-400 hover:text-white flex items-center justify-center transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-7 h-7 rounded bg-[#181818] hover:bg-[#252525] text-neutral-400 hover:text-white flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#181818] px-3 py-1 rounded-full border border-neutral-800">
            <div className="w-5 h-5 rounded-full bg-[#E50914] flex items-center justify-center text-[10px] font-bold text-white">
              U
            </div>
            <span className="text-xs font-medium text-neutral-300">User Account</span>
          </div>
        </div>
      </header>

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{feed.greeting}</h1>
        <p className="text-xs text-neutral-400 mt-0.5">High-fidelity audio streaming across regional & global charts</p>
      </div>

      {/* Popular Telugu Songs */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white tracking-wide">Popular Telugu Songs</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {(feed.trendingTelugu || []).map((t: Track) => renderTrackCard(t, feed.trendingTelugu))}
        </div>
      </section>

      {/* Hindi Hits */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white tracking-wide">Hindi Hits</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {(feed.trendingHindi || []).map((t: Track) => renderTrackCard(t, feed.trendingHindi))}
        </div>
      </section>

      {/* English Hits */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white tracking-wide">English Hits</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {(feed.trendingEnglish || []).map((t: Track) => renderTrackCard(t, feed.trendingEnglish))}
        </div>
      </section>

      {/* Trending Albums */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white tracking-wide">Trending Albums</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(feed.trendingAlbums || []).map((alb: any) => (
            <div
              key={alb.id}
              className="bg-[#1D1D1D] hover:bg-[#262626] p-3 rounded-lg border border-[#2A2A2A] transition-all cursor-pointer group"
            >
              <div className="aspect-square rounded overflow-hidden mb-2.5">
                <img src={alb.artwork} alt={alb.title} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-semibold text-xs text-white truncate">{alb.title}</h4>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5">{alb.artist} • {alb.releaseDate}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Artists */}
      <section className="pb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white tracking-wide">Featured Artists</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(feed.recommendedArtists || []).map((artist: any) => (
            <div
              key={artist.id}
              className="bg-[#1D1D1D] hover:bg-[#262626] p-3 rounded-lg border border-[#2A2A2A] flex flex-col items-center text-center cursor-pointer transition-all"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden mb-2.5 border border-neutral-700">
                <img src={artist.artwork} alt={artist.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-semibold text-xs text-white truncate w-full">{artist.name}</h4>
              <p className="text-[10px] text-neutral-400 mt-0.5">{artist.genres ? artist.genres[0] : 'Artist'}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

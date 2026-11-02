import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';
import { api } from '../services/api';
import { Track } from '../types';

export const HomeScreen: React.FC = () => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useMobilePlayerStore();
  const [feed, setFeed] = useState<any>(null);

  useEffect(() => {
    api.getHomeFeed().then(setFeed);
  }, []);

  if (!feed) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#090909]">
        <div className="w-7 h-7 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderHorizontalCarousel = (title: string, tracks: Track[]) => (
    <section className="space-y-2.5">
      <div className="px-4">
        <h2 className="text-base font-bold text-white tracking-wide">{title}</h2>
      </div>

      <div className="flex overflow-x-auto space-x-3 px-4 no-scrollbar touch-scroll pb-1">
        {tracks.map(track => {
          const isThisPlaying = currentTrack?.id === track.id && isPlaying;
          return (
            <div
              key={track.id}
              onClick={() => {
                if (currentTrack?.id === track.id) togglePlay();
                else playTrack(track, tracks);
              }}
              className="w-32 shrink-0 cursor-pointer active:scale-95 transition-transform"
            >
              <div className="aspect-square w-full rounded overflow-hidden mb-2 relative bg-[#1D1D1D] border border-neutral-800">
                <img
                  src={track.artwork}
                  alt={track.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {isThisPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-ping" />
                  </div>
                )}
                {track.isPreview && (
                  <div className="absolute top-1 right-1 bg-[#E50914] text-[8px] font-bold text-white px-1 rounded">
                    30s
                  </div>
                )}
              </div>
              <h4
                className={`text-xs font-semibold truncate ${
                  currentTrack?.id === track.id ? 'text-[#E50914]' : 'text-white'
                }`}
              >
                {track.title}
              </h4>
              <p className="text-[10px] text-neutral-400 truncate mt-0.5">{track.artist}</p>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#090909] select-none pb-24 touch-scroll">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-[#181818]">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-full bg-[#E50914] flex items-center justify-center text-xs font-bold text-white shadow">
            U
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">{feed.greeting}</h1>
        </div>

        <button className="p-1 text-neutral-400 hover:text-white">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="pt-4 space-y-6">
        {renderHorizontalCarousel('Popular Telugu Songs', feed.trendingTelugu || [])}
        {renderHorizontalCarousel('Hindi Hits', feed.trendingHindi || [])}
        {renderHorizontalCarousel('English Hits', feed.trendingEnglish || [])}

        {/* Trending Albums */}
        <section className="space-y-2.5">
          <div className="px-4">
            <h2 className="text-base font-bold text-white tracking-wide">Trending Albums</h2>
          </div>
          <div className="flex overflow-x-auto space-x-3 px-4 no-scrollbar touch-scroll pb-1">
            {(feed.trendingAlbums || []).map((alb: any) => (
              <div key={alb.id} className="w-32 shrink-0 cursor-pointer">
                <div className="aspect-square w-full rounded overflow-hidden mb-1.5 bg-[#1D1D1D] border border-neutral-800">
                  <img src={alb.artwork} alt={alb.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-xs font-semibold text-white truncate">{alb.title}</h4>
                <p className="text-[10px] text-neutral-400 truncate mt-0.5">{alb.artist}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Artists */}
        <section className="space-y-2.5">
          <div className="px-4">
            <h2 className="text-base font-bold text-white tracking-wide">Featured Artists</h2>
          </div>
          <div className="flex overflow-x-auto space-x-3.5 px-4 no-scrollbar touch-scroll pb-2">
            {(feed.recommendedArtists || []).map((artist: any) => (
              <div key={artist.id} className="w-20 shrink-0 flex flex-col items-center text-center cursor-pointer">
                <div className="w-16 h-16 rounded-full overflow-hidden mb-1.5 border border-neutral-700">
                  <img src={artist.artwork} alt={artist.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-[10px] font-semibold text-white truncate w-full">{artist.name}</h4>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Settings, Sparkles, Flame, Headphones, MoreVertical } from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';
import { api } from '../services/api';
import { Track } from '../types';

export const HomeScreen: React.FC = () => {
  const { playTrack, currentTrack, isPlaying, togglePlay, openOptionsMenu } = useMobilePlayerStore();
  const [feed, setFeed] = useState<any>(null);

  useEffect(() => {
    api.getHomeFeed().then(setFeed);
  }, []);

  if (!feed) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#121212]">
        <div className="w-8 h-8 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderHorizontalCarousel = (title: string, subtitle: string, tracks: Track[]) => (
    <section className="space-y-3">
      <div className="px-4">
        <h2 className="text-xl font-extrabold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Horizontal Scroll Carousel */}
      <div className="flex overflow-x-auto space-x-3.5 px-4 no-scrollbar touch-scroll pb-2">
        {tracks.map(track => {
          const isThisPlaying = currentTrack?.id === track.id && isPlaying;
          return (
            <div
              key={track.id}
              onClick={() => {
                if (currentTrack?.id === track.id) togglePlay();
                else playTrack(track, tracks);
              }}
              className="w-36 shrink-0 cursor-pointer active:scale-95 transition-transform"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden mb-2 relative bg-neutral-800 shadow-md">
                <img
                  src={track.artwork}
                  alt={track.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {isThisPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#1DB954] animate-ping" />
                  </div>
                )}
              </div>
              <h4
                className={`text-xs font-bold truncate ${
                  currentTrack?.id === track.id ? 'text-[#1DB954]' : 'text-white'
                }`}
              >
                {track.title}
              </h4>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5">{track.artist}</p>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#2a1d35]/60 via-[#121212] to-[#121212] select-none pb-24 touch-scroll">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xs font-black text-black shadow">
            M
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{feed.greeting}</h1>
        </div>

        <button className="p-2 text-neutral-300 hover:text-white">
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* 2-Column Recently Played Pill Cards */}
      <section className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-2">
          {feed.recentlyPlayed.slice(0, 6).map((track: Track) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <div
                key={track.id}
                onClick={() => {
                  if (currentTrack?.id === track.id) togglePlay();
                  else playTrack(track, feed.recentlyPlayed);
                }}
                className="flex items-center bg-[#282828]/80 hover:bg-[#333333] active:bg-[#404040] rounded-md overflow-hidden cursor-pointer shadow transition-colors"
              >
                <img src={track.artwork} alt={track.title} className="w-12 h-12 object-cover shrink-0" />
                <span className="text-[11px] font-bold text-white px-2.5 truncate flex-1 leading-snug">
                  {track.title}
                </span>
                {isThisPlaying && <div className="w-2 h-2 rounded-full bg-[#1DB954] mr-2 shrink-0" />}
              </div>
            );
          })}
        </div>
      </section>

      {/* Carousels */}
      <div className="space-y-7">
        {renderHorizontalCarousel('Made For You', 'Personalized tailored picks', feed.madeForYou)}
        {renderHorizontalCarousel('Popular Telugu Songs', 'Tollywood anthems & melodies', feed.teluguHits)}
        {renderHorizontalCarousel('Hindi Hits', 'Bollywood chartbusters & romantic soul', feed.hindiHits)}
        {renderHorizontalCarousel('English Hits', 'Global pop & chart toppers', feed.englishHits)}

        {/* Trending Albums */}
        <section className="space-y-3">
          <div className="px-4 flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-extrabold text-white tracking-tight">Trending Albums</h2>
          </div>
          <div className="flex overflow-x-auto space-x-3.5 px-4 no-scrollbar touch-scroll">
            {feed.trendingAlbums.map((alb: any) => (
              <div key={alb.id} className="w-36 shrink-0 cursor-pointer">
                <div className="aspect-square w-full rounded-xl overflow-hidden mb-2 shadow">
                  <img src={alb.artwork} alt={alb.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-xs font-bold text-white truncate">{alb.title}</h4>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">{alb.artist}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended Artists (Circular Avatars) */}
        <section className="space-y-3">
          <div className="px-4">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Artists You Love</h2>
          </div>
          <div className="flex overflow-x-auto space-x-4 px-4 no-scrollbar touch-scroll">
            {feed.recommendedArtists.map((artist: any) => (
              <div key={artist.id} className="w-24 shrink-0 flex flex-col items-center text-center cursor-pointer">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-2 shadow-lg">
                  <img src={artist.artwork} alt={artist.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-[11px] font-bold text-white truncate w-full">{artist.name}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* Mood & Vibe Collections */}
        <section className="space-y-3 px-4">
          <div className="flex items-center space-x-2">
            <Headphones className="w-5 h-5 text-[#1DB954]" />
            <h2 className="text-xl font-extrabold text-white tracking-tight">Mood & Vibes</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {feed.moodPlaylists.map((m: any) => (
              <div key={m.id} className="h-28 rounded-xl overflow-hidden relative shadow-lg cursor-pointer">
                <img src={m.coverUrl} alt={m.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 flex flex-col justify-end">
                  <p className="text-xs font-black text-white">{m.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};


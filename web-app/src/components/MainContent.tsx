import React, { useEffect, useState } from 'react';
import { Play, Pause, Heart, ChevronLeft, ChevronRight, User, Sparkles, Flame, Headphones } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { api } from '../services/api';
import { Track } from '../types';

export const MainContent: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, togglePlay, likedTrackIds, toggleLike } = usePlayerStore();
  const [feed, setFeed] = useState<any>(null);

  useEffect(() => {
    api.getHomeFeed().then(data => setFeed(data));
  }, []);

  if (!feed) {
    return (
      <div className="flex-1 bg-[#121212] rounded-xl flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderTrackCard = (track: Track, queueList: Track[]) => {
    const isThisPlaying = currentTrack?.id === track.id && isPlaying;
    const isLiked = likedTrackIds.includes(track.id);

    return (
      <div
        key={track.id}
        className="group relative bg-[#181818] hover:bg-[#282828] p-3.5 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 cursor-pointer flex flex-col"
        onClick={() => {
          if (currentTrack?.id === track.id) {
            togglePlay();
          } else {
            playTrack(track, queueList);
          }
        }}
      >
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-900 mb-3 shadow-md">
          <img
            src={track.artwork}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Floating Green Play Button */}
          <button
            onClick={e => {
              e.stopPropagation();
              if (currentTrack?.id === track.id) {
                togglePlay();
              } else {
                playTrack(track, queueList);
              }
            }}
            className={`absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl transition-all duration-300 transform ${
              isThisPlaying
                ? 'opacity-100 scale-100'
                : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 hover:bg-[#1ed760]'
            }`}
          >
            {isThisPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
          </button>
        </div>

        <div className="flex items-start justify-between">
          <div className="truncate pr-2">
            <h4
              className={`font-bold text-sm truncate ${
                currentTrack?.id === track.id ? 'text-[#1DB954]' : 'text-white'
              }`}
            >
              {track.title}
            </h4>
            <p className="text-xs text-neutral-400 truncate mt-1">{track.artist}</p>
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              toggleLike(track);
            }}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                isLiked ? 'text-[#1DB954] fill-[#1DB954]' : 'hover:scale-110'
              }`}
            />
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="flex-1 bg-gradient-to-b from-[#1e3a29]/40 via-[#121212] to-[#121212] rounded-xl overflow-y-auto p-6 space-y-8 select-none">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between sticky top-0 bg-[#121212]/80 backdrop-blur-md z-20 py-2 -mt-2">
        <div className="flex items-center space-x-2">
          <button className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-full border border-white/10 cursor-pointer transition-colors">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xs font-bold text-black">
              U
            </div>
            <span className="text-xs font-semibold text-white">Music Explorer</span>
          </div>
        </div>
      </header>

      {/* Greeting Banner & Quick Cards */}
      <section>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-5">{feed.greeting}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {feed.recentlyPlayed.map((track: Track) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <div
                key={track.id}
                onClick={() => {
                  if (currentTrack?.id === track.id) togglePlay();
                  else playTrack(track, feed.recentlyPlayed);
                }}
                className="group flex items-center bg-white/5 hover:bg-white/15 rounded-md overflow-hidden cursor-pointer transition-all duration-200"
              >
                <img src={track.artwork} alt={track.title} className="w-16 h-16 object-cover shadow" />
                <span className="font-bold text-sm text-white px-4 truncate flex-1">{track.title}</span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (currentTrack?.id === track.id) togglePlay();
                    else playTrack(track, feed.recentlyPlayed);
                  }}
                  className={`mr-4 w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-lg transition-all duration-200 ${
                    isThisPlaying
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 group-hover:opacity-100 group-hover:scale-100'
                  }`}
                >
                  {isThisPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Made For You */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#1DB954]" />
            <h2 className="text-xl font-bold text-white tracking-tight">Made For You</h2>
          </div>
          <span className="text-xs font-bold text-neutral-400 hover:text-white cursor-pointer uppercase tracking-wider">Show all</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {feed.madeForYou.map((track: Track) => renderTrackCard(track, feed.madeForYou))}
        </div>
      </section>

      {/* Popular Telugu Songs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Popular Telugu Songs</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Tollywood chartbusters & timeless melodies</p>
          </div>
          <span className="text-xs font-bold text-neutral-400 hover:text-white cursor-pointer uppercase tracking-wider">Show all</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {feed.teluguHits.map((track: Track) => renderTrackCard(track, feed.teluguHits))}
        </div>
      </section>

      {/* Hindi Hits */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Hindi Hits</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Bollywood romance, soulful ballads, & upbeat rhythms</p>
          </div>
          <span className="text-xs font-bold text-neutral-400 hover:text-white cursor-pointer uppercase tracking-wider">Show all</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {feed.hindiHits.map((track: Track) => renderTrackCard(track, feed.hindiHits))}
        </div>
      </section>

      {/* English Hits */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">English Hits</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Global pop sensations & chart leaders</p>
          </div>
          <span className="text-xs font-bold text-neutral-400 hover:text-white cursor-pointer uppercase tracking-wider">Show all</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {feed.englishHits.map((track: Track) => renderTrackCard(track, feed.englishHits))}
        </div>
      </section>

      {/* Trending Albums */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-white tracking-tight">Trending Albums</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {feed.trendingAlbums.map((alb: any) => (
            <div
              key={alb.id}
              className="bg-[#181818] hover:bg-[#282828] p-4 rounded-xl cursor-pointer transition-all duration-200 group"
            >
              <div className="aspect-square rounded-lg overflow-hidden mb-3 shadow">
                <img src={alb.artwork} alt={alb.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h4 className="font-bold text-sm text-white truncate">{alb.title}</h4>
              <p className="text-xs text-neutral-400 truncate mt-1">{alb.artist} • {alb.releaseDate}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Artists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Recommended Artists</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {feed.recommendedArtists.map((artist: any) => (
            <div
              key={artist.id}
              className="bg-[#181818] hover:bg-[#282828] p-4 rounded-xl flex flex-col items-center text-center cursor-pointer transition-all duration-200 group"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden mb-3 shadow-lg">
                <img src={artist.artwork} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h4 className="font-bold text-sm text-white truncate w-full">{artist.name}</h4>
              <p className="text-xs text-neutral-400 mt-1 capitalize">Artist</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mood Collections */}
      <section className="pb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Headphones className="w-5 h-5 text-[#1DB954]" />
            <h2 className="text-xl font-bold text-white tracking-tight">Mood & Vibe Collections</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {feed.moodPlaylists.map((mood: any) => (
            <div
              key={mood.id}
              className="relative h-44 rounded-xl overflow-hidden cursor-pointer group shadow-lg"
            >
              <img src={mood.coverUrl} alt={mood.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end">
                <h4 className="font-extrabold text-lg text-white">{mood.title}</h4>
                <p className="text-xs text-neutral-300 mt-1 line-clamp-1">{mood.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};


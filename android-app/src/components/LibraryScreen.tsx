import React from 'react';
import { Heart, Plus, Search, Disc3 } from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';

export const LibraryScreen: React.FC = () => {
  const { likedTrackIds } = useMobilePlayerStore();

  return (
    <div className="flex-1 overflow-y-auto bg-[#090909] select-none px-4 pt-5 pb-24 touch-scroll">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#181818]">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-full bg-[#E50914] flex items-center justify-center text-xs font-bold text-white">
            U
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Your Library</h1>
        </div>

        <div className="flex items-center space-x-2 text-neutral-400">
          <button className="p-1 hover:text-white">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Liked Songs Tile */}
      <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-[#151515] border border-[#222222] active:bg-[#1D1D1D] cursor-pointer transition-colors mb-3">
        <div className="w-12 h-12 rounded bg-gradient-to-br from-[#E50914] to-[#7A060C] flex items-center justify-center shadow">
          <Heart className="w-6 h-6 text-white fill-white" />
        </div>
        <div>
          <h3 className="font-semibold text-xs text-white">Liked Songs</h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            {likedTrackIds.length === 0
              ? 'No songs saved yet'
              : `${likedTrackIds.length} ${likedTrackIds.length === 1 ? 'song' : 'songs'}`}
          </p>
        </div>
      </div>

      {/* Clean Empty State or Playlist List */}
      {likedTrackIds.length === 0 ? (
        <div className="text-center py-12 px-6 space-y-2 border border-dashed border-[#262626] rounded-xl my-4">
          <Disc3 className="w-8 h-8 text-neutral-600 mx-auto" />
          <h4 className="text-xs font-bold text-neutral-300">Your collection is empty</h4>
          <p className="text-[11px] text-neutral-500 max-w-xs mx-auto leading-relaxed">
            Tap the heart on any track while listening to add it to your personal library.
          </p>
        </div>
      ) : null}
    </div>
  );
};

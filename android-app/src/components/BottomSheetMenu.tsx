import React from 'react';
import { Heart, PlusCircle, ArrowDownCircle, User, Share2, X } from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';

export const BottomSheetMenu: React.FC = () => {
  const {
    isOptionsMenuOpen,
    closeOptionsMenu,
    selectedTrackForOptions,
    likedTrackIds,
    toggleLike
  } = useMobilePlayerStore();

  if (!isOptionsMenuOpen || !selectedTrackForOptions) return null;

  const isLiked = likedTrackIds.includes(selectedTrackForOptions.id);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end select-none"
      onClick={closeOptionsMenu}
    >
      <div
        className="bg-[#242424] rounded-t-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Track Preview Header */}
        <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
          <img
            src={selectedTrackForOptions.artwork}
            alt={selectedTrackForOptions.title}
            className="w-12 h-12 rounded object-cover shadow"
          />
          <div className="truncate flex-1">
            <h3 className="font-bold text-sm text-white truncate">{selectedTrackForOptions.title}</h3>
            <p className="text-xs text-neutral-400 truncate mt-0.5">{selectedTrackForOptions.artist}</p>
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-1 text-sm font-semibold text-neutral-200">
          <button
            onClick={() => {
              toggleLike(selectedTrackForOptions);
              closeOptionsMenu();
            }}
            className="w-full flex items-center space-x-4 py-3 px-2 rounded-lg active:bg-white/10"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'text-[#1DB954] fill-[#1DB954]' : ''}`} />
            <span>{isLiked ? 'Remove from Liked Songs' : 'Like'}</span>
          </button>

          <button
            onClick={closeOptionsMenu}
            className="w-full flex items-center space-x-4 py-3 px-2 rounded-lg active:bg-white/10"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add to playlist</span>
          </button>

          <button
            onClick={closeOptionsMenu}
            className="w-full flex items-center space-x-4 py-3 px-2 rounded-lg active:bg-white/10"
          >
            <ArrowDownCircle className="w-5 h-5" />
            <span>Download for offline listening</span>
          </button>

          <button
            onClick={closeOptionsMenu}
            className="w-full flex items-center space-x-4 py-3 px-2 rounded-lg active:bg-white/10"
          >
            <User className="w-5 h-5" />
            <span>View artist</span>
          </button>

          <button
            onClick={closeOptionsMenu}
            className="w-full flex items-center space-x-4 py-3 px-2 rounded-lg active:bg-white/10"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>

        <button
          onClick={closeOptionsMenu}
          className="w-full py-3 bg-white/10 rounded-xl text-center text-xs font-bold text-white uppercase tracking-wider"
        >
          Close
        </button>
      </div>
    </div>
  );
};


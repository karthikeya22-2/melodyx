import React from 'react';
import { Heart, PlusCircle, ArrowDownCircle, Share2 } from 'lucide-react';
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
      className="fixed inset-0 z-50 bg-black/80 flex flex-col justify-end select-none"
      onClick={closeOptionsMenu}
    >
      <div
        className="bg-[#151515] rounded-t-xl p-4 space-y-3 max-h-[75vh] border-t border-[#262626]"
        onClick={e => e.stopPropagation()}
      >
        {/* Track Preview Header */}
        <div className="flex items-center space-x-3 pb-3 border-b border-[#242424]">
          <img
            src={selectedTrackForOptions.artwork}
            alt={selectedTrackForOptions.title}
            className="w-11 h-11 rounded object-cover shadow"
          />
          <div className="truncate flex-1">
            <h3 className="font-semibold text-xs text-white truncate">{selectedTrackForOptions.title}</h3>
            <p className="text-[10px] text-neutral-400 truncate mt-0.5">{selectedTrackForOptions.artist}</p>
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-0.5 text-xs font-semibold text-neutral-300">
          <button
            onClick={() => {
              toggleLike(selectedTrackForOptions);
              closeOptionsMenu();
            }}
            className="w-full flex items-center space-x-3 py-2.5 px-2 rounded active:bg-[#202020]"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'text-[#E50914] fill-[#E50914]' : ''}`} />
            <span>{isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}</span>
          </button>

          <button
            onClick={closeOptionsMenu}
            className="w-full flex items-center space-x-3 py-2.5 px-2 rounded active:bg-[#202020]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add to playlist</span>
          </button>

          <button
            onClick={closeOptionsMenu}
            className="w-full flex items-center space-x-3 py-2.5 px-2 rounded active:bg-[#202020]"
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>Download track</span>
          </button>

          <button
            onClick={closeOptionsMenu}
            className="w-full flex items-center space-x-3 py-2.5 px-2 rounded active:bg-[#202020]"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        <button
          onClick={closeOptionsMenu}
          className="w-full py-2.5 bg-[#202020] rounded-lg text-center text-xs font-semibold text-neutral-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

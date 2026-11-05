import React from 'react';
import { Heart, PlusCircle, ArrowDownCircle, Share2, Disc3 } from 'lucide-react';
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
        className="bg-[#131316] rounded-t-2xl p-5 space-y-4 max-h-[75vh] border-t border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Track Preview Header */}
        <div className="flex items-center space-x-3.5 pb-3 border-b border-white/10">
          <img
            src={selectedTrackForOptions.artwork}
            alt={selectedTrackForOptions.title}
            className="w-12 h-12 rounded-lg object-cover shadow-md shrink-0 ring-1 ring-white/10"
          />
          <div className="truncate flex-1">
            <h3 className="font-bold text-sm text-white truncate">{selectedTrackForOptions.title}</h3>
            <p className="text-xs text-[#94A3B8] truncate mt-0.5">{selectedTrackForOptions.artist}</p>
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-1 text-sm font-semibold text-white">
          <button
            onClick={() => {
              toggleLike(selectedTrackForOptions);
              closeOptionsMenu();
            }}
            className="w-full flex items-center space-x-3.5 py-3 px-2 rounded-lg active:bg-[#1A1A20] text-left transition-colors"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'text-white fill-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]' : 'text-[#94A3B8]'}`} />
            <span>{isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}</span>
          </button>

          <button
            onClick={closeOptionsMenu}
            className="w-full flex items-center space-x-3.5 py-3 px-2 rounded-lg active:bg-[#1A1A20] text-left transition-colors"
          >
            <PlusCircle className="w-5 h-5 text-[#94A3B8]" />
            <span>Add to playlist</span>
          </button>

          <button
            onClick={closeOptionsMenu}
            className="w-full flex items-center space-x-3.5 py-3 px-2 rounded-lg active:bg-[#1A1A20] text-left transition-colors"
          >
            <Disc3 className="w-5 h-5 text-[#94A3B8]" />
            <span>View album</span>
          </button>

          <button
            onClick={closeOptionsMenu}
            className="w-full flex items-center space-x-3.5 py-3 px-2 rounded-lg active:bg-[#1A1A20] text-left transition-colors"
          >
            <Share2 className="w-5 h-5 text-[#94A3B8]" />
            <span>Share</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={closeOptionsMenu}
          className="w-full py-3 bg-[#1A1A20] hover:bg-[#22222A] rounded-full text-center text-sm font-bold text-white active:scale-98 border border-white/10 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};

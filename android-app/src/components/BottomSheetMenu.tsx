import React, { useState } from 'react';
import { Heart, PlusCircle, Share2, Disc3, Check } from 'lucide-react';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';
import { AddToPlaylistModal } from './AddToPlaylistModal';

export const BottomSheetMenu: React.FC = () => {
  const {
    isOptionsMenuOpen,
    closeOptionsMenu,
    selectedTrackForOptions,
    likedTrackIds,
    toggleLike,
    setCurrentTab
  } = useMobilePlayerStore();

  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOptionsMenuOpen || !selectedTrackForOptions) return null;

  const isLiked = likedTrackIds.includes(selectedTrackForOptions.id);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleShare = async () => {
    const track = selectedTrackForOptions;
    if (navigator.share) {
      try {
        await navigator.share({
          title: track.title,
          text: `Listen to "${track.title}" by ${track.artist} on Melodyx!`,
          url: 'https://melodyxdownload.vercel.app'
        });
        closeOptionsMenu();
        return;
      } catch (e) { }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`"${track.title}" by ${track.artist} - Melodyx Music: https://melodyxdownload.vercel.app`);
        showToast('Track link copied to clipboard!');
        setTimeout(closeOptionsMenu, 1200);
        return;
      } catch (e) { }
    }

    showToast(`Sharing "${track.title}"`);
    setTimeout(closeOptionsMenu, 1000);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80 flex flex-col justify-end select-none animate-fadeIn"
        onClick={closeOptionsMenu}
      >
        <div
          className="bg-[#131316] rounded-t-3xl p-5 space-y-4 max-h-[75vh] border-t border-white/10 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Toast Notification */}
          {toastMsg && (
            <div className="p-2.5 rounded-xl bg-white text-black text-xs font-bold text-center shadow-lg">
              {toastMsg}
            </div>
          )}

          {/* Track Preview Header */}
          <div className="flex items-center space-x-3.5 pb-3 border-b border-white/10">
            <img
              src={selectedTrackForOptions.artwork || '/logo.png'}
              alt={selectedTrackForOptions.title}
              className="w-12 h-12 rounded-xl object-cover shadow-md shrink-0 ring-1 ring-white/10"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
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
              className="w-full flex items-center space-x-3.5 py-3 px-2 rounded-xl active:bg-[#1A1A20] text-left transition-colors"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'text-white fill-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]' : 'text-[#94A3B8]'}`} />
              <span>{isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}</span>
            </button>

            {/* Add to Playlist Action */}
            <button
              onClick={() => setIsAddToPlaylistOpen(true)}
              className="w-full flex items-center space-x-3.5 py-3 px-2 rounded-xl active:bg-[#1A1A20] text-left transition-colors"
            >
              <PlusCircle className="w-5 h-5 text-[#94A3B8]" />
              <span>Add to playlist</span>
            </button>

            <button
              onClick={() => {
                closeOptionsMenu();
                setCurrentTab('search');
              }}
              className="w-full flex items-center space-x-3.5 py-3 px-2 rounded-xl active:bg-[#1A1A20] text-left transition-colors"
            >
              <Disc3 className="w-5 h-5 text-[#94A3B8]" />
              <span>{selectedTrackForOptions.album ? `Album: ${selectedTrackForOptions.album}` : 'Search more tracks'}</span>
            </button>

            <button
              onClick={handleShare}
              className="w-full flex items-center space-x-3.5 py-3 px-2 rounded-xl active:bg-[#1A1A20] text-left transition-colors"
            >
              <Share2 className="w-5 h-5 text-[#94A3B8]" />
              <span>Share song</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={closeOptionsMenu}
            className="w-full py-3 bg-[#1A1A20] hover:bg-[#22222A] rounded-2xl text-center text-sm font-bold text-white active:scale-98 border border-white/10 transition-all"
          >
            Close
          </button>
        </div>
      </div>

      {/* Add To Playlist Modal */}
      {isAddToPlaylistOpen && (
        <AddToPlaylistModal
          isOpen={isAddToPlaylistOpen}
          track={selectedTrackForOptions}
          onClose={() => {
            setIsAddToPlaylistOpen(false);
            closeOptionsMenu();
          }}
        />
      )}
    </>
  );
};

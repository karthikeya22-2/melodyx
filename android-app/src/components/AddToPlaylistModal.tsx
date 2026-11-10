import React, { useState, useEffect } from 'react';
import { X, Plus, Music2, Check, AlertCircle, CheckCircle2, ListMusic } from 'lucide-react';
import { Track, Playlist } from '../types';
import { playlistStorage } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  track: Track | null;
  onClose: () => void;
  onAdded?: (playlistTitle: string) => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  track,
  onClose,
  onAdded
}) => {
  const { user } = useAuthStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPlaylists(playlistStorage.getPlaylists());
      setFeedback(null);
      setNewTitle('');
      setIsCreating(false);
    }
  }, [isOpen]);

  if (!isOpen || !track) return null;

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      if (type === 'success') {
        onClose();
      } else {
        setFeedback(null);
      }
    }, 1500);
  };

  const handleSelectPlaylist = (pl: Playlist) => {
    const existingTracks: Track[] = pl.tracks || [];

    // Duplicate check by ID or Title + Artist
    const isDuplicate = existingTracks.some(
      t => t.id === track.id ||
      (t.title.trim().toLowerCase() === track.title.trim().toLowerCase() &&
       t.artist.trim().toLowerCase() === track.artist.trim().toLowerCase())
    );

    if (isDuplicate) {
      showFeedback('error', `"${track.title}" is already in "${pl.title}".`);
      return;
    }

    const updatedTracks = [...existingTracks, track];
    const updatedPlaylist: Playlist = {
      ...pl,
      tracks: updatedTracks,
      trackCount: updatedTracks.length,
      coverUrl: (!pl.coverUrl || pl.coverUrl.includes('RRR')) ? track.artwork : pl.coverUrl
    };

    const saved = playlistStorage.savePlaylist(updatedPlaylist);
    setPlaylists(saved);
    showFeedback('success', `Added to "${pl.title}"!`);
    if (onAdded) onAdded(pl.title);
  };

  const handleCreateNewPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) {
      showFeedback('error', 'Please enter a playlist name.');
      return;
    }

    // Check if user already has a playlist with this name
    const nameExists = playlists.some(p => p.title.toLowerCase() === title.toLowerCase());
    if (nameExists) {
      showFeedback('error', `A playlist named "${title}" already exists.`);
      return;
    }

    const newPlaylist: Playlist = {
      id: 'pl-' + Date.now(),
      title,
      description: `Created by ${user?.displayName || 'User'}`,
      coverUrl: track.artwork || '/logo.png',
      trackCount: 1,
      tracks: [track],
      source: 'custom'
    };

    const saved = playlistStorage.savePlaylist(newPlaylist);
    setPlaylists(saved);
    setNewTitle('');
    setIsCreating(false);
    showFeedback('success', `Created "${title}" and added song!`);
    if (onAdded) onAdded(title);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex flex-col justify-end select-none animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#131316] rounded-t-3xl p-5 space-y-4 max-h-[80vh] border-t border-white/10 shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <ListMusic className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm text-white truncate">Add to Playlist</h3>
              <p className="text-[11px] text-[#94A3B8] truncate">{track.title} • {track.artist}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#888] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div
            className={`p-2.5 rounded-xl flex items-center space-x-2 text-xs font-semibold shrink-0 transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-950/60 border border-red-500/30 text-red-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="truncate">{feedback.message}</span>
          </div>
        )}

        {/* Inline Create New Playlist Section */}
        <div className="shrink-0">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center space-x-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-colors active:scale-98"
            >
              <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center shadow">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span>Create New Playlist</span>
            </button>
          ) : (
            <form onSubmit={handleCreateNewPlaylist} className="p-3 rounded-2xl bg-[#1A1A20] border border-white/15 space-y-2.5">
              <p className="text-[11px] font-bold text-white">New Playlist Name</p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. My Favorites, Telugu Hits..."
                  className="flex-1 bg-[#0A0A0C] border border-white/15 focus:border-white/50 focus:outline-none rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-white via-slate-100 to-slate-200 text-black font-extrabold text-xs rounded-xl shadow active:scale-95"
                >
                  Create & Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewTitle('');
                  }}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* User's Actual Library Playlists */}
        <div className="flex-1 overflow-y-auto space-y-1.5 touch-scroll pr-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#888] px-1 pt-1">
            Your Playlists ({playlists.length})
          </p>

          {playlists.length > 0 ? (
            playlists.map(pl => {
              const count = pl.tracks?.length || pl.trackCount || 0;
              const isAlreadyIn = pl.tracks && pl.tracks.some(t => t.id === track.id);

              return (
                <div
                  key={pl.id}
                  onClick={() => handleSelectPlaylist(pl)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer border ${
                    isAlreadyIn
                      ? 'bg-[#181820] border-white/5 opacity-80'
                      : 'bg-[#1A1A20] hover:bg-[#24242C] border-white/5 hover:border-white/20 active:scale-98'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    {pl.coverUrl ? (
                      <img
                        src={pl.coverUrl}
                        alt={pl.title}
                        className="w-11 h-11 rounded-xl object-cover shrink-0 border border-white/10 shadow"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo.png';
                        }}
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                        <Music2 className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div className="truncate text-left">
                      <p className="text-xs font-bold text-white truncate">{pl.title}</p>
                      <p className="text-[10px] text-[#94A3B8] truncate mt-0.5">
                        {count} {count === 1 ? 'song' : 'songs'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {isAlreadyIn ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-slate-300">
                        <Check className="w-3 h-3 text-slate-300" />
                        <span>Added</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-black px-2.5 py-1 bg-white hover:bg-slate-200 rounded-full shadow-sm">
                        Add
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center space-y-1">
              <p className="text-xs font-bold text-white">No playlists yet</p>
              <p className="text-[11px] text-[#94A3B8]">
                Create your first playlist above to save "{track.title}".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

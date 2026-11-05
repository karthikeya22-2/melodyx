import React, { useState } from 'react';
import { X, Link2, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { api, playlistStorage } from '../services/api';
import { useMobilePlayerStore } from '../store/useMobilePlayerStore';
import { Playlist } from '../types';

interface ImportPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (playlist: Playlist) => void;
}

export const ImportPlaylistModal: React.FC<ImportPlaylistModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successPlaylist, setSuccessPlaylist] = useState<Playlist | null>(null);

  const { setSelectedPlaylist } = useMobilePlayerStore();

  if (!isOpen) return null;

  const handleImport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid playlist link.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const imported = await api.importPlaylist(url.trim());
      if (!imported || !imported.tracks || imported.tracks.length === 0) {
        throw new Error('No songs could be extracted from this playlist. Make sure the playlist is public and contains playable songs.');
      }
      playlistStorage.savePlaylist(imported);
      setSuccessPlaylist(imported);

      setTimeout(() => {
        setSelectedPlaylist(imported);
        if (onSuccess) onSuccess(imported);
        handleClose();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Failed to import playlist. Please check link and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setError(null);
    setSuccessPlaylist(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#131316] border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl relative space-y-4 text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-white flex items-center justify-center text-black shadow-md">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="text-base font-bold">Import Playlist</h2>
              <p className="text-[11px] text-slate-300">Spotify • JioSaavn • YouTube • Apple Music</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-[#888] hover:text-white hover:bg-[#22222A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleImport} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#BBB]">
              Playlist URL / Link
            </label>
            <div className="relative flex items-center">
              <Link2 className="absolute left-3 w-4 h-4 text-[#888]" />
              <input
                type="text"
                value={url}
                onChange={e => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Paste link (Spotify, JioSaavn, YouTube) or song names"
                className="w-full bg-[#0A0A0C] border border-[#2A2A30] focus:border-white/40 focus:outline-none rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#666]"
                disabled={isLoading}
                autoFocus
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Supports public playlist links from Spotify, JioSaavn, YouTube, Apple Music, or comma-separated song titles.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start space-x-2 p-2.5 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Preview */}
          {successPlaylist && (
            <div className="flex items-center space-x-2.5 p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <div className="truncate flex-1">
                <p className="font-bold text-white truncate">{successPlaylist.title}</p>
                <p className="text-[10px] text-emerald-400">
                  Imported {successPlaylist.tracks?.length || successPlaylist.trackCount} songs! Opening...
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-white/10 flex items-center justify-center space-x-2 transition-transform active:scale-98"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Importing & Processing...</span>
              </>
            ) : (
              <>
                <span>Import & Save Playlist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};


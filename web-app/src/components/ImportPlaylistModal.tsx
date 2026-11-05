import React, { useState } from 'react';
import { X, Link2, Sparkles, AlertCircle, CheckCircle2, Music2, ArrowRight } from 'lucide-react';
import { api, playlistStorage } from '../services/api';
import { usePlayerStore } from '../store/usePlayerStore';
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

  const { setSelectedPlaylist, setCurrentView } = usePlayerStore();

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
      // Save locally so it persists
      playlistStorage.savePlaylist(imported);
      setSuccessPlaylist(imported);

      setTimeout(() => {
        setSelectedPlaylist(imported);
        setCurrentView('playlist');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-[#131316] border border-white/10 rounded-xl p-6 shadow-2xl relative space-y-5 text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-white flex items-center justify-center text-black shadow-md">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Transfer & Import Playlist</h2>
              <p className="text-xs text-[#94A3B8]">
                Transfer playlists from Spotify, JioSaavn, or YouTube Music
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-[#888] hover:text-white hover:bg-[#22222A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#94A3B8]">
          <span className="px-2.5 py-1 rounded-full bg-[#1A1A20] border border-[#2A2A30] text-emerald-400">
            ● Spotify
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#1A1A20] border border-[#2A2A30] text-blue-400">
            ● JioSaavn
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#1A1A20] border border-[#2A2A30] text-red-400">
            ● YouTube
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#1A1A20] border border-[#2A2A30] text-pink-400">
            ● Apple Music
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleImport} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#CCC]">
              Playlist URL
            </label>
            <div className="relative flex items-center">
              <Link2 className="absolute left-3 w-4 h-4 text-[#888]" />
              <input
                type="url"
                value={url}
                onChange={e => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="https://open.spotify.com/playlist/... or JioSaavn / YouTube link"
                className="w-full bg-[#0A0A0C] border border-[#2A2A30] focus:border-white/40 focus:outline-none rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#666] transition-colors"
                disabled={isLoading}
                autoFocus
              />
            </div>
            <p className="text-[11px] text-[#777]">
              Copy the share link from your music app and paste it above.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Preview */}
          {successPlaylist && (
            <div className="flex items-center space-x-3 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <div className="truncate flex-1">
                <p className="font-bold text-white truncate">{successPlaylist.title}</p>
                <p className="text-[11px] text-emerald-400">
                  Imported {successPlaylist.tracks?.length || successPlaylist.trackCount} tracks successfully! Opening...
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-[#1A1A20] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-6 py-2 rounded-full text-xs font-extrabold bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-white/10 hover:scale-105 active:scale-95 flex items-center space-x-2 transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <span>Import Playlist</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


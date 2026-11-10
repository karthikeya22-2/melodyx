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
  const [progressStep, setProgressStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successPlaylist, setSuccessPlaylist] = useState<Playlist | null>(null);

  const { setSelectedPlaylist } = useMobilePlayerStore();

  if (!isOpen) return null;

  const validateUrl = (raw: string): boolean => {
    const trimmed = raw.trim();
    if (!trimmed) return false;

    // Direct song names/comma-separated list
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('spotify:')) {
      return trimmed.length >= 2;
    }

    // Supported platform URLs
    const lower = trimmed.toLowerCase();
    return (
      lower.includes('spotify.com') ||
      lower.startsWith('spotify:') ||
      lower.includes('jiosaavn.com') ||
      lower.includes('saavn.com') ||
      lower.includes('youtube.com') ||
      lower.includes('youtu.be') ||
      lower.includes('apple.com') ||
      lower.includes('music.apple.com')
    );
  };

  const handleImport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setError('Please enter a valid playlist link.');
      return;
    }

    if (!validateUrl(cleanUrl)) {
      setError('Please provide a supported link from Spotify, JioSaavn, YouTube, or Apple Music.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgressStep('Validating playlist link...');

    try {
      setProgressStep('Connecting to playlist source...');

      // Dynamic progress steps
      const progressTimer1 = setTimeout(() => {
        setProgressStep('Extracting playlist tracks and metadata...');
      }, 900);

      const progressTimer2 = setTimeout(() => {
        setProgressStep('Resolving high-quality audio streams...');
      }, 2200);

      const imported = await api.importPlaylist(cleanUrl);
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);

      if (!imported || !imported.tracks || imported.tracks.length === 0) {
        throw new Error('This playlist is private, empty, or restricted. Please verify the playlist is public.');
      }

      setProgressStep('Saving playlist to your library...');
      playlistStorage.savePlaylist(imported);
      setSuccessPlaylist(imported);

      setTimeout(() => {
        setSelectedPlaylist(imported);
        if (onSuccess) onSuccess(imported);
        handleClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to import playlist. Please check link and try again.');
    } finally {
      setIsLoading(false);
      setProgressStep('');
    }
  };

  const handleClose = () => {
    setUrl('');
    setError(null);
    setProgressStep('');
    setSuccessPlaylist(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div
        className="w-full max-w-md bg-[#131316] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl relative space-y-4 text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-white flex items-center justify-center text-black shadow-md shrink-0">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="text-base font-bold">Import Playlist</h2>
              <p className="text-[11px] text-slate-300">Spotify • JioSaavn • YouTube • Apple Music</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-[#888] hover:text-white hover:bg-[#22222A] transition-colors"
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
                placeholder="Paste Spotify, JioSaavn, YouTube, or Apple Music link"
                className="w-full bg-[#0A0A0C] border border-[#2A2A30] focus:border-white/40 focus:outline-none rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#666]"
                disabled={isLoading}
                autoFocus
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Paste any public playlist URL or a list of song names to import into your library.
            </p>
          </div>

          {/* Progress Indicator */}
          {isLoading && progressStep && (
            <div className="flex items-center space-x-2 p-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-200 text-xs">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="truncate">{progressStep}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start space-x-2 p-2.5 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
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
                  Successfully imported {successPlaylist.tracks?.length || successPlaylist.trackCount} tracks! Opening...
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full py-3 rounded-2xl text-xs font-extrabold bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-white/10 flex items-center justify-center space-x-2 transition-transform active:scale-98"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Processing Playlist...</span>
              </>
            ) : (
              <>
                <span>Import & Save to Library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

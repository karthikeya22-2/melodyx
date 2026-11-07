import React, { useState, useEffect } from 'react';
import { Sparkles, Download, X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { MelodyxMedia } from '../services/melodyxNativeMedia';

export interface UpdateInfo {
  isUpdateAvailable: boolean;
  clientVersion?: string;
  clientVersionCode?: number;
  latestVersion: string;
  latestVersionCode: number;
  title?: string;
  releaseNotes?: string;
  changelog?: string[];
  apkDownloadUrl: string;
  mandatoryUpdate?: boolean;
}

interface UpdateModalProps {
  updateInfo: UpdateInfo | null;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ updateInfo, onClose }) => {
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'installing' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [downloadedMB, setDownloadedMB] = useState('0');
  const [totalMB, setTotalMB] = useState('0');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let sub: any = null;
    try {
      sub = MelodyxMedia.addListener('downloadProgress', (data: { percent: number; bytesDownloaded: number; totalBytes: number }) => {
        setProgress(data.percent || 0);
        if (data.bytesDownloaded) {
          setDownloadedMB((data.bytesDownloaded / (1024 * 1024)).toFixed(1));
        }
        if (data.totalBytes) {
          setTotalMB((data.totalBytes / (1024 * 1024)).toFixed(1));
        }
      });
    } catch (e) { }

    return () => {
      if (sub && sub.remove) sub.remove();
    };
  }, []);

  if (!updateInfo || !updateInfo.isUpdateAvailable) return null;

  const handleStartUpdate = async () => {
    const url = updateInfo.apkDownloadUrl;
    if (!url) {
      setErrorMessage('Download URL is currently unavailable.');
      setDownloadState('error');
      return;
    }

    setDownloadState('downloading');
    setProgress(0);
    setErrorMessage(null);

    try {
      const result = await MelodyxMedia.downloadAndInstallApk({ downloadUrl: url });
      if (result && result.success) {
        setDownloadState('installing');
      } else {
        // Fallback: open URL in browser / direct intent
        window.open(url, '_system');
        setDownloadState('installing');
      }
    } catch (err: any) {
      console.warn('Native update download failed, falling back to browser:', err);
      // Fallback: launch direct browser download
      window.open(url, '_system');
      setDownloadState('idle');
      onClose();
    }
  };

  const isMandatory = Boolean(updateInfo.mandatoryUpdate);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm bg-[#121216] border border-white/15 rounded-2xl p-5 shadow-2xl flex flex-col space-y-4 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center shadow-lg shadow-rose-950/40">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">Melody X Update</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  v{updateInfo.latestVersion}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">Official Android Release</p>
            </div>
          </div>

          {!isMandatory && downloadState !== 'downloading' && (
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-white p-1 rounded-lg active:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body content based on state */}
        {downloadState === 'idle' && (
          <div className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
              <p className="text-xs font-bold text-white uppercase tracking-wider">What's New in Melody X:</p>
              <div className="space-y-1.5 text-xs text-[#CBD5E1]">
                {updateInfo.changelog && updateInfo.changelog.length > 0 ? (
                  updateInfo.changelog.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span className="leading-tight">{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="whitespace-pre-line leading-relaxed text-[11px] text-[#94A3B8]">
                    {updateInfo.releaseNotes || 'Includes fixes for lock-screen media controls and background playback.'}
                  </p>
                )}
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] text-center">
              Your login, playlists, and downloaded music will be safely preserved.
            </p>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-1">
              {!isMandatory && (
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 active:bg-white/15 text-xs font-bold text-white transition-all text-center"
                >
                  Later
                </button>
              )}
              <button
                onClick={handleStartUpdate}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 active:scale-[0.98] text-xs font-extrabold text-white shadow-lg shadow-rose-950/40 flex items-center justify-center space-x-1.5 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Update Now</span>
              </button>
            </div>
          </div>
        )}

        {downloadState === 'downloading' && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white">Downloading Update...</span>
                <span className="text-rose-400 font-mono">{progress}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 rounded-full transition-all duration-200"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>{downloadedMB} MB / {totalMB || '6.4'} MB</span>
                <span>Do not close Melody X</span>
              </div>
            </div>
          </div>
        )}

        {downloadState === 'installing' && (
          <div className="space-y-3 py-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Download Complete</h4>
              <p className="text-xs text-[#94A3B8]">
                Opening the Android Package Installer... Tap <strong>Install</strong> or <strong>Update</strong> when prompted.
              </p>
            </div>
            <button
              onClick={() => handleStartUpdate()}
              className="mt-2 text-xs font-bold text-rose-400 underline"
            >
              Click here if installer did not open
            </button>
          </div>
        )}

        {downloadState === 'error' && (
          <div className="space-y-3 py-2 text-center">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs text-rose-200">{errorMessage || 'Update failed to download'}</p>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-white/10 text-white rounded-lg text-xs font-bold"
              >
                Dismiss
              </button>
              <button
                onClick={handleStartUpdate}
                className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

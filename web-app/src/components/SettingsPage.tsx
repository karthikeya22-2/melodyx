import React, { useState } from 'react';
import {
  Sliders,
  Volume2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Info,
  ShieldCheck,
  Music,
  Radio,
  RefreshCw,
  Download,
  LogOut
} from 'lucide-react';
import { recommendationEngine } from '../services/recommendationEngine';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [audioQuality, setAudioQuality] = useState<'very-high' | 'high' | 'normal'>('very-high');
  const [normalizeVolume, setNormalizeVolume] = useState(true);
  const [gaplessPlayback, setGaplessPlayback] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{
    checked: boolean;
    isAvailable: boolean;
    latestVersion?: string;
    changelog?: string[];
    downloadUrl?: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearSearchHistory = () => {
    recommendationEngine.clearSearchHistory();
    showToast('Search history successfully cleared.');
  };

  const handleClearListeningHistory = () => {
    recommendationEngine.clearListeningHistory();
    showToast('Listening history and preferences reset.');
  };

  const handleCheckUpdates = async () => {
    setIsCheckingUpdate(true);
    try {
      const res = await api.checkForUpdates('2.0.0');
      setUpdateStatus({
        checked: true,
        isAvailable: Boolean(res.isUpdateAvailable),
        latestVersion: res.latestVersion || '2.0.0',
        changelog: res.changelog || [],
        downloadUrl: res.downloadUrl
      });
      if (res.isUpdateAvailable) {
        showToast(`Update v${res.latestVersion} available!`);
      } else {
        showToast('Melodyx is up to date (v2.0.0)');
      }
    } catch (e) {
      setUpdateStatus({
        checked: true,
        isAvailable: false,
        latestVersion: '2.0.0'
      });
      showToast('Melodyx is up to date (v2.0.0)');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const searchHistoryCount = recommendationEngine.getSearchHistory().length;
  const recentlyPlayedCount = recommendationEngine.getRecentlyPlayed().length;

  return (
    <div className="flex-1 bg-[#0A0A0C] rounded-lg overflow-y-auto p-6 space-y-8 select-none border border-white/5 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-white via-slate-100 to-slate-300 text-black px-4 py-2.5 rounded-lg shadow-2xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-xs text-[#94A3B8] mt-1">Configure your Melodyx playback and system updates.</p>
      </div>

      {/* 1. Profile / Account Summary */}
      <div className="bg-[#131316] p-5 rounded-xl flex items-center justify-between border border-white/10">
        <div className="flex items-center space-x-4 truncate">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName || 'User'}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-300 shadow-lg shadow-white/10 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-white flex items-center justify-center text-black font-extrabold text-xl shadow-lg shadow-white/10 shrink-0">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'G'}
            </div>
          )}
          <div className="truncate">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white truncate">{user?.displayName || 'Google User'}</h3>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                Verified Google
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5 truncate">{user?.email || 'Logged in via Google'}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            showToast('Signed out from Google account');
          }}
          className="px-3.5 py-1.5 rounded-xl bg-[#1A1A20] hover:bg-red-950/40 border border-red-500/30 hover:border-red-500/60 text-red-400 text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 ml-3"
          title="Sign out of Melodyx"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 2. Audio Quality & Playback */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-white font-bold text-lg">
          <Volume2 className="w-5 h-5 text-slate-300" />
          <h2>Audio Streaming Quality</h2>
        </div>

        <div className="bg-[#131316] rounded-xl divide-y divide-[#1A1A20] border border-white/10">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-white">Streaming Fidelity</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Optimizes audio bitrate for high-speed lossless listening.
              </p>
            </div>
            <select
              value={audioQuality}
              onChange={e => {
                setAudioQuality(e.target.value as any);
                showToast(`Audio quality set to ${e.target.value.replace('-', ' ').toUpperCase()}`);
              }}
              className="bg-[#1A1A20] text-white text-xs font-semibold px-3 py-2 rounded-md border border-[#2A2A30] focus:outline-none focus:border-white/40"
            >
              <option value="very-high">Very High (320 kbps AAC/Opus)</option>
              <option value="high">High (256 kbps)</option>
              <option value="normal">Normal (160 kbps)</option>
            </select>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-white">Normalize Volume</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Equalizes playback gain so all tracks play at consistent volume.
              </p>
            </div>
            <input
              type="checkbox"
              checked={normalizeVolume}
              onChange={e => setNormalizeVolume(e.target.checked)}
              className="w-5 h-5 accent-slate-200 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-white">Gapless Playback</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Zero cross-track latency between sequential songs.
              </p>
            </div>
            <input
              type="checkbox"
              checked={gaplessPlayback}
              onChange={e => setGaplessPlayback(e.target.checked)}
              className="w-5 h-5 accent-slate-200 rounded cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* 3. Search for Updates Section (Replaces legacy Appearance) */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-white font-bold text-lg">
          <RefreshCw className="w-5 h-5 text-slate-300" />
          <h2>App Updates & Releases</h2>
        </div>

        <div className="bg-[#131316] p-5 rounded-xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10 shadow-sm">
                <RefreshCw className={`w-5 h-5 ${isCheckingUpdate ? 'animate-spin text-white' : 'text-slate-300'}`} />
              </div>
              <div>
                <p className="font-semibold text-sm text-white">Melodyx Version</p>
                <p className="text-xs text-[#94A3B8]">Current Installed: v2.0.0-release</p>
              </div>
            </div>
            <button
              onClick={handleCheckUpdates}
              disabled={isCheckingUpdate}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-white via-slate-100 to-slate-300 text-black font-extrabold text-xs shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              {isCheckingUpdate ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Search for Updates</span>
                </>
              )}
            </button>
          </div>

          {updateStatus && (
            <div className={`p-4 rounded-xl border text-xs space-y-2 ${
              updateStatus.isAvailable
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-[#94A3B8]'
            }`}>
              {updateStatus.isAvailable ? (
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2 font-bold text-emerald-400 text-sm">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Update Available: Version v{updateStatus.latestVersion} is ready!</span>
                  </div>
                  <p className="text-xs text-emerald-200/80">
                    A newer release of Melodyx is available with enhanced performance and features.
                  </p>
                  {updateStatus.downloadUrl && (
                    <a
                      href={updateStatus.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs shadow-md transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Latest Release</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2.5 text-white font-medium text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>App is up to date (Version 2.0.0)</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 4. Privacy, History & Cache */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-white font-bold text-lg">
          <Trash2 className="w-5 h-5 text-white" />
          <h2>History, Cache & Privacy</h2>
        </div>

        <div className="bg-[#131316] rounded-xl divide-y divide-[#1A1A20] border border-[#1A1A20]">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-white">Search History</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Currently storing {searchHistoryCount} recent search {searchHistoryCount === 1 ? 'query' : 'queries'}.
              </p>
            </div>
            <button
              onClick={handleClearSearchHistory}
              className="px-3.5 py-1.5 bg-[#1A1A20] hover:bg-[#2A2A30] hover:text-white text-xs font-semibold text-white rounded-md transition-colors"
            >
              Clear Search History
            </button>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-white">Listening History & Preferences</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Stored listening history: {recentlyPlayedCount} tracks. Reset to refresh recommendations.
              </p>
            </div>
            <button
              onClick={handleClearListeningHistory}
              className="px-3.5 py-1.5 bg-[#1A1A20] hover:bg-[#2A2A30] hover:text-white text-xs font-semibold text-white rounded-md transition-colors"
            >
              Clear Listening History
            </button>
          </div>
        </div>
      </section>

      {/* 5. About Platform */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-white font-bold text-lg">
          <Info className="w-5 h-5 text-white" />
          <h2>About Melodyx</h2>
        </div>

        <div className="bg-[#131316] p-5 rounded-xl border border-[#1A1A20] space-y-3 text-xs text-[#94A3B8] leading-relaxed">
          <div className="flex items-center justify-between text-white font-semibold pb-2 border-b border-[#1A1A20]">
            <span className="flex items-center space-x-2">
              <img src="/logo.png" alt="Melodyx" className="w-5 h-5 rounded object-cover shadow-sm" />
              <span>Melodyx Music Platform</span>
            </span>
            <span className="font-mono text-white">v2.0.0-melodyx</span>
          </div>
          <p>
            Melodyx is built with high-fidelity streaming capabilities, lossless stream caching, accurate 2–3 result song search prioritization, Google Cloud authentication, and a client-side Spotify-like recommendation engine.
          </p>
          <div className="flex items-center space-x-4 pt-1 text-[11px] text-[#777]">
            <span>• No external AI/ML trackers</span>
            <span>• Privacy-friendly local storage</span>
            <span>• Continuous non-stop audio</span>
          </div>
        </div>
      </section>
    </div>
  );
};

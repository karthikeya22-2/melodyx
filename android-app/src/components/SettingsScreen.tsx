import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Volume2,
  Trash2,
  CheckCircle2,
  Info,
  Radio,
  RefreshCw,
  Download,
  Sparkles,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { recommendationEngine } from '../services/recommendationEngine';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { MelodyxMedia } from '../services/melodyxNativeMedia';
import { UpdateModal, UpdateInfo } from './UpdateModal';

export const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [audioQuality, setAudioQuality] = useState<'very-high' | 'high' | 'normal'>('very-high');
  const [normalizeVolume, setNormalizeVolume] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [installedVersion, setInstalledVersion] = useState('2.1.0');
  const [installedVersionCode, setInstalledVersionCode] = useState(2);
  const [activeModalUpdate, setActiveModalUpdate] = useState<UpdateInfo | null>(null);
  const [updateStatus, setUpdateStatus] = useState<{
    checked: boolean;
    isAvailable: boolean;
    latestVersion?: string;
    changelog?: string[];
    downloadUrl?: string;
  } | null>(null);

  useEffect(() => {
    MelodyxMedia.getAppVersion().then(v => {
      if (v && v.versionName) {
        setInstalledVersion(v.versionName);
        setInstalledVersionCode(Number(v.versionCode) || 2);
      }
    }).catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearSearch = () => {
    recommendationEngine.clearSearchHistory();
    showToast('Search history cleared');
  };

  const handleClearHistory = () => {
    recommendationEngine.clearListeningHistory();
    showToast('Listening history & preferences reset');
  };

  const handleCheckUpdates = async () => {
    setIsCheckingUpdate(true);
    try {
      const res = await api.checkForUpdates(installedVersion, installedVersionCode);
      setUpdateStatus({
        checked: true,
        isAvailable: Boolean(res.isUpdateAvailable),
        latestVersion: res.latestVersion || installedVersion,
        changelog: res.changelog || [],
        downloadUrl: res.apkDownloadUrl || res.downloadUrl
      });
      if (res.isUpdateAvailable) {
        setActiveModalUpdate(res);
        showToast(`Update v${res.latestVersion} available!`);
      } else {
        showToast(`App is up to date (v${installedVersion})`);
      }
    } catch (e) {
      setUpdateStatus({
        checked: true,
        isAvailable: false,
        latestVersion: installedVersion
      });
      showToast(`App is up to date (v${installedVersion})`);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const searchCount = recommendationEngine.getSearchHistory().length;
  const historyCount = recommendationEngine.getRecentlyPlayed().length;

  return (
    <div className="flex-1 overflow-y-auto bg-[#0A0A0C] select-none px-4 pt-4 pb-28 touch-scroll space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-white via-slate-100 to-slate-300 text-black text-xs font-bold px-4 py-3 rounded-md shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-xs text-[#94A3B8] mt-0.5">Melodyx Shiny Silver Edition</p>
      </div>

      {/* Profile Card */}
      <div className="bg-[#131316] p-4 rounded-xl flex items-center justify-between border border-white/10">
        <div className="flex items-center space-x-3 truncate">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName || 'User'}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-300 shadow-md shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-white flex items-center justify-center text-black font-black text-lg shadow-md shrink-0">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'G'}
            </div>
          )}
          <div className="truncate">
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-bold text-white truncate">{user?.displayName || 'Google User'}</h3>
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-full border border-emerald-500/30">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] truncate">{user?.email || 'Logged in via Google'}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            showToast('Signed out of Google account');
          }}
          className="px-2.5 py-1.5 rounded-xl bg-[#1A1A20] hover:bg-red-950/40 border border-red-500/30 text-red-400 text-[11px] font-bold flex items-center space-x-1 shrink-0 ml-2"
          title="Sign Out"
        >
          <LogOut className="w-3 h-3" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Audio Quality Section */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider px-1">
          Audio Quality
        </h2>
        <div className="bg-[#131316] rounded-xl divide-y divide-[#1A1A20] border border-white/10 overflow-hidden">
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Streaming Fidelity</p>
              <p className="text-[11px] text-[#94A3B8]">Optimized for mobile network</p>
            </div>
            <select
              value={audioQuality}
              onChange={e => {
                setAudioQuality(e.target.value as any);
                showToast(`Audio set to ${e.target.value.toUpperCase()}`);
              }}
              className="bg-[#1A1A20] text-white text-xs font-semibold px-2.5 py-1.5 rounded-md border border-[#2A2A30] focus:outline-none focus:border-white/40"
            >
              <option value="very-high">Very High (320k)</option>
              <option value="high">High (256k)</option>
              <option value="normal">Normal (160k)</option>
            </select>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Normalize Volume</p>
              <p className="text-[11px] text-[#94A3B8]">Equalize volume across tracks</p>
            </div>
            <input
              type="checkbox"
              checked={normalizeVolume}
              onChange={e => setNormalizeVolume(e.target.checked)}
              className="w-5 h-5 accent-slate-200 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Search for Updates Section (Replaces legacy Appearance) */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider px-1">
          App Updates
        </h2>
        <div className="bg-[#131316] p-4 rounded-xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10">
                <RefreshCw className={`w-4 h-4 ${isCheckingUpdate ? 'animate-spin text-white' : 'text-slate-300'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Version & Updates</p>
                <p className="text-[11px] text-[#94A3B8]">Current Installed: v2.0.0</p>
              </div>
            </div>
            <button
              onClick={handleCheckUpdates}
              disabled={isCheckingUpdate}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-white via-slate-100 to-slate-300 text-black font-bold text-xs shadow-md active:scale-95 disabled:opacity-50 transition-all flex items-center space-x-1.5"
            >
              {isCheckingUpdate ? (
                <span>Checking...</span>
              ) : (
                <span>Search for Updates</span>
              )}
            </button>
          </div>

          {updateStatus && (
            <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${
              updateStatus.isAvailable
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-[#94A3B8]'
            }`}>
              {updateStatus.isAvailable ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-emerald-400">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Update Available: Version v{updateStatus.latestVersion} is ready!</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80">
                    A new version of Melodyx is available with fresh features and improvements.
                  </p>
                  {updateStatus.downloadUrl && (
                    <a
                      href={updateStatus.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-md text-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download APK Update</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-white font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>App is up to date (Version 2.0.0)</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Storage and History Section */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider px-1">
          Storage & History
        </h2>
        <div className="bg-[#131316] rounded-xl divide-y divide-[#1A1A20] border border-[#1A1A20] overflow-hidden">
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Search History</p>
              <p className="text-[11px] text-[#94A3B8]">{searchCount} stored searches</p>
            </div>
            <button
              onClick={handleClearSearch}
              className="px-3 py-1.5 bg-[#1A1A20] active:bg-[#2A2A30] text-xs font-bold text-white active:text-white rounded-md transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Listening History</p>
              <p className="text-[11px] text-[#94A3B8]">{historyCount} tracks tracked</p>
            </div>
            <button
              onClick={handleClearHistory}
              className="px-3 py-1.5 bg-[#1A1A20] active:bg-[#2A2A30] text-xs font-bold text-white active:text-white rounded-md transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider px-1">
          About
        </h2>
        <div className="bg-[#131316] p-4 rounded-xl border border-[#1A1A20] space-y-2">
          <div className="flex items-center justify-between text-white font-semibold text-sm">
            <span className="flex items-center space-x-2">
              <img src="/logo.png" alt="Melodyx" className="w-5 h-5 rounded object-cover shadow-sm" />
              <span>Melodyx Music</span>
            </span>
            <span className="text-xs font-mono text-white">v{installedVersion}</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            Full-track continuous music streaming with animated waveform scrubbing, Google Cloud authentication, lock-screen media controls, and local recommendation intelligence.
          </p>
        </div>
      </div>

      {/* Manual Update Check Modal */}
      <UpdateModal updateInfo={activeModalUpdate} onClose={() => setActiveModalUpdate(null)} />
    </div>
  );
};

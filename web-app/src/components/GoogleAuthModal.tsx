import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, LogOut, User, Mail, Music2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';

interface GoogleAuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, login, logout, isAuthModalOpen, closeAuthModal, authNotice } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isVisible = isOpen !== undefined ? isOpen : isAuthModalOpen;

  const handleClose = () => {
    if (onClose) onClose();
    closeAuthModal();
  };

  useEffect(() => {
    if (isVisible) {
      setError(null);
      setSuccessMsg(null);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleGoogleLogin = async (customName?: string, customEmail?: string) => {
    setIsLoading(true);
    setError(null);

    const nameToUse = customName || displayName.trim() || 'Music Fan';
    const emailToUse = customEmail || email.trim() || `${nameToUse.toLowerCase().replace(/\s+/g, '')}@gmail.com`;

    try {
      const res = await api.loginWithGoogle({
        googleUser: {
          name: nameToUse,
          email: emailToUse,
          picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameToUse)}`,
          sub: 'g-' + Date.now()
        }
      });

      login(res.user, res.token);
      setSuccessMsg(`Welcome, ${res.user.displayName}! Songs unlocked.`);
      setTimeout(() => {
        handleClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div
        className="w-full max-w-md bg-[#131316] border border-white/10 rounded-2xl p-6 shadow-2xl relative space-y-4 text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">Melodyx Account</h2>
              <p className="text-xs text-[#888]">Google authentication required to play music</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-[#888] hover:text-white hover:bg-[#22222A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Card if prompted to stream */}
        {authNotice && !isAuthenticated && (
          <div className="bg-gradient-to-r from-slate-900 via-neutral-900 to-slate-900 border border-slate-400/20 rounded-xl p-3 text-center space-y-1">
            <p className="text-xs font-bold text-white flex items-center justify-center space-x-1.5">
              <Music2 className="w-4 h-4 text-slate-300" />
              <span>Sign In Required To Play Songs</span>
            </p>
            <p className="text-[11px] text-[#94A3B8]">{authNotice}</p>
          </div>
        )}

        {/* Logged in state */}
        {isAuthenticated && user ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-[#1A1A20] border border-white/10">
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-300"
              />
              <div className="truncate flex-1">
                <p className="font-bold text-sm text-white truncate">{user.displayName}</p>
                <p className="text-xs text-[#888] truncate">{user.email}</p>
                <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold">
                  ✓ Signed In with Google • Songs Unlocked
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                handleClose();
              }}
              className="w-full py-2.5 rounded-xl bg-[#1A1A20] hover:bg-red-950/40 border border-red-500/30 text-red-400 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          /* Sign-in state */
          <div className="space-y-4">
            {error && (
              <div className="flex items-start space-x-2 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center space-x-2.5 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Google Sign In */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleGoogleLogin();
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#BBB]">Your Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-[#777]" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#0A0A0C] border border-[#2A2A30] focus:border-white/40 focus:outline-none rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#666]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#BBB]">Google Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-[#777]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full bg-[#0A0A0C] border border-[#2A2A30] focus:border-white/40 focus:outline-none rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#666]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-b from-white via-slate-100 to-slate-300 text-black font-extrabold text-xs shadow-md shadow-white/10 flex items-center justify-center space-x-2 transition-all active:scale-98"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Unlock Songs & Enter Melodyx</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

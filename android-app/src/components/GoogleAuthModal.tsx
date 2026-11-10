import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, LogOut, ShieldCheck, Headphones } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';

interface GoogleAuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const GOOGLE_CLIENT_ID = '631547173450-qhn4t4kvqcsrokeih374q9d8kipnrlla.apps.googleusercontent.com';

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, login, logout, isAuthModalOpen, closeAuthModal, authNotice } = useAuthStore();
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
      setIsLoading(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setError(null);

    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (resp: any) => {
            if (resp.error) {
              setIsLoading(false);
              if (resp.error !== 'popup_closed_by_user') {
                setError(`Google Sign-In notice: ${resp.error}`);
              }
              return;
            }
            if (resp.access_token) {
              try {
                const res = await api.loginWithGoogle({ accessToken: resp.access_token });
                login(res.user, res.token);
                setSuccessMsg(`Welcome, ${res.user.displayName}!`);
                setTimeout(handleClose, 400);
              } catch (e: any) {
                setError(e.message || 'Google verification failed.');
              } finally {
                setIsLoading(false);
              }
            }
          }
        });
        tokenClient.requestAccessToken();
        return;
      } catch (err: any) {
        console.warn('oauth2 token client failed:', err);
      }
    }

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsLoading(false);
          }
        });
        return;
      } catch (e) {
        console.warn('accounts.id.prompt error:', e);
      }
    }

    setIsLoading(false);
    setError('Google Sign-In is unavailable. Please verify network connection.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div
        className="w-full max-w-md bg-[#131316] border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl relative space-y-4 text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <h2 className="text-base font-bold">Google Account</h2>
              <p className="text-[11px] text-[#888]">Authenticated profile & playback sync</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-[#888] hover:text-white hover:bg-[#22222A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Card if prompted */}
        {authNotice && !isAuthenticated && (
          <div className="bg-gradient-to-r from-slate-900 via-neutral-900 to-slate-900 border border-slate-400/20 rounded-xl p-3 text-center space-y-1">
            <p className="text-xs font-bold text-white flex items-center justify-center space-x-1.5">
              <Headphones className="w-3.5 h-3.5 text-slate-300" />
              <span>Google Account Required</span>
            </p>
            <p className="text-[11px] text-[#94A3B8]">{authNotice}</p>
          </div>
        )}

        {/* Logged In State */}
        {isAuthenticated && user ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-[#1A1A20] border border-white/10">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'G'}
                </div>
              )}
              <div className="truncate flex-1">
                <p className="font-bold text-sm text-white truncate">{user.displayName}</p>
                <p className="text-xs text-[#94A3B8] truncate">{user.email}</p>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 mt-1 rounded-full text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Authenticated with Google</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                handleClose();
              }}
              className="w-full py-2.5 rounded-xl bg-[#1A1A20] hover:bg-red-950/40 border border-red-500/30 text-red-400 font-bold text-xs flex items-center justify-center space-x-2 transition-colors active:scale-98"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Google Account</span>
            </button>
          </div>
        ) : (
          /* Sign-In State */
          <div className="space-y-3">
            {error && (
              <div className="flex items-start space-x-2 p-2.5 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center space-x-2 p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-white via-slate-100 to-slate-200 text-black font-extrabold text-xs shadow-lg shadow-white/10 flex items-center justify-center space-x-2.5 transition-all active:scale-98"
            >
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <span>{isLoading ? 'Connecting to Google...' : 'Sign In with Google'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

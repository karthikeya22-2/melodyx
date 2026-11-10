import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, ShieldCheck, Lock, Headphones, ArrowRight, Trash2 } from 'lucide-react';
import { useAuthStore, AuthUser } from '../store/useAuthStore';
import { api } from '../services/api';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          cancel: () => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

interface SavedAccount {
  email: string;
  name: string;
  avatarUrl?: string;
  lastUsed: number;
}

const GOOGLE_CLIENT_ID = '631547173450-qhn4t4kvqcsrokeih374q9d8kipnrlla.apps.googleusercontent.com';
const RECENT_ACCOUNTS_KEY = 'melodyx_recent_google_accounts';

export const CompulsoryAuthScreen: React.FC = () => {
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [recentAccounts, setRecentAccounts] = useState<SavedAccount[]>([]);
  const [gsiReady, setGsiReady] = useState(false);

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Load genuine saved accounts from localStorage on this device
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_ACCOUNTS_KEY);
      if (saved) {
        const parsed: SavedAccount[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentAccounts(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read cached accounts:', e);
    }
  }, []);

  const saveAccountToRecent = (user: AuthUser) => {
    try {
      const existingStr = localStorage.getItem(RECENT_ACCOUNTS_KEY);
      let list: SavedAccount[] = existingStr ? JSON.parse(existingStr) : [];
      list = list.filter(acc => acc.email.toLowerCase() !== user.email.toLowerCase());
      list.unshift({
        email: user.email,
        name: user.displayName,
        avatarUrl: user.avatarUrl || '',
        lastUsed: Date.now()
      });
      list = list.slice(0, 4);
      localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(list));
      setRecentAccounts(list);
    } catch (e) {
      console.warn('Could not save recent account', e);
    }
  };

  const removeRecentAccount = (emailToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = recentAccounts.filter(acc => acc.email.toLowerCase() !== emailToRemove.toLowerCase());
      localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(updated));
      setRecentAccounts(updated);
    } catch (e) { }
  };

  const handleAuthSuccess = (authUser: AuthUser, authToken: string) => {
    saveAccountToRecent(authUser);
    login(authUser, authToken);
    setIsLoading(false);
  };

  // Process ID Token or OAuth Token from Google Identity Services
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response || (!response.credential && !response.access_token)) {
      setError('Google Sign-In response was empty. Please try again.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg('Verifying your Google account...');

    try {
      const res = await api.loginWithGoogle({
        credential: response.credential,
        accessToken: response.access_token
      });

      if (res && res.user && res.token) {
        setSuccessMsg(`Welcome, ${res.user.displayName}!`);
        setTimeout(() => {
          handleAuthSuccess(res.user, res.token);
        }, 300);
      } else {
        throw new Error('Authentication succeeded but user profile was not returned.');
      }
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setIsLoading(false);
      setError(err.message || 'Google verification failed. Please try again.');
    }
  };

  // Launch Google Sign-In on demand
  const triggerGoogleSignIn = () => {
    setError(null);
    setIsLoading(true);

    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: (tokenResp: any) => {
            if (tokenResp.error) {
              setIsLoading(false);
              if (tokenResp.error !== 'popup_closed_by_user') {
                setError(`Google Sign-In notice: ${tokenResp.error}`);
              }
              return;
            }
            handleGoogleCredentialResponse(tokenResp);
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
      } catch (err) {
        console.warn('accounts.id.prompt error:', err);
      }
    }

    setIsLoading(false);
    setError('Google Sign-In service is loading. Please tap the Google button below.');
  };

  // Mount Google Identity Services Button
  useEffect(() => {
    let checkInterval: any = null;
    let attempts = 0;

    const initGsi = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
            logo_alignment: 'left',
            width: Math.min(320, window.innerWidth - 64)
          });

          setGsiReady(true);
          return true;
        } catch (err) {
          console.warn('GSI render error:', err);
        }
      }
      return false;
    };

    if (!initGsi()) {
      checkInterval = setInterval(() => {
        attempts++;
        if (initGsi() || attempts > 20) {
          clearInterval(checkInterval);
        }
      }, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0C] overflow-y-auto select-none">
      {/* Background radial silver ambiance */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/30 via-[#0A0A0C] to-[#0A0A0C] pointer-events-none" />

      {/* Main Card */}
      <div className="relative w-full max-w-sm bg-[#131316] border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/90 space-y-4 text-white text-center my-auto">
        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border border-white/15 p-1 bg-gradient-to-b from-white/10 to-transparent">
            <img
              src="/logo.png"
              alt="Melodyx"
              className="w-14 h-14 object-cover rounded-xl"
            />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Melodyx
            </h1>
            <p className="text-[11px] text-[#94A3B8] font-medium mt-0.5">
              High-Fidelity Ad-Free Music Platform
            </p>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/60 text-slate-300 text-[10px] font-bold">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Sign In with Your Google Account</span>
          </div>
        </div>

        {/* Informational subtitle */}
        <p className="text-[11px] text-[#A0AEC0] leading-relaxed">
          Sign in securely with your Google account to stream high-fidelity studio music, create playlists, and sync your music library across devices.
        </p>

        {error && (
          <div className="flex items-start space-x-2 p-2.5 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-[11px] text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center space-x-2 p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* PRIMARY ACTION: Sign In with Google Button */}
        <div className="space-y-3 pt-2">
          {/* Rendered official Google button if GSI initialized */}
          <div ref={googleBtnRef} className="flex justify-center min-h-[44px]" />

          {/* High-visibility direct trigger button */}
          <button
            type="button"
            onClick={triggerGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-white via-slate-100 to-slate-200 hover:brightness-105 active:scale-98 text-black font-extrabold text-xs shadow-xl shadow-white/10 flex items-center justify-between transition-all"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
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
              <span className="font-bold text-xs tracking-tight">Continue with Google</span>
            </div>
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 text-black" />
            )}
          </button>
        </div>

        {/* Previously Authenticated Google Accounts on THIS Device */}
        {recentAccounts.length > 0 && (
          <div className="space-y-1.5 pt-2 text-left border-t border-white/10">
            <p className="text-[10px] font-semibold text-[#888] uppercase tracking-wider text-center">
              Or Reconnect Account:
            </p>
            <div className="space-y-1.5">
              {recentAccounts.map(acc => (
                <div
                  key={acc.email}
                  onClick={triggerGoogleSignIn}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-[#1A1A20] hover:bg-[#22222A] border border-white/5 hover:border-white/20 transition-all cursor-pointer text-left shadow active:scale-98"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {acc.avatarUrl ? (
                      <img
                        src={acc.avatarUrl}
                        alt={acc.name}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                        onError={(e) => {
                          // Gracefully handle expired Google photo URLs
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {acc.name ? acc.name.charAt(0).toUpperCase() : 'G'}
                      </div>
                    )}
                    <div className="truncate">
                      <p className="text-[11px] font-bold text-white truncate">{acc.name || 'Google Account'}</p>
                      <p className="text-[9px] text-[#888] truncate">{acc.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <span className="text-[9px] font-bold text-slate-300 px-2 py-0.5 bg-white/5 rounded-full">
                      Switch
                    </span>
                    <button
                      type="button"
                      onClick={e => removeRecentAccount(acc.email, e)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-center space-x-3 text-[9px] text-[#64748B]">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Google Verified</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Headphones className="w-3 h-3 text-slate-400" />
            <span>320kbps Audio</span>
          </span>
          <span>•</span>
          <span>Ad-Free</span>
        </div>
      </div>
    </div>
  );
};

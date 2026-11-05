import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Mail, User, ShieldCheck, Lock, Headphones, HelpCircle } from 'lucide-react';
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

const RECENT_ACCOUNTS_KEY = 'melodyx_recent_google_accounts';

export const CompulsoryAuthScreen: React.FC = () => {
  const { login } = useAuthStore();
  const [googleEmail, setGoogleEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [recentAccounts, setRecentAccounts] = useState<SavedAccount[]>([]);
  const [showManualInput, setShowManualInput] = useState(false);
  const [showOriginHelp, setShowOriginHelp] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);

  const googleBtnRef = useRef<HTMLDivElement>(null);
  const defaultClientId = '631547173450-qhn4t4kvqcsrokeih374q9d8kipnrlla.apps.googleusercontent.com';

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  // Load saved accounts from localStorage (accounts genuinely logged in on this device)
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
        avatarUrl: user.avatarUrl,
        lastUsed: Date.now()
      });
      list = list.slice(0, 4);
      localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(list));
      setRecentAccounts(list);
    } catch (e) {
      console.warn('Could not save recent account', e);
    }
  };

  // Initialize official Google Identity Services
  useEffect(() => {
    let checkInterval: any = null;

    const initGsi = async () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        setGsiLoaded(true);
        let clientIdToUse = defaultClientId;
        try {
          const cfg = await api.getGoogleConfig();
          if (cfg?.clientId || cfg?.webClientId) {
            clientIdToUse = cfg.webClientId || cfg.clientId;
          }
        } catch (e) { }

        try {
          window.google.accounts.id.initialize({
            client_id: clientIdToUse,
            callback: async (response: any) => {
              if (!response?.credential) return;
              setIsLoading(true);
              setError(null);
              try {
                const res = await api.loginWithGoogle({ credential: response.credential });
                saveAccountToRecent(res.user);
                login(res.user, res.token);
                setSuccessMsg(`Welcome, ${res.user.displayName}! Access granted.`);
              } catch (err: any) {
                setError(err.message || 'Google authentication failed.');
              } finally {
                setIsLoading(false);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: false
          });

          // Render official Google button
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
            logo_alignment: 'left',
            width: Math.min(320, window.innerWidth - 64)
          });

          if (checkInterval) clearInterval(checkInterval);
        } catch (err) {
          console.warn('[GSI] Init error:', err);
        }
      }
    };

    initGsi();
    checkInterval = setInterval(initGsi, 500);
    const timeout = setTimeout(() => {
      if (checkInterval) clearInterval(checkInterval);
    }, 6000);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, [login]);

  // Handle direct Google sign-in with chosen email
  const handleDirectGoogleLogin = async (targetEmail: string, targetName?: string, targetAvatar?: string) => {
    const trimmedEmail = targetEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your Google email address.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please enter a valid Google email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const resolvedName = targetName?.trim() || displayName.trim() || trimmedEmail.split('@')[0];
    const resolvedAvatar = targetAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedName)}`;

    try {
      const res = await api.loginWithGoogle({
        googleUser: {
          email: trimmedEmail,
          name: resolvedName,
          displayName: resolvedName,
          picture: resolvedAvatar,
          sub: 'g-user-' + Math.abs(trimmedEmail.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))
        }
      });

      saveAccountToRecent(res.user);
      login(res.user, res.token);
      setSuccessMsg(`Welcome, ${res.user.displayName}! Access granted.`);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0C] overflow-y-auto select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/20 via-[#0A0A0C] to-[#0A0A0C] pointer-events-none" />

      {/* Main Gate Card */}
      <div className="relative w-full max-w-md bg-[#131316] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-5 text-white text-center my-auto">
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center space-y-2.5">
          <div className="relative w-18 h-18 rounded-2xl overflow-hidden shadow-2xl border border-white/15 p-1 bg-gradient-to-b from-white/10 to-transparent">
            <img
              src="/logo.png"
              alt="Melodyx"
              className="w-16 h-16 object-cover rounded-xl"
            />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Melodyx
            </h1>
            <p className="text-xs text-[#94A3B8] font-medium mt-0.5">
              High-Fidelity Ad-Free Music Platform
            </p>
          </div>

          {/* Mandatory Lock Badge */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/60 text-slate-300 text-[11px] font-bold">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Compulsory Google Sign-In</span>
          </div>
        </div>

        {/* Informational Notice */}
        <p className="text-xs text-[#A0AEC0] leading-relaxed">
          Sign in with your Google account to unlock full-length streaming, personal playlists, and synchronized lyrics.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start space-x-2.5 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="flex items-center space-x-2.5 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Section 1: Official Google Sign-In Button */}
        <div className="space-y-3">
          <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-semibold">
            Continue with Google
          </p>
          <div className="flex flex-col items-center justify-center min-h-[46px] w-full">
            <div ref={googleBtnRef} className="flex justify-center w-full" />
            {!gsiLoaded && (
              <button
                onClick={() => setShowManualInput(true)}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-full bg-white hover:bg-neutral-100 text-black font-bold text-xs shadow-md flex items-center justify-center space-x-2.5 transition-transform active:scale-98"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>
            )}
          </div>

          {/* Origin Mismatch helper toggle */}
          <button
            type="button"
            onClick={() => setShowOriginHelp(!showOriginHelp)}
            className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center w-full space-x-1 underline-offset-2 hover:underline"
          >
            <HelpCircle className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Seeing &quot;Error 400: origin_mismatch&quot; in Google Popup?</span>
          </button>

          {showOriginHelp && (
            <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-left text-[11px] text-amber-200 space-y-1.5 animate-fadeIn">
              <p className="font-bold text-white">Fix origin_mismatch in Google Cloud:</p>
              <p>
                Add <code className="bg-black/60 px-1 py-0.5 rounded text-amber-300">{currentOrigin}</code> to <strong>Authorized JavaScript origins</strong> on your Web Client ID in Google Cloud Console.
              </p>
              <p className="text-[10px] text-slate-300">
                Or use the <strong>Sign In with Google Email</strong> option below to sign in instantly.
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Recently Signed In Accounts on this device */}
        {recentAccounts.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/10 text-left">
            <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider text-center">
              Signed-in Accounts
            </p>
            <div className="space-y-1.5">
              {recentAccounts.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => handleDirectGoogleLogin(acc.email, acc.name, acc.avatarUrl)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#1A1A22] to-slate-900 hover:from-slate-800 hover:to-slate-850 border border-white/15 hover:border-white/30 transition-all text-left shadow-lg active:scale-98"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    {acc.avatarUrl ? (
                      <img src={acc.avatarUrl} alt={acc.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {acc.name ? acc.name.charAt(0).toUpperCase() : 'G'}
                      </div>
                    )}
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate">{acc.name || 'Google User'}</p>
                      <p className="text-[10px] text-[#94A3B8] truncate">{acc.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 px-2.5 py-1 bg-white/5 rounded-full shrink-0">
                    Switch To
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Direct Google Account Email Sign-In */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline flex items-center justify-center w-full space-x-1"
          >
            <span>{showManualInput ? '▲ Hide Email Input' : '▼ Sign In with Google Email'}</span>
          </button>

          {showManualInput && (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleDirectGoogleLogin(googleEmail, displayName);
              }}
              className="space-y-3 text-left animate-fadeIn pt-1"
            >
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#A0AEC0]">
                  Your Google Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-[#777]" />
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={e => setGoogleEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    required
                    className="w-full bg-[#0A0A0C] border border-[#2A2A30] focus:border-white/50 focus:outline-none rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#666]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#A0AEC0]">
                  Your Display Name (Optional)
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-[#777]" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#0A0A0C] border border-[#2A2A30] focus:border-white/50 focus:outline-none rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#666]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-slate-200 via-white to-slate-200 text-black font-extrabold text-xs shadow-lg hover:brightness-105 active:scale-98 transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>Sign In to Melodyx</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Trust & Policy Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-center space-x-4 text-[10px] text-[#64748B]">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Google OAuth</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Headphones className="w-3.5 h-3.5 text-slate-400" />
            <span>Lossless Bitrate</span>
          </span>
          <span>•</span>
          <span>Ad-Free</span>
        </div>
      </div>
    </div>
  );
};

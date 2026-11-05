import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  preferredLanguages?: string[];
  isGoogleAccount?: boolean;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authNotice: string | null;
  openAuthModal: (notice?: string) => void;
  closeAuthModal: () => void;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const STORAGE_KEYS = {
  USER: 'melodyx_auth_user',
  TOKEN: 'melodyx_auth_token',
  LEGACY_USER: 'soundwave_auth_user',
  LEGACY_TOKEN: 'soundwave_auth_token'
};

export const useAuthStore = create<AuthStore>((set, get) => {
  // Initialize from localStorage if available
  let initialUser: AuthUser | null = null;
  let initialToken: string | null = null;

  try {
    const rawUser = localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem(STORAGE_KEYS.LEGACY_USER);
    initialToken = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem(STORAGE_KEYS.LEGACY_TOKEN);
    if (rawUser) {
      initialUser = JSON.parse(rawUser);
    }
  } catch (e) {
    console.warn('Failed to parse cached auth session:', e);
  }

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: Boolean(initialUser && initialToken),
    isAuthModalOpen: false,
    authNotice: null,

    openAuthModal: (notice?: string) => {
      set({
        isAuthModalOpen: true,
        authNotice: notice || 'Sign in with Google to play songs and access your music library.'
      });
    },

    closeAuthModal: () => {
      set({ isAuthModalOpen: false, authNotice: null });
    },

    login: (user: AuthUser, token: string) => {
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      } catch (e) { }
      set({ user, token, isAuthenticated: true, isAuthModalOpen: false, authNotice: null });
    },

    logout: () => {
      try {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.LEGACY_USER);
        localStorage.removeItem(STORAGE_KEYS.LEGACY_TOKEN);
      } catch (e) { }
      set({ user: null, token: null, isAuthenticated: false });
    },

    updateUser: (updates: Partial<AuthUser>) => {
      const current = get().user;
      if (!current) return;
      const updated = { ...current, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      } catch (e) { }
      set({ user: updated });
    }
  };
});

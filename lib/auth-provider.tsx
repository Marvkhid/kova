'use client';

// ============================================================
// KOVA — Unified Auth Context (first-party, no Clerk)
// Single auth source for the whole app:
//   • register → /api/auth/register (buyer OR seller + shop)
//   • login    → /api/auth/login    (bcrypt + 7-day JWT)
//   • session  → JWT in localStorage, restored on load
// Exposes useAuth / useUser / UserButton — the same hook
// surface the app has always used — so every component works
// unchanged, now without any third-party auth dependency.
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, registerAuthTokenProvider, API_URL } from '@/lib/api';

// ── Local session storage ────────────────────────────────

const LS_TOKEN_KEY = 'kova_local_token';

export interface LocalUser {
  id: string;
  email: string;
  name: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  avatarUrl: string | null;
  sellerProfile: {
    id: string;
    storeName: string;
    storeSlug: string;
    logoUrl?: string | null;
  } | null;
}

function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LS_TOKEN_KEY);
}

function decodeJwtPayload(token: string): any | null {
  try {
    const part = token.split('.')[1];
    return JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

// ── Context shape ─────────────────────────────────────────

interface UnifiedAuth {
  isLoaded: boolean;
  isSignedIn: boolean;
  /** Works for ALL authenticated requests; used by the API client. */
  getToken: () => Promise<string | null>;
  user: LocalUser | null;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<LocalUser>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    role: 'BUYER' | 'SELLER';
    storeName?: string;
    storeDescription?: string;
  }) => Promise<LocalUser>;
  logout: () => void;
}

const AuthContext = createContext<UnifiedAuth | null>(null);

export function KovaAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const [restoreDone, setRestoreDone] = useState(false);

  // Restore session on load and wire the API token provider.
  useEffect(() => {
    const token = readStoredToken();
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload?.provider === 'local' && payload.exp * 1000 > Date.now()) {
        registerAuthTokenProvider(async () => token);
      } else {
        window.localStorage.removeItem(LS_TOKEN_KEY);
      }
    }
    setTokenReady(true);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = readStoredToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      registerAuthTokenProvider(async () => token);
      const me = await api.getMe();
      setUser(me as LocalUser);
    } catch (err) {
      // Only evict the session when the server REJECTS the token.
      // Network hiccups (server restarting, offline) must not log
      // the user out.
      const status =
        err && typeof err === 'object' && 'status' in err
          ? (err as { status?: number }).status
          : undefined;
      if (status === 401 || status === 403) {
        window.localStorage.removeItem(LS_TOKEN_KEY);
        registerAuthTokenProvider(async () => null);
        setUser(null);
      }
      // else: keep the token; the next navigation retries the restore.
    }
  }, []);

  useEffect(() => {
    if (!tokenReady) return;
    if (readStoredToken()) {
      void refreshUser().finally(() => setRestoreDone(true));
    } else {
      setRestoreDone(true);
    }
  }, [tokenReady, refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetchAuth<{ token: string; user: LocalUser }>(
      '/auth/login',
      { email, password },
    );
    window.localStorage.setItem(LS_TOKEN_KEY, res.token);
    registerAuthTokenProvider(async () => res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      role: 'BUYER' | 'SELLER';
      storeName?: string;
      storeDescription?: string;
    }) => {
      const res = await apiFetchAuth<{ token: string; user: LocalUser }>(
        '/auth/register',
        input,
      );
      window.localStorage.setItem(LS_TOKEN_KEY, res.token);
      registerAuthTokenProvider(async () => res.token);
      setUser(res.user);
      return res.user;
    },
    [],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(LS_TOKEN_KEY);
    registerAuthTokenProvider(async () => null);
    setUser(null);
    router.push('/');
    router.refresh();
  }, [router]);

  const isSignedIn = !!user;

  const getToken = useCallback(async (): Promise<string | null> => {
    return readStoredToken();
  }, []);

  const value = useMemo<UnifiedAuth>(
    () => ({
      // Match Clerk semantics: isLoaded only once the session state is
      // actually known (restore finished).
      isLoaded: tokenReady && restoreDone,
      isSignedIn,
      getToken,
      user,
      refreshUser,
      login,
      register,
      logout,
    }),
    [
      tokenReady,
      restoreDone,
      isSignedIn,
      getToken,
      user,
      refreshUser,
      login,
      register,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Back-compat alias (previous provider name).
export const LocalAuthProvider = KovaAuthProvider;

// Small fetch helper that does NOT attach auth headers (used only
// for login/register before a token exists).
async function apiFetchAuth<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (typeof data?.message === 'string' && data.message) ||
        (Array.isArray(data?.message) && data.message.join(' · ')) ||
        'Something went wrong',
    );
  }
  return data as T;
}

// ── Public hooks (same surface the app has always used) ──

export interface KovaUseAuthReturn {
  isLoaded: boolean;
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
  login: (email: string, password: string) => Promise<LocalUser>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    role: 'BUYER' | 'SELLER';
    storeName?: string;
    storeDescription?: string;
  }) => Promise<LocalUser>;
  logout: () => void;
  user: LocalUser | null;
}

export interface KovaUseUserReturn {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    /** Convenience: "firstName lastName" (or name / email local-part). */
    fullName: string | null;
    imageUrl: string;
    emailAddresses: Array<{ emailAddress: string; id: string }>;
    primaryEmailAddress: { emailAddress: string; id: string } | null;
    createdAt: string;
  } | null;
}

function contextOrThrow(): UnifiedAuth {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('Kova auth hooks must be used inside <KovaAuthProvider>');
  }
  return ctx;
}

/** Signed-in state + token access + login/register/logout. */
export function useAuth(): KovaUseAuthReturn {
  const ctx = contextOrThrow();
  return {
    isLoaded: ctx.isLoaded,
    isSignedIn: ctx.isSignedIn,
    getToken: ctx.getToken,
    login: ctx.login,
    register: ctx.register,
    logout: ctx.logout,
    user: ctx.user,
  };
}

/** Current user, shaped like the old Clerk user object. */
export function useUser(): KovaUseUserReturn {
  const ctx = contextOrThrow();
  const u = ctx.user;
  return {
    isLoaded: ctx.isLoaded,
    isSignedIn: ctx.isSignedIn,
    user: u
      ? {
          id: u.id,
          username: null,
          firstName: u.name?.split(' ')[0] ?? null,
          lastName: u.name?.split(' ').slice(1).join(' ') || null,
          fullName: u.name ?? null,
          imageUrl: u.avatarUrl ?? '',
          emailAddresses: [{ emailAddress: u.email, id: 'local' }],
          primaryEmailAddress: { emailAddress: u.email, id: 'local' },
          createdAt: new Date(0).toISOString(),
        }
      : null,
  };
}

/** Account menu avatar with links + sign out (renders nothing when signed out). */
export function UserButton(_props?: Record<string, unknown>) {
  const ctx = useContext(AuthContext);
  if (!ctx || !ctx.isSignedIn || !ctx.user) return null;
  return <LocalUserMenu />;
}

function LocalUserMenu() {
  const ctx = contextOrThrow();
  const [open, setOpen] = useState(false);
  const user = ctx.user;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-local-user-menu]')) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!user) return null;

  const initials = (user.name ?? user.email)
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative" data-local-user-menu>
      <button
        type="button"
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full bg-[#0D0D0D] text-[#F5F0E8] text-[0.7rem] font-bold flex items-center justify-center ring-2 ring-transparent hover:ring-[#E8622A] transition-all"
      >
        {initials}
      </button>
      {open && (
        <div className="fixed sm:absolute right-3 sm:right-0 top-[60px] sm:top-[calc(100%+8px)] left-3 sm:left-auto w-auto sm:w-56 bg-white rounded-[14px] border border-black/[0.08] shadow-xl p-2 z-[80]">
          <div className="px-3 py-2 border-b border-black/[0.06] mb-1">
            <p className="font-semibold text-[0.82rem] text-[#0D0D0D] truncate">{user.name}</p>
            <p className="text-[0.7rem] text-black/45 truncate">{user.email}</p>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#E8622A] mt-1">
              {user.role.toLowerCase()}
              {user.sellerProfile ? ` · ${user.sellerProfile.storeName}` : ''}
            </p>
          </div>
          <a
            href="/profile"
            className="block px-3 py-2 rounded-[10px] text-[0.82rem] text-[#0D0D0D] hover:bg-black/[0.05]"
          >
            My profile
          </a>
          <a
            href="/orders"
            className="block px-3 py-2 rounded-[10px] text-[0.82rem] text-[#0D0D0D] hover:bg-black/[0.05]"
          >
            My orders
          </a>
          <a
            href="/wishlist"
            className="block px-3 py-2 rounded-[10px] text-[0.82rem] text-[#0D0D0D] hover:bg-black/[0.05]"
          >
            Wishlist
          </a>
          {user.sellerProfile && (
            <>
              <a
                href="/sellers/dashboard"
                className="block px-3 py-2 rounded-[10px] text-[0.82rem] text-[#0D0D0D] hover:bg-black/[0.05]"
              >
                Seller dashboard
              </a>
              <a
                href={`/store/${user.sellerProfile.storeSlug}`}
                className="block px-3 py-2 rounded-[10px] text-[0.82rem] text-[#0D0D0D] hover:bg-black/[0.05]"
              >
                My shop
              </a>
            </>
          )}
          <button
            type="button"
            onClick={ctx.logout}
            className="w-full text-left px-3 py-2 rounded-[10px] text-[0.82rem] text-red-500 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

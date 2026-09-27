'use client';

// ============================================================
// KOVA — Unified Auth Context
// Merges TWO auth sources into one hook surface that mirrors
// the Clerk API surface the app already uses:
//   1. Clerk (existing accounts, Google OAuth)
//   2. KOVA local accounts (email + password via /api/auth/*)
// Components import useAuth/useUser/UserButton from this module
// (or keep importing from @clerk/nextjs — both work). Signed-in
// state, token plumbing and the account menu behave identically
// for both account types.
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
import {
  useAuth as useClerkAuth,
  useUser as useClerkUser,
  UserButton as ClerkUserButton,
} from '@clerk/nextjs';
import { api, registerAuthTokenProvider } from '@/lib/api';

// ── Local account storage ────────────────────────────────

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

// ── Context shape (mirrors the Clerk surface we use) ──────

interface UnifiedAuth {
  isLoaded: boolean;
  isSignedIn: boolean;
  authKind: 'local' | 'clerk' | null;
  /** Works for BOTH auth kinds; used by the API client. */
  getToken: () => Promise<string | null>;
  localUser: LocalUser | null;
  refreshLocalUser: () => Promise<void>;
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

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const clerk = useClerkAuth();
  const router = useRouter();
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
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

  const refreshLocalUser = useCallback(async () => {
    const token = readStoredToken();
    if (!token) {
      setLocalUser(null);
      return;
    }
    try {
      registerAuthTokenProvider(async () => token);
      const me = await api.getMe();
      setLocalUser(me as LocalUser);
    } catch (err) {
      // Only evict the session when the server REJECTS the token.
      // Network hiccups (server restarting, offline) must not log
      // the user out.
      const status = err && typeof err === 'object' && 'status' in err ? (err as { status?: number }).status : undefined;
      if (status === 401 || status === 403) {
        window.localStorage.removeItem(LS_TOKEN_KEY);
        registerAuthTokenProvider(async () => null);
        setLocalUser(null);
      }
      // else: keep the token; the UI stays in its loading/anonymous
      // state and the next navigation retries the restore.
    }
  }, []);

  useEffect(() => {
    if (!tokenReady) return;
    if (readStoredToken()) {
      void refreshLocalUser().finally(() => setRestoreDone(true));
    } else {
      setRestoreDone(true);
    }
  }, [tokenReady, refreshLocalUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiFetchAuth<{ token: string; user: LocalUser }>(
        '/auth/login',
        { email, password },
      );
      window.localStorage.setItem(LS_TOKEN_KEY, res.token);
      registerAuthTokenProvider(async () => res.token);
      setLocalUser(res.user);
      return res.user;
    },
    [],
  );

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
      setLocalUser(res.user);
      return res.user;
    },
    [],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(LS_TOKEN_KEY);
    registerAuthTokenProvider(async () => null);
    setLocalUser(null);
    router.push('/');
    router.refresh();
  }, [router]);

  const isLocalSignedIn = !!localUser;
  const isSignedIn = isLocalSignedIn || !!clerk.isSignedIn;

  const getToken = useCallback(async (): Promise<string | null> => {
    if (isLocalSignedIn) return readStoredToken();
    if (clerk.isSignedIn) {
      try {
        return await clerk.getToken();
      } catch {
        return null;
      }
    }
    return null;
  }, [isLocalSignedIn, clerk]);

  // Make sure the API client always has a working provider
  // (covers the Clerk-only case, which AuthBridge also handles).
  useEffect(() => {
    if (isSignedIn && !isLocalSignedIn) {
      registerAuthTokenProvider(async () => {
        try {
          return await clerk.getToken();
        } catch {
          return null;
        }
      });
    }
  }, [isSignedIn, isLocalSignedIn, clerk]);

  const value = useMemo<UnifiedAuth>(
    () => ({
      // Match Clerk semantics: isLoaded only once the session state is
      // actually known (local restore finished + Clerk booted).
      isLoaded: tokenReady && restoreDone && (clerk.isLoaded ?? false),
      isSignedIn,
      authKind: isLocalSignedIn ? 'local' : clerk.isSignedIn ? 'clerk' : null,
      getToken,
      localUser,
      refreshLocalUser,
      login,
      register,
      logout,
    }),
    [
      tokenReady,
      clerk,
      isSignedIn,
      isLocalSignedIn,
      getToken,
      localUser,
      refreshLocalUser,
      login,
      register,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Small fetch helper that does NOT attach auth headers (used only
// for login/register before a token exists).
async function apiFetchAuth<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
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

// ── Shim hooks: drop-in compatible with Clerk's versions ──

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
  localUser: LocalUser | null;
  authKind: 'local' | 'clerk' | null;
}

export interface KovaUseUserReturn {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    /** Convenience: "firstName lastName" (or username / email local-part). */
    fullName: string | null;
    imageUrl: string;
    emailAddresses: Array<{ emailAddress: string; id: string }>;
    primaryEmailAddress: { emailAddress: string; id: string } | null;
    externalAccounts: unknown[];
    createdAt: string;
  } | null;
}

/** Merged useAuth — local accounts report signed-in too. */
export function useAuth(): KovaUseAuthReturn {
  // Clerk hook must run unconditionally (rules of hooks).
  const clerk = useClerkAuth();
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Fallback: Clerk-only (outside the provider).
    return {
      isLoaded: !!clerk.isLoaded,
      isSignedIn: !!clerk.isSignedIn,
      getToken: async () => {
        try {
          return (await clerk.getToken()) ?? null;
        } catch {
          return null;
        }
      },
      login: async () => {
        throw new Error('Local auth is not available here');
      },
      register: async () => {
        throw new Error('Local auth is not available here');
      },
      logout: () => undefined,
      localUser: null,
      authKind: clerk.isSignedIn ? 'clerk' : null,
    };
  }
  return {
    isLoaded: ctx.isLoaded,
    isSignedIn: ctx.isSignedIn,
    getToken: ctx.getToken,
    login: ctx.login,
    register: ctx.register,
    logout: ctx.logout,
    localUser: ctx.localUser,
    authKind: ctx.authKind,
  };
}

/** Merged useUser — local accounts get a user object shaped like Clerk's. */
export function useUser(): KovaUseUserReturn {
  // Clerk hook must run unconditionally (rules of hooks).
  const clerkUser = useClerkUser();
  const ctx = useContext(AuthContext);

  // Gate "loaded" on the local restore too — otherwise Clerk reports
  // loaded (it only knows about ITS sessions) while the local session
  // is still being restored, and pages redirect signed-in users.
  if (ctx && !ctx.isLoaded) {
    return { isLoaded: false, isSignedIn: false, user: null };
  }

  if (ctx?.localUser) {
    const u = ctx.localUser;
    return {
      isLoaded: true,
      isSignedIn: true,
      user: {
        id: u.id,
        username: null,
        firstName: u.name?.split(' ')[0] ?? null,
        lastName: u.name?.split(' ').slice(1).join(' ') || null,
        fullName: u.name ?? null,
        imageUrl: u.avatarUrl ?? '',
        emailAddresses: [{ emailAddress: u.email, id: 'local' }],
        primaryEmailAddress: { emailAddress: u.email, id: 'local' },
        externalAccounts: [],
        createdAt: new Date().toISOString(),
      },
    };
  }

  const u = clerkUser.user;
  return {
    isLoaded: clerkUser.isLoaded,
    isSignedIn: !!clerkUser.isSignedIn,
    user: u
      ? {
          id: u.id,
          username: u.username ?? null,
          firstName: u.firstName ?? null,
          lastName: u.lastName ?? null,
          fullName: u.fullName ?? null,
          imageUrl: u.imageUrl,
          emailAddresses: u.emailAddresses.map((e) => ({ emailAddress: e.emailAddress, id: e.id })),
          primaryEmailAddress: u.primaryEmailAddress
            ? { emailAddress: u.primaryEmailAddress.emailAddress, id: u.primaryEmailAddress.id }
            : null,
          externalAccounts: u.externalAccounts,
          createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
        }
      : null,
  };
}

/** Account menu for local accounts; renders Clerk's button for Clerk users. */
export function UserButton(props: Record<string, unknown>) {
  const ctx = useContext(AuthContext);
  if (!ctx) return <ClerkUserButton {...(props as any)} />;
  if (ctx.authKind === 'clerk' || !ctx.isSignedIn) {
    return <ClerkUserButton {...(props as any)} />;
  }
  return <LocalUserMenu />;
}

function LocalUserMenu() {
  const ctx = useContext(AuthContext)!;
  const [open, setOpen] = useState(false);
  const user = ctx.localUser;

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
        <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-[14px] border border-black/[0.08] shadow-xl p-2 z-[80]">
          <div className="px-3 py-2 border-b border-black/[0.06] mb-1">
            <p className="font-semibold text-[0.82rem] text-[#0D0D0D] truncate">{user.name}</p>
            <p className="text-[0.7rem] text-black/45 truncate">{user.email}</p>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#E8622A] mt-1">
              {user.role.toLowerCase()}
              {user.sellerProfile ? ` · ${user.sellerProfile.storeName}` : ''}
            </p>
          </div>
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

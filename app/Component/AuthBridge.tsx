'use client';

// ============================================================
// KOVA — AuthBridge
// Registers Clerk's getToken with the API client so every
// authenticated request carries the session token.
// ============================================================

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { registerAuthTokenProvider } from '@/lib/api';

export function AuthBridge() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && getToken) {
      registerAuthTokenProvider(() => getToken());
    } else {
      registerAuthTokenProvider(async () => null);
    }
  }, [isLoaded, isSignedIn, getToken]);

  return null;
}

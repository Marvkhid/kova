'use client';

// ============================================================
// KOVA — Wishlist hook
// Persistent, server-backed wishlist for authenticated users.
// Guest state stays in memory only (nothing is faked).
// ============================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { api, ApiError } from '@/lib/api';
import { track } from '@/lib/analytics';
import type { Product } from '@/lib/types';

interface WishlistContextValue {
  ids: Set<string>;
  items: Product[];
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  toggle: (product: Product) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setIds(new Set());
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.getWishlist();
      setItems(res.items.map((i) => i.product).filter(Boolean));
      setIds(new Set(res.items.map((i) => i.product.id)));
    } catch {
      // keep silent — wishlist is non-critical UI
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  // Re-sync when the signed-in user changes
  useEffect(() => {
    if (isSignedIn && user) refresh();
    if (!isSignedIn) {
      setIds(new Set());
      setItems([]);
    }
  }, [isSignedIn, user?.id, refresh]);

  const isWishlisted = useCallback((productId: string) => ids.has(productId), [ids]);

  const toggle = useCallback(
    async (product: Product) => {
      if (!isSignedIn) return; // UI should prompt sign-in instead
      const wasWishlisted = ids.has(product.id);
      try {
        if (wasWishlisted) {
          setIds((prev) => {
            const next = new Set(prev);
            next.delete(product.id);
            return next;
          });
          setItems((prev) => prev.filter((p) => p.id !== product.id));
          await api.removeFromWishlist(product.id);
          track.removeFromWishlist({ id: product.id });
        } else {
          setIds((prev) => new Set(prev).add(product.id));
          setItems((prev) => [product, ...prev]);
          await api.addToWishlist(product.id);
          track.addToWishlist({ id: product.id, name: product.name });
        }
      } catch (err) {
        // rollback on failure
        refresh();
        if (err instanceof ApiError && err.status !== 401) throw err;
      }
    },
    [isSignedIn, ids, refresh],
  );

  const remove = useCallback(
    async (productId: string) => {
      setIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      setItems((prev) => prev.filter((p) => p.id !== productId));
      if (isSignedIn) {
        try {
          await api.removeFromWishlist(productId);
        } catch {
          refresh();
        }
      }
    },
    [isSignedIn, refresh],
  );

  const value = useMemo(
    () => ({ ids, items, loading, isWishlisted, toggle, remove, refresh }),
    [ids, items, loading, isWishlisted, toggle, remove, refresh],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
}

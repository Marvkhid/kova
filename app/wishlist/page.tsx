'use client';
// ============================================================
// KOVA — /wishlist
// Persistent wishlist backed by the API (Postgres).
// Requires authentication — that is the one place it makes sense.
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/app/Component/ToastContext';
import { ProductCard } from '@/app/Component/ProductCard';
import { ProductCardSkeleton } from '@/app/Component/Skeletons';
import type { Product } from '@/lib/types';

export default function WishlistPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { addToast } = useToast();
  const [items, setItems] = useState<Product[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = async () => {
    try {
      const res = await api.getWishlist();
      setItems(res.items.map((i) => i.product).filter(Boolean));
      setState('ready');
    } catch {
      setState('error');
    }
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) return; // render gate below
    if (isLoaded && isSignedIn) load();
  }, [isLoaded, isSignedIn]);

  async function remove(id: string, name: string) {
    try {
      await api.removeFromWishlist(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      addToast(`Removed "${name}" from your wishlist.`);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Could not update wishlist.', 'error');
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] px-4 sm:px-5 md:px-8 py-10">
        <div className="max-w-[1280px] mx-auto">
          <div className="h-10 w-56 bg-black/[0.06] rounded-full animate-pulse mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
        <div className="bg-white rounded-[20px] border border-black/[0.07] p-8 sm:p-10 text-center max-w-[420px] w-full">
          <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-5" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/seed/photo/beauty/beauty-p07.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <h1 className="font-extrabold text-[1.3rem] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Sign in to see your wishlist
          </h1>
          <p className="text-[0.86rem] text-black/45 mb-6 leading-relaxed">
            Saved items sync to your account — they follow you across devices.
          </p>
          <Link
            href="/sign-in?redirect_url=%2Fwishlist"
            className="inline-block px-8 py-3 rounded-full bg-[#0D0D0D] text-[#F5F0E8] font-medium hover:bg-[#1A1A1A] transition-colors"
          >
            Sign in to continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] px-4 sm:px-5 md:px-8 py-10 sm:py-14">
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-8 sm:mb-10">
          <p className="text-[0.68rem] font-medium tracking-[0.14em] uppercase text-black/36 mb-1.5">Saved for later</p>
          <h1 className="font-extrabold text-[#0D0D0D] leading-[1.0] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.55rem, 7vw, 2.4rem)' }}>
            Your wishlist
          </h1>
          <p className="text-[0.85rem] text-black/45 mt-2">
            {state === 'ready' && `${items.length} item${items.length === 1 ? '' : 's'} saved`}
          </p>
        </div>

        {state === 'loading' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5" aria-busy="true" aria-label="Loading wishlist">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        )}

        {state === 'error' && (
          <div className="bg-white rounded-[16px] border border-black/[0.07] p-8 text-center max-w-[400px] mx-auto">
            <p className="font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Could not load your wishlist</p>
            <p className="text-[0.84rem] text-black/45 mb-5">The server did not respond. Check your connection.</p>
            <button type="button" onClick={load} className="px-6 py-2.5 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors">
              Retry
            </button>
          </div>
        )}

        {state === 'ready' && items.length === 0 && (
          <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-8 sm:p-12 text-center max-w-[520px] mx-auto">
            <h2 className="font-extrabold text-[1.1rem] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Nothing saved yet
            </h2>
            <p className="text-[0.85rem] text-black/45 mb-6 leading-relaxed">
              Tap the heart on any product to keep it here — your list is saved to your account, not this device.
            </p>
            <Link href="/shopping" className="inline-block px-7 py-3 rounded-full bg-[#E8622A] text-white font-medium hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(232,98,42,0.35)] transition-all duration-200">
              Browse the marketplace
            </Link>
          </div>
        )}

        {state === 'ready' && items.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {items.map((p) => (
              <div key={p.id} className="relative group">
                <ProductCard product={p} />
                <button
                  type="button"
                  onClick={() => remove(p.id, p.name)}
                  aria-label={`Remove ${p.name} from wishlist`}
                  className="absolute top-2.5 right-2.5 z-30 w-8 h-8 rounded-full bg-white/90 backdrop-blur border border-black/[0.08] flex items-center justify-center text-[#E8622A] hover:bg-white hover:scale-110 transition-all shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A5.99 5.99 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

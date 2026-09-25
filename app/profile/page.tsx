'use client';
// ============================================================
// KOVA — /profile
// Real account page backed by Clerk + the API. No hardcoded
// user, no fabricated orders — honest empty states instead.
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import type { Product } from '@/lib/types';

export default function ProfilePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistState, setWishlistState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    api
      .getWishlist()
      .then((res) => {
        if (cancelled) return;
        setWishlist(res.items.map((i) => i.product).filter(Boolean));
        setWishlistState('ready');
      })
      .catch(() => {
        if (!cancelled) setWishlistState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  const loading = !isLoaded || !userLoaded;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] px-4 py-10" aria-busy="true">
        <div className="max-w-[1280px] mx-auto">
          <div className="h-10 w-64 bg-black/[0.06] rounded-full animate-pulse mb-8" />
          <div className="grid lg:grid-cols-[300px_1fr] gap-6">
            <div className="h-64 bg-black/[0.04] rounded-[16px] animate-pulse" />
            <div className="h-64 bg-black/[0.04] rounded-[16px] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
        <div className="bg-white rounded-[20px] border border-black/[0.07] p-8 sm:p-10 text-center max-w-[420px] w-full">
          <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-5" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/seed/photo/interior-home/interior-home-p08.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <h1 className="font-extrabold text-[1.25rem] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Sign in to view your profile
          </h1>
          <p className="text-[0.86rem] text-black/45 mb-6">
            Your account, wishlist and seller dashboard all live behind one sign-in.
          </p>
          <Link
            href="/sign-in?redirect_url=%2Fprofile"
            className="inline-block px-8 py-3 rounded-full bg-[#0D0D0D] text-[#F5F0E8] font-medium hover:bg-[#1A1A1A] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const displayName = user.fullName ?? user.username ?? 'Your account';
  const email = user.primaryEmailAddress?.emailAddress ?? '';
  const initials =
    displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'K';

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-[#0D0D0D] pt-8 sm:pt-10 pb-12 sm:pb-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
          <p className="text-[0.66rem] sm:text-[0.7rem] font-medium tracking-[0.14em] uppercase text-[#F5F0E8]/30 mb-3">
            My account
          </p>
          <h1
            className="font-extrabold text-[#F5F0E8] leading-[1.0] tracking-[-0.03em]"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 7vw, 3rem)' }}
          >
            Your profile
          </h1>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8 py-8 sm:py-10">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6 sm:gap-8 items-start">
          {/* ── Left: account card + links ── */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-5 sm:p-6 flex flex-col items-center text-center gap-2">
              {user.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.imageUrl} alt="" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#E8622A] flex items-center justify-center">
                  <span
                    className="font-extrabold text-white text-[1.4rem] sm:text-[1.8rem]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {initials}
                  </span>
                </div>
              )}
              <p className="font-bold text-[0.96rem] sm:text-[1rem] text-[#0D0D0D] mt-2" style={{ fontFamily: 'var(--font-display)' }}>
                {displayName}
              </p>
              <p className="text-[0.76rem] sm:text-[0.78rem] text-black/40 break-all">{email}</p>
              {user.createdAt && (
                <p className="text-[0.7rem] text-black/35 mt-1">
                  KOVA member since{' '}
                  {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>

            <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] overflow-hidden">
              {[
                { label: 'Wishlist', href: '/wishlist', photo: '/images/seed/photo/interior-home/interior-home-p06.jpg' },
                { label: 'Seller dashboard', href: '/sellers/dashboard', photo: '/images/seed/photo/electronics/electronics-p06.jpg' },
                { label: 'Create a listing', href: '/sellers/new', photo: '/images/seed/photo/fashion/fashion-p06.jpg' },
                { label: 'Browse the marketplace', href: '/shopping', photo: '/images/seed/photo/furniture/furniture-p06.jpg' },
                { label: 'Contact support', href: '/contact', photo: '/images/seed/photo/beauty/beauty-p06.jpg' },
              ].map((item, i, arr) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-black/[0.03] transition-colors text-[0.84rem] sm:text-[0.88rem] font-medium text-[#0D0D0D] ${
                    i < arr.length - 1 ? 'border-b border-black/[0.05]' : ''
                  }`}
                >
                  <span className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.photo} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </span>
                  {item.label}
                  <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>

            <p className="text-[0.72rem] text-black/35 px-1">
              Manage your email, password and sign-in methods via the account button in the header.
            </p>
          </div>

          {/* ── Right: wishlist preview ── */}
          <div className="flex flex-col gap-5 sm:gap-6">
            <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-black/[0.06]">
                <h2 className="font-bold text-[0.95rem] sm:text-[1rem] text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
                  Wishlist preview
                </h2>
                <Link href="/wishlist" className="text-[0.76rem] sm:text-[0.78rem] text-[#E8622A] font-medium hover:opacity-70 transition-opacity">
                  Open wishlist →
                </Link>
              </div>

              {wishlistState === 'loading' && (
                <div className="p-6 flex flex-col gap-3" aria-busy="true">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-[10px] bg-black/[0.05] animate-pulse flex-shrink-0" />
                      <div className="h-3.5 w-40 bg-black/[0.06] rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              )}

              {wishlistState === 'error' && (
                <div className="p-6">
                  <p className="text-[0.84rem] text-black/45 mb-3">Could not load your wishlist right now.</p>
                  <Link href="/wishlist" className="text-[0.8rem] font-medium text-[#E8622A] hover:opacity-70">
                    Try the full wishlist page →
                  </Link>
                </div>
              )}

              {wishlistState === 'ready' && wishlist.length === 0 && (
                <div className="p-6">
                  <p className="text-[0.84rem] text-black/45 mb-3">Nothing saved yet.</p>
                  <Link href="/shopping" className="text-[0.8rem] font-medium text-[#E8622A] hover:opacity-70">
                    Find something to save →
                  </Link>
                </div>
              )}

              {wishlistState === 'ready' && wishlist.length > 0 && (
                <div className="divide-y divide-black/[0.05]">
                  {wishlist.slice(0, 4).map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 hover:bg-black/[0.02] transition-colors"
                    >
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[10px] overflow-hidden bg-[#EDE8DF] flex-shrink-0">
                        {p.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-black/25 text-[0.6rem] font-semibold uppercase">
                            {p.name.slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[0.82rem] sm:text-[0.85rem] text-[#0D0D0D] truncate">{p.name}</p>
                        <p className="text-[0.7rem] text-black/38 mt-0.5 capitalize">{p.productType.toLowerCase()}</p>
                      </div>
                      <span className="font-bold text-[0.84rem] text-[#0D0D0D] flex-shrink-0" style={{ fontFamily: 'var(--font-display)' }}>
                        ${p.price}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Seller nudge */}
            <div className="bg-[#0D0D0D] rounded-[16px] sm:rounded-[20px] p-6 sm:p-7">
              <h2 className="font-extrabold text-[1rem] text-[#F5F0E8] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Thinking about selling?
              </h2>
              <p className="text-[0.85rem] text-[#F5F0E8]/55 leading-relaxed mb-4">
                Your account can become a store in under a minute — list physical or digital products with
                their own shareable links and QR codes.
              </p>
              <Link
                href="/sell"
                className="inline-block px-6 py-2.5 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors"
              >
                Sell on KOVA →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

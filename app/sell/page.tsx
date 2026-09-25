'use client';
// ============================================================
// KOVA — /sell
// Seller onboarding. A signed-in user activates their existing
// account as a seller — no second account, ever.
// The backend generates the store slug from the store name.
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/app/Component/ToastContext';
import { track } from '@/lib/analytics';

const inputClass =
  'w-full rounded-[12px] bg-[#F5F0E8] border border-black/[0.09] text-[0.9rem] text-[#0D0D0D] placeholder:text-black/30 px-4 h-[48px] outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/15 transition-all duration-200';

export default function SellPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { addToast } = useToast();

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Already a seller? Straight to the dashboard.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setCheckingExisting(false);
      return;
    }
    let cancelled = false;
    api
      .getSellerDashboard()
      .then(() => {
        if (!cancelled) router.replace('/sellers/dashboard');
      })
      .catch(() => {
        if (!cancelled) setCheckingExisting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, router]);

  // Prefill a sensible store name
  useEffect(() => {
    if (!user) return;
    setStoreName((prev) => {
      if (prev) return prev;
      const name = user.fullName ?? user.username ?? '';
      return name ? `${name}'s Store` : '';
    });
  }, [user]);

  const nameValid = storeName.trim().length >= 2;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nameValid) {
      setError('Store name must be at least 2 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await api.createSellerProfile({ storeName: storeName.trim(), description: description.trim() || undefined });
      track.sellerOnboarding();
      addToast('Welcome aboard — you are now a Kova seller.');
      router.push('/sellers/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not activate your store. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Not signed in: conversion gate ──
  if (isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-8">
            <span className="inline-block text-[0.66rem] font-semibold tracking-[0.18em] uppercase text-[#E8622A] bg-[#E8622A]/[0.08] rounded-full px-4 py-1.5 mb-5">
              Sell on Kova
            </span>
            <h1
              className="font-extrabold text-[#0D0D0D] leading-[1.04] tracking-[-0.03em] mb-4"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 6vw, 2.4rem)' }}
            >
              Turn what you make into what you sell.
            </h1>
            <p className="text-black/50 text-[0.95rem] leading-relaxed">
              Physical goods or digital products — list in minutes, get a public page with its own link and
              QR code, and reach buyers across the marketplace. Sign in first; it takes one tap with Google.
            </p>
          </div>
          <div className="bg-white rounded-[20px] border border-black/[0.07] p-6 sm:p-8">
            <Link
              href="/sign-in?redirect_url=%2Fsell"
              className="w-full h-[48px] rounded-full bg-[#0D0D0D] text-[#F5F0E8] font-medium flex items-center justify-center gap-2.5 hover:bg-[#1A1A1A] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z" />
                <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.86 11.86 0 0 0 0 10.76l3.98-3.09Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
              </svg>
              Continue with Google
            </Link>
            <p className="text-center text-[0.72rem] text-black/35 mt-4">
              Secured by Clerk · Your Kova account works for buying and selling
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading states ──
  if (!isLoaded || checkingExisting) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center" aria-busy="true" aria-label="Loading">
        <div className="w-10 h-10 rounded-full border-[3px] border-black/10 border-t-[#E8622A] animate-spin" />
      </div>
    );
  }

  // ── Onboarding form ──
  return (
    <div className="min-h-screen bg-[#F5F0E8] px-4 py-12 sm:py-16">
      <div className="max-w-[560px] mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <span className="inline-block text-[0.66rem] font-semibold tracking-[0.18em] uppercase text-[#E8622A] bg-[#E8622A]/[0.08] rounded-full px-4 py-1.5 mb-5">
            Sell on Kova
          </span>
          <h1
            className="font-extrabold text-[#0D0D0D] leading-[1.04] tracking-[-0.03em] mb-3"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 6vw, 2.4rem)' }}
          >
            Set up your store
          </h1>
          <p className="text-black/50 text-[0.92rem] leading-relaxed max-w-[420px] mx-auto">
            Same account you browse with — activating a store doesn&apos;t create a new one.
          </p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-[20px] border border-black/[0.07] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="mb-5">
            <label htmlFor="storeName" className="block text-[0.8rem] font-semibold text-[#0D0D0D] mb-2">
              Store name <span className="text-[#E8622A]">*</span>
            </label>
            <input
              id="storeName"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Ada's Leather Craft"
              className={inputClass}
              maxLength={60}
              required
            />
            <p className="text-[0.72rem] text-black/35 mt-1.5">Shown on all your listings. 2–60 characters.</p>
          </div>

          <div className="mb-6">
            <label htmlFor="storeDesc" className="block text-[0.8rem] font-semibold text-[#0D0D0D] mb-2">
              About your store <span className="text-black/35 font-normal">(optional)</span>
            </label>
            <textarea
              id="storeDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you make or sell? Buyers see this on your listings."
              rows={3}
              maxLength={500}
              className="w-full rounded-[12px] bg-[#F5F0E8] border border-black/[0.09] text-[0.9rem] text-[#0D0D0D] placeholder:text-black/30 px-4 py-3 outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/15 transition-all resize-none"
            />
          </div>

          {error && (
            <div role="alert" className="mb-5 rounded-[12px] bg-red-50 border border-red-100 px-4 py-3 text-[0.8rem] text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !nameValid}
            className="w-full h-[48px] rounded-full bg-[#E8622A] text-white font-medium hover:bg-[#F07A48] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
                Activating your store…
              </>
            ) : (
              'Activate my store'
            )}
          </button>
          <p className="text-center text-[0.72rem] text-black/35 mt-4">
            Free to start · You choose when each listing goes live
          </p>
        </form>
      </div>
    </div>
  );
}

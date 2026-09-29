'use client';
// ============================================================
// KOVA — /sell
// Multi-step seller onboarding wizard:
//   01 Account → 02 Seller Profile → 03 Store Appearance
//   → 04 Seller Terms → 05 Review & Submit
// Creating the profile starts the seller lifecycle (PENDING).
// Submitting sends the application for admin review; the seller
// cannot publish products until an admin APPROVES the store —
// the backend enforces this, the UI only mirrors it.
// ============================================================

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/lib/auth-provider';
import { api, ApiError } from '@/lib/api';
import { SELLER_TERMS_VERSION } from '@/lib/types';
import { useToast } from '@/app/Component/ToastContext';
import { track } from '@/lib/analytics';

const inputClass =
  'w-full rounded-[12px] bg-[#F5F0E8] border border-black/[0.09] text-[0.9rem] text-[#0D0D0D] placeholder:text-black/30 px-4 h-[48px] outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/15 transition-all duration-200';
const labelClass = 'block text-[0.8rem] font-semibold text-[#0D0D0D] mb-2';

const STEPS = [
  { n: '01', title: 'Account' },
  { n: '02', title: 'Seller Profile' },
  { n: '03', title: 'Store Appearance' },
  { n: '04', title: 'Seller Terms' },
  { n: '05', title: 'Review & Submit' },
];

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export default function SellPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { addToast } = useToast();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Form fields (steps 2–4 data)
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');

  // Uploads (step 3)
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Terms (step 4)
  const [agreed, setAgreed] = useState(false);

  // Existing sellers belong on the dashboard (their state shows there).
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

  // Prefill sensible defaults from the signed-in account.
  useEffect(() => {
    if (!user) return;
    setStoreName((prev) => {
      if (prev) return prev;
      const name = user.fullName ?? user.username ?? '';
      return name ? `${name}'s Store` : '';
    });
    setPhone((prev) => prev || '');
  }, [user]);

  // Category options for step 2.
  useEffect(() => {
    let cancelled = false;
    api
      .getCategories()
      .then((cats) => {
        if (!cancelled) setCategories(cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug })));
      })
      .catch(() => {
        /* optional field — silent */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nameValid = storeName.trim().length >= 2;
  const descValid = description.trim().length >= 30;
  const locationValid = location.trim().length >= 2;
  const phoneValid = phone.trim() === '' || /^[\d\s()+-]{7,20}$/.test(phone.trim());
  const termsValid = agreed;

  const stepValid = (i: number) => {
    if (i === 0) return isSignedIn;
    if (i === 1) return nameValid && descValid && locationValid && phoneValid;
    if (i === 3) return termsValid;
    return true; // appearance + review steps are always passable
  };

  const canContinue = stepValid(step);

  async function uploadImage(
    file: File,
    setUploading: (v: boolean) => void,
    setUrl: (url: string) => void,
  ) {
    setError(null);
    setUploading(true);
    setUploadPct(0);
    try {
      const urls = await api.uploadImagesWithProgress([file], (pct) => setUploadPct(pct));
      if (urls[0]) setUrl(urls[0]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed — try a smaller image.');
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      // 1) Create the seller profile → role upgraded, lifecycle starts PENDING.
      await api.createSellerProfile({
        storeName: storeName.trim(),
        description: description.trim(),
      });
      // 2) Enrich the profile (PATCH — separate endpoint).
      await api.updateSellerProfile({
        location: location.trim(),
        category: category || undefined,
        phone: phone.trim() || undefined,
        logoUrl: logoUrl ?? undefined,
        bannerUrl: bannerUrl ?? undefined,
      });
      // 3) Submit for review — records terms version + acceptance timestamp.
      await api.submitSellerApplication(SELLER_TERMS_VERSION);
      track.sellerOnboarding();
      addToast('Application submitted — our team will review it shortly.');
      router.push('/sellers/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your application. Try again.');
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
              Physical goods or digital products — apply once, get reviewed, and run a store with its own
              public page. Sign in first; it takes one tap.
            </p>
          </div>
          <div className="bg-white rounded-[20px] border border-black/[0.07] p-6 sm:p-8">
            <Link
              href="/login"
              className="w-full h-[48px] rounded-full bg-[#0D0D0D] text-[#F5F0E8] font-medium flex items-center justify-center hover:bg-[#1A1A1A] transition-colors"
            >
              Sign in to continue
            </Link>
            <p className="text-center text-[0.72rem] text-black/35 mt-4">
              Your Kova account works for buying and selling
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

  // ── Wizard ──
  return (
    <div className="min-h-screen bg-[#F5F0E8] px-4 py-10 sm:py-14">
      <div className="max-w-[620px] mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block text-[0.66rem] font-semibold tracking-[0.18em] uppercase text-[#E8622A] bg-[#E8622A]/[0.08] rounded-full px-4 py-1.5 mb-5">
            Sell on Kova
          </span>
          <h1
            className="font-extrabold text-[#0D0D0D] leading-[1.04] tracking-[-0.03em] mb-3"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 6vw, 2.4rem)' }}
          >
            Apply to open your store
          </h1>
          <p className="text-black/50 text-[0.92rem] leading-relaxed max-w-[460px] mx-auto">
            Five short steps. Our team reviews every application before your store goes live.
          </p>
        </div>

        {/* Step indicator */}
        <ol className="flex items-center gap-1.5 mb-7" aria-label="Onboarding progress">
          {STEPS.map((s, i) => (
            <li key={s.n} className="flex-1">
              <div
                className={`h-[3px] rounded-full transition-colors duration-300 ${
                  i < step ? 'bg-[#E8622A]' : i === step ? 'bg-[#E8622A]/60' : 'bg-black/[0.08]'
                }`}
                aria-current={i === step ? 'step' : undefined}
              />
              <p
                className={`mt-2 text-[0.62rem] sm:text-[0.66rem] font-semibold tracking-wide uppercase ${
                  i <= step ? 'text-[#0D0D0D]' : 'text-black/30'
                }`}
              >
                <span className="hidden sm:inline">{s.n} · </span>
                {s.title}
              </p>
            </li>
          ))}
        </ol>

        <div className="bg-white rounded-[20px] border border-black/[0.07] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          {/* ── Step 1: Account ── */}
          {step === 0 && (
            <div>
              <h2 className="font-extrabold text-[1.1rem] mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                Your account
              </h2>
              <p className="text-[0.84rem] text-black/45 mb-6">
                Same account you browse with — applying never creates a second one.
              </p>
              {user && (
                <div className="flex items-center gap-4 bg-[#F5F0E8] rounded-[14px] p-4">
                  {user.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.imageUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#E8622A] text-white flex items-center justify-center font-bold">
                      {(user.fullName ?? 'K').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-[0.9rem] text-[#0D0D0D] truncate">{user.fullName ?? 'Kova seller'}</p>
                    <p className="text-[0.75rem] text-black/40 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-[0.68rem] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Verified sign-in
                  </span>
                </div>
              )}
              <div className="mt-6 bg-[#F5F0E8]/60 border border-black/[0.05] rounded-[12px] p-4 text-[0.78rem] text-black/50 leading-relaxed">
                After approval your store gets a public page with its own link, and you can list physical and
                digital products. Review usually takes a short time; we&apos;ll email you the decision.
              </div>
            </div>
          )}

          {/* ── Step 2: Seller profile ── */}
          {step === 1 && (
            <div>
              <h2 className="font-extrabold text-[1.1rem] mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                Seller profile
              </h2>
              <p className="text-[0.84rem] text-black/45 mb-6">
                Tell buyers what you sell and where you ship from. Admins see this during review.
              </p>

              <div className="mb-5">
                <label htmlFor="storeName" className={labelClass}>
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
                />
                <p className="text-[0.72rem] text-black/35 mt-1.5">Shown on all your listings. 2–60 characters.</p>
              </div>

              <div className="mb-5">
                <label htmlFor="storeDesc" className={labelClass}>
                  About your store <span className="text-[#E8622A]">*</span>
                </label>
                <textarea
                  id="storeDesc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What do you make or sell? How long have you been doing it? What makes your products special?"
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-[12px] bg-[#F5F0E8] border border-black/[0.09] text-[0.9rem] text-[#0D0D0D] placeholder:text-black/30 px-4 py-3 outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/15 transition-all resize-none"
                />
                <p className="text-[0.72rem] text-black/35 mt-1.5">
                  Minimum 30 characters · {description.trim().length}/500
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label htmlFor="storeLocation" className={labelClass}>
                    Location <span className="text-[#E8622A]">*</span>
                  </label>
                  <input
                    id="storeLocation"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className={inputClass}
                    maxLength={80}
                  />
                </div>
                <div>
                  <label htmlFor="storeCategory" className={labelClass}>
                    Main category <span className="text-black/35 font-normal">(optional)</span>
                  </label>
                  <select
                    id="storeCategory"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22black%22 stroke-opacity=%220.35%22 stroke-width=%222.5%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[right_1rem_center]`}
                  >
                    <option value="">Choose a category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-2">
                <label htmlFor="storePhone" className={labelClass}>
                  Contact phone <span className="text-black/35 font-normal">(optional)</span>
                </label>
                <input
                  id="storePhone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className={inputClass}
                  maxLength={20}
                />
                {!phoneValid && (
                  <p className="text-[0.72rem] text-red-500 mt-1.5">
                    Use digits, spaces and + - ( ) only — 7 to 20 characters.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Store appearance ── */}
          {step === 2 && (
            <div>
              <h2 className="font-extrabold text-[1.1rem] mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                Store appearance
              </h2>
              <p className="text-[0.84rem] text-black/45 mb-6">
                Optional now — you can change these anytime from your dashboard.
              </p>

              {/* Banner */}
              <p className={labelClass}>Store banner</p>
              <div className="rounded-[14px] border border-dashed border-black/15 overflow-hidden mb-1.5">
                {bannerUrl ? (
                  <div className="relative h-[120px] sm:h-[140px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bannerUrl} alt="Store banner preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setBannerUrl(null)}
                      className="absolute top-2.5 right-2.5 bg-white/95 hover:bg-white text-[#0D0D0D] text-[0.7rem] font-semibold rounded-full px-3 py-1.5 shadow-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className="w-full h-[110px] sm:h-[120px] bg-[#F5F0E8] hover:bg-[#EDE7DC] transition-colors flex flex-col items-center justify-center gap-1.5 text-black/40"
                  >
                    {uploadingBanner ? (
                      <>
                        <span className="w-5 h-5 rounded-full border-2 border-black/15 border-t-[#E8622A] animate-spin" aria-hidden="true" />
                        <span className="text-[0.74rem] font-medium text-black/45">Uploading… {uploadPct}%</span>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="m21 15-5-5L5 21" />
                        </svg>
                        <span className="text-[0.78rem] font-medium">Add a banner image</span>
                        <span className="text-[0.68rem]">Shown behind your store name · ~1600×400 works best</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(f, setUploadingBanner, setBannerUrl);
                  e.target.value = '';
                }}
              />

              {/* Logo */}
              <p className={`${labelClass} mt-6`}>Store logo</p>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative w-[72px] h-[72px] rounded-[14px] overflow-hidden border border-black/[0.08]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Store logo preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-[72px] h-[72px] rounded-[14px] bg-[#F5F0E8] flex items-center justify-center text-black/25">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="10" r="3" />
                      <path d="M7 20.66V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.66" />
                    </svg>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="inline-flex items-center gap-2 rounded-full border border-black/12 px-4 py-2 text-[0.76rem] font-semibold text-[#0D0D0D] hover:bg-black/[0.04] transition-colors disabled:opacity-50"
                  >
                    {uploadingLogo ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-black/15 border-t-[#E8622A] animate-spin" aria-hidden="true" />
                        Uploading… {uploadPct}%
                      </>
                    ) : logoUrl ? (
                      'Replace logo'
                    ) : (
                      'Upload logo'
                    )}
                  </button>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl(null)}
                      className="text-[0.72rem] text-black/40 hover:text-red-500 transition-colors text-left"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(f, setUploadingLogo, setLogoUrl);
                  e.target.value = '';
                }}
              />
              <p className="text-[0.72rem] text-black/35 mt-2">Square image · appears next to your store name everywhere.</p>
            </div>
          )}

          {/* ── Step 4: Seller terms ── */}
          {step === 3 && (
            <div>
              <h2 className="font-extrabold text-[1.1rem] mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                Seller terms
              </h2>
              <p className="text-[0.84rem] text-black/45 mb-6">
                Every Kova seller operates under the same agreement — please read it.
              </p>
              <div className="bg-[#F5F0E8]/60 border border-black/[0.05] rounded-[14px] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-white border border-black/[0.08] px-3 py-1 text-[0.68rem] font-semibold text-[#0D0D0D]">
                    Version {SELLER_TERMS_VERSION}
                  </span>
                  <span className="text-[0.7rem] text-black/35">Effective September 28, 2026</span>
                </div>
                <p className="text-[0.82rem] text-black/55 leading-relaxed mb-4">
                  It covers who can sell, what you can list, how fees and payouts work, fulfillment duties,
                  refunds and disputes, and when a store can be suspended. Plain language, 18 short sections.
                </p>
                <Link
                  href="/seller-terms"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-[#E8622A] hover:opacity-70 transition-opacity"
                >
                  Read the Seller Terms &amp; Conditions
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 17 17 7M7 7h10v10" />
                  </svg>
                </Link>
              </div>

              <label className="mt-6 flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-[18px] h-[18px] accent-[#E8622A] flex-shrink-0"
                />
                <span className="text-[0.84rem] text-[#0D0D0D] leading-relaxed">
                  I have read and agree to the{' '}
                  <Link href="/seller-terms" target="_blank" className="font-semibold text-[#E8622A] hover:underline">
                    Seller Terms &amp; Conditions
                  </Link>{' '}
                  (v{SELLER_TERMS_VERSION}).
                </span>
              </label>
            </div>
          )}

          {/* ── Step 5: Review & submit ── */}
          {step === 4 && (
            <div>
              <h2 className="font-extrabold text-[1.1rem] mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                Review &amp; submit
              </h2>
              <p className="text-[0.84rem] text-black/45 mb-6">
                Double-check everything — admins review exactly what you see here.
              </p>

              {/* Store preview */}
              <div className="rounded-[14px] border border-black/[0.08] overflow-hidden mb-6">
                <div className="h-[88px] bg-[#EDE7DC]">
                  {bannerUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="px-5 pb-5">
                  <div className="flex items-end gap-3 -mt-7 mb-3">
                    <div className="w-14 h-14 rounded-[12px] overflow-hidden border-[3px] border-white bg-[#F5F0E8] flex-shrink-0">
                      {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black/30 font-bold">
                          {storeName.trim().slice(0, 1).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="font-extrabold text-[1.02rem] text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
                    {storeName.trim() || 'Your store'}
                  </p>
                  {location.trim() && <p className="text-[0.76rem] text-black/45 mt-0.5">📍 {location.trim()}</p>}
                  {description.trim() && (
                    <p className="text-[0.8rem] text-black/55 leading-relaxed mt-2">{description.trim()}</p>
                  )}
                  {(category || phone.trim()) && (
                    <p className="text-[0.72rem] text-black/40 mt-2">
                      {category && <span className="mr-3">🏷 {category}</span>}
                      {phone.trim() && <span>📞 {phone.trim()}</span>}
                    </p>
                  )}
                </div>
              </div>

              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[0.8rem] mb-6">
                <div className="flex justify-between sm:block">
                  <dt className="text-black/40">Terms accepted</dt>
                  <dd className="font-semibold text-[#0D0D0D]">
                    Seller Terms v{SELLER_TERMS_VERSION} {agreed ? '✓' : ''}
                  </dd>
                </div>
                <div className="flex justify-between sm:block">
                  <dt className="text-black/40">Account</dt>
                  <dd className="font-semibold text-[#0D0D0D] truncate">{user?.primaryEmailAddress?.emailAddress}</dd>
                </div>
              </dl>

              <div className="bg-[#F5F0E8]/60 border border-black/[0.05] rounded-[12px] p-4 text-[0.78rem] text-black/50 leading-relaxed">
                After you submit, your store enters <strong>review</strong>. You can add product drafts meanwhile —
                publishing unlocks once an admin approves your store.
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="mt-6 rounded-[12px] bg-red-50 border border-red-100 px-4 py-3 text-[0.8rem] text-red-600">
              {error}
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between gap-3 mt-8">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep((s) => s - 1);
                }}
                disabled={submitting}
                className="rounded-full border border-black/12 px-5 py-2.5 text-[0.8rem] font-semibold text-[#0D0D0D] hover:bg-black/[0.04] transition-colors disabled:opacity-40"
              >
                Back
              </button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep((s) => s + 1);
                }}
                disabled={!canContinue}
                className="rounded-full bg-[#E8622A] text-white px-7 py-2.5 text-[0.8rem] font-semibold hover:bg-[#F07A48] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting || !termsValid}
                className="rounded-full bg-[#E8622A] text-white px-7 py-2.5 text-[0.8rem] font-semibold hover:bg-[#F07A48] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {submitting && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />}
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[0.72rem] text-black/35 mt-5">
          Free to apply · You choose when each listing goes live
        </p>
      </div>
    </div>
  );
}

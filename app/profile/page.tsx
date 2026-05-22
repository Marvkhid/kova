'use client';
// ============================================================
// KOVA — /profile
// Buyer profile with image upload + order history.
// ============================================================

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useToast } from '../Component/ToastContext';
import { PRODUCTS } from '@/lib/types/data/products';
import { formatPrice } from '@/lib/utils';

const RECENT_ORDERS = [
  { id: 'ORD-2091', date: 'May 3, 2026', product: PRODUCTS[0], status: 'delivered', total: 12 },
  { id: 'ORD-2088', date: 'Apr 28, 2026', product: PRODUCTS[1], status: 'shipped', total: 19 },
  { id: 'ORD-2074', date: 'Apr 14, 2026', product: PRODUCTS[4], status: 'delivered', total: 29 },
];

const STATUS_STYLES: Record<string, string> = {
  delivered: 'bg-[#2A5C45]/[0.08] text-[#2A5C45]',
  shipped: 'bg-[#3B2F6E]/[0.08] text-[#3B2F6E]',
  processing: 'bg-[#D4A843]/[0.10] text-[#A07820]',
};

// ── Avatar uploader ───────────────────────────────────────

function AvatarUploader({ name }: { name: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const { addToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image must be under 5MB.', 'error');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    addToast('Profile photo updated!');
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar circle */}
      <div
        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden cursor-pointer group"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="w-full h-full bg-[#E8622A] flex items-center justify-center">
            <span
              className="font-extrabold text-white text-[1.4rem] sm:text-[1.8rem]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {initials}
            </span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-[0.68rem] sm:text-[0.7rem] font-medium">Change</span>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-[0.76rem] sm:text-[0.78rem] text-[#E8622A] font-medium hover:opacity-70 transition-opacity"
      >
        Upload photo
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function ProfilePage() {
  const [name, setName] = useState('Marvel Adeniyi');
  const [email, setEmail] = useState('marvel@example.com');
  const [bio, setBio] = useState('Buyer & creator. Based in Lagos, Nigeria.');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    addToast('Profile updated successfully.');
  }

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
          {/* ── Left: avatar + nav ── */}
          <div className="flex flex-col gap-4">
            {/* Profile card */}
            <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-5 sm:p-6 flex flex-col items-center text-center gap-2">
              <AvatarUploader name={name} />
              <p className="font-bold text-[0.96rem] sm:text-[1rem] text-[#0D0D0D] mt-2" style={{ fontFamily: 'var(--font-display)' }}>
                {name}
              </p>
              <p className="text-[0.76rem] sm:text-[0.78rem] text-black/40">{email}</p>
              <p className="text-[0.8rem] sm:text-[0.82rem] text-black/50 mt-1">{bio}</p>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] overflow-hidden">
              {[
                { label: 'My orders', href: '/orders', icon: '📦' },
                { label: 'Saved items', href: '/saved', icon: '❤️' },
                { label: 'Seller dashboard', href: '/sellers/dashboard', icon: '📊' },
                { label: 'Settings', href: '/settings', icon: '⚙️' },
              ].map((item, i, arr) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-black/[0.03] transition-colors text-[0.84rem] sm:text-[0.88rem] font-medium text-[#0D0D0D] ${
                    i < arr.length - 1 ? 'border-b border-black/[0.05]' : ''
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                  <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Right: form + orders ── */}
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Edit profile form */}
            <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-5 sm:p-6">
              <h2 className="font-bold text-[0.95rem] sm:text-[1rem] text-[#0D0D0D] mb-5" style={{ fontFamily: 'var(--font-display)' }}>
                Personal information
              </h2>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.78rem] sm:text-[0.8rem] font-semibold text-black/60">Full name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-[44px] px-4 rounded-[10px] bg-[#F5F0E8] border border-black/[0.09] text-[0.86rem] sm:text-[0.88rem] text-[#0D0D0D] outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/15 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.78rem] sm:text-[0.8rem] font-semibold text-black/60">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-[44px] px-4 rounded-[10px] bg-[#F5F0E8] border border-black/[0.09] text-[0.86rem] sm:text-[0.88rem] text-[#0D0D0D] outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.78rem] sm:text-[0.8rem] font-semibold text-black/60">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="px-4 py-3 rounded-[10px] bg-[#F5F0E8] border border-black/[0.09] text-[0.86rem] sm:text-[0.88rem] text-[#0D0D0D] outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/15 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(232,98,42,0.3)] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Saving…
                      </>
                    ) : (
                      'Save changes'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Recent orders */}
            <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-black/[0.06]">
                <h2 className="font-bold text-[0.95rem] sm:text-[1rem] text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
                  Recent orders
                </h2>
                <Link href="/orders" className="text-[0.76rem] sm:text-[0.78rem] text-[#E8622A] font-medium hover:opacity-70 transition-opacity">
                  View all →
                </Link>
              </div>

              <div className="divide-y divide-black/[0.05]">
                {RECENT_ORDERS.map((order) => (
                  <div key={order.id} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-black/[0.018] transition-colors">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[10px] overflow-hidden bg-[#EDE8DF] flex-shrink-0">
                      <img
                        src={`/images/${order.product.imagePlaceholder}.jpg`}
                        alt={order.product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[0.82rem] sm:text-[0.85rem] text-[#0D0D0D] truncate">{order.product.name}</p>
                      <p className="text-[0.68rem] sm:text-[0.72rem] text-black/38 mt-0.5">
                        {order.id} · {order.date}
                      </p>
                    </div>

                    <span className={`hidden sm:inline-flex text-[0.68rem] font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>

                    <p className="font-bold text-[0.84rem] sm:text-[0.88rem] text-[#0D0D0D] flex-shrink-0" style={{ fontFamily: 'var(--font-display)' }}>
                      {formatPrice(order.total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
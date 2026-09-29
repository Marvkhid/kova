'use client';
// ============================================================
// KOVA — /register
// First-party email + password account creation.
// Buyers get an account; sellers also get their own shop
// (unique slug) created atomically server-side.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isSignedIn } = useAuth();
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register({
        name,
        email,
        password,
        role,
        storeName: role === 'SELLER' ? storeName : undefined,
        storeDescription: role === 'SELLER' ? storeDescription : undefined,
      });
      router.push(role === 'SELLER' ? '/sellers/dashboard' : '/shopping');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setBusy(false);
    }
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
        <div className="bg-white rounded-[16px] border border-black/[0.07] p-8 text-center max-w-[380px]">
          <p className="font-bold text-[1rem] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            You're already signed in
          </p>
          <Link href="/shopping" className="text-[#E8622A] text-[0.85rem] font-medium hover:opacity-70">
            Continue shopping →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">
        <h1
          className="font-extrabold text-[#0D0D0D] tracking-[-0.02em] leading-[1.05] mb-1.5"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.45rem, 6vw, 2rem)' }}
        >
          Join KOVA.
        </h1>
        <p className="text-[0.84rem] sm:text-[0.88rem] text-black/45 mb-6">
          Create your free account — no phone number needed.
        </p>

        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2 mb-5" role="tablist" aria-label="Account type">
          {(['BUYER', 'SELLER'] as const).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={role === r}
              onClick={() => setRole(r)}
              className={`px-4 py-3 rounded-[12px] text-[0.86rem] font-semibold border transition-all ${
                role === r
                  ? 'bg-[#0D0D0D] text-[#F5F0E8] border-[#0D0D0D]'
                  : 'bg-white text-black/60 border-black/[0.09] hover:border-black/25'
              }`}
            >
              {r === 'BUYER' ? 'I want to buy' : 'I want to sell'}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <label className="block">
            <span className="text-[0.78rem] font-semibold text-[#0D0D0D]/62 mb-1.5 block">Full name</span>
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Chidi Okafor"
              className="w-full bg-white border border-black/[0.09] rounded-[12px] h-[46px] px-4 text-[0.9rem] outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/12 transition-all"
            />
          </label>

          {role === 'SELLER' && (
            <>
              <label className="block">
                <span className="text-[0.78rem] font-semibold text-[#0D0D0D]/62 mb-1.5 block">Shop name</span>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Amara Luxe Atelier"
                  className="w-full bg-white border border-black/[0.09] rounded-[12px] h-[46px] px-4 text-[0.9rem] outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/12 transition-all"
                />
                <span className="text-[0.7rem] text-black/40 mt-1 block">
                  Your shop gets its own public page at /store/your-shop-name
                </span>
              </label>
              <label className="block">
                <span className="text-[0.78rem] font-semibold text-[#0D0D0D]/62 mb-1.5 block">
                  Shop description <span className="text-black/30 font-normal">(optional)</span>
                </span>
                <textarea
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Handmade leather goods from Lagos"
                  className="w-full bg-white border border-black/[0.09] rounded-[12px] p-3 text-[0.88rem] outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/12 transition-all resize-none"
                />
              </label>
            </>
          )}

          <label className="block">
            <span className="text-[0.78rem] font-semibold text-[#0D0D0D]/62 mb-1.5 block">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white border border-black/[0.09] rounded-[12px] h-[46px] px-4 text-[0.9rem] outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/12 transition-all"
            />
          </label>

          <label className="block">
            <span className="text-[0.78rem] font-semibold text-[#0D0D0D]/62 mb-1.5 block">Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-white border border-black/[0.09] rounded-[12px] h-[46px] px-4 text-[0.9rem] outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/12 transition-all"
            />
          </label>

          {error && (
            <p className="text-[0.78rem] text-red-500 bg-red-50 border border-red-100 rounded-[10px] px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#E8622A] hover:bg-[#F07A48] text-white rounded-full h-[48px] font-medium text-[0.95rem] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(232,98,42,0.32)] active:scale-[0.98] disabled:opacity-50 mt-1"
          >
            {busy ? 'Creating account…' : role === 'SELLER' ? 'Create account & open my shop' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-black/45 text-[0.84rem] mt-5">
          Already have an account?
          <Link href="/login" className="text-[#E8622A] font-medium hover:opacity-70 ml-1">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

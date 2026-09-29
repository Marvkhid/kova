'use client';
// ============================================================
// KOVA — /forgot-password
// Requests a password-reset email (always confirms, never
// reveals whether the address has an account).
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { API_URL as API } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? 'Could not send the email');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[70vh] bg-[#F5F0E8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <h1
          className="font-extrabold text-[#0D0D0D] tracking-[-0.02em] mb-1.5"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.45rem, 6vw, 2rem)' }}
        >
          Reset your password
        </h1>
        <p className="text-[0.85rem] text-black/45 mb-6">
          Enter the email you signed up with and we&apos;ll send you a reset link.
        </p>

        {sent ? (
          <div className="bg-white rounded-[14px] border border-black/[0.08] p-6 text-center">
            <p className="font-semibold text-[0.92rem] mb-1">Check your inbox</p>
            <p className="text-[0.82rem] text-black/50">
              If an account exists for <strong>{email}</strong>, a reset link is on its way.
              It expires in 1 hour.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
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
            {error && (
              <p className="text-[0.78rem] text-red-500 bg-red-50 border border-red-100 rounded-[10px] px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-[#E8622A] hover:bg-[#F07A48] text-white rounded-full h-[48px] font-medium text-[0.95rem] transition-all disabled:opacity-50"
            >
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="text-center text-black/45 text-[0.84rem] mt-5">
          <Link href="/login" className="text-[#E8622A] font-medium hover:opacity-70">
            ← Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}

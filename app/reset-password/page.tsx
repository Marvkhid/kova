'use client';
// ============================================================
// KOVA — /reset-password?token=...
// Sets a new password using the one-time token emailed to the
// user. On success, sends them to log in.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { API_URL as API } from '@/lib/api';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? 'Could not reset the password');
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <div className="bg-white rounded-[14px] border border-black/[0.08] p-6 text-center">
        <p className="font-semibold text-[0.92rem] mb-1">Missing reset token</p>
        <p className="text-[0.82rem] text-black/50 mb-4">
          Open the reset link from your email, or request a new one.
        </p>
        <Link href="/forgot-password" className="text-[#E8622A] font-medium text-[0.85rem]">
          Request a new link →
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-white rounded-[14px] border border-black/[0.08] p-6 text-center">
        <p className="font-semibold text-[0.92rem] mb-1">Password updated</p>
        <p className="text-[0.82rem] text-black/50">Taking you to log in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
      <label className="block">
        <span className="text-[0.78rem] font-semibold text-[#0D0D0D]/62 mb-1.5 block">New password</span>
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
      <label className="block">
        <span className="text-[0.78rem] font-semibold text-[#0D0D0D]/62 mb-1.5 block">Confirm new password</span>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat it"
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
        {busy ? 'Saving…' : 'Set new password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[70vh] bg-[#F5F0E8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <h1
          className="font-extrabold text-[#0D0D0D] tracking-[-0.02em] mb-6"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.45rem, 6vw, 2rem)' }}
        >
          Choose a new password
        </h1>
        <Suspense fallback={<div className="text-black/45 text-[0.85rem]">Loading…</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}

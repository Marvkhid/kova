'use client';
// ============================================================
// KOVA — /verify-email?token=...
// Consumes the emailed verification token and shows the result.
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { API_URL as API } from '@/lib/api';

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState<'working' | 'ok' | 'error'>('working');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('Verification link is missing its token.');
      return;
    }
    fetch(`${API}/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message ?? 'Verification failed');
        setState('ok');
        setMessage(data.email ? `${data.email} is now verified.` : 'Email verified.');
      })
      .catch((err: Error) => {
        setState('error');
        setMessage(err.message);
      });
  }, [token]);

  return (
    <div className="bg-white rounded-[14px] border border-black/[0.08] p-8 text-center">
      {state === 'working' && <p className="text-[0.9rem] text-black/55">Verifying your email…</p>}
      {state === 'ok' && (
        <>
          <p className="font-bold text-[1.05rem] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            Email verified ✓
          </p>
          <p className="text-[0.85rem] text-black/50 mb-4">{message}</p>
          <Link href="/shopping" className="text-[#E8622A] font-medium text-[0.86rem]">
            Start shopping →
          </Link>
        </>
      )}
      {state === 'error' && (
        <>
          <p className="font-bold text-[1.05rem] mb-1 text-red-500" style={{ fontFamily: 'var(--font-display)' }}>
            Could not verify
          </p>
          <p className="text-[0.85rem] text-black/50 mb-4">{message}</p>
          <Link href="/login" className="text-[#E8622A] font-medium text-[0.86rem]">
            Back to log in
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[70vh] bg-[#F5F0E8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <Suspense fallback={<div className="text-black/45 text-[0.85rem]">Loading…</div>}>
          <VerifyInner />
        </Suspense>
      </div>
    </div>
  );
}

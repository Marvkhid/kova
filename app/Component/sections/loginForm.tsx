'use client';
// ============================================================
// KOVA — LoginForm
// Email + password login against the real API (/api/auth/login).
// Buyers → /shopping, sellers → their dashboard.
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { AuthInput, AuthSubmitButton } from '../ui/authForm';

interface LoginFormProps {
  onSwitchTab: () => void;
}

export function LoginForm({ onSwitchTab: _onSwitchTab }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required.';
    else if (!email.includes('@')) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setFormError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'SELLER' && user.sellerProfile) {
        router.push('/sellers/dashboard');
      } else {
        router.push('/shopping');
      }
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not sign in. Try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4 w-full" noValidate>
      <AuthInput
        label="Email address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        }
      />

      <AuthInput
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="current-password"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        }
      />

      {formError && (
        <p className="text-[0.78rem] text-red-500 bg-red-50 border border-red-100 rounded-[10px] px-3 py-2">
          {formError}
        </p>
      )}

      <AuthSubmitButton loading={loading}>Log in to KOVA</AuthSubmitButton>

      <p className="text-center text-[0.82rem] sm:text-[0.85rem] text-black/50 mt-1">
        Don&apos;t have an account?{' '}
        <a
          href="/register"
          className="text-[#E8622A] font-medium hover:opacity-70 transition-opacity"
        >
          Sign up free
        </a>
      </p>
    </form>
  );
}
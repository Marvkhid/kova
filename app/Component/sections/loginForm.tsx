'use client';
// ============================================================
// KOVA — LoginForm
// Email + password login with validation.
// On success → redirects to /shopping (swap for real auth later)
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthInput, AuthDivider, GoogleButton, AuthSubmitButton } from '../ui/authForm';

interface LoginFormProps {
  onSwitchTab: () => void;
}

export function LoginForm({ onSwitchTab }: LoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    // ── Replace this block with real auth logic ──
    await new Promise((r) => setTimeout(r, 1000)); // simulate network
    setLoading(false);
    router.push('/shopping');
    // ──────────────────────────────────────────────
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

      {/* Forgot password */}
      <div className="flex justify-end -mt-1">
        <Link href="/forgot-password" className="text-[0.76rem] sm:text-[0.78rem] text-[#E8622A] hover:opacity-70 transition-opacity">
          Forgot password?
        </Link>
      </div>

      <AuthSubmitButton loading={loading}>Log in to KOVA</AuthSubmitButton>

      <AuthDivider />

      <GoogleButton label="Continue with Google" />

      {/* Switch to signup */}
      <p className="text-center text-[0.82rem] sm:text-[0.85rem] text-black/50 mt-1">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchTab}
          className="text-[#E8622A] font-medium hover:opacity-70 transition-opacity"
        >
          Sign up free
        </button>
      </p>
    </form>
  );
}
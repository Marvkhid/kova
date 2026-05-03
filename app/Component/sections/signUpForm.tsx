'use client';
// ============================================================
// KOVA — SignupForm
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthInput, AuthDivider, GoogleButton, AuthSubmitButton } from '../ui/authForm';

interface SignupFormProps {
  onSwitchTab: () => void;
}

export function SignupForm({ onSwitchTab }: SignupFormProps) {
  const router = useRouter();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())              e.name     = 'Full name is required.';
    if (!email.trim())             e.email    = 'Email is required.';
    else if (!email.includes('@')) e.email    = 'Enter a valid email address.';
    if (!password)                 e.password = 'Password is required.';
    else if (password.length < 6)  e.password = 'Password must be at least 6 characters.';
    if (password !== confirm)      e.confirm  = 'Passwords do not match.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    // ── Replace with real auth ──
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    router.push('/shopping');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" noValidate>

      <AuthInput
        label="Full name"
        type="text"
        placeholder="Your name"
        value={name}
        onChange={e => setName(e.target.value)}
        error={errors.name}
        autoComplete="name"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        }
      />

      <AuthInput
        label="Email address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        }
      />

      <AuthInput
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={e => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="new-password"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        }
      />

      <AuthInput
        label="Confirm password"
        type="password"
        placeholder="••••••••"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        error={errors.confirm}
        autoComplete="new-password"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
          </svg>
        }
      />

      <p className="text-[0.75rem] text-black/40 -mt-1">
        By signing up you agree to our{' '}
        <a href="/terms" className="text-[#E8622A] hover:opacity-70">Terms</a>
        {' '}and{' '}
        <a href="/privacy" className="text-[#E8622A] hover:opacity-70">Privacy Policy</a>.
      </p>

      <AuthSubmitButton loading={loading}>
        Create my account
      </AuthSubmitButton>

      <AuthDivider />

      <GoogleButton label="Sign up with Google" />

      <p className="text-center text-[0.85rem] text-black/50 mt-1">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchTab}
          className="text-[#E8622A] font-medium hover:opacity-70 transition-opacity">
          Log in
        </button>
      </p>

    </form>
  );
}
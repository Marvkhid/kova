'use client';
// ============================================================
// KOVA — SignupForm
// Real account creation via /api/auth/register. Sellers get
// their own shop (unique slug) created in the same step.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { AuthInput, AuthSubmitButton } from '../ui/authForm';

interface SignupFormProps {
  onSwitchTab: () => void;
}

export function SignupForm({ onSwitchTab: _onSwitchTab }: SignupFormProps) {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Full name is required.';
    if (role === 'SELLER' && storeName.trim().length < 3) e.storeName = 'Shop name must be at least 3 characters.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!email.includes('@')) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (!confirm) e.confirm = 'Please confirm your password.';
    else if (password !== confirm) e.confirm = 'Passwords do not match.';
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
      const user = await register({
        name,
        email,
        password,
        role,
        storeName: role === 'SELLER' ? storeName : undefined,
        storeDescription: role === 'SELLER' ? storeDescription : undefined,
      });
      if (user.role === 'SELLER') {
        router.push('/sellers/dashboard');
      } else {
        router.push('/shopping');
      }
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create your account. Try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4 w-full" noValidate>
      {/* Account type */}
      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Account type">
        {(['BUYER', 'SELLER'] as const).map((r) => (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={role === r}
            onClick={() => setRole(r)}
            className={`px-4 py-2.5 rounded-[12px] text-[0.84rem] font-semibold border transition-all ${
              role === r
                ? 'bg-[#0D0D0D] text-[#F5F0E8] border-[#0D0D0D]'
                : 'bg-white text-black/60 border-black/[0.09] hover:border-black/25'
            }`}
          >
            {r === 'BUYER' ? 'I want to buy' : 'I want to sell'}
          </button>
        ))}
      </div>

      <AuthInput
        label="Full name"
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        autoComplete="name"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        }
      />

      {role === 'SELLER' && (
        <AuthInput
          label="Shop name"
          type="text"
          placeholder="Amara Luxe Atelier"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          error={errors.storeName}
          autoComplete="organization"
          hint="Your shop gets its own public page at /store/your-shop-name"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9h18l-1.5 9.5a2 2 0 0 1-2 1.5h-11a2 2 0 0 1-2-1.5L3 9z" />
              <path d="M8 9V6a4 4 0 0 1 8 0v3" />
            </svg>
          }
        />
      )}

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
        autoComplete="new-password"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        }
      />

      <AuthInput
        label="Confirm password"
        type="password"
        placeholder="••••••••"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={errors.confirm}
        autoComplete="new-password"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
        }
      />

      <p className="text-[0.72rem] sm:text-[0.75rem] text-black/40 -mt-1 leading-relaxed">
        By signing up you agree to our{' '}
        <Link href="/terms" className="text-[#E8622A] hover:opacity-70">
          Terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-[#E8622A] hover:opacity-70">
          Privacy Policy
        </Link>
        .
      </p>

      {formError && (
        <p className="text-[0.78rem] text-red-500 bg-red-50 border border-red-100 rounded-[10px] px-3 py-2">
          {formError}
        </p>
      )}

      <AuthSubmitButton loading={loading}>
        {role === 'SELLER' ? 'Create account & open my shop' : 'Create my account'}
      </AuthSubmitButton>

      <p className="text-center text-[0.82rem] sm:text-[0.85rem] text-black/50 mt-1">
        Already have an account?{' '}
        <a
          href="/login"
          className="text-[#E8622A] font-medium hover:opacity-70 transition-opacity"
        >
          Log in
        </a>
      </p>
    </form>
  );
}
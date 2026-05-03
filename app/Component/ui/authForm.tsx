'use client';
// ============================================================
// KOVA — AuthForm UI atoms
// Reusable input, label, and button components for auth pages.
// ============================================================

import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';

// ── AuthInput ─────────────────────────────────────────────

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label:    string;
  error?:   string;
  icon?:    ReactNode;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[0.8rem] font-medium text-[#0D0D0D]/70 tracking-[0.01em]">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={[
              'w-full h-[48px] rounded-[12px]',
              'bg-[#F5F0E8] border',
              error ? 'border-red-400' : 'border-black/[0.09]',
              'text-[0.9rem] text-[#0D0D0D] placeholder:text-black/30',
              'outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/15',
              'transition-all duration-200',
              icon ? 'pl-10 pr-4' : 'px-4',
              className,
            ].join(' ')}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[0.75rem] text-red-500 mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';

// ── AuthDivider ───────────────────────────────────────────

export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-[1px] bg-black/[0.08]" />
      <span className="text-[0.75rem] text-black/35 font-medium uppercase tracking-[0.08em]">
        {label}
      </span>
      <div className="flex-1 h-[1px] bg-black/[0.08]" />
    </div>
  );
}

// ── GoogleButton ──────────────────────────────────────────

export function GoogleButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className={[
        'w-full h-[48px] rounded-[12px]',
        'bg-white border border-black/[0.12]',
        'flex items-center justify-center gap-3',
        'text-[0.9rem] font-medium text-[#0D0D0D]',
        'hover:bg-black/[0.03] hover:border-black/20',
        'transition-all duration-200',
        'shadow-sm',
      ].join(' ')}
    >
      {/* Google icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {label}
    </button>
  );
}

// ── AuthSubmitButton ──────────────────────────────────────

export function AuthSubmitButton({
  children,
  loading = false,
}: {
  children: ReactNode;
  loading?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={[
        'w-full h-[48px] rounded-[12px]',
        'bg-[#E8622A] text-white font-medium text-[0.95rem]',
        'hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(232,98,42,0.35)]',
        'active:scale-[0.98]',
        'transition-all duration-200',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none',
        'flex items-center justify-center gap-2',
      ].join(' ')}
    >
      {loading ? (
        <>
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Processing…
        </>
      ) : children}
    </button>
  );
}
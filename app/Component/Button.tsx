'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'white' | 'outline-white';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  children:   ReactNode;
  fullWidth?: boolean;
  loading?:   boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[#E8622A] text-white hover:bg-[#F07A48] hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(232,98,42,0.35)] active:scale-[0.98]',
  secondary:
    'bg-[#0D0D0D] text-[#F5F0E8] hover:bg-[#E8622A] hover:scale-[1.02] active:scale-[0.98]',
  ghost:
    'bg-transparent text-[#0D0D0D] hover:bg-black/[0.06] active:bg-black/[0.10]',
  outline:
    'bg-transparent text-[#0D0D0D] border border-black/20 hover:border-black/60 hover:bg-black/[0.04] active:scale-[0.98]',
  white:
    'bg-white text-[#E8622A] hover:scale-[1.03] hover:shadow-md active:scale-[0.98]',
  'outline-white':
    'bg-transparent text-white border border-white/40 hover:border-white hover:bg-white/[0.08] active:scale-[0.98]',
};

const sizeStyles: Record<Size, string> = {
  // sm — min 44px height for touch (Apple/Google standard)
  sm: 'px-4 py-[0.6rem] text-[0.85rem] rounded-full min-h-[40px]',
  // md — comfortable tap target
  md: 'px-6 py-[0.875rem] text-[0.95rem] rounded-full min-h-[48px]',
  // lg — prominent CTA
  lg: 'px-8 py-[1rem] text-[1rem] sm:text-[1.05rem] rounded-full min-h-[52px]',
};

export function Button({
  variant   = 'primary',
  size      = 'md',
  children,
  fullWidth = false,
  loading   = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2',
        'font-medium',
        'transition-all duration-200',
        'select-none cursor-pointer',
        'outline-none focus-visible:ring-2 focus-visible:ring-[#E8622A] focus-visible:ring-offset-2',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin flex-shrink-0"
            width="16" height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <span>Loading…</span>
        </>
      ) : children}
    </button>
  );
}
'use client';
// ============================================================
// KOVA — Button Component
// Variants: primary | secondary | ghost | outline | white
// Sizes:    sm | md | lg
// ============================================================

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'white' | 'outline-white';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  children:  ReactNode;
  fullWidth?: boolean;
  asChild?:   boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[#E8622A] text-white hover:bg-[#F07A48] hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(232,98,42,0.35)]',
  secondary:
    'bg-[#0D0D0D] text-[#F5F0E8] hover:bg-[#E8622A] hover:scale-[1.02]',
  ghost:
    'bg-transparent text-[#0D0D0D] hover:bg-black/[0.06]',
  outline:
    'bg-transparent text-[#0D0D0D] border border-black/20 hover:border-black/60 hover:bg-black/[0.04]',
  white:
    'bg-white text-[#E8622A] hover:scale-[1.03] hover:shadow-md',
  'outline-white':
    'bg-transparent text-white border border-white/40 hover:border-white hover:bg-white/[0.08]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-full',
  md: 'px-6 py-[0.875rem] text-base rounded-full',
  lg: 'px-8 py-[1rem] text-lg rounded-full',
};

export function Button({
  variant   = 'primary',
  size      = 'md',
  children,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2',
        'font-[family-name:var(--font-body)] font-medium',
        'transition-all duration-[250ms] cubic-bezier(0.22,1,0.36,1)',
        'select-none outline-none focus-visible:ring-2 focus-visible:ring-[#E8622A] focus-visible:ring-offset-2',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
// ============================================================
// KOVA — Small UI Atoms
// Badge | StarRating | SectionLabel | EyebrowPill
// ============================================================

import type { ProductBadge } from '@/lib/types';

// ── Badge ─────────────────────────────────────────────────

const badgeConfig: Record<ProductBadge, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-[#0D0D0D] text-[#F5F0E8]' },
  hot: { label: 'Hot', className: 'bg-[#2A5C45] text-white' },
  sale: { label: 'Sale', className: 'bg-[#E8622A] text-white' },
};

export function Badge({ type }: { type: ProductBadge }) {
  const cfg = badgeConfig[type];
  return (
    <span
      className={`inline-block text-[0.64rem] sm:text-[0.67rem] font-semibold tracking-[0.07em] uppercase px-[9px] sm:px-[10px] py-[3px] sm:py-1 rounded-full ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

// ── StarRating ────────────────────────────────────────────

export function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[#F4A438] text-[0.82rem] sm:text-sm leading-none">
        {'★'.repeat(Math.floor(rating))}
        {rating % 1 >= 0.5 ? '½' : ''}
        {'☆'.repeat(5 - Math.ceil(rating))}
      </span>
      {count !== undefined && <span className="text-[0.68rem] sm:text-[0.72rem] text-black/40">({count})</span>}
    </div>
  );
}

// ── SectionLabel ──────────────────────────────────────────

export function SectionLabel({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={`text-[0.66rem] sm:text-[0.7rem] font-medium tracking-[0.14em] uppercase mb-3 ${
        light ? 'text-[#F5F0E8]/40' : 'text-black/36'
      }`}
    >
      {children}
    </p>
  );
}

// ── EyebrowPill ───────────────────────────────────────────

export function EyebrowPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-[#E8622A]/[0.11] text-[#E8622A] text-[0.68rem] sm:text-[0.72rem] font-semibold tracking-[0.1em] uppercase px-[12px] sm:px-[14px] py-[5px] sm:py-[6px] rounded-full">
      {children}
    </span>
  );
}

// ── Divider ───────────────────────────────────────────────

export function Divider({ light = false }: { light?: boolean }) {
  return <hr className={`border-0 border-t ${light ? 'border-white/10' : 'border-black/8'}`} />;
}
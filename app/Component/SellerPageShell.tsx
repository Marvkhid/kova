// ============================================================
// KOVA — SellerPageShell
// Dark top bar + centered content wrapper shared by seller pages
// (dashboard, new listing, edit listing).
// ============================================================

import Link from 'next/link';

function KovaMark() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 flex-shrink-0" aria-label="KOVA home">
      <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect width="36" height="36" rx="10" fill="#1A1A1A" />
        <rect x="9" y="8" width="4" height="20" rx="2" fill="#F5F0E8" />
        <path d="M13 18 L24 8" stroke="#E8622A" strokeWidth="4" strokeLinecap="round" />
        <path d="M13 18 L24 28" stroke="#F5F0E8" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </Link>
  );
}

export function SellerPageShell({
  breadcrumb,
  title,
  subtitle,
  children,
  wide = false,
}: {
  breadcrumb: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Top bar */}
      <div className="bg-[#0D0D0D] px-4 sm:px-5 md:px-8 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <KovaMark />
          <span className="text-[#F5F0E8]/20 text-sm hidden sm:inline">/</span>
          <Link
            href="/sellers/dashboard"
            className="text-[#F5F0E8]/50 text-[0.78rem] sm:text-sm hover:text-[#F5F0E8] transition-colors hidden sm:inline"
          >
            Dashboard
          </Link>
          <span className="text-[#F5F0E8]/20 text-sm hidden sm:inline">/</span>
          <span className="text-[#F5F0E8]/80 text-[0.78rem] sm:text-sm truncate max-w-[180px] sm:max-w-[260px]">
            {breadcrumb}
          </span>
        </div>
        <Link
          href="/sellers/dashboard"
          className="text-[0.76rem] sm:text-[0.8rem] text-[#F5F0E8]/50 hover:text-[#F5F0E8] transition-colors flex-shrink-0"
        >
          ← Back
        </Link>
      </div>

      <div
        className={[
          'mx-auto px-4 sm:px-5 md:px-8 py-8 sm:py-10',
          wide ? 'max-w-[1280px]' : 'max-w-[880px]',
        ].join(' ')}
      >
        <div className="mb-7 sm:mb-9">
          <h1
            className="font-extrabold text-[#0D0D0D] leading-[1.0] tracking-[-0.03em] mb-1"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.55rem, 7vw, 2.4rem)' }}
          >
            {title}
          </h1>
          {subtitle && <p className="text-[0.86rem] sm:text-[0.9rem] text-black/40">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

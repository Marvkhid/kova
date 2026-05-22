// ============================================================
// KOVA — 404 Not Found Page
// Netflix-style dark fullscreen with background image
// ============================================================

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0D0D0D]">
      {/* Background image */}
      <img
        src="/images/not-found-bg.jpg"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.18,
        }}
      />

      {/* Overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(13,13,13,0.7) 0%, rgba(13,13,13,0.95) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-[560px] mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-10 sm:mb-14 group">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:scale-105">
            <rect width="36" height="36" rx="10" fill="#1A1A1A" />
            <rect x="9" y="8" width="4" height="20" rx="2" fill="#F5F0E8" />
            <path d="M13 18 L24 8" stroke="#E8622A" strokeWidth="4" strokeLinecap="round" />
            <path d="M13 18 L24 28" stroke="#F5F0E8" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span className="font-extrabold text-[1.2rem] sm:text-[1.3rem] tracking-[-0.03em] text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
            K<span className="text-[#E8622A]">O</span>VA
          </span>
        </Link>

        <p
          className="font-extrabold text-[#E8622A] mb-3 sm:mb-4 leading-none"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(4.5rem, 24vw, 12rem)' }}
        >
          404
        </p>

        <h1
          className="font-extrabold text-[#F5F0E8] mb-3 sm:mb-4 leading-[1.05] tracking-[-0.02em]"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.35rem, 6vw, 2.4rem)' }}
        >
          Lost in the marketplace.
        </h1>

        <p className="text-[#F5F0E8]/50 text-[0.9rem] sm:text-[1rem] leading-relaxed mb-8 sm:mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to something good.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-8 py-[0.9rem] rounded-full bg-[#E8622A] text-white font-medium hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(232,98,42,0.4)] transition-all duration-200"
          >
            Back to home
          </Link>
          <Link
            href="/shopping"
            className="px-8 py-[0.9rem] rounded-full border border-[#F5F0E8]/20 text-[#F5F0E8] font-medium hover:border-[#F5F0E8]/50 hover:bg-[#F5F0E8]/[0.06] transition-all duration-200"
          >
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}
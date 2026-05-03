// ============================================================
// KOVA — Footer
// ============================================================

import Link from 'next/link';
import { SITE_TAGLINE } from '@/lib/types/data/constants';

const FOOTER_LINKS = {
  Company:  [{ label: 'About', href: '/about' }, { label: 'Careers', href: '/careers' }, { label: 'Blog', href: '/blog' }],
  Sellers:  [{ label: 'Sell on KOVA', href: '/sellers' }, { label: 'Seller Handbook', href: '/sellers/handbook' }, { label: 'Payouts', href: '/sellers/payouts' }],
  Support:  [{ label: 'Help Center', href: '/help' }, { label: 'Contact', href: '/contact' }, { label: 'Returns', href: '/returns' }],
  Legal:    [{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }, { label: 'Cookies', href: '/cookies' }],
};

export function Footer() {
  return (
    <footer className="bg-[#0D0D0D] text-[#F5F0E8]">
      {/* Main footer grid */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-16 grid grid-cols-2 md:grid-cols-6 gap-10">
        {/* Brand column — takes 2 cols */}
        <div className="col-span-2">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-[10px] group mb-4">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="36" height="36" rx="10" fill="#1A1A1A" />
              <rect x="9" y="8" width="4" height="20" rx="2" fill="#F5F0E8" />
              <path d="M13 18 L24 8" stroke="#E8622A" strokeWidth="4" strokeLinecap="round" />
              <path d="M13 18 L24 28" stroke="#F5F0E8" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <span
              className="font-extrabold text-[1.25rem] tracking-[-0.03em]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              K<span className="text-[#E8622A]">O</span>VA
            </span>
          </Link>

          <p className="text-[0.7rem] tracking-[0.08em] uppercase text-[#F5F0E8]/28 mb-4">
            {SITE_TAGLINE}
          </p>

          <p className="text-sm text-[#F5F0E8]/50 leading-relaxed max-w-[220px]">
            The marketplace where buyers and sellers meet, transact, and grow.
          </p>

          {/* Social links */}
          <div className="flex gap-3 mt-6">
            {['Twitter', 'Instagram', 'LinkedIn'].map(s => (
              <a
                key={s}
                href="#"
                aria-label={s}
                className="w-8 h-8 rounded-full border border-[#F5F0E8]/12 flex items-center justify-center text-[#F5F0E8]/40 hover:border-[#E8622A] hover:text-[#E8622A] transition-all duration-200 text-xs"
              >
                {s[0]}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading} className="col-span-1">
            <p
              className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-[#F5F0E8]/36 mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {heading}
            </p>
            <ul className="flex flex-col gap-2.5">
              {links.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#F5F0E8]/48 hover:text-[#F5F0E8] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#F5F0E8]/[0.07]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[0.72rem] text-[#F5F0E8]/22">
            © {new Date().getFullYear()} KOVA Inc. All rights reserved.
          </p>
          <p className="text-[0.72rem] text-[#F5F0E8]/22">
            Built with ♥ for creators, makers, and sellers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
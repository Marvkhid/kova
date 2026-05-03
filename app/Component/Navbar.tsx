'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/features/cart/CartContext';
import { NAV_LINKS } from '@/lib/types/data/constants';

function KovaLogo() {
  return (
    <Link href="/" className="flex items-center gap-[10px] group" aria-label="KOVA home">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        aria-hidden="true">
        <rect width="36" height="36" rx="10" fill="#0D0D0D" />
        <rect x="9" y="8" width="4" height="20" rx="2" fill="#F5F0E8" />
        <path d="M13 18 L24 8" stroke="#E8622A" strokeWidth="4" strokeLinecap="round" />
        <path d="M13 18 L24 28" stroke="#F5F0E8" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span className="font-extrabold text-[1.35rem] tracking-[-0.03em] text-[#0D0D0D] leading-none"
        style={{ fontFamily: 'var(--font-display)' }}>
        K<span className="text-[#E8622A]">O</span>VA
      </span>
    </Link>
  );
}

function CartButton({ itemCount }: { itemCount: number }) {
  return (
    <Link href="/cart"
      className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D0D0D] text-[#F5F0E8] text-sm font-medium hover:bg-[#E8622A] transition-all duration-300 group"
      aria-label={`Cart, ${itemCount} item${itemCount !== 1 ? 's' : ''}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <span>Cart</span>
      {itemCount > 0 && (
        <span key={itemCount}
          className="min-w-[20px] h-5 px-1 rounded-full bg-[#E8622A] group-hover:bg-white group-hover:text-[#E8622A] text-white text-[0.65rem] font-bold flex items-center justify-center transition-all duration-200"
          aria-hidden="true">
          +{itemCount}
        </span>
      )}
    </Link>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="w-5 h-4 relative flex flex-col justify-between" aria-hidden="true">
      {[0, 1, 2].map(i => (
        <span key={i}
          className="block h-[2px] bg-[#0D0D0D] rounded-full transition-all duration-300"
          style={{
            transformOrigin: 'center',
            transform:
              open && i === 0 ? 'rotate(45deg) translate(4px, 4px)' :
              open && i === 1 ? 'scaleX(0)' :
              open && i === 2 ? 'rotate(-45deg) translate(4px, -4px)' :
              'none',
            opacity: open && i === 1 ? 0 : 1,
          }} />
      ))}
    </div>
  );
}

function MobileDrawer({ open, onClose, pathname, itemCount }:
  { open: boolean; onClose: () => void; pathname: string; itemCount: number }) {

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <div aria-hidden="true" onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }} />

      <div role="dialog" aria-modal="true" aria-label="Navigation menu"
        className="fixed top-[64px] left-0 right-0 z-50 bg-[#F5F0E8] border-b border-black/10 shadow-xl transition-all duration-[380ms]"
        style={{
          transform: open ? 'translateY(0)' : 'translateY(-8px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}>
        <div className="px-5 pt-4 pb-6 flex flex-col gap-1">

          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} onClick={onClose}
              className={[
                'flex items-center justify-between px-4 py-3 rounded-[12px]',
                'text-base font-medium transition-all duration-200',
                pathname === link.href
                  ? 'bg-[#0D0D0D] text-[#F5F0E8]'
                  : 'text-[#0D0D0D] hover:bg-black/[0.06]',
              ].join(' ')}>
              {link.label}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ))}

          <div className="my-2 border-t border-black/[0.08]" />

          <div className="flex flex-col gap-2 pt-1">
            <Link href="/login" onClick={onClose}
              className="text-center py-3 rounded-[12px] text-base font-medium text-[#0D0D0D] hover:bg-black/[0.06] transition-colors">
              Log in
            </Link>
            <Link href="/cart" onClick={onClose}
              className="flex items-center justify-center gap-2 py-3 rounded-[12px] bg-[#0D0D0D] text-[#F5F0E8] text-base font-medium hover:bg-[#E8622A] transition-colors">
              Cart
              {itemCount > 0 && (
                <span className="bg-[#E8622A] text-white text-xs font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">
                  +{itemCount}
                </span>
              )}
            </Link>
            <Link href="/sellers" onClick={onClose}
              className="text-center py-3 rounded-[12px] bg-[#E8622A] text-white text-base font-medium hover:bg-[#F07A48] transition-colors">
              Start selling →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export function Navbar() {
  const { itemCount } = useCart();
  const pathname      = usePathname();
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header ref={navRef}
        className={[
          'fixed top-0 left-0 right-0 z-[60]',
          'h-[64px] flex items-center',
          'bg-[rgba(245,240,232,0.92)] backdrop-blur-[16px]',
          'transition-all duration-300',
          scrolled
            ? 'border-b border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.06)]'
            : 'border-b border-transparent',
        ].join(' ')}>

        <div className="w-full max-w-[1280px] mx-auto px-5 md:px-8 flex items-center justify-between gap-4">

          <KovaLogo />

          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => {
              const active = pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href}
                  className={[
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-[#0D0D0D] text-[#F5F0E8]'
                      : 'text-[#0D0D0D]/60 hover:text-[#0D0D0D] hover:bg-black/[0.06]',
                  ].join(' ')}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/login"
              className="px-4 py-2 rounded-full text-sm font-medium text-[#0D0D0D]/70 hover:text-[#0D0D0D] hover:bg-black/[0.06] transition-all duration-200">
              Log in
            </Link>
            <CartButton itemCount={itemCount} />
            <Link href="/sellers/dashboard"
              className="px-4 py-2 rounded-full text-sm font-medium text-white bg-[#E8622A] hover:bg-[#F07A48] hover:scale-[1.02] transition-all duration-200 ml-1">
              Sell on KOVA
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Link href="/cart" aria-label={`Cart, ${itemCount} items`}
              className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[#0D0D0D] text-[#F5F0E8] hover:bg-[#E8622A] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-[3px] bg-[#E8622A] text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(v => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/[0.06] transition-colors">
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>

        </div>
      </header>

      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
        itemCount={itemCount} />
    </>
  );
}
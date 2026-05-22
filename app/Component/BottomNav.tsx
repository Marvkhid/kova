'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/features/cart/CartContext';
import { useCartPanel } from '@/features/cart/cartPanel';

const NAV_ITEMS = [
  {
    label: 'Home',
    href:  '/',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24"
        fill={active ? '#E8622A' : 'none'}
        stroke={active ? '#E8622A' : '#0D0D0D'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    label: 'Browse',
    href:  '/shopping',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#E8622A' : '#0D0D0D'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    label: 'Cart',
    href:  null,
    icon: (active: boolean, count: number) => (
      <div className="relative">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#E8622A' : '#0D0D0D'}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        {count > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[15px] h-[15px] px-[3px] bg-[#E8622A] text-white text-[0.5rem] font-bold rounded-full flex items-center justify-center leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </div>
    ),
  },
  {
    label: 'Sell',
    href:  '/sellers',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#E8622A' : '#0D0D0D'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  },
  {
    label: 'Profile',
    href:  '/profile',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24"
        fill={active ? '#E8622A' : 'none'}
        stroke={active ? '#E8622A' : '#0D0D0D'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname      = usePathname();
  const { itemCount } = useCart();
  const { toggle }    = useCartPanel();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-[60] md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 border-t border-black/[0.08]"
        style={{ background: 'rgba(245,240,232,0.96)', backdropFilter: 'blur(16px)' }}
      />

      {/* Nav items */}
      <div className="relative flex items-center justify-around w-full px-1 py-1">
        {NAV_ITEMS.map(item => {
          const isCart = item.href === null;
          const active = !isCart && (
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href!)
          );

          const sharedClass = [
            'flex flex-col items-center justify-center gap-[3px]',
            'flex-1 py-2 rounded-[10px] transition-all duration-200',
            'min-w-0 max-w-[72px] mx-auto',
            active
              ? 'bg-[#E8622A]/[0.09]'
              : 'active:bg-black/[0.05]',
          ].join(' ');

          if (isCart) {
            return (
              <button
                key="cart"
                onClick={toggle}
                className={sharedClass}
                aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
              >
                {item.icon(false, itemCount)}
                <span className="text-[0.6rem] font-medium text-black/50 leading-none mt-[1px]">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={sharedClass}
              aria-label={item.label}
            >
              {/* icon — call with 1 arg for non-cart items */}
              {(item.icon as (active: boolean) => React.ReactNode)(active)}
              <span className={[
                'text-[0.6rem] font-medium leading-none mt-[1px] transition-colors',
                active ? 'text-[#E8622A]' : 'text-black/50',
              ].join(' ')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
// ============================================================
// KOVA — App Constants & Navigation Config
// ============================================================

import type { NavLink } from '@/lib/types';

export const SITE_NAME = 'KOVA';
export const SITE_TAGLINE = 'Konnect · Offer · Value · Anywhere';

export const NAV_LINKS: NavLink[] = [
  { label: 'Browse',   href: '/shopping'  },
  { label: 'New',      href: '/shopping?sort=newest' },
  { label: 'Sellers',  href: '/sellers'   },
  { label: 'About',    href: '/about'     },
  { label: 'Contact',  href: '/contact'   },
];

// Design tokens (reference — actual values live in globals.css)
export const COLORS = {
  black:  '#0D0D0D',
  cream:  '#F5F0E8',
  orange: '#E8622A',
  green:  '#2A5C45',
  purple: '#3B2F6E',
} as const;

export const TOAST_DURATION_MS = 3500;
export const CART_STORAGE_KEY  = 'kova_cart';

export const MARQUEE_ITEMS = [
  'Physical Goods',
  'Digital Products',
  'Courses & Education',
  'Fashion & Style',
  'Art & Crafts',
  'Templates & Tools',
];

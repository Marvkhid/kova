// ============================================================
// KOVA — App Constants & Navigation Config
// ============================================================

import type { NavLink } from '@/lib/types';

export const SITE_NAME = 'KOVA';
export const SITE_TAGLINE = 'Konnect · Offer · Value · Anywhere';

export const NAV_LINKS: NavLink[] = [
  { label: 'Browse',   href: '/shopping'  },
  { label: 'Sellers',  href: '/sellers'   },
  { label: 'Services', href: '/services'  },
  { label: 'Deals',    href: '/deals'     },
];

export const TRUST_STATS = [
  { value: '48K+',  label: 'Active sellers'    },
  { value: '190+',  label: 'Countries reached'  },
  { value: '$2.1M', label: 'Paid to sellers'    },
  { value: '4.9★',  label: 'Average rating'     },
];

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create your account',
    description: 'Sign up free in under 60 seconds. Join as a buyer, a seller, or both.',
  },
  {
    step: '02',
    title: 'Browse or list',
    description: 'Discover thousands of products — or publish your own listing in minutes.',
  },
  {
    step: '03',
    title: 'Transact safely',
    description: 'Pay and get paid with buyer protection, escrow, and instant payouts.',
  },
  {
    step: '04',
    title: 'Grow with us',
    description: 'Analytics, reviews, and seller tools to scale your business from day one.',
  },
];

export const MARQUEE_ITEMS = [
  'Physical Goods',
  'Digital Products',
  'Freelance Services',
  'Courses & Education',
  'Fashion & Style',
  'Tech & Electronics',
  'Art & Crafts',
  'Templates & Tools',
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
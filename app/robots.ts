// ============================================================
// KOVA — robots.txt
// ============================================================

import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kova-shopp.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/sellers/dashboard', '/sellers/new', '/sellers/edit', '/wishlist', '/profile', '/checkout', '/cart'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

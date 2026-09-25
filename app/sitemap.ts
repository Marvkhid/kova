// ============================================================
// KOVA — sitemap.ts
// Static routes + database-driven product/category URLs.
// Gracefully returns static routes only when the API is down.
// ============================================================

import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kova-shopp.vercel.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const revalidate = 3600; // hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/shopping`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/sellers`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Store pages are crawlable too — category pages use query params
  // and are excluded on purpose (canonicalisation).
  try {
    const storeRes = await fetch(`${API_URL}/sellers/store-all`, {
      next: { revalidate: 3600 },
    });
    if (storeRes.ok) {
      const stores = (await storeRes.json()) as { stores: { storeSlug: string }[] };
      staticRoutes.push(
        ...stores.stores.map((s) => ({
          url: `${SITE_URL}/store/${s.storeSlug}`,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        })),
      );
    }
  } catch {
    // store listing unavailable — keep static routes
  }

  try {
    const res = await fetch(`${API_URL}/products?limit=500&sort=newest`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return staticRoutes;
    const data = (await res.json()) as {
      products: { slug: string; updatedAt?: string; createdAt?: string }[];
    };
    const productRoutes: MetadataRoute.Sitemap = (data.products ?? [])
      .filter((p) => Boolean(p.slug))
      .map((p) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : p.createdAt ? new Date(p.createdAt) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}

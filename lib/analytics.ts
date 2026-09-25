// ============================================================
// KOVA — Analytics
// GA4 via @next/third-parties. Events are only sent when a
// measurement ID is configured (NEXT_PUBLIC_GA_MEASUREMENT_ID).
// ============================================================

import { sendGAEvent } from '@next/third-parties/google';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const analyticsEnabled = Boolean(GA_MEASUREMENT_ID);

type EventParams = Record<string, string | number | boolean | undefined>;

/** Fire a GA4 event — no-op when analytics is not configured. */
export function trackEvent(name: string, params: EventParams = {}) {
  if (!analyticsEnabled) return;
  try {
    sendGAEvent('event', name, params);
  } catch {
    // analytics must never break the app
  }
}

// ── Marketplace events ────────────────────────────────────

export const track = {
  productView: (p: { id: string; name: string; productType: string; price: number }) =>
    trackEvent('view_item', {
      item_id: p.id,
      item_name: p.name,
      product_type: p.productType,
      value: p.price,
    }),

  search: (query: string, resultCount: number) =>
    trackEvent('search', { search_term: query, result_count: resultCount }),

  addToCart: (p: { id: string; name: string; price: number }) =>
    trackEvent('add_to_cart', { item_id: p.id, item_name: p.name, value: p.price }),

  addToWishlist: (p: { id: string; name: string }) =>
    trackEvent('add_to_wishlist', { item_id: p.id, item_name: p.name }),

  removeFromWishlist: (p: { id: string }) =>
    trackEvent('remove_from_wishlist', { item_id: p.id }),

  shareProduct: (p: { id: string; method: string }) =>
    trackEvent('share', { item_id: p.id, method: p.method }),

  qrDownload: (p: { id: string }) =>
    trackEvent('qr_code_download', { item_id: p.id }),

  sellerOnboarding: () => trackEvent('seller_onboarding'),

  productCreated: (p: { id: string; productType: string; published: boolean }) =>
    trackEvent('product_created', {
      item_id: p.id,
      product_type: p.productType,
      published: p.published,
    }),

  productPublished: (p: { id: string; productType: string }) =>
    trackEvent('product_published', { item_id: p.id, product_type: p.productType }),
};

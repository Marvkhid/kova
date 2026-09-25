// ============================================================
// KOVA — real-photo fallbacks
// Every UI surface that could otherwise show an icon, emoji or
// glyph falls back to a real photograph from the first-party
// CC0 photo pool instead. No icons, anywhere.
// ============================================================

export const PHOTO_BASE = '/images/seed/photo';

/** Category slug → representative real photo (matches seed pool folders). */
export const CATEGORY_PHOTO: Record<string, string> = {
  fashion: `${PHOTO_BASE}/fashion/fashion-p01.jpg`,
  'beauty-perfumes': `${PHOTO_BASE}/beauty/beauty-p01.jpg`,
  'interior-home': `${PHOTO_BASE}/interior-home/interior-home-p01.jpg`,
  furniture: `${PHOTO_BASE}/furniture/furniture-p01.jpg`,
  electronics: `${PHOTO_BASE}/electronics/electronics-p01.jpg`,
  'health-wellness': `${PHOTO_BASE}/health/health-p01.jpg`,
  'digital-education': `${PHOTO_BASE}/digital-education/digital-education-p01.jpg`,
  digital: `${PHOTO_BASE}/digital-products/digital-products-p01.jpg`,
  'digital-products': `${PHOTO_BASE}/digital-products/digital-products-p02.jpg`,
  physical: `${PHOTO_BASE}/furniture/furniture-p02.jpg`,
  services: `${PHOTO_BASE}/digital-education/digital-education-p02.jpg`,
  art: `${PHOTO_BASE}/interior-home/interior-home-p02.jpg`,
  courses: `${PHOTO_BASE}/digital-education/digital-education-p03.jpg`,
};

export const FALLBACK_PHOTO =
  CATEGORY_PHOTO['interior-home'] as string; // neutral interior shot

/** Resolve a category slug (or legacy key) to a real photo path. */
export function categoryPhoto(slug?: string | null): string {
  if (slug && CATEGORY_PHOTO[slug]) return CATEGORY_PHOTO[slug];
  return FALLBACK_PHOTO;
}

/**
 * Last-resort product image: pick a stable photo from the pool based on
 * the product's category, else a name hash, so the same product always
 * shows the same photograph — never a placeholder icon.
 */
export function productPhoto(opts: {
  categorySlug?: string | null;
  name?: string;
  seed?: number | string;
}): string {
  const { categorySlug, name = '', seed = 0 } = opts;
  if (categorySlug && CATEGORY_PHOTO[categorySlug]) return CATEGORY_PHOTO[categorySlug];
  const keys = Object.keys(CATEGORY_PHOTO);
  let h = typeof seed === 'number' ? seed : 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return CATEGORY_PHOTO[keys[h % keys.length]] as string;
}

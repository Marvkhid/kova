// ============================================================
// KOVA — Utility Functions
// ============================================================

/**
 * Format a number as Nigerian Naira. Kovo marketplace prices are
 * whole-Naira; kobo are shown only when present (₦12,500 · ₦12,500.50).
 */
export function formatPrice(amount: number): string {
  const hasKobo = Math.round(amount * 100) % 100 !== 0;
  return `₦${new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: hasKobo ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

/** Generate a unique ID for toasts / transient items */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Compute cart total from items */
export function computeCartTotal(
  items: { product: { price: number }; quantity: number }[]
): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

/** Slugify a string for URL use */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Truncate long text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

/** Build star string from numeric rating */
export function renderStars(rating: number): string {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}
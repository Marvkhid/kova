// ============================================================
// KOVA — API Client
// Thin fetch wrapper for the NestJS backend. Attaches the
// Clerk session token automatically on the client.
// ============================================================

import type {
  Product,
  ProductListResponse,
  Category,
  SellerDashboardResponse,
  SellerProfile,
  WishlistItem,
  AdminOverview,
  ProductReviewPage,
  MyReviewStatus,
  SellerReviewPublic,
  SellerReviewSummary,
  SellerStore,
  FeaturedSeller,
  Order,
  SellerOrderView,
  FulfillmentStatus,
  SellerApplicationRow,
  SellerApplicationDetail,
} from './types';

// API base URL resolution order:
//   1. NEXT_PUBLIC_API_URL (set in Vercel/env — the source of truth)
//   2. Same-origin fallback when the app is served from vercel.app (the
//      frontend and API share an origin). Remove this when you point
//      NEXT_PUBLIC_API_URL at the deployed backend.
//   3. Local dev default
function resolveApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined' && /vercel\.app$/.test(window.location.hostname)) {
    // Same-origin: the static app and the API live on the same host.
    const origin = window.location.origin.replace(/\/?$/, '');
    return `${origin}/api`;
  }
  return 'http://localhost:3001/api';
}

export const API_URL = resolveApiUrl();

// ── Token plumbing ────────────────────────────────────────

type GetToken = () => Promise<string | null>;
let getTokenFn: GetToken = async () => null;

/** Register Clerk's getToken so apiFetch can authenticate. */
export function registerAuthTokenProvider(fn: GetToken) {
  getTokenFn = fn;
}

async function authHeaders(): Promise<Record<string, string>> {
  try {
    const token = await getTokenFn();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

// ── Error shape ───────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  details?: string[];
  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// ── Core fetch ────────────────────────────────────────────

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = false, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string> | undefined),
  };
  if (auth) Object.assign(headers, await authHeaders());

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    let details: string[] | undefined;
    try {
      const body = await res.json();
      message = body?.message ?? message;
      if (Array.isArray(body?.message)) details = body.message;
      if (Array.isArray(message)) {
        details = message;
        message = message.join(' · ');
      }
    } catch {
      // non-JSON error body
    }
    throw new ApiError(message, res.status, details);
  }

  return res.json();
}

// ── Typed endpoints ───────────────────────────────────────

export interface ProductQuery {
  q?: string;
  category?: string;
  type?: 'PHYSICAL' | 'DIGITAL';
  sort?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  store?: string;
}

function qs(params: object): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== '' && v !== null,
  );
  if (!entries.length) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
}

// Shared response shape for product mutations
export interface ProductMutationResponse {
  id: string;
  slug: string;
  status: ProductListResponse['products'][number]['status'];
}

export const api = {
  // Products (public)
  listProducts: (query: ProductQuery = {}) =>
    apiFetch<ProductListResponse>(`/products${qs(query)}`),
  getProduct: (id: string) => apiFetch<Product>(`/products/${id}`),
  getProductBySlug: (slug: string) => apiFetch<Product>(`/products/slug/${slug}`),
  getFeatured: () => apiFetch<Product[]>(`/products/featured`),
  getNewArrivals: (limit = 12) => apiFetch<Product[]>(`/products/new${qs({ limit })}`),
  /** Homepage multi-seller discovery grid — daily-rotated, seller-balanced. */
  getDiscovery: () => apiFetch<Product[]>(`/products/discovery`),

  // Categories (public)
  getCategories: () => apiFetch<Category[]>(`/categories`),

  // Featured sellers (public) — homepage shop discovery cards
  getFeaturedSellers: () => apiFetch<FeaturedSeller[]>(`/sellers/featured`),
  getStore: (slug: string, page = 1) =>
    apiFetch<SellerStore>(`/sellers/store/${slug}${qs({ page })}`),

  // Seller (auth)
  getSellerDashboard: () =>
    apiFetch<SellerDashboardResponse>(`/sellers/dashboard`, { auth: true }),
  createSellerProfile: (body: { storeName: string; description?: string }) =>
    apiFetch<SellerProfile>(`/sellers/profile`, { method: 'POST', body: JSON.stringify(body), auth: true }),
  getMySellerProfile: () => apiFetch<SellerProfile>(`/sellers/profile`, { auth: true }),
  /** Submit (or re-submit) the seller application for admin review. */
  submitSellerApplication: (termsVersion: string) =>
    apiFetch<{ profile: SellerProfile; message: string }>(`/sellers/apply`, {
      method: 'POST',
      body: JSON.stringify({ termsVersion }),
      auth: true,
    }),
  getMyProducts: () =>
    apiFetch<{ products: Product[]; counts: Record<string, number> }>(`/products/seller/me`, { auth: true }),
  createProduct: (body: unknown) =>
    apiFetch<ProductMutationResponse>(`/products`, { method: 'POST', body: JSON.stringify(body), auth: true }),
  updateProduct: (id: string, body: unknown) =>
    apiFetch<ProductMutationResponse>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(body), auth: true }),
  publishProduct: (id: string) =>
    apiFetch<ProductMutationResponse>(`/products/${id}/publish`, { method: 'POST', auth: true }),
  unpublishProduct: (id: string) =>
    apiFetch<ProductMutationResponse>(`/products/${id}/unpublish`, { method: 'POST', auth: true }),
  deleteProduct: (id: string) =>
    apiFetch<{ message: string }>(`/products/${id}`, { method: 'DELETE', auth: true }),

  // Wishlist (auth)
  getWishlist: () => apiFetch<{ items: WishlistItem[] }>(`/wishlist`, { auth: true }),
  addToWishlist: (productId: string) =>
    apiFetch<unknown>(`/wishlist/${productId}`, { method: 'POST', auth: true }),
  removeFromWishlist: (productId: string) =>
    apiFetch<{ message: string }>(`/wishlist/${productId}`, { method: 'DELETE', auth: true }),

  // Admin (auth + role)
  getAdminOverview: () => apiFetch<AdminOverview>(`/admin/overview`, { auth: true }),

  // ── Admin: seller governance ────────────────────────────
  /** Application queue. status: PENDING | APPROVED | REJECTED | SUSPENDED | BLOCKED */
  getAdminSellerApplications: (status?: string) =>
    apiFetch<{ applications: SellerApplicationRow[] }>(
      `/admin/sellers${qs({ status })}`,
      { auth: true },
    ),
  getAdminSellerApplication: (id: string) =>
    apiFetch<SellerApplicationDetail>(`/admin/sellers/${id}`, { auth: true }),
  adminApproveSeller: (id: string) =>
    apiFetch<unknown>(`/admin/sellers/${id}/approve`, { method: 'POST', auth: true }),
  adminRejectSeller: (id: string, reason: string, note?: string) =>
    apiFetch<unknown>(`/admin/sellers/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, note }),
      auth: true,
    }),
  adminSuspendSeller: (id: string, reason?: string, note?: string) =>
    apiFetch<unknown>(`/admin/sellers/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason, note }),
      auth: true,
    }),
  adminBlockSeller: (id: string, reason?: string, note?: string) =>
    apiFetch<unknown>(`/admin/sellers/${id}/block`, {
      method: 'POST',
      body: JSON.stringify({ reason, note }),
      auth: true,
    }),
  adminReinstateSeller: (id: string) =>
    apiFetch<unknown>(`/admin/sellers/${id}/reinstate`, { method: 'POST', auth: true }),
  /** Hard-delete any user (wipes store + products + activity). */
  adminDeleteUser: (id: string) =>
    apiFetch<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE', auth: true }),
  /** Self-service account deletion. */
  deleteMyAccount: () =>
    apiFetch<{ message: string }>(`/users/me`, { method: 'DELETE', auth: true }),
  getAdminUsers: (query: { page?: number; q?: string; role?: string } = {}) =>
    apiFetch<any>(`/admin/users${qs(query)}`, { auth: true }),
  getAdminProducts: (query: { page?: number; status?: string; q?: string } = {}) =>
    apiFetch<any>(`/admin/products${qs(query)}`, { auth: true }),
  adminSetUserRole: (id: string, role: 'BUYER' | 'SELLER' | 'ADMIN') =>
    apiFetch<{ id: string; role: string }>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
      auth: true,
    }),
  adminPublishProduct: (id: string) =>
    apiFetch<ProductMutationResponse>(`/admin/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'PUBLISHED' }),
      auth: true,
    }),
  adminRemoveProduct: (id: string) =>
    apiFetch<ProductMutationResponse>(`/admin/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'REMOVED' }),
      auth: true,
    }),
  /** Moderate a product with an auditable reason (approve/reject/etc). */
  adminModerateProduct: (id: string, status: string, reason?: string) =>
    apiFetch<ProductMutationResponse>(`/admin/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
      auth: true,
    }),
  updateProductStatus: (id: string, status: string) =>
    apiFetch<ProductMutationResponse>(`/admin/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      auth: true,
    }),

  updateSellerProfile: (body: {
    storeName?: string;
    description?: string;
    location?: string;
    category?: string;
    phone?: string;
    payoutEmail?: string;
    logoUrl?: string;
    bannerUrl?: string;
  }) =>
    apiFetch<SellerProfile>(`/sellers/profile`, { method: 'PATCH', body: JSON.stringify(body), auth: true }),

  // Uploads (auth, multipart)
  /** Single image upload (shop logos, avatars). Multipart field: file. */
  uploadImage: async (form: FormData) => {
    const token = await getTokenFn();
    const res = await fetch(`${API_URL}/uploads/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(text || 'Upload failed', res.status);
    }
    return (await res.json()) as { url: string };
  },

  uploadImages: async (files: File[]) => {
    const token = await getTokenFn();
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const res = await fetch(`${API_URL}/uploads/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(text || 'Upload failed', res.status);
    }
    return (await res.json()) as { urls: string[] };
  },

  /**
   * Upload images with REAL progress events (XHR — fetch cannot report
   * upload progress). Resolves with the Cloudinary URLs in file order.
   */
  uploadImagesWithProgress: (files: File[], onProgress: (pct: number) => void) =>
    new Promise<string[]>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/uploads/images`);
      xhr.timeout = 60_000;
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const body = JSON.parse(xhr.responseText) as { urls: string[] };
            resolve(body.urls ?? []);
          } catch {
            reject(new ApiError('Unexpected upload response', xhr.status));
          }
        } else {
          let message = 'Upload failed';
          try {
            message = JSON.parse(xhr.responseText)?.message ?? message;
          } catch {
            /* keep default */
          }
          reject(new ApiError(message, xhr.status));
        }
      };
      xhr.onerror = () => reject(new ApiError('Network error during upload', 0));
      xhr.ontimeout = () => reject(new ApiError('Upload timed out', 0));

      const form = new FormData();
      files.forEach((f) => form.append('files', f));
      getTokenFn()
        .then((token) => {
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.send(form);
        })
        .catch(() => xhr.send(form));
    }),

  // Me (auth)
  getMe: () => apiFetch<any>(`/users/me`, { auth: true }),

  // ── Reviews (public reads, auth writes) ─────────────────

  getProductReviews: (productId: string, page = 1, limit = 10) =>
    apiFetch<ProductReviewPage>(`/reviews/product/${productId}${qs({ page, limit })}`),

  getMyReviewStatus: (productId: string) =>
    apiFetch<MyReviewStatus>(`/reviews/mine/${productId}`, { auth: true }),

  submitReview: (body: {
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
    sellerRating?: {
      rating: number;
      communication?: number;
      productAccuracy?: number;
      packaging?: number;
      deliveryExperience?: number;
      comment?: string;
    };
  }) => apiFetch<unknown>(`/reviews`, { method: 'POST', body: JSON.stringify(body), auth: true }),

  updateReview: (id: string, body: { rating?: number; title?: string; comment?: string }) =>
    apiFetch<unknown>(`/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(body), auth: true }),

  deleteMyReview: (id: string) =>
    apiFetch<{ message: string }>(`/reviews/${id}`, { method: 'DELETE', auth: true }),

  getSellerReviews: (sellerUserId: string, page = 1, limit = 10) =>
    apiFetch<{
      seller: { id: string; name: string | null; store: SellerStore | null };
      reviews: SellerReviewPublic[];
      summary: SellerReviewSummary;
      page: number;
      pages: number;
    }>(`/reviews/seller/${sellerUserId}${qs({ page, limit })}`),

  // ── Public store page ───────────────────────────────────

  getSellerStore: (slug: string) =>
    apiFetch<SellerStore>(`/sellers/store/${slug}`),

  // ── Orders (buyer) ──────────────────────────────────────

  createOrder: (body: {
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress?: Record<string, string>;
  }) => apiFetch<Order>(`/orders`, { method: 'POST', body: JSON.stringify(body), auth: true }),
  getMyOrders: () => apiFetch<Order[]>(`/orders`, { auth: true }),
  getOrder: (id: string) => apiFetch<Order>(`/orders/${id}`, { auth: true }),
  /** Verify a Paystack payment by reference (after redirect back). */
  verifyPayment: (reference: string) =>
    apiFetch<Order>(`/payments/verify/${encodeURIComponent(reference)}`, { auth: true }),
  /** Start a Paystack payment for an order. */
  initializePayment: (body: { orderId: string; email: string }) =>
    apiFetch<{ authorizationUrl: string; reference: string; accessCode: string }>(
      `/payments/initialize`,
      { method: 'POST', body: JSON.stringify(body), auth: true },
    ),

  // ── Orders (seller) ─────────────────────────────────────

  getSellerOrders: (query: { status?: string; page?: number } = {}) =>
    apiFetch<{ orders: SellerOrderView[]; total: number; page: number; pages: number }>(
      `/orders/seller${qs(query)}`,
      { auth: true },
    ),

  updateItemFulfillment: (
    orderId: string,
    itemId: string,
    body: { status: FulfillmentStatus; trackingNumber?: string; carrier?: string; message?: string },
  ) =>
    apiFetch<unknown>(`/orders/${orderId}/items/${itemId}/fulfillment`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      auth: true,
    }),

  // ── Reviews admin (auth + role) ─────────────────────────

  getAdminReviews: (query: { page?: number; status?: string } = {}) =>
    apiFetch<any>(`/reviews/admin${qs(query)}`, { auth: true }),
  moderateProductReview: (id: string, status: 'VISIBLE' | 'HIDDEN') =>
    apiFetch<{ message: string }>(`/reviews/admin/product/${id}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      auth: true,
    }),
  moderateSellerReview: (id: string, status: 'VISIBLE' | 'HIDDEN') =>
    apiFetch<{ message: string }>(`/reviews/admin/seller/${id}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      auth: true,
    }),

  // ── Orders admin (auth + role) ──────────────────────────
  getAdminOrders: (query: { status?: string; page?: number } = {}) =>
    apiFetch<any>(`/orders/admin${qs(query)}`, { auth: true }),
};

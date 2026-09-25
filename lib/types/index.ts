// ============================================================
// KOVA — Shared Types (synced with kova-api/src)
// These mirror the API responses 1:1.
// ============================================================

export type ProductType = 'PHYSICAL' | 'DIGITAL';
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'REMOVED';
export type ProductBadge = 'new' | 'hot' | 'sale';
export type Role = 'BUYER' | 'SELLER' | 'ADMIN';

export interface SellerRef {
  id: string;
  name: string | null;
  avatarUrl?: string | null;
  sellerProfile?: { storeName: string; storeSlug: string } | null;
}

export interface CategoryRef {
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  productType: ProductType;
  status?: ProductStatus;
  badge?: ProductBadge | null;
  tags?: string[];
  images: string[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  buyCount?: number;
  viewCount?: number;
  createdAt?: string;
  categoryId?: string | null;
  category?: CategoryRef | null;
  seller: SellerRef;
  description?: string;
  reviews?: ProductReview[];
}

export interface ProductReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: { id: string; name: string | null; avatarUrl?: string | null };
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  sortOrder: number;
  productCount: number;
}

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  isVerified: boolean;
  user?: { name: string | null; email: string; avatarUrl?: string | null };
}

/** Homepage featured-sellers card — computed server-side from live data. */
export type FeaturedSeller = {
  storeName: string;
  storeSlug: string;
  description: string | null;
  location: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  isVerified: boolean;
  productCount: number;
  avgRating: number | null;
  previewProducts: Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'images' | 'rating' | 'reviewCount' | 'productType'>[];
};

export interface SellerDashboardResponse {
  stats: {
    totalProducts: number;
    published: number;
    drafts: number;
    unpublished: number;
    digital: number;
    physical: number;
    totalViews: number;
    totalSales: number;
    totalRevenue: number;
    avgRating: number;
  };
  products: Product[];
  profile: SellerProfile | null;
}

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: Product;
}

export interface AdminOverview {
  users: { total: number; buyers: number; sellers: number; admins: number };
  products: {
    total: number;
    published: number;
    drafts: number;
    digital: number;
    physical: number;
    addedToday: number;
    addedThisWeek: number;
  };
  engagement: { totalProductViews: number };
  orders: { total: number; paid: number };
  generatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// ── Orders & tracking ─────────────────────────────────────

export type OrderStatus =
  | 'PENDING' | 'PAID' | 'PROCESSING' | 'PACKED' | 'SHIPPED'
  | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export type FulfillmentStatus = Exclude<OrderStatus, 'REFUNDED'> | 'PENDING';

export interface OrderEvent {
  id: string;
  status: OrderStatus;
  message: string | null;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  fulfillmentStatus: FulfillmentStatus;
  trackingNumber?: string | null;
  carrier?: string | null;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'productType' | 'images'> & {
    sellerId?: string;
    seller?: { name: string | null; sellerProfile?: { storeName: string } | null };
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  shippingAddress?: { city?: string; state?: string; country?: string } | null;
  items: OrderItem[];
  events?: OrderEvent[];
}

export interface SellerOrderView {
  id: string;
  orderNumber: string;
  createdAt: string;
  paymentStatus: string;
  buyer: { name: string | null; email: string } | null;
  shippingCity: string | null;
  shippingState: string | null;
  items: {
    id: string;
    quantity: number;
    price: number;
    fulfillmentStatus: FulfillmentStatus;
    trackingNumber?: string | null;
    carrier?: string | null;
    product: Pick<Product, 'id' | 'name' | 'slug' | 'productType' | 'images'>;
  }[];
  sellerSubtotal: number;
}

// ── Reviews ───────────────────────────────────────────────

export interface ReviewSummary {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

export interface ProductReviewPage {
  product: { id: string; slug: string; name: string };
  reviews: ProductReview[];
  summary: ReviewSummary;
  page: number;
  pages: number;
}

export interface MyReviewStatus {
  review: (ProductReview & { title?: string | null; verifiedPurchase: boolean }) | null;
  verifiedPurchase: boolean;
}

export interface SellerReviewPublic {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: { id: string; name: string | null; avatarUrl?: string | null } | null;
}

export interface SellerReviewSummary extends ReviewSummary {
  dimensions: {
    communication: number | null;
    productAccuracy: number | null;
    packaging: number | null;
    deliveryExperience: number | null;
  };
}

export interface SellerStore {
  id: string;
  /** Owner user id — used to fetch seller-review summaries. */
  userId?: string;
  storeName: string;
  storeSlug: string;
  description?: string | null;
  location?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  isVerified: boolean;
  /** New paginated payload fields (backend now sends these). */
  ownerName?: string | null;
  totalProducts?: number;
  page?: number;
  limit?: number;
  pages?: number;
  user?: {
    id: string;
    name: string | null;
    avatarUrl?: string | null;
    products: Product[];
  };
  /** Flat product list for the new paginated payload. */
  products?: Product[];
}

export interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

export interface NavLink {
  label: string;
  href: string;
}

// ── UI helpers ────────────────────────────────────────────

export function badgeLabel(badge?: string | null): string {
  if (!badge) return '';
  switch (badge.toUpperCase()) {
    case 'NEW': return 'new';
    case 'HOT': return 'hot';
    case 'SALE': return 'sale';
    default: return badge.toLowerCase();
  }
}

export function isProductPrimaryImage(images: string[] | undefined): string | undefined {
  return images?.[0] ?? undefined;
}

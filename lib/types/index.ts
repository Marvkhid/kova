// ============================================================
// KOVA — Global Type Definitions
// ============================================================

export type ProductCategory =
  | 'fashion'
  | 'digital'
  | 'services'
  | 'physical'
  | 'art'
  | 'courses';

export type ProductBadge = 'new' | 'hot' | 'sale';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;       // shows strikethrough if discounted
  category: ProductCategory;
  seller: string;
  description: string;
  badge?: ProductBadge;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  buyCount?: number;
  imagePlaceholder: string;     // slot label, replaced with real img src
}

export interface CartItem {
  product: Product;
  quantity: number;
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

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatarPlaceholder: string;
}

export interface CategoryCard {
  id: string;
  name: string;
  count: string;
  imagePlaceholder: string;
  href: string;
}
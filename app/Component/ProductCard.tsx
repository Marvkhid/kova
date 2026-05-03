'use client';
// ============================================================
// KOVA — ProductCard
// Used on landing page, shopping page, trending section, etc.
// Fires toast notification on add-to-cart.
// ============================================================

import { ImageSlot } from './ImageSlot';
import { Badge, StarRating } from '../ui/Atom';
import { useCart }  from '@/features/cart/CartContext';
import { useToast } from './ToastContext';
import { formatPrice } from '@/lib/utils/index';
import type { Product } from '@/lib/types/index';
import Link from 'next/link';
interface ProductCardProps {
  product:  Product;
  variant?: 'default' | 'compact';
}
 
export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addItem }  = useCart();
  const { addToast } = useToast();
 
  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault(); // don't navigate if card is wrapped in Link
    addItem(product);
    addToast(`${product.name} has been added to your cart.`);
  }
 
  return (
    <div
      className={[
        'group relative bg-white rounded-[18px] overflow-hidden',
        'border border-black/[0.07]',
        'transition-all duration-300 ease-[var(--ease-out)]',
        'hover:-translate-y-[5px] hover:shadow-[0_20px_44px_rgba(0,0,0,0.12)]',
        'cursor-pointer',
      ].join(' ')}
    >
      <Link href={`/shopping/${product.id}`} className="block">
        {/* ── Image area ── */}
        <div className="relative w-full aspect-square overflow-hidden">
          <img
            src={`/images/${product.imagePlaceholder}.jpg`}
            alt={product.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
 
          {/* Badge */}
          {product.badge && (
            <div className="absolute top-[10px] left-[10px] z-10">
              <Badge type={product.badge} />
            </div>
          )}
 
          {/* Quick-add overlay — slides up on hover */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none group-hover:pointer-events-auto">
            <button
              onClick={handleAddToCart}
              className={[
                'font-medium text-[0.82rem] tracking-[0.02em]',
                'text-white bg-[#E8622A]',
                'px-5 py-[9px] rounded-full',
                'shadow-[0_4px_16px_rgba(232,98,42,0.4)]',
                'opacity-0 translate-y-3 scale-95',
                'group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100',
                'transition-all duration-[280ms] ease-[var(--ease-out)]',
                'hover:bg-[#F07A48] active:scale-95',
              ].join(' ')}
            >
              Quick add
            </button>
          </div>
        </div>
 
        {/* ── Info ── */}
        <div className="px-4 pt-3 pb-4">
          {/* Seller */}
          <p className="text-[0.68rem] text-black/38 uppercase tracking-[0.07em] mb-[3px] transition-colors duration-200 group-hover:text-[#E8622A]">
            {product.seller}
          </p>
 
          {/* Name */}
          <p
            className="font-semibold text-[0.96rem] text-[#0D0D0D] leading-snug mb-1 transition-all duration-200 group-hover:text-[1.01rem]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {product.name}
          </p>
 
          {/* Rating */}
          {product.rating && (
            <div className="mb-2">
              <StarRating rating={product.rating} count={product.reviewCount} />
            </div>
          )}
 
          {/* Social proof */}
          {product.buyCount && (
            <p className="text-[0.68rem] text-black/36 mb-2">
              {product.buyCount.toLocaleString()} people bought this
            </p>
          )}
 
          {/* Price row */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-baseline gap-2">
              <span
                className="font-bold text-[1.08rem] text-[#0D0D0D] transition-colors duration-200 group-hover:text-[#E8622A]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[0.78rem] text-black/36 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
 
            {/* Add button */}
            <button
              aria-label={`Add ${product.name} to cart`}
              onClick={handleAddToCart}
              className={[
                'w-[34px] h-[34px] rounded-full flex-shrink-0',
                'bg-[#0D0D0D] text-[#F5F0E8]',
                'flex items-center justify-center',
                'text-lg font-light leading-none',
                'transition-all duration-200',
                'hover:bg-[#E8622A] hover:scale-110',
                'active:scale-95',
              ].join(' ')}
            >
              +
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
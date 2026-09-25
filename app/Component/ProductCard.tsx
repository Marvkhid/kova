'use client';
// ============================================================
// KOVA — ProductCard
// Renders an API product. Links to the canonical, QR-stable
// URL /products/[slug]. Wishlist heart + quick add-to-cart.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useCart } from '@/features/cart/CartContext';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { useToast } from './ToastContext';
import { Badge, StarRating } from '../ui/Atom';
import { formatPrice } from '@/lib/utils/index';
import { track } from '@/lib/analytics';
import { productPhoto } from '@/lib/photo-fallback';
import type { Product } from '@/lib/types/index';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
}

function FallbackImage({ name, categorySlug }: { name: string; categorySlug?: string | null }) {
  return (
    <div className="absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={productPhoto({ categorySlug, name })}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />
    </div>
  );
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { isWishlisted, toggle } = useWishlist();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);

  const isCompact = variant === 'compact';
  const image = product.images?.[0];
  const wished = isWishlisted(product.id);
  const sellerName =
    product.seller?.sellerProfile?.storeName ?? product.seller?.name ?? 'KOVA Seller';
  const storeSlug = product.seller?.sellerProfile?.storeSlug ?? null;
  const discounted = Boolean(product.originalPrice && product.originalPrice > product.price);

  // Marketplace navigation: the seller line opens the seller's shop.
  // (A nested <Link> inside the card's product <Link> would be invalid
  // HTML, so this is a click-through span with proper keyboard support.)
  function handleSellerClick(e: React.MouseEvent) {
    if (!storeSlug) return;
    e.preventDefault();
    e.stopPropagation();
    router.push(`/store/${storeSlug}`);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product);
    track.addToCart({ id: product.id, name: product.name, price: product.price });
    addToast(`${product.name} has been added to your cart.`);
  }

  async function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }
    try {
      await toggle(product);
    } catch {
      addToast('Could not update your wishlist. Please try again.', 'error');
    }
  }

  return (
    <div
      className={[
        'group relative bg-white rounded-[16px] sm:rounded-[18px] overflow-hidden',
        'border border-black/[0.07]',
        'transition-all duration-300 ease-[var(--ease-out)]',
        'hover:-translate-y-[3px] sm:hover:-translate-y-[5px] hover:shadow-[0_20px_44px_rgba(0,0,0,0.12)]',
      ].join(' ')}
    >
      <Link href={`/products/${product.slug}`} className="block" aria-label={product.name}>
        {/* ── Image area ── */}
        <div className="relative w-full aspect-square overflow-hidden">
          {image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={product.name}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 400ms ease, transform 500ms var(--ease-out)',
                }}
                className="group-hover:scale-[1.04]"
              />
              {!imageLoaded && <div className="absolute inset-0 bg-[#EDE8DF] animate-pulse" />}
            </>
          ) : (
            <FallbackImage name={product.name} categorySlug={product.category?.slug} />
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {product.badge && <Badge type={product.badge.toLowerCase() as any} />}
            {product.productType === 'DIGITAL' && (
              <span className="inline-flex items-center bg-[#3B2F6E]/90 text-[#F5F0E8] text-[0.58rem] font-semibold uppercase tracking-[0.06em] px-2 py-[3px] rounded-full">
                Digital
              </span>
            )}
          </div>

          {/* Wishlist heart */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            aria-pressed={wished}
            className={[
              'absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center',
              'transition-all duration-200 active:scale-90',
              wished
                ? 'bg-[#E8622A] text-white shadow-md'
                : 'bg-white/90 text-black/50 hover:text-[#E8622A] opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
            ].join(' ')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>

          {/* Quick-add overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none group-hover:pointer-events-auto">
            <button
              type="button"
              onClick={handleAddToCart}
              className={[
                'font-medium text-[0.76rem] sm:text-[0.82rem] tracking-[0.02em]',
                'text-white bg-[#E8622A]',
                'px-4 sm:px-5 py-2 sm:py-[9px] rounded-full',
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
        <div className={isCompact ? 'px-3 pt-2.5 pb-3' : 'px-3 sm:px-4 pt-3 pb-4'}>
          <span
            role={storeSlug ? 'link' : undefined}
            tabIndex={storeSlug ? 0 : undefined}
            onClick={handleSellerClick}
            onKeyDown={(e) => {
              if (storeSlug && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                router.push(`/store/${storeSlug}`);
              }
            }}
            className={[
              'block text-[0.64rem] sm:text-[0.68rem] uppercase tracking-[0.07em] mb-[3px] truncate transition-colors duration-200',
              storeSlug
                ? 'cursor-pointer font-semibold text-black/45 hover:text-[#E8622A] group-hover:text-[#E8622A]'
                : 'text-black/38 group-hover:text-[#E8622A]',
            ].join(' ')}
            aria-label={storeSlug ? `Visit ${sellerName}'s shop` : undefined}
          >
            {sellerName}
          </span>

          <p
            className={[
              'font-semibold text-[#0D0D0D] leading-snug mb-1 transition-all duration-200',
              isCompact
                ? 'text-[0.88rem]'
                : 'text-[0.9rem] sm:text-[0.96rem] group-hover:text-[0.98rem] sm:group-hover:text-[1.01rem]',
            ].join(' ')}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {product.name}
          </p>

          {product.rating > 0 && (
            <div className="mb-1.5 sm:mb-2">
              <StarRating rating={product.rating} count={product.reviewCount} />
            </div>
          )}

          {product.category && (
            <p className="text-[0.64rem] sm:text-[0.68rem] text-black/36 mb-1.5 sm:mb-2 truncate">
              {product.category.name}
            </p>
          )}

          {/* Price row */}
          <div className="flex items-center justify-between mt-1 gap-2">
            <div className="flex items-baseline gap-1.5 sm:gap-2 min-w-0">
              <span
                className="font-bold text-[1rem] sm:text-[1.08rem] text-[#0D0D0D] transition-colors duration-200 group-hover:text-[#E8622A] truncate"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formatPrice(product.price)}
              </span>
              {discounted && (
                <span className="text-[0.72rem] sm:text-[0.78rem] text-black/36 line-through truncate">
                  {formatPrice(product.originalPrice!)}
                </span>
              )}
            </div>

            <button
              type="button"
              aria-label={`Add ${product.name} to cart`}
              onClick={handleAddToCart}
              className={[
                'w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-full flex-shrink-0',
                'bg-[#0D0D0D] text-[#F5F0E8]',
                'flex items-center justify-center',
                'text-base sm:text-lg font-light leading-none',
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

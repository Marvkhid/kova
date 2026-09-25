'use client';

// ============================================================
// KOVA — ProductActions (client)
// Add-to-cart, wishlist toggle and share/QR entry points on
// the product detail page.
// ============================================================

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCart } from '@/features/cart/CartContext';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { useToast } from '@/app/Component/ToastContext';
import { ShareProduct } from '@/app/Component/ShareProduct';
import { formatPrice } from '@/lib/utils';
import { track } from '@/lib/analytics';
import type { Product } from '@/lib/types';

export function ProductActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { isWishlisted, toggle } = useWishlist();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const wished = isWishlisted(product.id);

  // Fire the product-view analytics event once per mount
  useEffect(() => {
    track.productView({
      id: product.id,
      name: product.name,
      productType: product.productType,
      price: product.price,
    });
  }, [product.id, product.name, product.productType, product.price]);

  function handleAddToCart() {
    addItem(product);
    track.addToCart({ id: product.id, name: product.name, price: product.price });
    addToast(`${product.name} added to your cart.`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  async function handleWishlist() {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }
    try {
      await toggle(product);
    } catch {
      addToast('Could not update your wishlist.', 'error');
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={handleAddToCart}
          className={[
            'flex-1 h-[50px] sm:h-[52px] rounded-full font-medium text-[0.92rem] sm:text-[0.98rem]',
            'transition-all duration-200 active:scale-[0.98]',
            added
              ? 'bg-[#2A5C45] text-white'
              : 'bg-[#E8622A] text-white hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(232,98,42,0.35)]',
          ].join(' ')}
        >
          {added ? '✓ Added to cart' : `Add to cart — ${formatPrice(product.price)}`}
        </button>

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wished}
          className={[
            'w-[50px] sm:w-[52px] h-[50px] sm:h-[52px] rounded-full flex-shrink-0',
            'flex items-center justify-center border transition-all duration-200 active:scale-90',
            wished
              ? 'bg-[#E8622A] border-[#E8622A] text-white'
              : 'bg-white border-black/[0.12] text-black/50 hover:text-[#E8622A] hover:border-[#E8622A]/40',
          ].join(' ')}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShareOpen(true)}
        className={[
          'h-[46px] rounded-full border border-black/[0.12] bg-white',
          'text-[0.86rem] font-medium text-[#0D0D0D]',
          'hover:border-black/30 transition-colors',
          'flex items-center justify-center gap-2',
        ].join(' ')}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.59 13.51 6.83 3.98m-.01-10.98-6.82 3.98" />
        </svg>
        Share · Copy link · QR code
      </button>

      <ShareProduct product={product} open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}

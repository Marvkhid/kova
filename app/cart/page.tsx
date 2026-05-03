'use client';
// ============================================================
// KOVA — /cart
// Full cart page: items list, quantity +/-, remove,
// order summary with subtotal + total, checkout CTA.
// ============================================================

import Link from 'next/link';
import { useCart } from '@/features/cart/CartContext';
import { useToast } from '../Component/ToastContext';
import { ImageSlot } from '../Component/ImageSlot';
import { formatPrice } from '@/lib/utils';
import type { CartItem } from '@/lib/types';

// ── Cart item row ─────────────────────────────────────────

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const { addToast } = useToast();
  const { product, quantity } = item;

  function handleRemove() {
    removeItem(product.id);
    addToast(`${product.name} removed from cart.`, 'info');
  }

  return (
    <div className="flex gap-4 py-5 border-b border-black/[0.07] last:border-0 group">

      {/* Image */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[12px] overflow-hidden flex-shrink-0 bg-[#EDE8DF]">
        {/* SWAP: <Image src={`/images/${product.imagePlaceholder}.jpg`} alt={product.name} fill className="object-cover" /> */}
        <ImageSlot label={product.imagePlaceholder} fill />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* Seller */}
          <p className="text-[0.7rem] text-black/40 uppercase tracking-[0.07em] mb-[2px]">
            {product.seller}
          </p>
          {/* Name */}
          <p
            className="font-semibold text-[0.95rem] text-[#0D0D0D] leading-snug truncate"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {product.name}
          </p>
          {/* Price per unit */}
          <p className="text-[0.82rem] text-black/45 mt-[2px]">
            {formatPrice(product.price)} each
          </p>
        </div>

        {/* Quantity + remove row */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity stepper */}
          <div className="flex items-center gap-1 bg-[#F0EBE2] rounded-full p-[3px]">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              aria-label="Decrease quantity"
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#0D0D0D] hover:bg-white hover:shadow-sm transition-all duration-150 text-lg leading-none font-light"
            >
              −
            </button>
            <span className="w-7 text-center text-sm font-semibold text-[#0D0D0D] select-none">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              aria-label="Increase quantity"
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#0D0D0D] hover:bg-white hover:shadow-sm transition-all duration-150 text-lg leading-none font-light"
            >
              +
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={handleRemove}
            className="text-[0.75rem] text-black/35 hover:text-red-500 transition-colors duration-200 underline underline-offset-2"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Line total */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <p
          className="font-bold text-[1rem] text-[#0D0D0D]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {formatPrice(product.price * quantity)}
        </p>
      </div>

    </div>
  );
}

// ── Empty cart ────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl mb-5">🛒</div>
      <h2
        className="font-bold text-[1.4rem] text-[#0D0D0D] mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Your cart is empty
      </h2>
      <p className="text-[0.9rem] text-black/50 mb-8 max-w-[260px]">
        Looks like you haven&apos;t added anything yet. Start browsing to find something you love.
      </p>
      <Link
        href="/shopping"
        className="px-7 py-[0.875rem] rounded-full bg-[#E8622A] text-white font-medium hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(232,98,42,0.35)] transition-all duration-250"
      >
        Browse products
      </Link>
    </div>
  );
}

// ── Order summary ─────────────────────────────────────────

function OrderSummary({ subtotal }: { subtotal: number }) {
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const total    = subtotal + shipping;

  return (
    <div className="bg-white rounded-[20px] border border-black/[0.08] p-6 sticky top-[88px]">
      <h2
        className="font-bold text-[1.1rem] text-[#0D0D0D] mb-5"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Order Summary
      </h2>

      <div className="flex flex-col gap-3 text-[0.9rem] mb-5">
        <div className="flex justify-between">
          <span className="text-black/55">Subtotal</span>
          <span className="font-medium text-[#0D0D0D]">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-black/55">Shipping</span>
          <span className={shipping === 0 ? 'text-[#2A5C45] font-medium' : 'font-medium text-[#0D0D0D]'}>
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>
        {shipping > 0 && (
          <p className="text-[0.75rem] text-black/40">
            Free shipping on orders over $50
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-black/[0.07] my-4" />

      {/* Total */}
      <div className="flex justify-between items-baseline mb-6">
        <span className="font-bold text-[1rem] text-[#0D0D0D]">Total</span>
        <span
          className="font-extrabold text-[1.4rem] text-[#0D0D0D]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {formatPrice(total)}
        </span>
      </div>

      {/* Checkout button */}
      <button className="w-full py-[0.9rem] rounded-full bg-[#E8622A] text-white font-medium text-[1rem] hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(232,98,42,0.35)] transition-all duration-200 active:scale-[0.98]">
        Checkout →
      </button>

      {/* Trust note */}
      <p className="text-center text-[0.72rem] text-black/35 mt-4 flex items-center justify-center gap-1">
        <span>🔒</span> Secure checkout · Buyer protection
      </p>

      {/* Continue shopping */}
      <div className="mt-4 text-center">
        <Link
          href="/shopping"
          className="text-[0.82rem] text-[#E8622A] hover:opacity-70 transition-opacity underline underline-offset-2"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function CartPage() {
  const { items, itemCount, total, clearCart } = useCart();
  const { addToast } = useToast();

  function handleClear() {
    clearCart();
    addToast('Cart cleared.', 'info');
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* Header */}
      <div className="bg-[#0D0D0D] pt-10 pb-12">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] uppercase text-[#F5F0E8]/32 mb-3">
            Your cart
          </p>
          <h1
            className="font-extrabold text-[#F5F0E8] leading-[1.0] tracking-[-0.03em]"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            }}
          >
            {itemCount > 0
              ? `${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart`
              : 'Your cart'}
          </h1>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-10">

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">

            {/* Left — items */}
            <div>
              {/* Items header */}
              <div className="flex items-center justify-between mb-1">
                <h2
                  className="font-bold text-[1rem] text-[#0D0D0D]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Items
                </h2>
                <button
                  onClick={handleClear}
                  className="text-[0.78rem] text-black/35 hover:text-red-500 transition-colors underline underline-offset-2"
                >
                  Clear all
                </button>
              </div>

              {/* Items list */}
              <div className="bg-white rounded-[20px] border border-black/[0.07] px-5 divide-y divide-black/[0.06]">
                {items.map(item => (
                  <CartItemRow key={item.product.id} item={item} />
                ))}
              </div>

              {/* You might also like */}
              <div className="mt-8">
                <p
                  className="font-semibold text-[0.9rem] text-black/50 mb-4"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  You might also like
                </p>
                <Link
                  href="/shopping"
                  className="inline-flex items-center gap-2 text-[0.875rem] font-medium text-[#E8622A] hover:opacity-70 transition-opacity"
                >
                  Browse more products →
                </Link>
              </div>
            </div>

            {/* Right — summary */}
            <OrderSummary subtotal={total} />

          </div>
        )}

      </div>
    </div>
  );
}
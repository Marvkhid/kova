'use client';
// ============================================================
// KOVA — CartPanel
// Slide-in drawer from the right.
// Triggered globally — import useCartPanel to open/close.
// ============================================================

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/features/cart/CartContext';
import { useToast } from '@/app/Component/ToastContext';
import { formatPrice } from '@/lib/utils';
import type { CartItem } from '@/lib/types';
interface CartPanelContextValue {
  isOpen:  boolean;
  open:    () => void;
  close:   () => void;
  toggle:  () => void;
}
 
const CartPanelContext = createContext<CartPanelContextValue | null>(null);
 
export function useCartPanel(): CartPanelContextValue {
  const ctx = useContext(CartPanelContext);
  if (!ctx) throw new Error('useCartPanel must be used inside <CartPanelProvider>');
  return ctx;
}
 
// ── Empty State ───────────────────────────────────────────
 
function EmptyPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
 
  function handleBrowse() {
    // Close panel first, then navigate after paint
    onClose();
    setTimeout(() => router.push('/shopping'), 50);
  }
 
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-16 text-center px-6">
      <div className="text-5xl mb-4">🛒</div>
      <h3
        className="font-bold text-[1.1rem] text-[#0D0D0D] mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Your cart is empty
      </h3>
      <p className="text-[0.85rem] text-black/45 mb-6 max-w-[220px]">
        Add something great to get started.
      </p>
      <button
        onClick={handleBrowse}
        className="px-6 py-2.5 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors cursor-pointer"
      >
        Browse products
      </button>
    </div>
  );
}
 
// ── Cart Item Row ─────────────────────────────────────────
 
function PanelCartItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const { addToast } = useToast();
  const { product, quantity } = item;
 
  return (
    <div className="flex gap-3 py-4 border-b border-black/[0.06] last:border-0">
      <div className="w-16 h-16 rounded-[10px] overflow-hidden bg-[#EDE8DF] flex-shrink-0">
        <img
          src={`/images/${product.imagePlaceholder}.jpg`}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
 
      <div className="flex-1 min-w-0">
        <p className="text-[0.68rem] text-[#E8622A] uppercase tracking-[0.06em] font-medium">
          {product.seller}
        </p>
        <p
          className="font-semibold text-[0.85rem] text-[#0D0D0D] leading-snug truncate mt-0.5"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {product.name}
        </p>
 
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 bg-[#F0EBE2] rounded-full p-[2px]">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#0D0D0D] hover:bg-white transition-all text-sm leading-none"
            >
              −
            </button>
            <span className="w-5 text-center text-[0.8rem] font-semibold text-[#0D0D0D]">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#0D0D0D] hover:bg-white transition-all text-sm leading-none"
            >
              +
            </button>
          </div>
          <p
            className="font-bold text-[0.9rem] text-[#0D0D0D]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {formatPrice(product.price * quantity)}
          </p>
        </div>
      </div>
 
      <button
        onClick={() => {
          removeItem(product.id);
          addToast(`${product.name} removed.`, 'info');
        }}
        aria-label={`Remove ${product.name}`}
        className="self-start text-black/25 hover:text-red-400 transition-colors text-xl leading-none mt-0.5 flex-shrink-0"
      >
        ×
      </button>
    </div>
  );
}
 
// ── Cart Panel ────────────────────────────────────────────
 
function CartPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const { items, total, itemCount, clearCart } = useCart();
  const { addToast } = useToast();
 
  const shipping   = total >= 50 ? 0 : 4.99;
  const grandTotal = total + shipping;
 
  function handleCheckout() {
    onClose();
    setTimeout(() => router.push('/cart'), 50);
  }
 
  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] transition-opacity duration-300"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
      />
 
      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="fixed top-0 right-0 bottom-0 z-[80] w-full max-w-[420px] bg-[#F5F0E8] shadow-2xl flex flex-col transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.07]">
          <div className="flex items-center gap-2">
            <h2
              className="font-bold text-[1rem] text-[#0D0D0D]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Your cart
            </h2>
            {itemCount > 0 && (
              <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#E8622A] text-white text-[0.65rem] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                onClick={() => { clearCart(); addToast('Cart cleared.', 'info'); }}
                className="text-[0.75rem] text-black/35 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/[0.07] transition-colors text-black/50 hover:text-black text-xl"
            >
              ×
            </button>
          </div>
        </div>
 
        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <EmptyPanel onClose={onClose} />
          ) : (
            <div className="divide-y divide-black/[0.06]">
              {items.map(item => (
                <PanelCartItem key={item.product.id} item={item} />
              ))}
            </div>
          )}
        </div>
 
        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-black/[0.07] px-6 py-5">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[0.85rem]">
                <span className="text-black/50">Subtotal</span>
                <span className="font-medium text-[#0D0D0D]">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-[0.85rem]">
                <span className="text-black/50">Shipping</span>
                <span className={`font-medium ${shipping === 0 ? 'text-[#2A5C45]' : 'text-[#0D0D0D]'}`}>
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-[0.7rem] text-black/35">
                  Add {formatPrice(50 - total)} more for free shipping
                </p>
              )}
            </div>
 
            <div className="flex justify-between items-baseline mb-5 pt-3 border-t border-black/[0.07]">
              <span className="font-bold text-[#0D0D0D]">Total</span>
              <span
                className="font-extrabold text-[1.3rem] text-[#0D0D0D]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formatPrice(grandTotal)}
              </span>
            </div>
 
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCheckout}
                className="w-full py-[0.9rem] rounded-full bg-[#E8622A] text-white font-medium hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(232,98,42,0.35)] transition-all duration-200 active:scale-[0.98]"
              >
                Checkout →
              </button>
              <button
                onClick={handleCheckout}
                className="w-full py-[0.9rem] rounded-full border border-black/15 text-[#0D0D0D] font-medium text-sm hover:border-black/30 transition-colors"
              >
                View full cart
              </button>
            </div>
 
            <p className="text-center text-[0.7rem] text-black/30 mt-3 flex items-center justify-center gap-1">
              <span>🔒</span> Secure checkout · Buyer protection
            </p>
          </div>
        )}
      </div>
    </>
  );
}
 
// ── Provider ──────────────────────────────────────────────
 
export function CartPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
 
  const open   = useCallback(() => setIsOpen(true),  []);
  const close  = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(v => !v), []);
 
  return (
    <CartPanelContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
      <CartPanel isOpen={isOpen} onClose={close} />
    </CartPanelContext.Provider>
  );
}
 
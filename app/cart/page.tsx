'use client';

import Link from 'next/link';
import { useCart } from '@/features/cart/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();

  const shipping = total >= 50 ? 0 : 4.99;
  const grandTotal = total + shipping;

  return (
    <div className="min-h-screen bg-[#F5F0E8] px-4 sm:px-6 py-8">
      <div className="max-w-[1100px] mx-auto">
        <h1
          className="font-extrabold text-[#0D0D0D] mb-6"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)' }}
        >
          Your Cart
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-[16px] sm:rounded-[20px] p-6 sm:p-8 border border-black/[0.08]">
            <p className="mb-4 text-black/60">Your cart is empty.</p>
            <Link href="/shopping" className="text-[#E8622A] font-medium">
              Browse products →
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_340px] gap-5 sm:gap-6">
            {/* Items */}
            <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.08] divide-y divide-black/[0.06]">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                  <img
                    src={`/images/${product.imagePlaceholder}.jpg`}
                    alt={product.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-[10px] object-cover bg-[#EDE8DF] flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[0.88rem] sm:text-[0.94rem] text-[#0D0D0D] truncate">
                      {product.name}
                    </p>
                    <p className="text-[0.76rem] sm:text-sm text-black/50">
                      {formatPrice(product.price)}
                    </p>

                    <div className="mt-2 inline-flex items-center gap-1 bg-[#F0EBE2] rounded-full p-[2px]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 rounded-full hover:bg-white transition-colors"
                        aria-label={`Decrease quantity of ${product.name}`}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-[0.82rem] font-semibold">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-7 h-7 rounded-full hover:bg-white transition-colors"
                        aria-label={`Increase quantity of ${product.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(product.id)}
                    className="text-[0.78rem] sm:text-sm text-red-500 hover:text-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <aside className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.08] p-4 sm:p-5 h-fit">
              <h2 className="font-bold text-[1rem] text-[#0D0D0D] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Summary
              </h2>

              <div className="space-y-2 text-[0.84rem] sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-black/55">Subtotal</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/55">Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-[#2A5C45]' : ''}`}>
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-black/[0.08]">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full mt-4 py-2.5 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors"
              >
                Checkout
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="w-full mt-2 py-2.5 rounded-full border border-black/15 text-sm font-medium text-black/65 hover:border-black/30 hover:text-black transition-colors"
              >
                Clear cart
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
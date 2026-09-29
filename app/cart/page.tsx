'use client';

// ============================================================
// KOVA — /cart
// Real checkout: creates an order on the API, then redirects to
// Paystack's hosted payment page. The API locks prices and
// computes shipping authoritatively; /orders confirms payment
// when Paystack redirects back.
// ============================================================

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/features/cart/CartContext';
import { useAuth } from '@/lib/auth-provider';
import { api, ApiError } from '@/lib/api';
import { productPhoto } from '@/lib/photo-fallback';
import { useToast } from '@/app/Component/ToastContext';
import { formatPrice } from '@/lib/utils';

// Mirrors the API's shipping rules (₦2,500 physical, free over
// ₦50,000, digital-only free). The API recomputes authoritatively.
function estimateShipping(items: { product: { productType: string } }[], subtotal: number) {
  const hasPhysical = items.some((i) => i.product.productType === 'PHYSICAL');
  return hasPhysical && subtotal < 50000 ? 2500 : 0;
}

interface ShippingForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

const SHIPPING_FIELDS: Array<[keyof ShippingForm, string, string]> = [
  ['fullName', 'Full name', 'Chidi Okafor'],
  ['phone', 'Phone', '0801 234 5678'],
  ['address', 'Address', '12 Awolowo Road'],
  ['city', 'City', 'Ikoyi'],
  ['state', 'State', 'Lagos'],
];

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { user, isSignedIn, isLoaded } = useAuth();
  const { addToast } = useToast();
  const [showShipping, setShowShipping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shipping, setShipping] = useState<ShippingForm>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  });

  const ship = estimateShipping(items, total);
  const grandTotal = total + ship;

  async function placeOrder() {
    setBusy(true);
    try {
      // 1. Create the order (API locks prices + computes shipping).
      const order = await api.createOrder({
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        shippingAddress: { ...shipping },
      });

      // 2. Initialize the Paystack payment for that order.
      const pay = await api.initializePayment({
        orderId: order.id,
        email: user!.email,
      });

      // 3. Hand off to Paystack's hosted page.
      window.location.href = pay.authorizationUrl;
    } catch (err) {
      addToast(
        err instanceof ApiError ? err.message : 'Could not start checkout — try again.',
        'error',
      );
      setBusy(false);
    }
  }

  const shippingValid =
    shipping.fullName.trim().length >= 2 &&
    shipping.phone.trim().length >= 7 &&
    shipping.address.trim().length >= 5 &&
    shipping.city.trim().length >= 2 &&
    shipping.state.trim().length >= 2;

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
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[10px] overflow-hidden bg-[#EDE8DF] flex-shrink-0">
                    {product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={productPhoto({ categorySlug: product.category?.slug, name: product.name })}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>

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

            {/* Summary + checkout */}
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
                  <span className="font-medium">{ship === 0 ? 'Free' : formatPrice(ship)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-black/[0.08]">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {!isLoaded ? null : !isSignedIn ? (
                <Link
                  href="/login?redirect_url=%2Fcart"
                  className="block text-center w-full mt-4 py-2.5 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors"
                >
                  Log in to check out
                </Link>
              ) : showShipping ? (
                <div className="mt-4 flex flex-col gap-3">
                  <p className="text-[0.8rem] font-semibold text-black/60">Delivery details</p>
                  {SHIPPING_FIELDS.map(([field, label, ph]) => (
                    <input
                      key={field}
                      type="text"
                      value={shipping[field]}
                      onChange={(e) => setShipping((s) => ({ ...s, [field]: e.target.value }))}
                      placeholder={`${label} — ${ph}`}
                      aria-label={label}
                      className="w-full bg-[#F5F0E8] border border-black/[0.09] rounded-[10px] h-[42px] px-3 text-[0.86rem] outline-none focus:border-[#E8622A] transition-all"
                    />
                  ))}
                  <button
                    type="button"
                    disabled={busy || !shippingValid}
                    onClick={placeOrder}
                    className="w-full py-2.5 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors disabled:opacity-50"
                  >
                    {busy ? 'Redirecting to Paystack…' : `Pay ${formatPrice(grandTotal)}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShipping(false)}
                    className="text-[0.76rem] text-black/45 hover:text-black transition-colors"
                  >
                    ← Back to summary
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowShipping(true)}
                  className="w-full mt-4 py-2.5 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors"
                >
                  Checkout securely
                </button>
              )}

              <p className="mt-2 text-[0.7rem] text-black/40 text-center">
                Payments processed securely by Paystack.
              </p>

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

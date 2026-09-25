'use client';
// ============================================================
// KOVA — /orders
// Real order history backed by GET /orders. The tracking
// timeline renders ONLY from OrderEvent rows (the append-only
// backend timeline) — nothing is animated or inferred
// client-side, per the marketplace spec.
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { api, ApiError } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useToast } from '../Component/ToastContext';
import type { Order, OrderStatus } from '@/lib/types';

const DATE_FMT = new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

// Physical lifecycle in canonical order — used to render the
// timeline skeleton; actual completion comes from real events.
const PHYSICAL_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'Order placed' },
  { status: 'PAID', label: 'Payment confirmed' },
  { status: 'PROCESSING', label: 'Seller processing' },
  { status: 'PACKED', label: 'Package packed' },
  { status: 'SHIPPED', label: 'Shipped' },
  { status: 'IN_TRANSIT', label: 'In transit' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { status: 'DELIVERED', label: 'Delivered' },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-black/[0.05] text-black/50',
  PAID: 'bg-[#2A5C45]/[0.08] text-[#2A5C45]',
  PROCESSING: 'bg-[#D4A843]/[0.12] text-[#A07820]',
  PACKED: 'bg-[#D4A843]/[0.12] text-[#A07820]',
  SHIPPED: 'bg-[#3B2F6E]/[0.08] text-[#3B2F6E]',
  IN_TRANSIT: 'bg-[#3B2F6E]/[0.08] text-[#3B2F6E]',
  OUT_FOR_DELIVERY: 'bg-[#E8622A]/[0.1] text-[#C24B18]',
  DELIVERED: 'bg-[#2A5C45]/[0.08] text-[#2A5C45]',
  CANCELLED: 'bg-[#B3261E]/[0.08] text-[#B3261E]',
  REFUNDED: 'bg-[#B3261E]/[0.08] text-[#B3261E]',
};

function statusLabel(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' ');
}

// ── Order timeline (from real OrderEvent rows) ────────────

function TrackingTimeline({ order }: { order: Order }) {
  const events = order.events ?? [];
  const reached = new Set(events.map((e) => e.status));
  const eventFor = (s: OrderStatus) => events.find((e) => e.status === s);
  const isDigitalOnly =
    order.items.length > 0 && order.items.every((i) => i.product?.productType === 'DIGITAL');
  const cancelled = order.status === 'CANCELLED';

  const steps = isDigitalOnly
    ? [
        { status: 'PENDING' as OrderStatus, label: 'Order placed' },
        { status: 'PAID' as OrderStatus, label: 'Payment confirmed' },
        { status: 'DELIVERED' as OrderStatus, label: 'Digital access released' },
      ]
    : PHYSICAL_STEPS;

  if (cancelled) {
    return (
      <div className="rounded-[12px] bg-[#B3261E]/[0.05] border border-[#B3261E]/[0.15] p-4">
        <p className="text-[0.8rem] font-semibold text-[#B3261E] mb-1">Order cancelled</p>
        {events.length > 0 && (
          <p className="text-[0.74rem] text-black/45">
            {events[events.length - 1].message ?? 'Cancelled'} ·{' '}
            {DATE_FMT.format(new Date(events[events.length - 1].createdAt))}
          </p>
        )}
      </div>
    );
  }

  return (
    <ol className="relative ml-1" aria-label="Order tracking timeline">
      {steps.map((step, idx) => {
        const event = eventFor(step.status);
        const done = reached.has(step.status);
        const isLast = idx === steps.length - 1;
        const isCurrent =
          done && (isLast || !reached.has(steps[idx + 1]?.status));
        return (
          <li key={step.status} className="relative flex gap-3.5 pb-5 last:pb-0">
            {/* Connector */}
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute left-[7px] top-4 bottom-0 w-[2px] ${done && reached.has(steps[idx + 1]?.status) ? 'bg-[#2A5C45]' : 'bg-black/[0.08]'}`}
              />
            )}
            {/* Node */}
            <span
              aria-hidden="true"
              className={`relative z-10 w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border-2 ${
                done
                  ? isCurrent
                    ? 'bg-[#2A5C45] border-[#2A5C45] ring-4 ring-[#2A5C45]/15'
                    : 'bg-[#2A5C45] border-[#2A5C45]'
                  : 'bg-white border-black/[0.15]'
              }`}
            />
            <div className="min-w-0 flex-1 -mt-1">
              <p className={`text-[0.82rem] font-semibold ${done ? 'text-[#0D0D0D]' : 'text-black/30'}`}>
                {step.label}
                {isCurrent && <span className="ml-2 text-[0.62rem] uppercase tracking-[0.06em] text-[#2A5C45]">Current</span>}
              </p>
              {event && (
                <p className="text-[0.72rem] text-black/40">
                  {event.message && `${event.message} · `}
                  {DATE_FMT.format(new Date(event.createdAt))}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ── Order card ────────────────────────────────────────────

function OrderCard({ order, onReviewed }: { order: Order; onReviewed: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const physicalItems = order.items.filter((i) => i.product?.productType === 'PHYSICAL');

  return (
    <article className="bg-white border border-black/[0.07] rounded-[18px] overflow-hidden">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full text-left p-5 sm:p-6 flex flex-wrap items-center gap-x-5 gap-y-2 hover:bg-black/[0.015] transition-colors"
      >
        <div className="min-w-[150px]">
          <p className="text-[0.62rem] uppercase tracking-[0.08em] text-black/35">Order</p>
          <p className="font-bold text-[0.9rem] text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
            {order.orderNumber}
          </p>
          <p className="text-[0.7rem] text-black/40">{DATE_FMT.format(new Date(order.createdAt))}</p>
        </div>

        <div className="flex-1 min-w-[140px]">
          <p className="text-[0.62rem] uppercase tracking-[0.08em] text-black/35">Items</p>
          <p className="text-[0.82rem] text-black/70 truncate">
            {order.items.map((i) => `${i.quantity}× ${i.product?.name ?? 'Item'}`).join(', ')}
          </p>
        </div>

        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.08em] text-black/35">Total</p>
          <p className="font-bold text-[0.9rem] text-[#0D0D0D]">{formatPrice(order.total)}</p>
        </div>

        <span className={`text-[0.66rem] font-bold uppercase tracking-[0.06em] px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] ?? 'bg-black/[0.05] text-black/50'}`}>
          {statusLabel(order.status)}
        </span>

        <span aria-hidden="true" className={`text-black/30 transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {expanded && (
        <div className="border-t border-black/[0.06] p-5 sm:p-6 grid md:grid-cols-[1fr_320px] gap-7">
          {/* Items */}
          <div>
            <ul className="space-y-4 mb-5">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3.5">
                  <div className="w-16 h-16 rounded-[10px] overflow-hidden bg-black/[0.04] flex-shrink-0">
                    {item.product?.images?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product?.slug}`}
                      className="text-[0.86rem] font-semibold text-[#0D0D0D] hover:text-[#E8622A] transition-colors line-clamp-2"
                    >
                      {item.product?.name}
                    </Link>
                    <p className="text-[0.74rem] text-black/45 mt-0.5">
                      {item.quantity} × {formatPrice(item.price)}
                      {' · '}
                      {item.product?.seller?.sellerProfile?.storeName ?? item.product?.seller?.name ?? 'Kova seller'}
                    </p>
                    <span className="inline-block mt-1.5 text-[0.62rem] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-black/[0.04] text-black/50">
                      {item.product?.productType === 'DIGITAL' ? 'Digital' : 'Physical'} · {statusLabel(item.fulfillmentStatus)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="text-[0.8rem] text-black/55 space-y-1 border-t border-black/[0.06] pt-4">
              <p className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></p>
              <p className="flex justify-between"><span>Shipping</span><span>{order.shipping === 0 ? '—' : formatPrice(order.shipping)}</span></p>
              <p className="flex justify-between font-bold text-[#0D0D0D] text-[0.9rem]">
                <span>Total</span><span>{formatPrice(order.total)}</span></p>
              {order.shippingAddress?.city && (
                <p className="flex justify-between text-black/40 text-[0.74rem]">
                  <span>Delivering to</span><span>{order.shippingAddress.city}, {order.shippingAddress.state ?? 'Nigeria'}</span>
                </p>
              )}
            </div>
          </div>

          {/* Tracking timeline */}
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.08em] text-black/35 mb-4">
              {physicalItems.length ? 'Tracking' : 'Fulfilment'}
            </p>
            <TrackingTimeline order={order} />
          </div>
        </div>
      )}
    </article>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function OrdersPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let alive = true;
    api
      .getMyOrders()
      .then((res) => { if (alive) setOrders(res); })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof ApiError ? e.message : 'Could not load your orders');
        setOrders([]);
      });
    return () => { alive = false; };
  }, [isLoaded, isSignedIn]);

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Header */}
      <div className="bg-[#0D0D0D] pt-8 sm:pt-10 pb-10 sm:pb-14">
        <div className="max-w-[900px] mx-auto px-4 sm:px-5 md:px-8">
          <p className="text-[0.66rem] sm:text-[0.7rem] font-medium tracking-[0.14em] uppercase text-[#F5F0E8]/30 mb-3">
            My account
          </p>
          <h1
            className="font-extrabold text-[#F5F0E8] leading-[1.0] tracking-[-0.03em]"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 7vw, 3rem)' }}
          >
            Your orders
          </h1>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 sm:px-5 md:px-8 py-8 sm:py-10">
        {!isLoaded ? (
          <div className="space-y-4" aria-busy="true">
            {[0, 1].map((i) => (
              <div key={i} className="animate-pulse bg-white border border-black/[0.07] rounded-[18px] p-6">
                <div className="h-4 w-48 bg-black/[0.06] rounded mb-3" />
                <div className="h-3 w-32 bg-black/[0.05] rounded" />
              </div>
            ))}
          </div>
        ) : !isSignedIn ? (
          <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-8 sm:p-10 text-center">
            <h2 className="font-bold text-[1.05rem] sm:text-[1.15rem] text-[#0D0D0D] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Sign in to see your orders
            </h2>
            <p className="text-black/45 text-[0.86rem] sm:text-[0.9rem] mb-6">
              Your order history is tied to your account.
            </p>
            <Link
              href="/sign-in?redirect_url=%2Forders"
              className="px-7 py-3 rounded-full bg-[#0D0D0D] text-[#F5F0E8] font-medium hover:bg-[#1A1A1A] transition-colors inline-block"
            >
              Sign in
            </Link>
          </div>
        ) : error ? (
          <div className="bg-white border border-black/[0.07] rounded-[16px] p-8 text-center">
            <p className="text-[0.86rem] text-[#B3261E] mb-4">{error}</p>
            <button
              type="button"
              onClick={() => { setError(null); setOrders(null); }}
              className="text-[0.8rem] font-semibold text-[#E8622A] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : orders === null ? (
          <div className="space-y-4" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-white border border-black/[0.07] rounded-[18px] p-6">
                <div className="h-4 w-48 bg-black/[0.06] rounded mb-3" />
                <div className="h-3 w-32 bg-black/[0.05] rounded" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-5" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/seed/photo/furniture/furniture-p07.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <h2
              className="font-bold text-[1.1rem] sm:text-[1.2rem] text-[#0D0D0D] mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              No orders yet
            </h2>
            <p className="text-black/45 text-[0.86rem] sm:text-[0.9rem] max-w-[440px] mx-auto leading-relaxed mb-6">
              Orders appear here once checkout is completed on a purchase.
            </p>
            <Link
              href="/shopping"
              className="px-7 py-3 rounded-full bg-[#E8622A] text-white font-medium hover:bg-[#F07A48] transition-colors inline-block"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[0.78rem] text-black/45 mb-2">
              {orders.length} order{orders.length === 1 ? '' : 's'} · tap a row to see items and tracking
            </p>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onReviewed={() => addToast('Thanks for your feedback!')} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

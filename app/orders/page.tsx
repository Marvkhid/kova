'use client';
// ============================================================
// KOVA — /orders
// Order tracking page with timeline and status.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { PRODUCTS } from '../../lib/types/data/products';

// Static order data — replace with real API later
const ORDERS = [
  {
    id: 'ORD-2091',
    date: 'May 3, 2026',
    status: 'delivered',
    items: [
      { product: PRODUCTS[0], quantity: 1 },
      { product: PRODUCTS[3], quantity: 2 },
    ],
    total: 48,
    tracking: 'KV-TRK-8821-NGR',
    timeline: [
      { label: 'Order placed',       done: true,  date: 'May 1, 9:02am' },
      { label: 'Payment confirmed',  done: true,  date: 'May 1, 9:03am' },
      { label: 'Processing',         done: true,  date: 'May 1, 2:15pm' },
      { label: 'Shipped',            done: true,  date: 'May 2, 10:30am' },
      { label: 'Delivered',          done: true,  date: 'May 3, 1:45pm' },
    ],
  },
  {
    id: 'ORD-2088',
    date: 'Apr 28, 2026',
    status: 'shipped',
    items: [{ product: PRODUCTS[1], quantity: 1 }],
    total: 19,
    tracking: 'KV-TRK-8817-NGR',
    timeline: [
      { label: 'Order placed',       done: true,  date: 'Apr 28, 3:10pm' },
      { label: 'Payment confirmed',  done: true,  date: 'Apr 28, 3:11pm' },
      { label: 'Processing',         done: true,  date: 'Apr 28, 6:00pm' },
      { label: 'Shipped',            done: true,  date: 'Apr 29, 9:00am' },
      { label: 'Delivered',          done: false, date: 'Expected May 5' },
    ],
  },
  {
    id: 'ORD-2074',
    date: 'Apr 14, 2026',
    status: 'delivered',
    items: [{ product: PRODUCTS[4], quantity: 1 }],
    total: 29,
    tracking: 'KV-TRK-8803-NGR',
    timeline: [
      { label: 'Order placed',       done: true, date: 'Apr 14, 11:22am' },
      { label: 'Payment confirmed',  done: true, date: 'Apr 14, 11:23am' },
      { label: 'Processing',         done: true, date: 'Apr 14, 3:00pm' },
      { label: 'Shipped',            done: true, date: 'Apr 15, 8:45am' },
      { label: 'Delivered',          done: true, date: 'Apr 16, 2:10pm' },
    ],
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  delivered:  { label: 'Delivered',  color: '#2A5C45', bg: 'rgba(42,92,69,0.08)' },
  shipped:    { label: 'Shipped',    color: '#3B2F6E', bg: 'rgba(59,47,110,0.08)' },
  processing: { label: 'Processing', color: '#D4A843', bg: 'rgba(212,168,67,0.10)' },
  pending:    { label: 'Pending',    color: '#7A746C', bg: 'rgba(122,116,108,0.10)' },
};

function OrderCard({ order }: { order: typeof ORDERS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.status];
  const total = order.items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <div className="bg-white rounded-[20px] border border-black/[0.07] overflow-hidden">

      {/* Order header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-black/[0.06]">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <p className="font-bold text-[0.9rem] text-[#0D0D0D]"
              style={{ fontFamily: 'var(--font-display)' }}>
              {order.id}
            </p>
            <p className="text-[0.72rem] text-black/40 mt-0.5">{order.date}</p>
          </div>
          <span
            className="text-[0.72rem] font-semibold px-2.5 py-1 rounded-full capitalize"
            style={{ color: status.color, background: status.bg }}
          >
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-bold text-[0.95rem] text-[#0D0D0D]"
            style={{ fontFamily: 'var(--font-display)' }}>
            {formatPrice(total)}
          </p>
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-[0.78rem] text-[#E8622A] font-medium hover:opacity-70 transition-opacity"
          >
            {expanded ? 'Hide details' : 'Track order'}
          </button>
        </div>
      </div>

      {/* Items preview */}
      <div className="flex gap-3 px-5 py-4 overflow-x-auto">
        {order.items.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center gap-3 flex-shrink-0">
            <div className="w-12 h-12 rounded-[10px] overflow-hidden bg-[#EDE8DF] flex-shrink-0">
              <img src={`/images/${product.imagePlaceholder}.jpg`} alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </div>
            <div>
              <p className="text-[0.82rem] font-medium text-[#0D0D0D] leading-snug">{product.name}</p>
              <p className="text-[0.72rem] text-black/40">Qty: {quantity} · {formatPrice(product.price)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded timeline */}
      {expanded && (
        <div className="border-t border-black/[0.06] px-5 py-5">
          <p className="text-[0.75rem] font-semibold text-black/40 uppercase tracking-[0.08em] mb-4">
            Tracking: {order.tracking}
          </p>

          {/* Timeline */}
          <div className="relative flex flex-col gap-0">
            {order.timeline.map((step, i) => (
              <div key={step.label} className="flex gap-4 relative">
                {/* Line */}
                {i < order.timeline.length - 1 && (
                  <div className="absolute left-[11px] top-[24px] bottom-0 w-[1px] bg-black/[0.08]"/>
                )}
                {/* Dot */}
                <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-[2px] transition-all ${
                  step.done
                    ? 'bg-[#2A5C45] border-[#2A5C45]'
                    : 'bg-white border-black/15'
                }`}>
                  {step.done && <span className="text-white text-[0.6rem]">✓</span>}
                </div>
                {/* Content */}
                <div className="pb-5">
                  <p className={`text-[0.85rem] font-medium ${step.done ? 'text-[#0D0D0D]' : 'text-black/35'}`}>
                    {step.label}
                  </p>
                  <p className="text-[0.72rem] text-black/35 mt-0.5">{step.date}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-2">
            {order.status === 'delivered' && (
              <button className="text-[0.78rem] font-medium text-[#E8622A] border border-[#E8622A]/30 px-4 py-2 rounded-full hover:bg-[#E8622A]/[0.06] transition-colors">
                Leave a review
              </button>
            )}
            <button className="text-[0.78rem] font-medium text-black/50 border border-black/15 px-4 py-2 rounded-full hover:border-black/30 transition-colors">
              Get help
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────

export function OrdersPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="bg-[#0D0D0D] h-[160px] animate-pulse"/>
      <div className="max-w-[900px] mx-auto px-5 md:px-8 py-10 flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-[20px] p-5 animate-pulse">
            <div className="flex justify-between mb-4">
              <div className="h-4 w-32 bg-[#EDE8DF] rounded-full"/>
              <div className="h-4 w-16 bg-[#EDE8DF] rounded-full"/>
            </div>
            <div className="flex gap-3">
              {[1, 2].map(j => (
                <div key={j} className="w-12 h-12 bg-[#EDE8DF] rounded-[10px]"/>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* Header */}
      <div className="bg-[#0D0D0D] pt-10 pb-14">
        <div className="max-w-[900px] mx-auto px-5 md:px-8">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] uppercase text-[#F5F0E8]/30 mb-3">
            My account
          </p>
          <h1
            className="font-extrabold text-[#F5F0E8] leading-[1.0] tracking-[-0.03em]"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Your orders
          </h1>
        </div>
      </div>

      {/* Orders list */}
      <div className="max-w-[900px] mx-auto px-5 md:px-8 py-10">
        {ORDERS.length > 0 ? (
          <div className="flex flex-col gap-4">
            {ORDERS.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="font-bold text-[1.2rem] text-[#0D0D0D] mb-2"
              style={{ fontFamily: 'var(--font-display)' }}>
              No orders yet
            </h2>
            <p className="text-black/45 text-[0.9rem] mb-6">Start shopping to see your orders here.</p>
            <Link href="/shopping"
              className="px-7 py-3 rounded-full bg-[#E8622A] text-white font-medium hover:bg-[#F07A48] transition-colors">
              Browse products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';
// ============================================================
// KOVA — Seller orders panel (dashboard tab)
// GET  /orders/seller — orders containing this seller's items
// PATCH /orders/:orderId/items/:itemId/fulfillment — advance
// Sellers can move their items forward through the physical
// flow but NEVER mark DELIVERED (buyer/admin-only per the API).
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/app/Component/ToastContext';
import type { SellerOrderView, FulfillmentStatus } from '@/lib/types';

const DATE_FMT = new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

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
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'New',
  PAID: 'Paid — action needed',
  PROCESSING: 'Processing',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  IN_TRANSIT: 'In transit',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

/** Next forward state a SELLER may set (never DELIVERED, forward-only). */
function nextSellerStatus(item: SellerOrderView['items'][number]): FulfillmentStatus | null {
  const flow: FulfillmentStatus[] = ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED'];
  const idx = flow.indexOf(item.fulfillmentStatus);
  if (item.fulfillmentStatus === 'PENDING') return 'PROCESSING';
  if (idx === -1 || idx === flow.length - 1) return null; // shipped → wait for buyer/admin
  return flow[idx + 1];
}

function FulfillmentControls({ order, item, onChanged }: {
  order: SellerOrderView;
  item: SellerOrderView['items'][number];
  onChanged: () => void;
}) {
  const { addToast } = useToast();
  const [busy, setBusy] = useState(false);
  const [carrier, setCarrier] = useState(item.carrier ?? '');
  const [tracking, setTracking] = useState(item.trackingNumber ?? '');
  const next = nextSellerStatus(item);
  const isPhysical = item.product.productType === 'PHYSICAL';

  async function advance() {
    if (!next) return;
    setBusy(true);
    try {
      await api.updateItemFulfillment(order.id, item.id, {
        status: next,
        // Carrier/tracking only attach at the shipping step
        ...(next === 'SHIPPED' && isPhysical
          ? { carrier: carrier || undefined, trackingNumber: tracking || undefined }
          : {}),
      });
      addToast(`Item marked ${next.toLowerCase().replace(/_/g, ' ')}.`);
      onChanged();
    } catch (e) {
      addToast(e instanceof ApiError ? e.message : 'Update failed', 'error');
    } finally {
      setBusy(false);
    }
  }

  if (item.fulfillmentStatus === 'DELIVERED' || item.fulfillmentStatus === 'CANCELLED') {
    return <span className="text-[0.72rem] text-black/35">No further action</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {next === 'SHIPPED' && isPhysical && (
        <>
          <input
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="Courier (e.g. GIG)"
            maxLength={60}
            className="text-[0.72rem] border border-black/[0.12] rounded-lg px-2.5 py-1.5 w-[120px] outline-none focus:border-[#E8622A]"
          />
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Tracking ref (optional)"
            maxLength={60}
            className="text-[0.72rem] border border-black/[0.12] rounded-lg px-2.5 py-1.5 w-[140px] outline-none focus:border-[#E8622A]"
          />
        </>
      )}
      {next ? (
        <button
          type="button"
          onClick={advance}
          disabled={busy}
          className="px-3.5 py-1.5 rounded-full bg-[#0D0D0D] text-[#F5F0E8] text-[0.72rem] font-semibold hover:bg-[#E8622A] transition-colors disabled:opacity-50"
        >
          {busy ? 'Saving…' : `Mark ${STATUS_LABELS[next]?.toLowerCase() ?? next.toLowerCase()}`}
        </button>
      ) : (
        <span className="text-[0.72rem] text-black/45">Awaiting delivery confirmation</span>
      )}
    </div>
  );
}

function SellerOrderRow({ order, onChanged }: { order: SellerOrderView; onChanged: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-black/[0.05] last:border-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full text-left px-4 sm:px-5 py-4 flex flex-wrap items-center gap-x-5 gap-y-2 hover:bg-black/[0.015] transition-colors"
      >
        <div className="min-w-[140px]">
          <p className="font-bold text-[0.84rem] text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
            {order.orderNumber}
          </p>
          <p className="text-[0.7rem] text-black/40">{DATE_FMT.format(new Date(order.createdAt))}</p>
        </div>
        <div className="flex-1 min-w-[150px]">
          <p className="text-[0.8rem] text-black/70 truncate">
            {order.buyer?.name ?? 'Buyer'}
            {order.shippingCity ? <span className="text-black/35"> · {order.shippingCity}{order.shippingState ? `, ${order.shippingState}` : ''}</span> : null}
          </p>
          <p className="text-[0.72rem] text-black/45 truncate">
            {order.items.map((i) => `${i.quantity}× ${i.product.name}`).join(', ')}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-[0.86rem] text-[#0D0D0D]">{formatPrice(order.sellerSubtotal)}</p>
          <p className="text-[0.66rem] text-black/40">
            {order.items[0]?.fulfillmentStatus ? STATUS_LABELS[order.items[0].fulfillmentStatus] : ''}
            {order.items.length > 1 ? ' (first item)' : ''}
          </p>
        </div>
        <span aria-hidden="true" className={`text-black/30 transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {expanded && (
        <div className="px-4 sm:px-5 pb-5 space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#F5F0E8]/60 rounded-[12px] p-3.5">
              <div className="w-12 h-12 rounded-[9px] overflow-hidden bg-black/[0.05] flex-shrink-0">
                {item.product.images?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="text-[0.84rem] font-semibold text-[#0D0D0D] hover:text-[#E8622A] transition-colors"
                >
                  {item.product.name}
                </Link>
                <p className="text-[0.72rem] text-black/45 mt-0.5">
                  {item.quantity} × {formatPrice(item.price)} ·{' '}
                  {item.product.productType === 'DIGITAL' ? 'Digital' : 'Physical'}
                  {item.carrier ? ` · ${item.carrier}` : ''}
                  {item.trackingNumber ? ` · ${item.trackingNumber}` : ''}
                </p>
                <span className={`inline-block mt-1.5 text-[0.6rem] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full ${STATUS_STYLES[item.fulfillmentStatus] ?? 'bg-black/[0.05]'}`}>
                  {STATUS_LABELS[item.fulfillmentStatus] ?? item.fulfillmentStatus}
                </span>
              </div>
              <div className="flex-shrink-0">
                <FulfillmentControls order={order} item={item} onChanged={onChanged} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SellerOrdersPanel() {
  const [data, setData] = useState<{ orders: SellerOrderView[]; total: number; page: number; pages: number } | null>(null);
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api.getSellerOrders({ status: status || undefined, page });
      setData(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load orders');
      setData({ orders: [], total: 0, page: 1, pages: 1 });
    }
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  const FILTERS = [
    { value: '', label: 'All' },
    { value: 'PAID', label: 'Paid' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'PACKED', label: 'Packed' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
  ];

  return (
    <section>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => { setStatus(f.value); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-full text-[0.74rem] font-medium transition-colors ${
              status === f.value
                ? 'bg-[#0D0D0D] text-[#F5F0E8]'
                : 'bg-white border border-black/[0.08] text-black/55 hover:border-black/25'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-[0.8rem] text-[#B3261E] bg-[#B3261E]/[0.06] rounded-lg px-3.5 py-2.5 mb-4">{error}</p>
      )}

      {!data ? (
        <div className="bg-white border border-black/[0.07] rounded-[16px] p-6 space-y-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse h-5 bg-black/[0.05] rounded" />
          ))}
        </div>
      ) : data.orders.length === 0 ? (
        <div className="bg-white border border-black/[0.07] rounded-[16px] p-8 text-center">
          <p className="text-[0.86rem] text-black/45">
            No orders in this view yet. Orders appear the moment a buyer checks out with your product.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-black/[0.07] rounded-[16px]">
            {data.orders.map((o) => (
              <SellerOrderRow key={o.id} order={o} onChanged={load} />
            ))}
          </div>
          {data.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-[0.78rem] font-medium disabled:opacity-30 hover:text-[#E8622A]"
              >
                ← Previous
              </button>
              <span className="text-[0.72rem] text-black/40">Page {data.page ?? page} of {data.pages}</span>
              <button
                type="button"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="text-[0.78rem] font-medium disabled:opacity-30 hover:text-[#E8622A]"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

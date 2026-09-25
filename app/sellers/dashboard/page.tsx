'use client';
// ============================================================
// KOVA — /sellers/dashboard
// The real command center, backed by the API:
//   • honest stats (zeros when empty — never fabricated)
//   • listing manager: publish / unpublish / share+QR / edit / delete
//   • onboarding gate: 404 from /sellers/dashboard → /sell
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { api, ApiError } from '@/lib/api';
import { productPhoto } from '@/lib/photo-fallback';
import { useToast } from '@/app/Component/ToastContext';
import { ShareButton } from '@/app/Component/ShareProduct';
import { SellerOrdersPanel } from '@/app/Component/dashboard/SellerOrdersPanel';
import { ShopSettingsPanel } from '@/app/Component/dashboard/ShopSettingsPanel';
import { formatPrice } from '@/lib/utils';
import { track } from '@/lib/analytics';
import type { SellerDashboardResponse } from '@/lib/types';

// ── Status pill ───────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    PUBLISHED: 'bg-[#2A5C45]/[0.12] text-[#2A5C45]',
    DRAFT: 'bg-black/[0.06] text-black/50',
    UNPUBLISHED: 'bg-[#F4A438]/[0.14] text-[#9A6B10]',
    REMOVED: 'bg-red-100 text-red-500',
  };
  return (
    <span className={`text-[0.6rem] font-semibold uppercase tracking-[0.07em] px-2 py-[3px] rounded-full ${cfg[status] ?? cfg.DRAFT}`}>
      {status.toLowerCase()}
    </span>
  );
}

// ── Listing row ───────────────────────────────────────────

function ListingRow({
  product,
  onChanged,
}: {
  product: SellerDashboardResponse['products'][number];
  onChanged: () => void;
}) {
  const { addToast } = useToast();
  const [busy, setBusy] = useState(false);

  async function act(fn: () => Promise<unknown>, okMsg: string) {
    setBusy(true);
    try {
      await fn();
      addToast(okMsg);
      onChanged();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Something went wrong.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 sm:gap-4 py-3.5 border-b border-black/[0.05] last:border-0">
      {/* Image */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[10px] overflow-hidden bg-[#EDE8DF] flex-shrink-0">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-[0.84rem] sm:text-[0.9rem] text-[#0D0D0D] truncate max-w-[240px] sm:max-w-none">
            {product.name}
          </p>
          <StatusPill status={product.status ?? 'DRAFT'} />
          {product.productType === 'DIGITAL' && (
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.06em] px-2 py-[2px] rounded-full bg-[#3B2F6E]/[0.1] text-[#3B2F6E]">
              digital
            </span>
          )}
        </div>
        <p className="text-[0.7rem] sm:text-[0.75rem] text-black/40 mt-0.5">
          {formatPrice(product.price)} · {product.viewCount ?? 0} views
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {product.status === 'PUBLISHED' && product.slug && (
          <ShareButton
            product={{ id: product.id, name: product.name, slug: product.slug }}
            className="px-3 h-8 rounded-full border border-black/12 text-[0.72rem] font-medium text-black/55 hover:border-black/30 hover:text-black transition-colors"
          />
        )}
        {product.status === 'PUBLISHED' ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => act(() => api.unpublishProduct(product.id), 'Listing unpublished.')}
            className="px-3 h-8 rounded-full border border-black/12 text-[0.72rem] font-medium text-black/55 hover:border-black/30 hover:text-black transition-colors disabled:opacity-50"
          >
            Unpublish
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              act(async () => {
                await api.publishProduct(product.id);
                track.productPublished({ id: product.id, productType: product.productType });
              }, 'Listing published — it is live on the marketplace.')
            }
            className="px-3 h-8 rounded-full bg-[#0D0D0D] text-[#F5F0E8] text-[0.72rem] font-medium hover:bg-[#E8622A] transition-colors disabled:opacity-50"
          >
            Publish
          </button>
        )}
        <Link
          href={`/sellers/edit/${product.id}`}
          className="px-3 h-8 rounded-full border border-black/12 text-[0.72rem] font-medium text-black/55 hover:border-black/30 hover:text-black transition-colors flex items-center"
        >
          Edit
        </Link>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (!window.confirm(`Permanently delete "${product.name}"? Its public URL will stop working.`)) return;
            act(() => api.deleteProduct(product.id), 'Listing deleted.');
          }}
          className="px-3 h-8 rounded-full border border-red-200 text-red-500 text-[0.72rem] font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────

function Stat({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-white rounded-[14px] sm:rounded-[16px] border border-black/[0.07] p-4 sm:p-5">
      <p className="text-[0.66rem] sm:text-[0.7rem] font-medium tracking-[0.08em] uppercase text-black/38 mb-1.5">{label}</p>
      <p
        className={`font-extrabold text-[1.3rem] sm:text-[1.55rem] leading-none ${accent ? 'text-[#E8622A]' : 'text-[#0D0D0D]'}`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {value}
      </p>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────

function EmptyState() {
  return (
    <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-8 sm:p-12 text-center">
      <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-4" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/seed/photo/health/health-p07.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <h2 className="font-extrabold text-[1.1rem] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
        Your store is ready — now fill it
      </h2>
      <p className="text-[0.85rem] text-black/45 max-w-[420px] mx-auto mb-6 leading-relaxed">
        Create your first listing, publish it, and it appears on the marketplace instantly with its own
        shareable link and QR code.
      </p>
      <Link
        href="/sellers/new"
        className="inline-block px-7 py-3 rounded-full bg-[#E8622A] text-white font-medium hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(232,98,42,0.35)] transition-all duration-200"
      >
        Create your first listing
      </Link>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function SellerDashboardPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [data, setData] = useState<SellerDashboardResponse | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [tab, setTab] = useState<'listings' | 'orders' | 'shop'>('listings');

  const load = useCallback(async () => {
    try {
      const res = await api.getSellerDashboard();
      setData(res);
      setState('ready');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // No seller profile yet → onboarding gate
        router.replace('/sell');
        return;
      }
      setState('error');
    }
  }, [router]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in?redirect_url=%2Fsellers%2Fdashboard');
      return;
    }
    if (isLoaded && isSignedIn) load();
  }, [isLoaded, isSignedIn, load, router]);

  if (!isLoaded || state === 'loading') {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
        <div className="w-full max-w-[320px] flex flex-col gap-3" aria-busy="true" aria-label="Loading dashboard">
          <div className="h-10 w-40 bg-black/[0.06] rounded-full animate-pulse mx-auto" />
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="h-24 bg-black/[0.04] rounded-[14px] animate-pulse" />
            <div className="h-24 bg-black/[0.04] rounded-[14px] animate-pulse" />
          </div>
          <div className="h-48 bg-black/[0.04] rounded-[16px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!isSignedIn) return null; // redirect in flight

  if (state === 'error' || !data) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
        <div className="bg-white rounded-[16px] border border-black/[0.07] p-8 text-center max-w-[380px]">
          <p className="font-bold text-[1rem] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            Could not load your dashboard
          </p>
          <p className="text-[0.84rem] text-black/45 mb-5">The server did not respond. Check your connection.</p>
          <button
            type="button"
            onClick={load}
            className="px-6 py-2.5 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, products, profile } = data;
  const hasListings = products.length > 0;

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Top bar */}
      <div className="bg-[#0D0D0D] px-4 sm:px-5 md:px-8 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="inline-flex items-center gap-2 flex-shrink-0" aria-label="KOVA home">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <rect width="36" height="36" rx="10" fill="#1A1A1A" />
              <rect x="9" y="8" width="4" height="20" rx="2" fill="#F5F0E8" />
              <path d="M13 18 L24 8" stroke="#E8622A" strokeWidth="4" strokeLinecap="round" />
              <path d="M13 18 L24 28" stroke="#F5F0E8" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </Link>
          <span className="text-[#F5F0E8]/20 text-sm hidden sm:inline">/</span>
          <span className="text-[#F5F0E8]/60 text-[0.78rem] sm:text-sm truncate hidden sm:inline">Seller Dashboard</span>
        </div>
        <Link
          href="/sellers/new"
          className="px-4 py-2 rounded-full bg-[#E8622A] text-white text-[0.8rem] font-medium hover:bg-[#F07A48] transition-colors flex-shrink-0"
        >
          + New listing
        </Link>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8 py-7 sm:py-9">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7 sm:mb-9">
          <div>
            <p className="text-[0.68rem] font-medium tracking-[0.14em] uppercase text-black/36 mb-1.5">
              {profile?.storeName ?? 'Your store'}
            </p>
            <h1
              className="font-extrabold text-[#0D0D0D] leading-[1.0] tracking-[-0.03em]"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.55rem, 7vw, 2.4rem)' }}
            >
              Dashboard
            </h1>
          </div>
          {profile?.storeSlug && (
            <p className="text-[0.78rem] text-black/40">
              Store address: <span className="text-black/60 font-medium">/store/{profile.storeSlug}</span>
            </p>
          )}
        </div>

        {/* Stats — honest zeros */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <Stat label="Total listings" value={stats.totalProducts} />
          <Stat label="Published" value={stats.published} />
          <Stat label="Total views" value={stats.totalViews} />
          <Stat label="Avg. rating" value={stats.avgRating > 0 ? `${stats.avgRating}★` : '—'} />
        </div>

        {/* Breakdown strip */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-8 sm:mb-10 text-[0.76rem] text-black/45">
          <span><strong className="text-[#0D0D0D]">{stats.physical}</strong> physical</span>
          <span><strong className="text-[#0D0D0D]">{stats.digital}</strong> digital</span>
          <span><strong className="text-[#0D0D0D]">{stats.drafts}</strong> drafts</span>
          <span><strong className="text-[#0D0D0D]">{stats.unpublished}</strong> unpublished</span>
          <span><strong className="text-[#0D0D0D]">{stats.totalSales}</strong> units sold</span>
          <span><strong className="text-[#0D0D0D]">{formatPrice(stats.totalRevenue)}</strong> revenue</span>
        </div>

        {/* Tabs: listings / orders */}
        <div className="flex items-center gap-2 mb-6" role="tablist" aria-label="Dashboard sections">
          {([
            { id: 'listings', label: 'Listings' },
            { id: 'orders', label: 'Orders' },
            { id: 'shop', label: 'Shop settings' },
          ] as const).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-[0.8rem] font-semibold transition-colors ${
                tab === t.id
                  ? 'bg-[#0D0D0D] text-[#F5F0E8]'
                  : 'bg-white border border-black/[0.08] text-black/55 hover:border-black/25'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'orders' ? (
          <SellerOrdersPanel />
        ) : tab === 'shop' && profile ? (
          <ShopSettingsPanel profile={profile} onSaved={load} />
        ) : (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[1.05rem] sm:text-[1.2rem]" style={{ fontFamily: 'var(--font-display)' }}>
              Your listings
            </h2>
            {hasListings && (
              <Link href="/sellers/new" className="text-[0.8rem] font-medium text-[#E8622A] hover:opacity-70 transition-opacity">
                + Add another
              </Link>
            )}
          </div>

          {hasListings ? (
            <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] px-4 sm:px-5">
              {products.map((p) => (
                <ListingRow key={p.id} product={p} onChanged={load} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>
        )}

        {/* Honest note when there are no sales */}
        {stats.totalSales === 0 && hasListings && (
          <p className="mt-6 text-[0.78rem] text-black/40 text-center">
            No sales recorded yet — revenue shows up here the moment orders come in.
          </p>
        )}
      </div>
    </div>
  );
}

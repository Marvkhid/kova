'use client';
// ============================================================
// KOVA — /admin
// Marketplace command center for platform administrators.
// Real metrics from the API. Server-side ADMIN role is enforced
// by the backend; unauthorized users get the 403 panel below.
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/app/Component/ToastContext';
import { formatPrice } from '@/lib/utils';
import type { AdminOverview, Product } from '@/lib/types';

const inputClass =
  'w-full rounded-[12px] bg-[#F5F0E8] border border-black/[0.09] text-[0.86rem] text-[#0D0D0D] placeholder:text-black/30 px-4 h-[42px] outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/15 transition-all';

type Tab = 'overview' | 'products' | 'users' | 'orders' | 'reviews';

interface AdminOrderRow {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  user?: { name?: string | null; email?: string } | null;
  items?: { id: string; quantity: number; fulfillmentStatus: string; product?: { name: string; productType: string } }[];
}

interface AdminReviewRow {
  id: string;
  kind: 'PRODUCT' | 'SELLER';
  rating: number;
  title?: string | null;
  comment?: string | null;
  verifiedPurchase?: boolean;
  status: string;
  createdAt: string;
  author?: { name?: string | null; email?: string } | null;
  target?: { name?: string | null; storeName?: string | null } | { name?: string | null; sellerProfile?: { storeName?: string } | null } | null;
}

interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
  sellerProfile: { storeName: string; storeSlug: string } | null;
  _count: { products: number };
}

function Stat({ label, value, hint, accent = false }: { label: string; value: string | number; hint?: string; accent?: boolean }) {
  return (
    <div className="bg-white rounded-[14px] sm:rounded-[16px] border border-black/[0.07] p-4 sm:p-5">
      <p className="text-[0.64rem] sm:text-[0.68rem] font-medium tracking-[0.08em] uppercase text-black/38 mb-1.5">{label}</p>
      <p
        className={`font-extrabold text-[1.25rem] sm:text-[1.5rem] leading-none ${accent ? 'text-[#E8622A]' : 'text-[#0D0D0D]'}`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {value}
      </p>
      {hint && <p className="text-[0.68rem] text-black/35 mt-1.5">{hint}</p>}
    </div>
  );
}

export default function AdminPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [reviews, setReviews] = useState<{ productReviews: AdminReviewRow[]; sellerReviews: AdminReviewRow[]; totals?: { productReviews: number; sellerReviews: number } } | null>(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadTab = useCallback(
    async (t: Tab) => {
      setState('loading');
      setErrorMsg(null);
      try {
        if (t === 'overview') {
          setOverview(await api.getAdminOverview());
        } else if (t === 'users') {
          const res = await api.getAdminUsers({ q: query || undefined, role: roleFilter || undefined });
          setUsers(res.users ?? []);
        } else if (t === 'orders') {
          const res = await api.getAdminOrders({});
          setOrders(res.orders ?? res ?? []);
        } else if (t === 'reviews') {
          setReviews(await api.getAdminReviews({}));
        } else {
          const res = await api.getAdminProducts({ q: productQuery || undefined, status: statusFilter || undefined });
          setProducts(res.products ?? []);
        }
        setState('ready');
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) setErrorMsg('403');
        else setErrorMsg(err instanceof ApiError ? err.message : 'Request failed');
        setState('error');
      }
    },
    // productQuery/statusFilter/roleFilter are applied via the Apply button
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, productQuery, statusFilter, roleFilter],
  );

  useEffect(() => {
    if (isLoaded && !isSignedIn) return; // gate below
    if (isLoaded && isSignedIn) loadTab(tab);
  }, [isLoaded, isSignedIn, tab, loadTab]);

  async function moderateReview(kind: 'PRODUCT' | 'SELLER', id: string, status: 'VISIBLE' | 'HIDDEN') {
    setBusyId(id);
    try {
      if (kind === 'PRODUCT') await api.moderateProductReview(id, status);
      else await api.moderateSellerReview(id, status);
      addToast(status === 'HIDDEN' ? 'Review hidden from the marketplace.' : 'Review restored.');
      await loadTab('reviews');
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Action failed.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function setUserRole(id: string, role: 'BUYER' | 'SELLER' | 'ADMIN') {
    setBusyId(id);
    try {
      await api.adminSetUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      addToast(`Role updated to ${role.toLowerCase()}.`);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Update failed.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function productAction(id: string, fn: () => Promise<unknown>, ok: string) {
    setBusyId(id);
    try {
      await fn();
      addToast(ok);
      await loadTab('products');
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Action failed.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] px-4 py-10">
        <div className="max-w-[1280px] mx-auto" aria-busy="true" aria-label="Loading admin dashboard">
          <div className="h-9 w-52 bg-black/[0.06] rounded-full animate-pulse mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-black/[0.04] rounded-[14px] animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
        <div className="bg-white rounded-[20px] border border-black/[0.07] p-8 text-center max-w-[400px]">
          <h1 className="font-extrabold text-[1.2rem] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Admin access
          </h1>
          <p className="text-[0.85rem] text-black/45 mb-6">Sign in with an administrator account to continue.</p>
          <Link href="/sign-in?redirect_url=%2Fadmin" className="inline-block px-7 py-3 rounded-full bg-[#0D0D0D] text-[#F5F0E8] font-medium hover:bg-[#1A1A1A] transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Top bar */}
      <div className="bg-[#0D0D0D] px-4 sm:px-5 md:px-8 py-3">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/" className="text-[#F5F0E8] font-extrabold tracking-tight flex-shrink-0" style={{ fontFamily: 'var(--font-display)' }}>
              KOVA
            </Link>
            <span className="text-[#F5F0E8]/25 hidden sm:inline">/</span>
            <span className="text-[#F5F0E8]/60 text-[0.8rem] sm:text-sm hidden sm:inline">Admin</span>
          </div>
          <span className="text-[0.66rem] font-semibold tracking-[0.12em] uppercase text-[#E8622A] bg-[#E8622A]/15 px-3 py-1.5 rounded-full flex-shrink-0">
            Restricted
          </span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8 py-7 sm:py-9">
        <h1 className="font-extrabold text-[#0D0D0D] leading-[1.0] tracking-[-0.03em] mb-6 sm:mb-8" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.55rem, 7vw, 2.4rem)' }}>
          Marketplace overview
        </h1>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-7 overflow-x-auto pb-0.5" role="tablist" aria-label="Admin sections">
          {(['overview', 'products', 'orders', 'reviews', 'users'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`px-4 sm:px-5 h-9 rounded-full text-[0.8rem] font-medium capitalize transition-colors whitespace-nowrap ${
                tab === t ? 'bg-[#0D0D0D] text-[#F5F0E8]' : 'bg-white border border-black/[0.08] text-black/55 hover:border-black/25'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {state === 'loading' && (
          <div aria-busy="true" aria-label="Loading section">
            <div className="h-40 bg-black/[0.04] rounded-[16px] animate-pulse" />
          </div>
        )}

        {state === 'error' && (
          <div className="bg-white rounded-[16px] border border-black/[0.07] p-8 text-center max-w-[440px] mx-auto">
            {errorMsg === '403' ? (
              <>
                <p className="font-bold text-[1rem] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Access denied</p>
                <p className="text-[0.84rem] text-black/45 mb-5">Your account does not have administrator permissions.</p>
              </>
            ) : (
              <>
                <p className="font-bold text-[1rem] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Something went wrong</p>
                <p className="text-[0.84rem] text-black/45 mb-5">{errorMsg}</p>
              </>
            )}
            <button type="button" onClick={() => loadTab(tab)} className="px-6 py-2.5 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors">
              Retry
            </button>
          </div>
        )}

        {state === 'ready' && tab === 'overview' && overview && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Stat label="Total users" value={overview.users.total} hint={`${overview.users.sellers} sellers`} />
              <Stat label="Sellers" value={overview.users.sellers} accent />
              <Stat label="Products" value={overview.products.total} hint={`${overview.products.published} published`} />
              <Stat label="Published" value={overview.products.published} />
              <Stat label="Physical" value={overview.products.physical} />
              <Stat label="Digital" value={overview.products.digital} />
              <Stat label="Added today" value={overview.products.addedToday} />
              <Stat label="Added this week" value={overview.products.addedThisWeek} accent />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Stat label="Drafts" value={overview.products.drafts} />
              <Stat label="Product views" value={overview.engagement.totalProductViews} />
              <Stat label="Orders" value={overview.orders.total} hint={`${overview.orders.paid} paid`} />
            </div>
            <p className="text-[0.72rem] text-black/35 mt-6">
              Metrics above are live database counts — page views and traffic come from Google Analytics and are tracked separately.
            </p>
          </div>
        )}

        {state === 'ready' && tab === 'products' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
              <input
                type="search"
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadTab('products')}
                placeholder="Search products or sellers…"
                className={inputClass}
                aria-label="Search products"
              />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass + ' sm:w-[170px]'} aria-label="Filter by status">
                <option value="">All statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="UNPUBLISHED">Unpublished</option>
                <option value="REMOVED">Removed</option>
              </select>
              <button type="button" onClick={() => loadTab('products')} className="px-5 h-[42px] rounded-[12px] bg-[#0D0D0D] text-[#F5F0E8] text-[0.84rem] font-medium hover:bg-black/80 transition-colors flex-shrink-0">
                Apply
              </button>
            </div>

            {products.length === 0 ? (
              <p className="text-[0.85rem] text-black/40 py-10 text-center">No products match these filters.</p>
            ) : (
              <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[760px]">
                  <thead>
                    <tr className="border-b border-black/[0.07] text-[0.66rem] uppercase tracking-[0.08em] text-black/38">
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Seller</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-black/[0.04] last:border-0 text-[0.82rem]">
                        <td className="px-4 py-3 font-medium text-[#0D0D0D] max-w-[220px] truncate">
                          {p.slug ? <Link href={`/products/${p.slug}`} className="hover:text-[#E8622A] transition-colors">{p.name}</Link> : p.name}
                        </td>
                        <td className="px-4 py-3 text-black/55">{p.seller?.sellerProfile?.storeName ?? p.seller?.name ?? '—'}</td>
                        <td className="px-4 py-3">{formatPrice(p.price)}</td>
                        <td className="px-4 py-3 capitalize text-black/55">{p.productType.toLowerCase()}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[0.62rem] font-semibold uppercase tracking-[0.06em] px-2 py-1 rounded-full ${
                            p.status === 'PUBLISHED' ? 'bg-[#2A5C45]/[0.12] text-[#2A5C45]' : p.status === 'REMOVED' ? 'bg-red-100 text-red-500' : 'bg-black/[0.06] text-black/50'
                          }`}>
                            {(p.status ?? 'draft').toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {p.status !== 'PUBLISHED' && p.status !== 'REMOVED' && (
                              <button
                                type="button"
                                disabled={busyId === p.id}
                                onClick={() => productAction(p.id, () => api.adminPublishProduct(p.id), 'Product published.')}
                                className="px-2.5 h-7 rounded-full bg-[#0D0D0D] text-[#F5F0E8] text-[0.68rem] font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
                              >
                                Publish
                              </button>
                            )}
                            {p.status !== 'REMOVED' && (
                              <button
                                type="button"
                                disabled={busyId === p.id}
                                onClick={() => {
                                  if (window.confirm(`Remove "${p.name}" from the marketplace? The seller keeps the draft.`))
                                    productAction(p.id, () => api.adminRemoveProduct(p.id), 'Product removed from marketplace.');
                                }}
                                className="px-2.5 h-7 rounded-full border border-red-200 text-red-500 text-[0.68rem] font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {state === 'ready' && tab === 'orders' && (
          <div className="animate-fade-in">
            {orders.length === 0 ? (
              <p className="text-[0.85rem] text-black/40 py-10 text-center">No orders recorded yet.</p>
            ) : (
              <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[720px]">
                  <thead>
                    <tr className="border-b border-black/[0.07] text-[0.66rem] uppercase tracking-[0.08em] text-black/38">
                      <th className="px-4 py-3 font-medium">Order</th>
                      <th className="px-4 py-3 font-medium">Buyer</th>
                      <th className="px-4 py-3 font-medium">Items</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Payment</th>
                      <th className="px-4 py-3 font-medium">Fulfilment</th>
                      <th className="px-4 py-3 font-medium">Placed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-black/[0.04] last:border-0 text-[0.82rem]">
                        <td className="px-4 py-3 font-medium text-[#0D0D0D]">{o.orderNumber}</td>
                        <td className="px-4 py-3 text-black/55">{o.user?.name ?? o.user?.email ?? '—'}</td>
                        <td className="px-4 py-3 text-black/55 max-w-[220px] truncate">
                          {o.items?.map((i) => `${i.quantity}× ${i.product?.name ?? 'item'}`).join(', ') ?? '—'}
                        </td>
                        <td className="px-4 py-3">{formatPrice(o.total)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[0.62rem] font-semibold uppercase tracking-[0.06em] px-2 py-1 rounded-full ${
                            o.paymentStatus === 'PAID' ? 'bg-[#2A5C45]/[0.12] text-[#2A5C45]' : 'bg-black/[0.06] text-black/50'
                          }`}>
                            {o.paymentStatus.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-black/55">{o.status.toLowerCase().replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3 text-black/45">{new Date(o.createdAt).toLocaleDateString('en-NG')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {state === 'ready' && tab === 'reviews' && reviews && (
          <div className="animate-fade-in">
            <p className="text-[0.78rem] text-black/45 mb-5">
              {reviews.totals
                ? `${reviews.totals.productReviews} product reviews · ${reviews.totals.sellerReviews} seller reviews`
                : 'Moderation queue'}{' '}
              — hiding a review removes it from public view and from rating aggregates; the author keeps authorship.
            </p>

            {/* Product reviews */}
            <h2 className="font-extrabold text-[1rem] mb-3" style={{ fontFamily: 'var(--font-display)' }}>Product reviews</h2>
            {reviews.productReviews.length === 0 ? (
              <p className="text-[0.85rem] text-black/40 mb-8">No product reviews yet.</p>
            ) : (
              <div className="bg-white rounded-[16px] border border-black/[0.07] divide-y divide-black/[0.04] mb-8">
                {reviews.productReviews.map((r) => (
                  <div key={r.id} className="p-4 flex flex-wrap items-start gap-3">
                    <div className="flex-1 min-w-[220px]">
                      <p className="text-[0.8rem] font-semibold text-[#0D0D0D]">
                        <span className="text-[#E8A020]">{'★'.repeat(r.rating)}</span>
                        <span className="ml-2 font-normal text-black/55">{r.title ?? ''}</span>
                      </p>
                      {r.comment && <p className="text-[0.78rem] text-black/55 mt-1 line-clamp-2">{r.comment}</p>}
                      <p className="text-[0.68rem] text-black/38 mt-1.5">
                        {r.author?.name ?? r.author?.email ?? 'Unknown'} · on {r.target?.name ?? 'product'}
                        {r.verifiedPurchase ? ' · ✓ verified purchase' : ''}
                        {r.status === 'HIDDEN' ? ' · HIDDEN' : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => moderateReview('PRODUCT', r.id, r.status === 'HIDDEN' ? 'VISIBLE' : 'HIDDEN')}
                      className={`px-3 h-8 rounded-full text-[0.72rem] font-medium transition-colors disabled:opacity-50 ${
                        r.status === 'HIDDEN'
                          ? 'bg-[#0D0D0D] text-[#F5F0E8] hover:bg-black/80'
                          : 'border border-red-200 text-red-500 hover:bg-red-50'
                      }`}
                    >
                      {r.status === 'HIDDEN' ? 'Restore' : 'Hide'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Seller reviews */}
            <h2 className="font-extrabold text-[1rem] mb-3" style={{ fontFamily: 'var(--font-display)' }}>Seller reviews</h2>
            {reviews.sellerReviews.length === 0 ? (
              <p className="text-[0.85rem] text-black/40">No seller reviews yet.</p>
            ) : (
              <div className="bg-white rounded-[16px] border border-black/[0.07] divide-y divide-black/[0.04]">
                {reviews.sellerReviews.map((r) => (
                  <div key={r.id} className="p-4 flex flex-wrap items-start gap-3">
                    <div className="flex-1 min-w-[220px]">
                      <p className="text-[0.8rem] font-semibold text-[#0D0D0D]">
                        <span className="text-[#E8A020]">{'★'.repeat(r.rating)}</span>
                        <span className="ml-2 font-normal text-black/55">{r.comment ?? ''}</span>
                      </p>
                      <p className="text-[0.68rem] text-black/38 mt-1.5">
                        {r.author?.name ?? r.author?.email ?? 'Unknown'} · store: {r.target?.name ?? 'unknown'}
                        {r.status === 'HIDDEN' ? ' · HIDDEN' : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => moderateReview('SELLER', r.id, r.status === 'HIDDEN' ? 'VISIBLE' : 'HIDDEN')}
                      className={`px-3 h-8 rounded-full text-[0.72rem] font-medium transition-colors disabled:opacity-50 ${
                        r.status === 'HIDDEN'
                          ? 'bg-[#0D0D0D] text-[#F5F0E8] hover:bg-black/80'
                          : 'border border-red-200 text-red-500 hover:bg-red-50'
                      }`}
                    >
                      {r.status === 'HIDDEN' ? 'Restore' : 'Hide'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {state === 'ready' && tab === 'users' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadTab('users')}
                placeholder="Search users by name or email…"
                className={inputClass}
                aria-label="Search users"
              />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={inputClass + ' sm:w-[150px]'} aria-label="Filter by role">
                <option value="">All roles</option>
                <option value="BUYER">Buyers</option>
                <option value="SELLER">Sellers</option>
                <option value="ADMIN">Admins</option>
              </select>
              <button type="button" onClick={() => loadTab('users')} className="px-5 h-[42px] rounded-[12px] bg-[#0D0D0D] text-[#F5F0E8] text-[0.84rem] font-medium hover:bg-black/80 transition-colors flex-shrink-0">
                Apply
              </button>
            </div>

            {users.length === 0 ? (
              <p className="text-[0.85rem] text-black/40 py-10 text-center">No users match these filters.</p>
            ) : (
              <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[680px]">
                  <thead>
                    <tr className="border-b border-black/[0.07] text-[0.66rem] uppercase tracking-[0.08em] text-black/38">
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Store</th>
                      <th className="px-4 py-3 font-medium">Listings</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-black/[0.04] last:border-0 text-[0.82rem]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {u.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                            ) : (
                              <span className="w-8 h-8 rounded-full bg-[#E8622A]/[0.12] text-[#E8622A] text-[0.7rem] font-bold flex items-center justify-center flex-shrink-0">
                                {(u.name ?? u.email)[0]?.toUpperCase()}
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-[#0D0D0D] truncate">{u.name ?? '—'}</p>
                              <p className="text-[0.72rem] text-black/40 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-black/55">{u.sellerProfile?.storeName ?? '—'}</td>
                        <td className="px-4 py-3">{u._count?.products ?? 0}</td>
                        <td className="px-4 py-3 text-black/55">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            disabled={busyId === u.id}
                            onChange={(e) => setUserRole(u.id, e.target.value as 'BUYER' | 'SELLER' | 'ADMIN')}
                            className="rounded-full border border-black/[0.1] bg-[#F5F0E8] text-[0.72rem] font-medium px-2.5 py-1 outline-none focus:border-[#E8622A] transition-colors"
                            aria-label={`Role for ${u.name ?? u.email}`}
                          >
                            <option value="BUYER">BUYER</option>
                            <option value="SELLER">SELLER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

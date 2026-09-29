'use client';
// ============================================================
// KOVA — /admin
// Marketplace command center for platform administrators.
// Real metrics from the API. Server-side ADMIN role is enforced
// by the backend; unauthorized users get the 403 panel below.
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, useUser } from '@/lib/auth-provider';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/app/Component/ToastContext';
import { formatPrice } from '@/lib/utils';
import type { AdminOverview, Product, SellerApplicationRow, SellerApplicationDetail, SellerStatus } from '@/lib/types';

const inputClass =
  'w-full rounded-[12px] bg-[#F5F0E8] border border-black/[0.09] text-[0.86rem] text-[#0D0D0D] placeholder:text-black/30 px-4 h-[42px] outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/15 transition-all';

type Tab = 'overview' | 'products' | 'sellers' | 'users' | 'orders' | 'reviews';

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

function SellerStatusPill({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    PENDING: 'bg-[#F4A438]/[0.16] text-[#9A6B10]',
    APPROVED: 'bg-[#2A5C45]/[0.12] text-[#2A5C45]',
    REJECTED: 'bg-red-100 text-red-500',
    SUSPENDED: 'bg-[#B7791F]/[0.15] text-[#8A5A0F]',
    BLOCKED: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`text-[0.62rem] font-semibold uppercase tracking-[0.06em] px-2 py-1 rounded-full ${cfg[status] ?? 'bg-black/[0.06] text-black/50'}`}>
      {status.toLowerCase()}
    </span>
  );
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
  const { user: me } = useUser();
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
  const [apps, setApps] = useState<SellerApplicationRow[]>([]);
  const [appStatusFilter, setAppStatusFilter] = useState('');
  const [detail, setDetail] = useState<SellerApplicationDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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
        } else if (t === 'sellers') {
          const res = await api.getAdminSellerApplications(appStatusFilter || undefined);
          setApps(res.applications ?? []);
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
    [query, productQuery, statusFilter, roleFilter, appStatusFilter],
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

  async function openSellerApplication(id: string) {
    setBusyId(id);
    try {
      setDetail(await api.getAdminSellerApplication(id));
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Could not load the application.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function sellerAction(id: string, fn: () => Promise<unknown>, ok: string) {
    setBusyId(id);
    try {
      await fn();
      addToast(ok);
      setDetail(await api.getAdminSellerApplication(id).catch(() => null));
      await loadTab('sellers');
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Action failed.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDeleteUser() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await api.adminDeleteUser(deleteTarget.id);
      addToast(`Account for ${deleteTarget.label} deleted, along with its store and products.`);
      setDeleteTarget(null);
      setDeleteConfirmText('');
      setDetail(null);
      await loadTab(tab);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Delete failed.', 'error');
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
          <Link href="/login" className="inline-block px-7 py-3 rounded-full bg-[#0D0D0D] text-[#F5F0E8] font-medium hover:bg-[#1A1A1A] transition-colors">
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
        <div className="flex gap-1.5 mb-7 overflow-x-auto pb-0.5 min-w-0 max-w-full" role="tablist" aria-label="Admin sections">
          {(['overview', 'products', 'sellers', 'orders', 'reviews', 'users'] as Tab[]).map((t) => (
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
              {t === 'sellers' && overview?.moderation?.pendingSellerApplications ? `Sellers (${overview.moderation.pendingSellerApplications})` : t}
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

            {/* Moderation queue — click through to the queues */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <button
                type="button"
                onClick={() => setTab('sellers')}
                className={`bg-white rounded-[14px] sm:rounded-[16px] border p-4 sm:p-5 text-left transition-colors ${
                  overview.moderation.pendingSellerApplications > 0 ? 'border-[#E8622A]/40 hover:bg-[#E8622A]/[0.04]' : 'border-black/[0.07]'
                }`}
              >
                <p className="text-[0.64rem] sm:text-[0.68rem] font-medium tracking-[0.08em] uppercase text-black/38 mb-1.5">Seller applications</p>
                <p className={`font-extrabold text-[1.25rem] sm:text-[1.5rem] leading-none ${overview.moderation.pendingSellerApplications > 0 ? 'text-[#E8622A]' : 'text-[#0D0D0D]'}`} style={{ fontFamily: 'var(--font-display)' }}>
                  {overview.moderation.pendingSellerApplications}
                </p>
                <p className="text-[0.68rem] text-black/35 mt-1.5">awaiting review →</p>
              </button>
              <button type="button" onClick={() => { setAppStatusFilter('SUSPENDED'); setTab('sellers'); }} className="bg-white rounded-[14px] sm:rounded-[16px] border border-black/[0.07] p-4 sm:p-5 text-left hover:border-black/25 transition-colors">
                <p className="text-[0.64rem] sm:text-[0.68rem] font-medium tracking-[0.08em] uppercase text-black/38 mb-1.5">Restricted sellers</p>
                <p className="font-extrabold text-[1.25rem] sm:text-[1.5rem] leading-none text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
                  {overview.moderation.suspendedSellers}
                </p>
                <p className="text-[0.68rem] text-black/35 mt-1.5">suspended or blocked →</p>
              </button>
              <button type="button" onClick={() => { setStatusFilter('PENDING_REVIEW'); setTab('products'); }} className="bg-white rounded-[14px] sm:rounded-[16px] border p-4 sm:p-5 text-left transition-colors border-black/[0.07] hover:border-black/25">
                <p className="text-[0.64rem] sm:text-[0.68rem] font-medium tracking-[0.08em] uppercase text-black/38 mb-1.5">Listings in review</p>
                <p className="font-extrabold text-[1.25rem] sm:text-[1.5rem] leading-none text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
                  {overview.moderation.pendingProductReviews}
                </p>
                <p className="text-[0.68rem] text-black/35 mt-1.5">pending moderation →</p>
              </button>
              <button type="button" onClick={() => { setStatusFilter('REJECTED'); setTab('products'); }} className="bg-white rounded-[14px] sm:rounded-[16px] border border-black/[0.07] p-4 sm:p-5 text-left hover:border-black/25 transition-colors">
                <p className="text-[0.64rem] sm:text-[0.68rem] font-medium tracking-[0.08em] uppercase text-black/38 mb-1.5">Rejected listings</p>
                <p className="font-extrabold text-[1.25rem] sm:text-[1.5rem] leading-none text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
                  {overview.moderation.rejectedProducts}
                </p>
                <p className="text-[0.68rem] text-black/35 mt-1.5">with seller-facing reasons →</p>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Stat label="Approved sellers" value={overview.moderation.approvedSellers} />
              <Stat label="Drafts" value={overview.products.drafts} />
              <Stat label="Orders" value={overview.orders.total} hint={`${overview.orders.paid} paid`} />
            </div>
            <p className="text-[0.72rem] text-black/35 mt-4">
              Product views all-time: {overview.engagement.totalProductViews}. Metrics above are live database counts.
            </p>
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

        {state === 'ready' && tab === 'sellers' && (
          <div className="animate-fade-in">
            {/* Status filter */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {(['', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'BLOCKED'] as const).map((s) => (
                <button
                  key={s || 'all'}
                  type="button"
                  onClick={() => setAppStatusFilter(s)}
                  className={`px-3.5 h-8 rounded-full text-[0.72rem] font-semibold transition-colors ${
                    appStatusFilter === s
                      ? 'bg-[#0D0D0D] text-[#F5F0E8]'
                      : 'bg-white border border-black/[0.08] text-black/55 hover:border-black/25'
                  }`}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>

            {apps.length === 0 ? (
              <p className="text-[0.85rem] text-black/40 py-10 text-center">No seller applications with this status.</p>
            ) : (
              <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[860px]">
                  <thead>
                    <tr className="border-b border-black/[0.07] text-[0.66rem] uppercase tracking-[0.08em] text-black/38">
                      <th className="px-4 py-3 font-medium">Store</th>
                      <th className="px-4 py-3 font-medium">Owner</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 font-medium">Products</th>
                      <th className="px-4 py-3 font-medium">Terms</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Applied</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map((a) => (
                      <tr key={a.id} className={`border-b border-black/[0.04] last:border-0 text-[0.82rem] ${a.sellerStatus === 'PENDING' ? 'bg-[#E8622A]/[0.03]' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {a.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={a.logoUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" loading="lazy" />
                            ) : (
                              <span className="w-8 h-8 rounded-full bg-[#0D0D0D] text-[#F5F0E8] text-[0.68rem] font-bold flex items-center justify-center flex-shrink-0">
                                {a.storeName[0]?.toUpperCase()}
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-[#0D0D0D] truncate max-w-[180px]">{a.storeName}</p>
                              <p className="text-[0.68rem] text-black/38 truncate">/{a.storeSlug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[#0D0D0D]">{a.ownerName ?? '—'}</p>
                          <p className="text-[0.7rem] text-black/40">{a.email}</p>
                        </td>
                        <td className="px-4 py-3 text-black/55 max-w-[140px] truncate">{a.location ?? '—'}</td>
                        <td className="px-4 py-3">{a.productCount}</td>
                        <td className="px-4 py-3 text-black/55">{a.termsVersion ? `v${a.termsVersion}` : '—'}</td>
                        <td className="px-4 py-3"><SellerStatusPill status={a.sellerStatus} /></td>
                        <td className="px-4 py-3 text-black/45">{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            disabled={busyId === a.id}
                            onClick={() => openSellerApplication(a.id)}
                            className="px-3 h-7 rounded-full bg-[#0D0D0D] text-[#F5F0E8] text-[0.68rem] font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Review screen */}
            {detail && (
              <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={`Review ${detail.storeName}`}>
                <div className="bg-[#F5F0E8] w-full max-w-[720px] max-h-[92vh] overflow-y-auto rounded-t-[20px] sm:rounded-[20px]">
                  {/* Cover */}
                  <div className="relative h-28 sm:h-36 bg-[#141310]">
                    {detail.bannerUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={detail.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => setDetail(null)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="px-5 sm:px-7 pb-7">
                    <div className="flex items-end gap-3 -mt-8 mb-3">
                      <div className="w-16 h-16 rounded-full border-[3px] border-[#F5F0E8] bg-[#0D0D0D] text-[#F5F0E8] flex items-center justify-center font-extrabold text-xl overflow-hidden flex-shrink-0">
                        {detail.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={detail.logoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          detail.storeName[0]?.toUpperCase()
                        )}
                      </div>
                      <SellerStatusPill status={detail.sellerStatus} />
                    </div>

                    <h3 className="font-extrabold text-[1.15rem] text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
                      {detail.storeName}
                    </h3>
                    <p className="text-[0.78rem] text-black/45 mt-0.5">
                      {detail.ownerName ?? '—'} · {detail.email}
                      {detail.phone ? ` · ${detail.phone}` : ''}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                      <div className="bg-white rounded-[12px] border border-black/[0.06] p-3">
                        <p className="text-[0.6rem] uppercase tracking-[0.08em] text-black/38 mb-1">Location</p>
                        <p className="text-[0.78rem] font-semibold text-[#0D0D0D] truncate">{detail.location ?? '—'}</p>
                      </div>
                      <div className="bg-white rounded-[12px] border border-black/[0.06] p-3">
                        <p className="text-[0.6rem] uppercase tracking-[0.08em] text-black/38 mb-1">Category</p>
                        <p className="text-[0.78rem] font-semibold text-[#0D0D0D] truncate">{detail.category ?? '—'}</p>
                      </div>
                      <div className="bg-white rounded-[12px] border border-black/[0.06] p-3">
                        <p className="text-[0.6rem] uppercase tracking-[0.08em] text-black/38 mb-1">Products</p>
                        <p className="text-[0.78rem] font-semibold text-[#0D0D0D]">{detail.productCount}</p>
                      </div>
                      <div className="bg-white rounded-[12px] border border-black/[0.06] p-3">
                        <p className="text-[0.6rem] uppercase tracking-[0.08em] text-black/38 mb-1">Terms</p>
                        <p className="text-[0.78rem] font-semibold text-[#0D0D0D]">
                          v{detail.termsVersion ?? '—'}{detail.termsAcceptedAt ? ' ✓' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-[12px] border border-black/[0.06] p-4 mt-3">
                      <p className="text-[0.62rem] uppercase tracking-[0.08em] text-black/38 mb-1.5">About the store</p>
                      <p className="text-[0.82rem] text-black/60 leading-relaxed whitespace-pre-line">{detail.description || 'No description provided.'}</p>
                    </div>

                    {(detail.rejectionReason || detail.adminNote) && (
                      <div className="bg-white rounded-[12px] border border-black/[0.06] p-4 mt-3">
                        {detail.rejectionReason && (
                          <p className="text-[0.78rem] text-red-500"><strong>Last rejection / restriction reason:</strong> {detail.rejectionReason}</p>
                        )}
                        {detail.adminNote && (
                          <p className="text-[0.78rem] text-black/55 mt-1.5"><strong>Internal note:</strong> {detail.adminNote}</p>
                        )}
                      </div>
                    )}

                    {/* Submitted products */}
                    <p className="text-[0.62rem] uppercase tracking-[0.08em] text-black/38 mt-5 mb-2">Submitted products ({detail.products.length})</p>
                    {detail.products.length === 0 ? (
                      <p className="text-[0.78rem] text-black/40">No products yet.</p>
                    ) : (
                      <div className="flex gap-2.5 overflow-x-auto pb-2">
                        {detail.products.map((p) => (
                          <div key={p.id} className="w-[132px] bg-white rounded-[12px] border border-black/[0.06] overflow-hidden flex-shrink-0">
                            <div className="h-[80px] bg-[#EDE8DF]">
                              {p.images?.[0] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                              ) : null}
                            </div>
                            <div className="p-2.5">
                              <p className="text-[0.7rem] font-semibold text-[#0D0D0D] truncate">{p.name}</p>
                              <p className="text-[0.68rem] text-black/45">{formatPrice(Number(p.price))}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-black/[0.08]">
                      {detail.sellerStatus === 'PENDING' || detail.sellerStatus === 'REJECTED' ? (
                        <>
                          <button
                            type="button"
                            disabled={busyId === detail.id}
                            onClick={() => sellerAction(detail.id, () => api.adminApproveSeller(detail.id), 'Seller approved — they can now publish listings.')}
                            className="px-5 py-2.5 rounded-full bg-[#2A5C45] text-white text-[0.78rem] font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                          >
                            Approve seller
                          </button>
                          {detail.sellerStatus === 'PENDING' && (
                            <button
                              type="button"
                              disabled={busyId === detail.id}
                              onClick={() => {
                                const reason = window.prompt('Reason sent to the seller (required):');
                                if (!reason?.trim()) return;
                                sellerAction(detail.id, () => api.adminRejectSeller(detail.id, reason.trim()), 'Seller rejected with reason.');
                              }}
                              className="px-5 py-2.5 rounded-full border border-red-200 text-red-500 text-[0.78rem] font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                              Reject with reason…
                            </button>
                          )}
                        </>
                      ) : null}
                      {detail.sellerStatus === 'APPROVED' && (
                        <button
                          type="button"
                          disabled={busyId === detail.id}
                          onClick={() => {
                            const reason = window.prompt('Suspension reason sent to the seller (optional):') ?? undefined;
                            sellerAction(detail.id, () => api.adminSuspendSeller(detail.id, reason), 'Seller suspended — their live listings were pulled.');
                          }}
                          className="px-5 py-2.5 rounded-full border border-[#B7791F]/40 text-[#8A5A0F] text-[0.78rem] font-semibold hover:bg-[#B7791F]/10 disabled:opacity-50 transition-colors"
                        >
                          Suspend…
                        </button>
                      )}
                      {detail.sellerStatus !== 'BLOCKED' && (
                        <button
                          type="button"
                          disabled={busyId === detail.id}
                          onClick={() => {
                            const reason = window.prompt('Block reason (optional):') ?? undefined;
                            if (!window.confirm(`Block ${detail.storeName}? The seller loses all selling access.`)) return;
                            sellerAction(detail.id, () => api.adminBlockSeller(detail.id, reason), 'Seller blocked.');
                          }}
                          className="px-5 py-2.5 rounded-full border border-red-200 text-red-500 text-[0.78rem] font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          Block…
                        </button>
                      )}
                      {(detail.sellerStatus === 'SUSPENDED' || detail.sellerStatus === 'BLOCKED') && (
                        <button
                          type="button"
                          disabled={busyId === detail.id}
                          onClick={() => sellerAction(detail.id, () => api.adminReinstateSeller(detail.id), 'Seller reinstated — publishing unlocked.')}
                          className="px-5 py-2.5 rounded-full bg-[#0D0D0D] text-[#F5F0E8] text-[0.78rem] font-semibold hover:bg-black/80 disabled:opacity-50 transition-colors"
                        >
                          Reinstate
                        </button>
                      )}
                      {detail.userId !== me?.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget({ id: detail.userId, label: detail.ownerName ?? detail.email });
                            setDeleteConfirmText('');
                          }}
                          className="px-5 py-2.5 rounded-full border border-red-300 text-red-600 text-[0.78rem] font-semibold hover:bg-red-50 transition-colors ml-auto"
                        >
                          Delete account…
                        </button>
                      )}
                    </div>
                  </div>
                </div>
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
                      <th className="px-4 py-3 font-medium"></th>
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
                        <td className="px-4 py-3">
                          {u.role === 'ADMIN' || u.id === me?.id ? (
                            <span className="text-[0.68rem] text-black/25">—</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget({ id: u.id, label: u.name ?? u.email });
                                setDeleteConfirmText('');
                              }}
                              className="px-2.5 h-7 rounded-full border border-red-200 text-red-500 text-[0.68rem] font-medium hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          )}
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

      {/* ── Delete-account confirm (typed) ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Confirm account deletion">
          <div className="bg-white rounded-[20px] border border-black/[0.08] p-6 sm:p-8 w-full max-w-[440px]">
            <h3 className="font-extrabold text-[1.05rem] text-red-600 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Delete this account permanently?
            </h3>
            <p className="text-[0.84rem] text-black/55 leading-relaxed mb-4">
              <strong>{deleteTarget.label}</strong> will be erased along with their store, listings, orders and
              reviews. This cannot be undone.
            </p>
            <label htmlFor="deleteConfirm" className="block text-[0.76rem] font-semibold text-[#0D0D0D] mb-1.5">
              Type <span className="font-mono bg-[#F5F0E8] px-1.5 py-0.5 rounded">DELETE</span> to confirm
            </label>
            <input
              id="deleteConfirm"
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className={inputClass}
              autoFocus
            />
            <div className="flex justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirmText('');
                }}
                className="px-5 py-2.5 rounded-full border border-black/12 text-[0.8rem] font-semibold text-[#0D0D0D] hover:bg-black/[0.04] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'DELETE' || busyId === deleteTarget.id}
                onClick={confirmDeleteUser}
                className="px-5 py-2.5 rounded-full bg-red-600 text-white text-[0.8rem] font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {busyId === deleteTarget.id && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />}
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

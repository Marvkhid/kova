'use client';

// ============================================================
// KOVA — MarketplaceBrowse
// The live marketplace browsing experience: search, category
// pills (database-driven), product type filter, sorting and
// pagination — all served by the API. Used by /shopping and
// /search.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from './Skeletons';
import { SectionLabel } from '../ui/Atom';
import { api, ApiError, type ProductQuery } from '@/lib/api';
import { track } from '@/lib/analytics';
import type { Category, Product, ProductType } from '@/lib/types';

const SORT_OPTIONS = [
  { value: 'new', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const TYPE_OPTIONS: { value: '' | ProductType; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'PHYSICAL', label: 'Physical' },
  { value: 'DIGITAL', label: 'Digital' },
];

interface MarketplaceBrowseProps {
  initialQuery?: string;
  initialCategory?: string;
  initialType?: string;
  initialSort?: string;
  lockStore?: string;
}

export function MarketplaceBrowse({
  initialQuery = '',
  initialCategory = '',
  initialType = '',
  initialSort = 'new',
  lockStore,
}: MarketplaceBrowseProps) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [type, setType] = useState<'' | ProductType>((initialType as ProductType) || '');
  const [sort, setSort] = useState(initialSort);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackedQuery = useRef<string | null>(
    initialQuery ? initialQuery : null,
  );

  // Load categories once
  useEffect(() => {
    api
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // Debounce the search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const buildQuery = useCallback(
    (pageNum: number): ProductQuery => ({
      q: debouncedQuery || undefined,
      category: category || undefined,
      type: type || undefined,
      sort,
      page: pageNum,
      limit: 24,
      store: lockStore,
    }),
    [debouncedQuery, category, type, sort, lockStore],
  );

  // Fetch page 1 whenever filters change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .listProducts(buildQuery(1))
      .then((res) => {
        if (cancelled) return;
        setProducts(res.products);
        setTotal(res.total);
        setPage(1);
        setPages(res.pages);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : 'Could not load products. Please try again.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Analytics: one search event per settled query
    if (debouncedQuery && trackedQuery.current !== debouncedQuery) {
      trackedQuery.current = debouncedQuery;
    }

    return () => {
      cancelled = true;
    };
  }, [buildQuery]);

  // Fire search analytics once results arrive
  useEffect(() => {
    if (!loading && trackedQuery.current && trackedQuery.current === debouncedQuery) {
      track.search(debouncedQuery, total);
      trackedQuery.current = null;
    }
  }, [loading, total, debouncedQuery]);

  async function loadMore() {
    if (loadingMore || page >= pages) return;
    setLoadingMore(true);
    try {
      const res = await api.listProducts(buildQuery(page + 1));
      setProducts((prev) => [...prev, ...res.products]);
      setPage(res.page);
      setPages(res.pages);
    } catch {
      // keep current items on failure
    } finally {
      setLoadingMore(false);
    }
  }

  function resetFilters() {
    setQuery('');
    setCategory('');
    setType('');
    setSort('new');
  }

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Header */}
      <div className="bg-[#0D0D0D] pt-8 sm:pt-10 pb-10 sm:pb-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
          <SectionLabel light>{lockStore ? 'Seller store' : 'Marketplace'}</SectionLabel>
          <h1
            className="font-extrabold text-[#F5F0E8] leading-[1.0] tracking-[-0.03em] mb-7 sm:mb-8"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.95rem, 9vw, 4rem)' }}
          >
            {lockStore ? (
              <>Everything from<br /><span className="text-[#E8622A] italic">this store.</span></>
            ) : (
              <>Browse everything<br /><span className="text-[#E8622A] italic">on KOVA.</span></>
            )}
          </h1>

          {/* Search */}
          <div className="relative w-full max-w-[520px]">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, sellers, tags…"
              aria-label="Search products"
              className={[
                'w-full h-[44px] sm:h-[46px] pl-11 pr-10 rounded-full',
                'bg-white border border-black/[0.09]',
                'text-[0.88rem] sm:text-[0.9rem] text-[#0D0D0D] placeholder:text-black/36',
                'outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/20',
                'transition-all duration-200',
              ].join(' ')}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/70 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="sticky top-[64px] z-30 bg-[#F5F0E8]/95 backdrop-blur-md border-b border-black/[0.07]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8 py-3.5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-0.5 -mb-0.5" role="tablist" aria-label="Categories">
              <FilterPill active={!category} onClick={() => setCategory('')} label="All" />
              {categories.map((cat) => (
                <FilterPill
                  key={cat.slug}
                  active={category === cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  label={cat.name}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Type filter */}
              <div className="flex rounded-full border border-black/[0.09] bg-white overflow-hidden">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    aria-pressed={type === opt.value}
                    className={[
                      'px-3 sm:px-3.5 py-2 text-[0.74rem] sm:text-[0.78rem] font-medium transition-colors',
                      type === opt.value
                        ? 'bg-[#0D0D0D] text-[#F5F0E8]'
                        : 'text-black/55 hover:text-black',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort products"
                className={[
                  'h-[38px] sm:h-[40px] px-3.5 pr-8 rounded-full appearance-none',
                  'bg-white border border-black/[0.09]',
                  'text-[0.78rem] sm:text-[0.82rem] font-medium text-[#0D0D0D]',
                  'outline-none focus:border-[#E8622A] cursor-pointer',
                  'transition-all duration-200',
                  'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23666\' stroke-width=\'2\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")]',
                  'bg-no-repeat bg-[right_12px_center]',
                ].join(' ')}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8 py-7 sm:py-9">
        {/* Result count */}
        <div className="flex items-baseline gap-2 flex-wrap mb-5 sm:mb-6">
          <span
            className="font-bold text-[1.3rem] sm:text-[1.5rem] text-[#0D0D0D]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {loading ? '…' : total}
          </span>
          <span className="text-[0.84rem] sm:text-[0.9rem] text-black/50">
            {total === 1 ? 'product' : 'products'}
            {debouncedQuery && ` for “${debouncedQuery}”`}
            {activeCategory && ` in ${activeCategory.name}`}
            {type === 'DIGITAL' && ' · digital'}
            {type === 'PHYSICAL' && ' · physical'}
          </span>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-4" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/seed/photo/interior-home/interior-home-p10.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <p className="text-[0.9rem] text-black/55 mb-5">{error}</p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-6 py-3 rounded-full bg-[#0D0D0D] text-[#F5F0E8] text-sm font-medium hover:bg-[#E8622A] transition-colors"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-5" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/seed/photo/interior-home/interior-home-p09.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <h3
              className="font-bold text-[1.05rem] sm:text-[1.2rem] text-[#0D0D0D] mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              No products found
            </h3>
            <p className="text-[0.86rem] sm:text-[0.9rem] text-black/50 mb-6 max-w-[300px]">
              Try a different search term or clear your filters. New listings appear here the
              moment sellers publish them.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-6 py-3 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Pagination */}
            {page < pages && (
              <div className="flex justify-center mt-8 sm:mt-10">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3.5 rounded-full border border-black/15 bg-white text-[0.86rem] font-medium text-[#0D0D0D] hover:border-black/30 transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {loadingMore && (
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  )}
                  {loadingMore ? 'Loading…' : `Load more (${total - products.length} remaining)`}
                </button>
              </div>
            )}

            {/* Seller CTA */}
            {!lockStore && (
              <div className="mt-12 sm:mt-14 bg-white border border-black/[0.07] rounded-[18px] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3
                    className="font-bold text-[1rem] sm:text-[1.15rem] text-[#0D0D0D] mb-1"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Made something people would love?
                  </h3>
                  <p className="text-[0.84rem] text-black/50">
                    Open your own KOVA store and put your products here.
                  </p>
                </div>
                <Link
                  href="/sellers"
                  className="flex-shrink-0 px-6 py-3 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors"
                >
                  Sell on KOVA →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        'flex-shrink-0 px-3.5 sm:px-4 py-2 rounded-full text-[0.8rem] sm:text-[0.84rem] font-medium',
        'transition-all duration-200 whitespace-nowrap',
        active
          ? 'bg-[#0D0D0D] text-[#F5F0E8]'
          : 'bg-white border border-black/[0.09] text-black/65 hover:border-black/25 hover:text-black',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

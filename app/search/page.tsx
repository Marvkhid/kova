'use client';
// ============================================================
// KOVA — /search
// Full search results with filters, sort, price range.
// ============================================================

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '../Component/ProductCard';
import { PRODUCTS } from '@/lib/types/data/products';
import type { ProductCategory } from '@/lib/types';

const CATEGORIES: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all',      label: 'All categories' },
  { value: 'fashion',  label: 'Fashion & Style' },
  { value: 'digital',  label: 'Digital Products' },
  { value: 'services', label: 'Services' },
  { value: 'physical', label: 'Physical Goods' },
  { value: 'art',      label: 'Art & Crafts' },
  { value: 'courses',  label: 'Courses' },
];

const SORT_OPTIONS = [
  { value: 'relevant',   label: 'Most relevant' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top rated' },
  { value: 'popular',    label: 'Most popular' },
];

function SearchResults() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [query,    setQuery]    = useState(initialQuery);
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [sort,     setSort]     = useState('relevant');
  const [maxPrice, setMaxPrice] = useState(200);
  const [badgeFilter, setBadgeFilter] = useState('');

  // Sync query from URL
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  const results = useMemo(() => {
    let r = [...PRODUCTS];

    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (category !== 'all') r = r.filter(p => p.category === category);
    if (badgeFilter)         r = r.filter(p => p.badge === badgeFilter);
    r = r.filter(p => p.price <= maxPrice);

    switch (sort) {
      case 'price-asc':  r.sort((a, b) => a.price - b.price); break;
      case 'price-desc': r.sort((a, b) => b.price - a.price); break;
      case 'rating':     r.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case 'popular':    r.sort((a, b) => (b.buyCount ?? 0) - (a.buyCount ?? 0)); break;
    }

    return r;
  }, [query, category, sort, maxPrice, badgeFilter]);

  function resetAll() {
    setQuery(''); setCategory('all');
    setSort('relevant'); setMaxPrice(200); setBadgeFilter('');
  }

  const hasFilters = category !== 'all' || badgeFilter || maxPrice < 200;

  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* ── Search header ── */}
      <div className="bg-[#0D0D0D] pt-10 pb-14">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] uppercase text-[#F5F0E8]/32 mb-3">
            Search
          </p>

          {/* Big search input */}
          <div className="relative max-w-[680px]">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 text-[#F5F0E8]/30 pointer-events-none"
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, sellers, tags…"
              className="w-full h-[58px] pl-14 pr-5 rounded-[16px] bg-[#1A1A1A] border border-[#F5F0E8]/[0.08] text-[#F5F0E8] text-[1rem] placeholder:text-[#F5F0E8]/28 outline-none focus:border-[#E8622A]/60 focus:ring-2 focus:ring-[#E8622A]/15 transition-all duration-200"
            />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#F5F0E8]/30 hover:text-[#F5F0E8]/70 transition-colors text-xl">
                ×
              </button>
            )}
          </div>

          {/* Result count */}
          {query && (
            <p className="text-[#F5F0E8]/40 text-[0.85rem] mt-3">
              <span className="text-[#F5F0E8] font-semibold">{results.length}</span>{' '}
              result{results.length !== 1 ? 's' : ''} for{' '}
              <span className="text-[#E8622A]">&ldquo;{query}&rdquo;</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Filters sidebar ── */}
          <aside className="w-full lg:w-[240px] flex-shrink-0">
            <div className="bg-white rounded-[20px] border border-black/[0.07] p-5 sticky top-[88px]">

              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-[0.95rem] text-[#0D0D0D]"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  Filters
                </h2>
                {hasFilters && (
                  <button onClick={resetAll}
                    className="text-[0.72rem] text-[#E8622A] hover:opacity-70 transition-opacity">
                    Reset all
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="mb-6">
                <p className="text-[0.72rem] font-semibold text-black/40 uppercase tracking-[0.08em] mb-3">
                  Category
                </p>
                <div className="flex flex-col gap-1">
                  {CATEGORIES.map(cat => (
                    <button key={cat.value} onClick={() => setCategory(cat.value)}
                      className={[
                        'text-left px-3 py-2 rounded-[8px] text-[0.82rem] font-medium transition-all duration-150',
                        category === cat.value
                          ? 'bg-[#0D0D0D] text-[#F5F0E8]'
                          : 'text-black/55 hover:bg-black/[0.05] hover:text-black',
                      ].join(' ')}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[0.72rem] font-semibold text-black/40 uppercase tracking-[0.08em]">
                    Max price
                  </p>
                  <span className="text-[0.78rem] font-bold text-[#0D0D0D]">${maxPrice}</span>
                </div>
                <input
                  type="range" min="5" max="200" step="5"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#E8622A] cursor-pointer"
                />
                <div className="flex justify-between text-[0.68rem] text-black/30 mt-1">
                  <span>$5</span><span>$200</span>
                </div>
              </div>

              {/* Badge */}
              <div>
                <p className="text-[0.72rem] font-semibold text-black/40 uppercase tracking-[0.08em] mb-3">
                  Badge
                </p>
                <div className="flex flex-col gap-1">
                  {[
                    { value: '',     label: 'Any' },
                    { value: 'new',  label: '🆕 New arrivals' },
                    { value: 'hot',  label: '🔥 Hot picks' },
                    { value: 'sale', label: '🏷 On sale' },
                  ].map(b => (
                    <button key={b.value} onClick={() => setBadgeFilter(b.value)}
                      className={[
                        'text-left px-3 py-2 rounded-[8px] text-[0.82rem] font-medium transition-all duration-150',
                        badgeFilter === b.value
                          ? 'bg-[#E8622A]/[0.12] text-[#E8622A]'
                          : 'text-black/55 hover:bg-black/[0.05] hover:text-black',
                      ].join(' ')}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* ── Results ── */}
          <div className="flex-1 min-w-0">

            {/* Sort + count bar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <p className="text-[0.85rem] text-black/50">
                <span className="font-semibold text-[#0D0D0D]">{results.length}</span> products
                {hasFilters && ' (filtered)'}
              </p>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="h-[38px] px-4 pr-8 rounded-full bg-white border border-black/[0.09] text-[0.82rem] font-medium text-[#0D0D0D] outline-none focus:border-[#E8622A] cursor-pointer appearance-none"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Active filter pills */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-5">
                {category !== 'all' && (
                  <span className="flex items-center gap-1.5 text-[0.75rem] font-medium bg-[#0D0D0D] text-[#F5F0E8] px-3 py-1.5 rounded-full">
                    {CATEGORIES.find(c => c.value === category)?.label}
                    <button onClick={() => setCategory('all')} className="hover:text-[#E8622A] transition-colors">×</button>
                  </span>
                )}
                {badgeFilter && (
                  <span className="flex items-center gap-1.5 text-[0.75rem] font-medium bg-[#E8622A]/[0.12] text-[#E8622A] px-3 py-1.5 rounded-full capitalize">
                    {badgeFilter}
                    <button onClick={() => setBadgeFilter('')} className="hover:opacity-60 transition-opacity">×</button>
                  </span>
                )}
                {maxPrice < 200 && (
                  <span className="flex items-center gap-1.5 text-[0.75rem] font-medium bg-black/[0.07] text-black/60 px-3 py-1.5 rounded-full">
                    Under ${maxPrice}
                    <button onClick={() => setMaxPrice(200)} className="hover:text-black transition-colors">×</button>
                  </span>
                )}
              </div>
            )}

            {/* Grid */}
            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {results.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-bold text-[1.2rem] text-[#0D0D0D] mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  No results found
                </h3>
                <p className="text-[0.9rem] text-black/45 mb-6 max-w-[260px]">
                  Try different keywords or remove some filters.
                </p>
                <button onClick={resetAll}
                  className="px-6 py-3 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
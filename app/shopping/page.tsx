'use client';
// ============================================================
// KOVA — /shopping
// Full browse page: search bar, category filters, sort,
// responsive product grid, active filter pills.
// ============================================================

import { useState, useMemo } from 'react';
import { ProductCard } from '../Component/ProductCard';
import { SectionLabel } from '../ui/Atom';
import { PRODUCTS } from '../../lib/types/data/products';
import type { ProductCategory } from '@/lib/types';

// ── Filter config ─────────────────────────────────────────

const CATEGORIES: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'fashion',  label: 'Fashion & Style' },
  { value: 'digital',  label: 'Digital Products' },
  { value: 'services', label: 'Services' },
  { value: 'physical', label: 'Physical Goods' },
  { value: 'art',      label: 'Art & Crafts' },
  { value: 'courses',  label: 'Courses' },
];

const SORT_OPTIONS = [
  { value: 'default',    label: 'Featured' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'popular',    label: 'Most Popular' },
];

// ── Search bar ────────────────────────────────────────────

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-full max-w-[480px]">
      {/* Search icon */}
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none"
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>

      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search products, sellers, tags…"
        className={[
          'w-full h-[46px] pl-11 pr-10 rounded-full',
          'bg-white border border-black/[0.09]',
          'text-[0.9rem] text-[#0D0D0D] placeholder:text-black/36',
          'outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/20',
          'transition-all duration-200',
        ].join(' ')}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/70 transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}

// ── Category pills ────────────────────────────────────────

function CategoryPills({
  active,
  onChange,
}: {
  active: ProductCategory | 'all';
  onChange: (v: ProductCategory | 'all') => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(cat => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={[
            'px-4 py-2 rounded-full text-sm font-medium',
            'transition-all duration-200',
            active === cat.value
              ? 'bg-[#0D0D0D] text-[#F5F0E8]'
              : 'bg-white border border-black/[0.09] text-black/65 hover:border-black/25 hover:text-black',
          ].join(' ')}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

// ── Sort dropdown ─────────────────────────────────────────

function SortSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={[
        'h-[42px] px-4 pr-8 rounded-full appearance-none',
        'bg-white border border-black/[0.09]',
        'text-[0.875rem] font-medium text-[#0D0D0D]',
        'outline-none focus:border-[#E8622A] cursor-pointer',
        'transition-all duration-200',
        // Custom arrow via background
        'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23666\' stroke-width=\'2\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")]',
        'bg-no-repeat bg-[right_14px_center]',
      ].join(' ')}
      aria-label="Sort products"
    >
      {SORT_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ── Results header ────────────────────────────────────────

function ResultsHeader({
  count,
  query,
  category,
}: {
  count: number;
  query: string;
  category: ProductCategory | 'all';
}) {
  const catLabel = CATEGORIES.find(c => c.value === category)?.label ?? '';

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span
        className="font-bold text-[1.5rem] text-[#0D0D0D]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {count}
      </span>
      <span className="text-[0.9rem] text-black/50">
        {count === 1 ? 'product' : 'products'}
        {query && ` for "${query}"`}
        {category !== 'all' && ` in ${catLabel}`}
      </span>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h3
        className="font-bold text-[1.2rem] text-[#0D0D0D] mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        No products found
      </h3>
      <p className="text-[0.9rem] text-black/50 mb-6 max-w-[280px]">
        Try a different search term or browse a different category.
      </p>
      <button
        onClick={onReset}
        className="px-6 py-3 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors"
      >
        Clear filters
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function ShoppingPage() {
  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [sort,     setSort]     = useState('default');

  // Filter + sort products
  const filtered = useMemo(() => {
    let result = [...PRODUCTS];

    // Search
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Category
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }

    // Sort
    switch (sort) {
      case 'price-asc':  result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating':     result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case 'popular':    result.sort((a, b) => (b.buyCount ?? 0) - (a.buyCount ?? 0)); break;
    }

    return result;
  }, [query, category, sort]);

  function resetFilters() {
    setQuery('');
    setCategory('all');
    setSort('default');
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* ── Page header ── */}
      <div className="bg-[#0D0D0D] pt-10 pb-12">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <SectionLabel light>Marketplace</SectionLabel>
          <h1
            className="font-extrabold text-[#F5F0E8] leading-[1.0] tracking-[-0.03em] mb-8"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            }}
          >
            Browse everything<br />
            <span className="text-[#E8622A] italic">on KOVA.</span>
          </h1>

          {/* Search bar */}
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </div>

      {/* ── Filters bar ── */}
      <div className="sticky top-[64px] z-30 bg-[#F5F0E8]/95 backdrop-blur-md border-b border-black/[0.07]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CategoryPills active={category} onChange={setCategory} />
          <SortSelect value={sort} onChange={setSort} />
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-10">

        {/* Results count */}
        <div className="mb-6">
          <ResultsHeader
            count={filtered.length}
            query={query}
            category={category}
          />
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.length > 0 ? (
            filtered.map(p => (
              <ProductCard key={p.id} product={p} />
            ))
          ) : (
            <EmptyState onReset={resetFilters} />
          )}
        </div>

      </div>
    </div>
  );
}
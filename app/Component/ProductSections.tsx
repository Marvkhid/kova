'use client';
// ============================================================
// KOVA — Categories + Featured Products + HowItWorks + TrustStrip
// ============================================================

import Link from 'next/link';
import { ImageSlot } from './ImageSlot';
import { SectionLabel } from '../ui/Atom';
import { ProductCard } from './ProductCard';
import { CATEGORIES, FEATURED_PRODUCTS, TRENDING_PRODUCTS } from '../../lib/types/data/products';
import type { Product } from '@/lib/types';
import { HOW_IT_WORKS, TRUST_STATS } from '../../lib/types/data/constants';
import Image from 'next/image';

// ✅ API products can be any shape, normalize to Product
type ApiProduct = Record<string, any>;

type ProductSectionProps = {
  products?: ApiProduct[];
};

function normalizeProduct(p: ApiProduct): Product {
  return {
    id: String(p.id ?? ''),
    name: p.name ?? 'Untitled product',
    price: Number(p.price ?? 0),
    category: p.category ?? 'general',
    seller: p.seller ?? p.storeName ?? 'KOVA Seller',
    description: p.description ?? '',
    imagePlaceholder:
      p.imagePlaceholder ??
      (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : 'washed-cap'),
    badge: p.badge,
    tags: Array.isArray(p.tags) ? p.tags : [],
    rating: typeof p.rating === 'number' ? p.rating : undefined,
    reviewCount: typeof p.reviewCount === 'number' ? p.reviewCount : undefined,
    buyCount: typeof p.buyCount === 'number' ? p.buyCount : undefined,
    originalPrice: typeof p.originalPrice === 'number' ? p.originalPrice : undefined,
  };
}
 
export function CategoriesSection() {
  return (
    <section className="bg-[#F5F0E8] py-14 sm:py-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
        <div className="reveal">
          <SectionLabel>Browse by category</SectionLabel>
          <h2
            className="font-extrabold text-[#0D0D0D] leading-[1.1] tracking-[-0.02em] mb-8 sm:mb-10"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.55rem, 6.2vw, 2.8rem)' }}
          >
            What are you looking for today?
          </h2>
        </div>
 
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 reveal-stagger">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className={[
                'group relative rounded-[16px] sm:rounded-[20px] overflow-hidden min-h-[160px] sm:min-h-[200px] cursor-pointer',
                'transition-all duration-[380ms] ease-[var(--ease-out)]',
                'hover:-translate-y-[4px] sm:hover:-translate-y-[6px] hover:scale-[1.012] sm:hover:scale-[1.018]',
                'hover:shadow-[0_24px_50px_rgba(0,0,0,0.16)]',
              ].join(' ')}
            >
              {/* Image — absolute fill */}
              <div className="absolute inset-0">
                <div className="w-full h-full transition-all duration-500 group-hover:brightness-50">
                  <img
                    src={`/images/${cat.imagePlaceholder}.jpg`}
                    alt={cat.name}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    className="transition-all duration-500 group-hover:scale-[1.08] group-hover:brightness-50"
                  />
                </div>
              </div>
 
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent transition-all duration-400 group-hover:from-[#E8622A]/88 group-hover:via-[#E8622A]/28" />
 
              {/* Arrow badge */}
              <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/12 border border-white/20 flex items-center justify-center text-white text-xs sm:text-sm opacity-0 scale-[0.65] rotate-[-40deg] transition-all duration-350 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0">
                ↗
              </div>
 
              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transition-transform duration-350 group-hover:-translate-y-[6px]">
                <p
                  className="font-bold text-white text-[0.92rem] sm:text-[1rem] leading-snug transition-all duration-300 group-hover:text-[1.02rem] sm:group-hover:text-[1.12rem]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {cat.name}
                </p>
                <p className="text-[0.66rem] sm:text-[0.72rem] text-white/56 mt-[3px] transition-colors duration-300 group-hover:text-white/88">
                  {cat.count}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
 
// ── FeaturedProductsSection ───────────────────────────────
 
export function FeaturedProductsSection({ products }: ProductSectionProps) {
  const items: Product[] = products?.length ? products.map(normalizeProduct) : FEATURED_PRODUCTS;

  return (
    <section className="bg-[#F5F0E8] py-14 sm:py-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
        <div className="flex items-end justify-between gap-3 mb-7 sm:mb-8 reveal">
          <div>
            <SectionLabel>Trending now</SectionLabel>
            <h2
              className="font-extrabold text-[#0D0D0D] leading-[1.1] tracking-[-0.02em]"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 5.2vw, 2.2rem)' }}
            >
              Featured picks
            </h2>
          </div>
          <Link
            href="/shopping"
            className="text-[0.8rem] sm:text-[0.875rem] font-medium text-[#E8622A] border-b border-[#E8622A] pb-[1px] hover:opacity-65 transition-opacity whitespace-nowrap"
          >
            See all →
          </Link>
        </div>
 
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 reveal-stagger">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
 
// ── TrendingSection ───────────────────────────────────────
 
export function TrendingSection({ products }: ProductSectionProps) {
  const items: Product[] = products?.length ? products.map(normalizeProduct) : TRENDING_PRODUCTS;

  return (
    <section className="bg-[#EDE8DF] py-14 sm:py-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
        <div className="flex items-end justify-between gap-3 mb-7 sm:mb-8 reveal">
          <div>
            <SectionLabel>Discover more</SectionLabel>
            <h2
              className="font-extrabold text-[#0D0D0D] leading-[1.1] tracking-[-0.02em]"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 5.2vw, 2.2rem)' }}
            >
              Trending on KOVA
            </h2>
          </div>
          <Link
            href="/shopping?sort=trending"
            className="text-[0.8rem] sm:text-[0.875rem] font-medium text-[#E8622A] border-b border-[#E8622A] pb-[1px] hover:opacity-65 transition-opacity whitespace-nowrap"
          >
            View all →
          </Link>
        </div>
 
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 reveal-stagger">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
 
// ── HowItWorksSection ─────────────────────────────────────
 
export function HowItWorksSection() {
  return (
    <section className="bg-[#0D0D0D] py-14 sm:py-20 md:py-28">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
        <div className="reveal">
          <p className="text-[0.66rem] sm:text-[0.7rem] font-medium tracking-[0.14em] uppercase text-[#F5F0E8]/32 mb-3">
            How it works
          </p>
          <h2
            className="font-extrabold text-[#F5F0E8] leading-[1.05] tracking-[-0.02em] mb-9 sm:mb-12 max-w-[420px]"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 7vw, 2.8rem)' }}
          >
            Simple to buy.<br />Simple to sell.
          </h2>
        </div>
 
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 reveal-stagger">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className={[
                'group p-5 sm:p-6 rounded-[16px]',
                'border border-[#F5F0E8]/[0.08] border-l-[3px] border-l-[#F5F0E8]/[0.06]',
                'cursor-default',
                'hover:bg-[#E8622A]/[0.14]',
                'hover:border-[#E8622A]',
                'hover:border-l-[#E8622A]',
                'hover:-translate-y-[3px]',
                'hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)]',
                'transition-all duration-300 ease-[var(--ease-out)]',
              ].join(' ')}
            >
              <p
                className="font-extrabold text-[2.2rem] sm:text-[2.6rem] text-[#E8622A] leading-none mb-3 sm:mb-4 opacity-48 transition-opacity duration-300 group-hover:opacity-92"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {item.step}
              </p>
              <p
                className="font-bold text-[0.95rem] sm:text-[1.02rem] text-[#F5F0E8] mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {item.title}
              </p>
              <p className="text-[0.8rem] sm:text-[0.84rem] text-[#F5F0E8]/52 leading-relaxed transition-colors duration-300 group-hover:text-[#F5F0E8]/88">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
 
// ── TrustStrip ────────────────────────────────────────────
 
export function TrustStrip() {
  return (
    <div className="bg-[#2A5C45] py-10 sm:py-14">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center reveal-stagger">
        {TRUST_STATS.map((stat) => (
          <div key={stat.value}>
            <p
              className="font-extrabold text-[2rem] sm:text-[2.8rem] text-[#F5F0E8] leading-none"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {stat.value}
            </p>
            <p className="text-[0.74rem] sm:text-[0.82rem] text-[#F5F0E8]/55 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
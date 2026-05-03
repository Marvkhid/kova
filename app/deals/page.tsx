'use client';
// ============================================================
// KOVA — /deals
// Deals & discounted products page.
// ============================================================

import { ProductCard } from '../Component/ProductCard';
import { SectionLabel } from '../ui/Atom';
import { PRODUCTS } from '../../lib/types/data/products';

// Products with originalPrice set = they're on sale
const DEALS = PRODUCTS.filter(p => p.originalPrice || p.badge === 'sale');
const ALL_DISCOUNTED = PRODUCTS.filter(p => p.badge === 'sale' || p.badge === 'hot' || p.originalPrice);

const BANNERS = [
  { label: 'Flash Sale', desc: 'Ends in 24hrs', color: '#E8622A' },
  { label: 'Digital Picks', desc: 'Up to 40% off', color: '#2A5C45' },
  { label: 'New Arrivals', desc: 'Fresh this week', color: '#3B2F6E' },
];

export default function DealsPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* Header */}
      <div className="bg-[#0D0D0D] pt-10 pb-14">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <SectionLabel light>Limited time</SectionLabel>
          <h1
            className="font-extrabold text-[#F5F0E8] leading-[0.97] tracking-[-0.03em] mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            }}
          >
            Today&apos;s best<br />
            <span className="text-[#E8622A] italic">deals.</span>
          </h1>
          <p className="text-[#F5F0E8]/48 text-[1rem] max-w-[380px]">
            Handpicked discounts updated daily. Grab them before they&apos;re gone.
          </p>
        </div>
      </div>

      {/* Deal banners */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12">
          {BANNERS.map(b => (
            <div
              key={b.label}
              className="rounded-[18px] px-6 py-5 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              style={{ background: b.color }}
            >
              <p
                className="font-extrabold text-white text-[1.2rem]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {b.label}
              </p>
              <p className="text-white/65 text-[0.85rem] mt-1">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Products on sale */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <SectionLabel>On sale now</SectionLabel>
              <h2
                className="font-extrabold text-[#0D0D0D] leading-[1.1] tracking-[-0.02em]"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}
              >
                Discounted picks
              </h2>
            </div>
          </div>

          {ALL_DISCOUNTED.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {ALL_DISCOUNTED.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            // Fallback — show all products if none have sale badge
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {PRODUCTS.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
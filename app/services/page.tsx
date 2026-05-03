'use client';
// ============================================================
// KOVA — /services
// Freelance services marketplace page.
// ============================================================

import { ProductCard } from '../Component/ProductCard';
import { SectionLabel } from '../ui/Atom';
import { PRODUCTS } from '../../lib/types/data/products';
import Link from 'next/link';

const SERVICE_PRODUCTS = PRODUCTS.filter(p => p.category === 'services');
// If no services in data yet, show all with a note
const DISPLAY = SERVICE_PRODUCTS.length > 0 ? SERVICE_PRODUCTS : PRODUCTS;

const SERVICE_CATEGORIES = [
  { icon: '🎙️', label: 'Audio & Podcast', href: '/shopping?category=services&tag=audio' },
  { icon: '🎨', label: 'Design & Branding', href: '/shopping?category=services&tag=design' },
  { icon: '💻', label: 'Web Development', href: '/shopping?category=services&tag=web' },
  { icon: '✍️', label: 'Writing & Copy', href: '/shopping?category=services&tag=writing' },
  { icon: '📱', label: 'Social Media', href: '/shopping?category=services&tag=social' },
  { icon: '📊', label: 'Business & Finance', href: '/shopping?category=services&tag=business' },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* Header */}
      <div className="bg-[#2A5C45] pt-10 pb-14 overflow-hidden relative">
        <div
          aria-hidden="true"
          className="absolute w-[400px] h-[400px] rounded-full bg-white/[0.05] -top-[100px] -right-[80px] pointer-events-none"
        />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative z-10">
          <SectionLabel light>Freelance & services</SectionLabel>
          <h1
            className="font-extrabold text-[#F5F0E8] leading-[0.97] tracking-[-0.03em] mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            }}
          >
            Hire talented<br />
            <span style={{ WebkitTextStroke: '2px #F5F0E8', color: 'transparent' }}>
              creators.
            </span>
          </h1>
          <p className="text-[#F5F0E8]/55 text-[1rem] max-w-[400px] mb-8">
            From podcast editing to brand design — find expert sellers ready to work on your project.
          </p>
          <Link
            href="/sellers"
            className="inline-block px-7 py-[0.875rem] rounded-full bg-[#E8622A] text-white font-medium hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(232,98,42,0.35)] transition-all duration-200"
          >
            Offer your services →
          </Link>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-10">

        {/* Service categories */}
        <div className="mb-12">
          <SectionLabel>Browse by service type</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
            {SERVICE_CATEGORIES.map(cat => (
              <Link
                key={cat.label}
                href={cat.href}
                className="bg-white rounded-[14px] px-4 py-4 border border-black/[0.07] hover:-translate-y-1 hover:shadow-md hover:border-[#E8622A]/30 transition-all duration-250 text-center group"
              >
                <span className="text-2xl block mb-2">{cat.icon}</span>
                <span
                  className="text-[0.8rem] font-medium text-black/70 group-hover:text-[#0D0D0D]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Service listings */}
        <div>
          <div className="flex items-end justify-between mb-6">
            <div>
              <SectionLabel>Available now</SectionLabel>
              <h2
                className="font-extrabold text-[#0D0D0D] leading-[1.1] tracking-[-0.02em]"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}
              >
                Services on KOVA
              </h2>
            </div>
            <Link
              href="/shopping?category=services"
              className="text-[0.875rem] font-medium text-[#E8622A] border-b border-[#E8622A] pb-[1px] hover:opacity-65 transition-opacity"
            >
              See all →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {DISPLAY.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
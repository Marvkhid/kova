// ============================================================
// KOVA — Homepage
// Everything is database-driven: categories, new arrivals and
// featured listings all come from the API. When the marketplace
// is empty, sections show honest empty states.
// ============================================================

import Link from 'next/link';
import { HeroSection, MarqueeStrip, AboutSection } from './Component/HeroSection';import { ProductCard } from './Component/ProductCard';
import { ProductRowSkeleton } from './Component/Skeletons';
import { SectionLabel } from './ui/Atom';
import { api } from '@/lib/api';
import { CATEGORY_PHOTO } from '@/lib/photo-fallback';
import type { Category, FeaturedSeller, Product } from '@/lib/types';

// Keep the homepage fresh — new products must appear promptly.
export const revalidate = 30;

async function getHomeData() {
  try {
    const [discovery, featured, newArrivals, categories, sellers] = await Promise.all([
      api.getDiscovery().catch(() => [] as Product[]),
      api.getFeatured().catch(() => [] as Product[]),
      api.getNewArrivals(8).catch(() => [] as Product[]),
      api.getCategories().catch(() => [] as Category[]),
      api.getFeaturedSellers().catch(() => [] as FeaturedSeller[]),
    ]);
    return { discovery, featured, newArrivals, categories, sellers };
  } catch {
    return {
      discovery: [] as Product[],
      featured: [] as Product[],
      newArrivals: [] as Product[],
      categories: [] as Category[],
      sellers: [] as FeaturedSeller[],
    };
  }
}

function GridEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white border border-black/[0.07] rounded-[18px] p-8 sm:p-10 text-center">
      <p
        className="font-bold text-[1rem] sm:text-[1.1rem] text-[#0D0D0D] mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </p>
      <p className="text-[0.85rem] text-black/50 max-w-[420px] mx-auto leading-relaxed">{body}</p>
      <Link
        href="/sellers"
        className="inline-block mt-5 px-6 py-2.5 rounded-full bg-[#E8622A] text-white text-[0.82rem] font-medium hover:bg-[#F07A48] transition-colors"
      >
        Be the first to list →
      </Link>
    </div>
  );
}

function SectionHeader({
  label,
  title,
  href,
  linkLabel,
}: {
  label: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 sm:mb-7">
      <div>
        <SectionLabel>{label}</SectionLabel>
        <h2
          className="font-extrabold text-[#0D0D0D] leading-tight tracking-[-0.02em]"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 5vw, 2.2rem)' }}
        >
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex-shrink-0 text-[0.8rem] sm:text-[0.86rem] font-medium text-[#E8622A] hover:opacity-70 transition-opacity"
        >
          {linkLabel ?? 'View all'} →
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const { discovery, featured, newArrivals, categories, sellers } = await getHomeData();

  return (
    <>
      <HeroSection />
      <MarqueeStrip />

      {/* ── Marketplace discovery — products from across the sellers ── */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#F5F0E8]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
          <SectionHeader
            label="The marketplace"
            title="Discover across Kova"
            href="/shopping"
            linkLabel="Browse everything"
          />
          {discovery.length === 0 ? (
            <GridEmptyState
              title="The marketplace is waking up"
              body="Products from every seller appear here the moment they are published."
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {discovery.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Sellers — every shop lives at /store/<slug> ── */}
      {sellers.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 bg-[#EDE8DF]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
            <SectionHeader
              label="Featured sellers"
              title="Shops on Kova"
              href="/sellers"
              linkLabel="See all sellers"
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {sellers.slice(0, 6).map((s) => (
                <div
                  key={s.storeSlug}
                  className="bg-white rounded-[18px] border border-black/[0.07] overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(0,0,0,0.1)] transition-all duration-300"
                >
                  <div className="h-24 bg-[#0D0D0D] relative">
                    {s.bannerUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.bannerUrl} alt="" className="w-full h-full object-cover opacity-80" />
                    )}
                  </div>
                  <div className="px-5 pb-5 flex flex-col flex-1">
                    <div className="flex items-end gap-3 -mt-7 mb-3">
                      <div className="w-14 h-14 rounded-full border-2 border-white overflow-hidden bg-[#F5F0E8] flex-shrink-0">
                        {s.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.logoUrl} alt={`${s.storeName} logo`} className="w-full h-full object-cover" />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center font-extrabold text-[#E8622A]" style={{ fontFamily: 'var(--font-display)' }}>
                            {s.storeName.slice(0, 1)}
                          </span>
                        )}
                      </div>
                      {s.isVerified && (
                        <span className="mb-1.5 inline-flex items-center gap-1 text-[0.62rem] font-semibold tracking-wide uppercase text-[#2A5C45] bg-[#2A5C45]/10 rounded-full px-2 py-0.5">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <h3
                      className="font-extrabold text-[1.02rem] text-[#0D0D0D] leading-tight mb-1"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {s.storeName}
                    </h3>
                    {s.location && <p className="text-[0.72rem] text-black/40 mb-2">{s.location}</p>}
                    {s.description && (
                      <p className="text-[0.8rem] text-black/50 leading-relaxed line-clamp-2 mb-3">{s.description}</p>
                    )}
                    <div className="mt-auto">
                      <div className="flex items-center gap-3 text-[0.72rem] text-black/45 mb-3">
                        <span>
                          <strong className="text-[#0D0D0D]">{s.productCount}</strong>{' '}
                          {s.productCount === 1 ? 'product' : 'products'}
                        </span>
                        {s.avgRating != null && s.avgRating > 0 && (
                          <span>
                            <strong className="text-[#0D0D0D]">{s.avgRating}★</strong> rated
                          </span>
                        )}
                      </div>
                      {s.previewProducts.length > 0 && (
                        <div className="flex gap-2 mb-4">
                          {s.previewProducts.slice(0, 3).map((p) => (
                            <Link
                              key={p.id}
                              href={`/products/${p.slug}`}
                              className="w-16 h-16 rounded-[10px] overflow-hidden bg-[#F5F0E8] border border-black/[0.05] hover:opacity-80 transition-opacity"
                              aria-label={p.name}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            </Link>
                          ))}
                        </div>
                      )}
                      <Link
                        href={`/store/${s.storeSlug}`}
                        className="inline-block px-5 py-2 rounded-full bg-[#0D0D0D] text-white text-[0.78rem] font-medium hover:bg-[#E8622A] transition-colors"
                      >
                        Visit Shop →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Categories ── */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#F5F0E8]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
          <SectionHeader
            label="Browse by category"
            title="Find your thing"
            href="/shopping"
            linkLabel="Browse all"
          />
          {categories.length === 0 ? (
            <GridEmptyState
              title="Categories are warming up"
              body="Categories will appear here as soon as the marketplace is set up."
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shopping?category=${cat.slug}`}
                  className="group bg-white rounded-[16px] sm:rounded-[18px] border border-black/[0.07] p-4 sm:p-5 text-center hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(0,0,0,0.1)] hover:border-[#E8622A]/30 transition-all duration-300"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full overflow-hidden border border-black/[0.06] mb-3 group-hover:scale-110 transition-transform duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={CATEGORY_PHOTO[cat.slug] ?? CATEGORY_PHOTO[cat.icon ?? ''] ?? '/images/seed/photo/interior-home/interior-home-p01.jpg'}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p
                    className="font-bold text-[0.84rem] sm:text-[0.9rem] text-[#0D0D0D] leading-tight mb-1"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {cat.name}
                  </p>
                  <p className="text-[0.68rem] sm:text-[0.72rem] text-black/40">
                    {cat.productCount === 1
                      ? '1 listing'
                      : `${cat.productCount} listings`}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── New Arrivals — the marketplace's heartbeat ── */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#EDE8DF]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
          <SectionHeader
            label="Fresh from KOVA sellers"
            title="New arrivals"
            href="/shopping?sort=new"
            linkLabel="See everything new"
          />
          {newArrivals.length === 0 ? (
            <GridEmptyState
              title="No listings yet"
              body="The marketplace is just getting started. New products appear here the moment a seller publishes them — no waiting, no manual approval queue."
            />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {newArrivals.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <AboutSection />

      {/* ── Physical vs Digital ── */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#0D0D0D]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
          <SectionHeader
            label="Two kinds of products"
            title="Physical and digital, side by side"
          />
          <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
            <Link
              href="/shopping?type=PHYSICAL"
              className="group relative bg-[#1A1A1A] rounded-[18px] sm:rounded-[24px] p-6 sm:p-9 overflow-hidden hover:-translate-y-1 transition-all duration-300 border border-[#F5F0E8]/[0.06] hover:border-[#E8622A]/40"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#2A5C45]/20 blur-2xl group-hover:bg-[#2A5C45]/30 transition-colors duration-500" />
              <div className="w-16 h-16 rounded-[14px] overflow-hidden border border-white/10 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/seed/photo/furniture/furniture-p03.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <h3 className="font-extrabold text-[1.2rem] sm:text-[1.5rem] text-[#F5F0E8] mt-4 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Physical products
              </h3>
              <p className="text-[0.86rem] text-[#F5F0E8]/55 leading-relaxed max-w-[380px]">
                Fashion, crafts, home goods and everything you can hold. Listings show the
                product from multiple angles — front, back, side and detail.
              </p>
              <span className="inline-block mt-5 text-[0.82rem] font-medium text-[#E8622A] group-hover:translate-x-1 transition-transform">
                Browse physical →
              </span>
            </Link>

            <Link
              href="/shopping?type=DIGITAL"
              className="group relative bg-[#1A1A1A] rounded-[18px] sm:rounded-[24px] p-6 sm:p-9 overflow-hidden hover:-translate-y-1 transition-all duration-300 border border-[#F5F0E8]/[0.06] hover:border-[#E8622A]/40"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#3B2F6E]/25 blur-2xl group-hover:bg-[#3B2F6E]/35 transition-colors duration-500" />
              <div className="w-16 h-16 rounded-[14px] overflow-hidden border border-white/10 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/seed/photo/digital-products/digital-products-p01.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <h3 className="font-extrabold text-[1.2rem] sm:text-[1.5rem] text-[#F5F0E8] mt-4 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Digital products
              </h3>
              <p className="text-[0.86rem] text-[#F5F0E8]/55 leading-relaxed max-w-[380px]">
                Templates, courses, design assets and software — creations that live on your
                devices, described in detail by the people who made them.
              </p>
              <span className="inline-block mt-5 text-[0.82rem] font-medium text-[#E8622A] group-hover:translate-x-1 transition-transform">
                Browse digital →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured ── */}
      {featured.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 bg-[#F5F0E8]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
            <SectionHeader
              label="Featured listings"
              title="On our radar"
              href="/shopping?sort=popular"
              linkLabel="See more"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {featured.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Seller CTA ── */}
      <section className="pb-14 sm:pb-20 px-4 sm:px-5 md:px-8 bg-[#F5F0E8]">
        <div className="max-w-[1280px] mx-auto">
          <div className="relative bg-[#E8622A] rounded-[20px] sm:rounded-[28px] px-5 sm:px-8 md:px-16 py-12 sm:py-16 text-center overflow-hidden">
            <div aria-hidden="true" className="absolute w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] rounded-full bg-white/[0.07] -top-[120px] -right-[110px] sm:-right-[90px] pointer-events-none" />
            <div aria-hidden="true" className="absolute w-[220px] sm:w-[260px] h-[220px] sm:h-[260px] rounded-full bg-white/[0.07] -bottom-[90px] -left-[80px] sm:-left-[60px] pointer-events-none" />

            <h2
              className="relative font-extrabold text-white leading-[1.05] tracking-[-0.02em] mb-3"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 7vw, 3rem)' }}
            >
              Got something to sell?
            </h2>
            <p className="relative text-white/75 mb-7 sm:mb-8 max-w-[480px] mx-auto text-[0.92rem] sm:text-base leading-relaxed">
              Your KOVA account is all you need. Open a store, list your first product with
              photos and a price, and get a shareable page with its own QR code.
            </p>
            <div className="relative flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
              <Link
                href="/sell"
                className="w-full sm:w-auto px-8 py-[0.9rem] rounded-full bg-white text-[#E8622A] font-medium hover:scale-[1.03] hover:shadow-md transition-all duration-200 text-center"
              >
                Start selling
              </Link>
              <Link
                href="/sellers"
                className="w-full sm:w-auto px-8 py-[0.9rem] rounded-full border border-white/40 text-white font-medium hover:border-white hover:bg-white/[0.08] transition-all duration-200 text-center"
              >
                How selling works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

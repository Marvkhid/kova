// ============================================================
// KOVA — /sellers
// Seller landing: what you get, how it works, FAQ, CTA.
// Plus the live shop directory — every real store from the API
// (seeded demo stores and new signups alike). No mock data.
// ============================================================

import Link from 'next/link';
import { SectionLabel } from '../ui/Atom';
import { api } from '@/lib/api';
import type { FeaturedSeller } from '@/lib/types';

const PERKS = [
  { photo: '/images/seed/photo/furniture/furniture-p04.jpg', title: 'Physical or digital', desc: 'Sell handmade goods and shipped products, or courses, templates, ebooks and designs. The listing flow adapts to what you are selling.' },
  { photo: '/images/seed/photo/digital-products/digital-products-p03.jpg', title: 'Your own product page', desc: 'Every published listing gets a permanent public link and a QR code — perfect for WhatsApp, Instagram, flyers and packaging.' },
  { photo: '/images/seed/photo/interior-home/interior-home-p04.jpg', title: 'Honest analytics', desc: 'See total views, listing status and store activity in your dashboard. Real numbers only — when there is nothing to show, we say so.' },
  { photo: '/images/seed/photo/fashion/fashion-p04.jpg', title: 'Simple store management', desc: 'Publish, unpublish, edit or delete listings at any time. Drafts stay private until you are ready.' },
  { photo: '/images/seed/photo/electronics/electronics-p04.jpg', title: 'List in minutes', desc: 'Guided image slots for physical products, a rich description flow for digital ones. No complicated setup.' },
  { photo: '/images/seed/photo/beauty/beauty-p04.jpg', title: 'One account for everything', desc: 'Your browsing account becomes your selling account. No separate logins, no duplicate profiles.' },
];

const STEPS = [
  { n: '01', title: 'Sign in', desc: 'Use Google or your existing account. Your buyer account doubles as your seller account — no separate login needed.' },
  { n: '02', title: 'Set up your store', desc: 'Add your store name and a short description. Takes under a minute.' },
  { n: '03', title: 'List your products', desc: 'Physical products need at least 3 photos (front, back, side). Digital products get their own flow.' },
  { n: '04', title: 'Publish and share', desc: 'Your listing goes live with a stable URL and QR code. Share it anywhere — the link keeps working.' },
];

const FAQS = [
  { q: 'Is it free to list on KOVA?', a: 'Yes. Creating a seller account and listing products is free.' },
  { q: 'What can I sell on KOVA?', a: 'Physical goods (fashion, crafts, electronics, anything shippable) and digital products (courses, templates, ebooks, designs, software). You pick the product type when listing — the form adapts.' },
  { q: 'How do buyers find my products?', a: 'Published listings appear automatically in New Arrivals, search, and their category. You also get a shareable link and QR code for every product, so you can bring your own audience.' },
  { q: 'Do I need a separate seller account?', a: 'No. One Kova account does both. Activate a store from the same login you browse with.' },
  { q: 'How do buyers pay me?', a: 'Payments are handled at checkout through the platform. Your dashboard shows real sales once orders come in — nothing is simulated.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-black/[0.08] last:border-0">
      <summary className="flex items-center justify-between gap-4 py-4 sm:py-5 cursor-pointer list-none select-none">
        <span className="font-semibold text-[0.88rem] sm:text-[0.95rem] text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
          {q}
        </span>
        <span className="flex-shrink-0 w-6 h-6 rounded-full border border-black/15 flex items-center justify-center text-black/50 group-open:rotate-45 transition-transform duration-200 text-lg leading-none">
          +
        </span>
      </summary>
      <p className="pb-5 text-[0.84rem] sm:text-[0.9rem] text-black/55 leading-relaxed">{a}</p>
    </details>
  );
}

// Shop directory is dynamic — new stores appear immediately.
export const dynamic = 'force-dynamic';

async function getSellers(): Promise<FeaturedSeller[]> {
  try {
    return await api.getFeaturedSellers();
  } catch {
    // API unreachable — show the honest empty state, never fake sellers.
    return [];
  }
}

export default async function SellersPage() {
  const sellers = await getSellers();

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Hero */}
      <section className="bg-[#0D0D0D] pt-12 sm:pt-14 pb-16 sm:pb-20 overflow-hidden relative">
        <div
          aria-hidden="true"
          className="absolute w-[420px] sm:w-[500px] h-[420px] sm:h-[500px] rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: '#E8622A', top: -150, right: -100 }}
        />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8 relative z-10">
          <SectionLabel light>Sell on KOVA</SectionLabel>
          <h1
            className="font-extrabold text-[#F5F0E8] leading-[0.97] tracking-[-0.03em] mb-5 sm:mb-6 max-w-[720px]"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 10vw, 4.5rem)' }}
          >
            Your products.
            <br />
            Your store.
            <br />
            <span className="text-[#E8622A] italic">One link.</span>
          </h1>
          <p className="text-[0.92rem] sm:text-[1rem] text-[#F5F0E8]/55 leading-[1.8] mb-7 sm:mb-8 max-w-[500px]">
            Turn what you make into what you sell. List physical or digital products in minutes, publish when
            you are ready, and share each listing with its own permanent link and QR code.
          </p>
          <div className="flex flex-col xs:flex-row flex-wrap gap-3">
            <Link href="/sell" className="px-7 py-[0.9rem] rounded-full bg-[#E8622A] text-white font-medium hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(232,98,42,0.35)] transition-all duration-200 text-center">
              Start selling free
            </Link>
            <Link href="#faq" className="px-7 py-[0.9rem] rounded-full border border-[#F5F0E8]/20 text-[#F5F0E8] font-medium hover:border-[#F5F0E8]/45 hover:bg-[#F5F0E8]/[0.05] transition-all duration-200 text-center">
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* ── Live shop directory — real stores from the API ── */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#EDE8DF]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
          <div className="flex items-end justify-between gap-4 mb-6 sm:mb-7">
            <div>
              <SectionLabel>The shops</SectionLabel>
              <h2
                className="font-extrabold text-[#0D0D0D] leading-tight tracking-[-0.02em]"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 5vw, 2.2rem)' }}
              >
                Marketplace sellers
              </h2>
            </div>
            <span className="flex-shrink-0 text-[0.78rem] text-black/40">
              {sellers.length} {sellers.length === 1 ? 'shop' : 'shops'}
            </span>
          </div>

          {sellers.length === 0 ? (
            <div className="bg-white rounded-[18px] border border-black/[0.07] p-8 sm:p-10 text-center">
              <p className="text-[0.9rem] text-black/50 mb-1 font-medium">Shops are waking up</p>
              <p className="text-[0.8rem] text-black/40">
                Store listings come straight from the marketplace API — nothing is faked.
                If this stays empty, the API is not reachable.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {sellers.map((s) => (
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
          )}
        </div>
      </section>

      {/* Perks */}
      <section className="py-14 sm:py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
          <div className="text-center max-w-[520px] mx-auto mb-10 sm:mb-14">
            <SectionLabel>Why sell on KOVA</SectionLabel>
            <h2 className="font-extrabold text-[#0D0D0D] leading-[1.05] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.55rem, 6vw, 2.8rem)' }}>
              Built for sellers
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {PERKS.map((perk) => (
              <div key={perk.title} className="bg-white rounded-[16px] sm:rounded-[18px] p-5 sm:p-6 border border-black/[0.07] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-[#E8622A]/[0.1] flex-shrink-0 mb-4" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={perk.photo} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <h3 className="font-bold text-[0.95rem] sm:text-[1rem] text-[#0D0D0D] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  {perk.title}
                </h3>
                <p className="text-[0.82rem] sm:text-[0.875rem] text-black/54 leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to start */}
      <section id="start" className="bg-[#0D0D0D] py-14 sm:py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
          <div className="mb-10 sm:mb-12">
            <SectionLabel light>Get started</SectionLabel>
            <h2 className="font-extrabold text-[#F5F0E8] leading-[1.05] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.55rem, 6vw, 2.8rem)' }}>
              Start selling in 4 steps
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="group p-5 sm:p-6 rounded-[16px] border border-[#F5F0E8]/[0.08] border-l-[3px] border-l-[#F5F0E8]/[0.06] hover:bg-[#E8622A]/[0.14] hover:border-[#E8622A] hover:border-l-[#E8622A] hover:-translate-y-[3px] transition-all duration-300"
              >
                <p className="font-extrabold text-[2.1rem] sm:text-[2.4rem] text-[#E8622A] opacity-50 leading-none mb-4 group-hover:opacity-90 transition-opacity" style={{ fontFamily: 'var(--font-display)' }}>
                  {step.n}
                </p>
                <p className="font-bold text-[0.95rem] sm:text-[1rem] text-[#F5F0E8] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  {step.title}
                </p>
                <p className="text-[0.8rem] sm:text-[0.84rem] text-[#F5F0E8]/50 leading-relaxed group-hover:text-[#F5F0E8]/85 transition-colors">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 sm:mt-12 text-center">
            <Link href="/sell" className="inline-block px-9 py-[1rem] rounded-full bg-[#E8622A] text-white font-medium text-[1rem] hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(232,98,42,0.35)] transition-all duration-200">
              Open your store →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-14 sm:py-20 md:py-28">
        <div className="max-w-[760px] mx-auto px-4 sm:px-5 md:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <SectionLabel>Questions</SectionLabel>
            <h2 className="font-extrabold text-[#0D0D0D] leading-[1.05] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.55rem, 6vw, 2.8rem)' }}>
              Frequently asked
            </h2>
          </div>

          <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] px-5 sm:px-6 md:px-8">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-14 sm:pb-20 px-4 sm:px-5 md:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="relative bg-[#E8622A] rounded-[20px] sm:rounded-[28px] px-5 sm:px-8 md:px-16 py-12 sm:py-16 text-center overflow-hidden">
            <div aria-hidden="true" className="absolute w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] rounded-full bg-white/[0.07] -top-[120px] -right-[110px] sm:-right-[90px] pointer-events-none" />
            <div aria-hidden="true" className="absolute w-[220px] sm:w-[260px] h-[220px] sm:h-[260px] rounded-full bg-white/[0.07] -bottom-[90px] -left-[80px] sm:-left-[60px] pointer-events-none" />
            <h2 className="relative font-extrabold text-white leading-[1.05] tracking-[-0.02em] mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 7vw, 3rem)' }}>
              Ready to start selling?
            </h2>
            <p className="relative text-white/75 mb-7 sm:mb-8 max-w-[440px] mx-auto text-[0.9rem] sm:text-base">
              Free to start. Your first listing can be live in minutes.
            </p>
            <Link href="/sell" className="relative inline-block px-9 py-[0.9rem] rounded-full bg-white text-[#E8622A] font-medium hover:scale-[1.03] hover:shadow-md transition-all duration-200">
              Get started free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

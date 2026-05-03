'use client';
// ============================================================
// KOVA — Testimonials + SellerCTA + StorySection + FinalCTA
// ============================================================

import Link from 'next/link';
import { ImageSlot } from './ImageSlot';
import { SectionLabel, StarRating } from '../ui/Atom';
import { TESTIMONIALS } from '@/lib/types/data/products';

// ── TestimonialsSection ───────────────────────────────────
export function TestimonialsSection() {
  return (
    <section className="bg-[#F5F0E8] py-20 md:py-28">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="text-center max-w-[500px] mx-auto mb-14 reveal">
          <SectionLabel>What people are saying</SectionLabel>
          <h2
            className="font-extrabold text-[#0D0D0D] leading-[1.05] tracking-[-0.02em]"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
          >
            Loved by buyers and sellers
          </h2>
        </div>
 
        <div className="grid md:grid-cols-3 gap-5 reveal-stagger">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.id}
              className={[
                'rounded-[20px] p-7',
                'border border-black/[0.07]',
                'hover:-translate-y-1 hover:shadow-lg',
                'transition-all duration-300',
                i === 1 ? 'bg-[#0D0D0D]' : 'bg-white',
              ].join(' ')}
            >
              <div className="mb-4">
                <StarRating rating={t.rating} />
              </div>
 
              <p className={[
                'text-[0.94rem] leading-relaxed mb-6',
                i === 1 ? 'text-[#F5F0E8]' : 'text-black/62',
              ].join(' ')}>
                &ldquo;{t.text}&rdquo;
              </p>
 
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#D4CFC5] flex-shrink-0">
                  <img
                    src={`/images/${t.avatarPlaceholder}.jpg`}
                    alt={t.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <p
                    className={`font-semibold text-[0.88rem] ${i === 1 ? 'text-[#F5F0E8]' : 'text-[#0D0D0D]'}`}
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {t.name}
                  </p>
                  <p className={`text-[0.72rem] ${i === 1 ? 'text-[#F5F0E8]/70' : 'text-black/40'}`}>
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
 
// ── StorySection ──────────────────────────────────────────
 
export function StorySection() {
  return (
    <section className="bg-[#EDE8DF] py-20 md:py-28 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-12 items-center">
 
        <div className="relative h-[460px] reveal-left">
          {/* Main large image */}
          <div className="absolute inset-y-0 left-0 right-[25%] rounded-[20px] overflow-hidden">
            <img
              src="/images/story-main.jpg"
              alt="Seller creating"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {/* Top right */}
          <div className="absolute top-0 right-0 w-[28%] h-[48%] rounded-[16px] overflow-hidden">
            <img
              src="/images/story-2.jpg"
              alt="Digital product"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {/* Bottom right */}
          <div className="absolute bottom-0 right-0 w-[28%] h-[48%] rounded-[16px] overflow-hidden">
            <img
              src="/images/story-3.jpg"
              alt="Happy customer"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
 
        <div className="reveal-right">
          <SectionLabel>Our story</SectionLabel>
          <h2
            className="font-extrabold text-[#0D0D0D] leading-[1.05] tracking-[-0.02em] mb-5"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)' }}
          >
            Built for creators,<br />
            makers, and{' '}
            <span className="text-[#E8622A] italic">sellers everywhere.</span>
          </h2>
          <p className="text-[1rem] text-black/58 leading-[1.8] mb-5">
            KOVA was built because great products deserve great reach. We saw too many talented creators and sellers without a platform that truly served them — one that combined the discoverability of a marketplace with the simplicity of a personal shop.
          </p>
          <p className="text-[1rem] text-black/58 leading-[1.8] mb-8">
            So we built it. For the designer selling UI kits at midnight. For the artisan pouring candles on weekends. For the freelancer who deserves to be found.
          </p>
          <Link
            href="/sellers"
            className="inline-flex items-center gap-2 text-[0.94rem] font-medium text-[#E8622A] border-b border-[#E8622A] pb-[2px] hover:opacity-65 transition-opacity"
          >
            Start selling on KOVA →
          </Link>
        </div>
      </div>
    </section>
  );
}
 
// ── SellerCTASection ──────────────────────────────────────
 
export function SellerCTASection() {
  return (
    <section className="bg-[#0D0D0D] py-20 md:py-28">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-12 items-center">
 
        <div className="reveal-left">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] uppercase text-[#F5F0E8]/32 mb-4">
            For sellers
          </p>
          <h2
            className="font-extrabold text-[#F5F0E8] leading-[1.05] tracking-[-0.02em] mb-5"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
          >
            Your products.<br />
            The world&apos;s<br />
            <span className="text-[#E8622A] italic">marketplace.</span>
          </h2>
          <p className="text-[1rem] text-[#F5F0E8]/52 leading-[1.8] mb-8 max-w-[420px]">
            Upload your products in minutes. Set your prices. Reach buyers across 190+ countries. Keep more of what you earn with our low-fee structure.
          </p>
 
          <ul className="flex flex-col gap-3 mb-10">
            {[
              'Free to list — zero upfront costs',
              'Seller analytics dashboard',
              'Instant payouts via your preferred method',
              'Built-in buyer protection builds your trust score',
            ].map(perk => (
              <li key={perk} className="flex items-center gap-3 text-[0.9rem] text-[#F5F0E8]/65">
                <span className="w-5 h-5 rounded-full bg-[#E8622A]/20 border border-[#E8622A]/40 flex-shrink-0 flex items-center justify-center text-[#E8622A] text-xs">✓</span>
                {perk}
              </li>
            ))}
          </ul>
 
          <div className="flex flex-wrap gap-3">
            <Link href="/sellers"
              className="px-7 py-[0.9rem] rounded-full bg-[#E8622A] text-white font-medium hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(232,98,42,0.35)] transition-all duration-250">
              Start selling free
            </Link>
            <Link href="/sellers"
              className="px-7 py-[0.9rem] rounded-full border border-[#F5F0E8]/20 text-[#F5F0E8] font-medium hover:border-[#F5F0E8]/50 hover:bg-[#F5F0E8]/[0.05] transition-all duration-200">
              Read seller guide →
            </Link>
          </div>
        </div>
 
        {/* Seller CTA image */}
        <div className="relative h-[420px] rounded-[24px] overflow-hidden reveal-right">
          <img
            src="/images/seller-cta.jpg"
            alt="Seller dashboard"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8622A]/12 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
 
// ── FinalCTASection ───────────────────────────────────────
 
export function FinalCTASection() {
  return (
    <section className="bg-[#F5F0E8] py-16 md:py-20">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="relative bg-[#E8622A] rounded-[28px] px-8 md:px-16 py-16 text-center overflow-hidden reveal-scale">
          <div aria-hidden="true" className="absolute w-[420px] h-[420px] rounded-full bg-white/[0.07] -top-[120px] -right-[90px] pointer-events-none" />
          <div aria-hidden="true" className="absolute w-[260px] h-[260px] rounded-full bg-white/[0.07] -bottom-[90px] -left-[60px] pointer-events-none" />
 
          <h2
            className="relative font-extrabold text-white leading-[1.05] tracking-[-0.02em] mb-4"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Ready to Konnect<br />with the world?
          </h2>
          <p className="relative text-white/72 text-[1rem] mb-8 max-w-[440px] mx-auto">
            Join thousands of buyers and sellers already building their future on KOVA.
          </p>
          <div className="relative flex flex-wrap gap-3 justify-center">
            <Link href="/shopping"
              className="px-8 py-[0.9rem] rounded-full bg-white text-[#E8622A] font-medium hover:scale-[1.03] hover:shadow-md transition-all duration-200">
              Start for free
            </Link>
            <Link href="/sellers"
              className="px-8 py-[0.9rem] rounded-full border border-white/40 text-white font-medium hover:border-white hover:bg-white/[0.08] transition-all duration-200">
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
 
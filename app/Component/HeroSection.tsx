'use client';

// ============================================================
// KOVA — Hero + Marquee + About Sections
// Honest copy only — no invented statistics.
// ============================================================

import Link from 'next/link';
import Image from 'next/image';
import { EyebrowPill } from '../ui/Atom';
import { MARQUEE_ITEMS } from '@/lib/types/data/constants';

// ── HeroSection ───────────────────────────────────────────

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#F5F0E8]">
      {/* Ambient blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute rounded-full opacity-[0.07]"
          style={{
            width: 580, height: 580,
            background: '#E8622A',
            top: -160, right: -120,
            animation: 'float-slow 9s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full opacity-[0.06]"
          style={{
            width: 380, height: 380,
            background: '#2A5C45',
            bottom: -80, left: -60,
            animation: 'float-medium 11s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full opacity-[0.05]"
          style={{
            width: 220, height: 220,
            background: '#3B2F6E',
            top: '42%', left: '52%',
            animation: 'float-slow 13s ease-in-out infinite reverse',
          }}
        />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8 grid md:grid-cols-2 items-center gap-8 md:gap-10 py-12 sm:py-14 md:py-20 lg:py-24">
        {/* ── Left: copy ── */}
        <div className="relative z-10">
          <div className="mb-4 sm:mb-5" style={{ animation: 'fadeUp 0.65s ease both' }}>
            <EyebrowPill>A marketplace for buyers and sellers</EyebrowPill>
          </div>

          <h1
            className="font-extrabold leading-[0.95] tracking-[-0.03em] text-[#0D0D0D] mb-5 sm:mb-6"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.25rem, 10vw, 5.5rem)',
              animation: 'fadeUp 0.65s 0.1s ease both',
            }}
          >
            One place.<br />
            <span className="text-[#E8622A] italic">Everything</span><br />
            <span style={{ WebkitTextStroke: '2px #2A5C45', color: 'transparent' }}>
              you need.
            </span>
          </h1>

          <p
            className="text-[0.96rem] sm:text-[1.05rem] font-light text-black/58 max-w-[460px] leading-[1.75] mb-7 sm:mb-8"
            style={{ animation: 'fadeUp 0.65s 0.18s ease both' }}
          >
            Discover products from independent sellers — physical goods, digital downloads and
            services. Or open your own store and put your products in front of buyers.
          </p>

          <div
            className="flex flex-col sm:flex-row sm:flex-wrap gap-3"
            style={{ animation: 'fadeUp 0.65s 0.26s ease both' }}
          >
            <Link
              href="/shopping"
              className="w-full sm:w-auto text-center px-6 sm:px-7 py-3 sm:py-[0.9rem] rounded-full bg-[#E8622A] text-white font-medium text-[0.98rem] sm:text-[1rem] hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(232,98,42,0.35)] transition-all duration-250"
            >
              Start shopping
            </Link>
            <Link
              href="/sellers"
              className="w-full sm:w-auto text-center px-6 sm:px-7 py-3 sm:py-[0.9rem] rounded-full border border-black/20 text-[#0D0D0D] font-medium text-[0.98rem] sm:text-[1rem] hover:border-black/60 hover:bg-black/[0.04] transition-all duration-200"
            >
              Become a seller →
            </Link>
          </div>
        </div>

        {/* ── Right: image frame ── */}
        <div
          className="relative h-[320px] sm:h-[400px] md:h-[520px] lg:h-[540px]"
          style={{ animation: 'fadeUp 0.75s 0.12s ease both' }}
        >
          <div className="relative w-full h-full rounded-[18px] sm:rounded-[24px] overflow-hidden">
            <Image
              src="/images/hero-main.jpg"
              alt="Products from KOVA sellers"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="eager"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#2A5C45]/10 to-transparent pointer-events-none" />
          </div>

          {/* Floating badge — honest */}
          <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 bg-[#F5F0E8]/95 backdrop-blur-md rounded-[12px] sm:rounded-[14px] px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-lg max-w-[85%]">
            <p className="text-[0.74rem] sm:text-[0.8rem] font-bold text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
              Fresh listings, every day
            </p>
            <p className="text-[0.62rem] sm:text-[0.68rem] text-black/44 mt-0.5">
              New products appear the moment sellers publish them
            </p>
          </div>

          {/* Floating badge — physical/digital */}
          <div className="absolute top-3 sm:top-5 right-3 sm:right-5 bg-[#0D0D0D] rounded-[12px] sm:rounded-[14px] px-3 sm:px-5 py-2.5 sm:py-3 text-center shadow-lg">
            <p className="font-extrabold text-[0.9rem] sm:text-[1.05rem] text-[#F5F0E8] leading-none" style={{ fontFamily: 'var(--font-display)' }}>
              Physical <span className="text-[#E8622A]">+</span> Digital
            </p>
            <p className="text-[0.58rem] sm:text-[0.66rem] text-[#F5F0E8]/60 uppercase tracking-[0.08em] mt-1">
              One marketplace
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── MarqueeStrip ──────────────────────────────────────────

export function MarqueeStrip() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="overflow-hidden bg-[#0D0D0D] py-3 sm:py-[0.85rem]" aria-hidden="true">
      <div
        className="flex gap-6 sm:gap-10 whitespace-nowrap"
        style={{ animation: 'marquee 22s linear infinite' }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-3 sm:gap-4 text-[#F5F0E8]/60 text-[0.68rem] sm:text-[0.76rem] font-bold tracking-[0.1em] sm:tracking-[0.12em] uppercase"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="w-1 h-1 rounded-full bg-[#E8622A] flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── AboutSection (honest) ─────────────────────────────────

export function AboutSection() {
  return (
    <section className="bg-[#F5F0E8] py-14 sm:py-20 md:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
        <div className="max-w-[640px] mb-10 sm:mb-14 reveal">
          <p className="text-[0.68rem] sm:text-[0.7rem] font-medium tracking-[0.14em] uppercase text-black/36 mb-3">
            What KOVA does
          </p>
          <h2
            className="font-extrabold text-[#0D0D0D] leading-[1.08] tracking-[-0.02em] mb-4 sm:mb-5"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 7vw, 3rem)' }}
          >
            The marketplace that connects{' '}
            <span className="text-[#E8622A] italic">buyers and sellers</span> — seamlessly.
          </h2>
          <p className="text-[0.95rem] sm:text-[1rem] text-black/58 leading-[1.8]">
            KOVA isn&apos;t just a store. It&apos;s a two-sided platform where anyone can
            discover products — and where sellers get the tools to list, manage and share
            their products from day one.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 reveal-stagger">
          <div className="bg-white rounded-[18px] sm:rounded-[20px] p-6 sm:p-7 border border-black/[0.07] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-[#E8622A]/[0.12] flex-shrink-0 mb-4 sm:mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/seed/photo/fashion/fashion-p03.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <h3 className="font-bold text-[1rem] sm:text-[1.05rem] mb-2 text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
              Buyers discover everything
            </h3>
            <p className="text-[0.88rem] sm:text-[0.9rem] text-black/54 leading-relaxed">
              From handcrafted physical goods to digital templates and services — browse
              listings across every category, with rich photos and clear descriptions.
            </p>
          </div>

          <div className="bg-[#0D0D0D] rounded-[18px] sm:rounded-[20px] p-6 sm:p-7 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-[#E8622A]/20 flex-shrink-0 mb-4 sm:mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/seed/photo/furniture/furniture-p03.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <h3 className="font-bold text-[1rem] sm:text-[1.05rem] mb-2 text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              Sellers list in minutes
            </h3>
            <p className="text-[0.88rem] sm:text-[0.9rem] text-[#F5F0E8]/80 leading-relaxed">
              Create your store, upload product photos, set your price and publish. Every
              listing gets a permanent page with a share link and QR code.
            </p>
          </div>

          <div className="bg-[#2A5C45] rounded-[18px] sm:rounded-[20px] p-6 sm:p-7 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-white/[0.12] flex-shrink-0 mb-4 sm:mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/seed/photo/interior-home/interior-home-p03.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <h3 className="font-bold text-[1rem] sm:text-[1.05rem] mb-2 text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              Built for sharing
            </h3>
            <p className="text-[0.88rem] sm:text-[0.9rem] text-[#F5F0E8]/55 leading-relaxed">
              Every product has a stable link that never changes. Print it on a flyer, post it
              on WhatsApp, put the QR code anywhere — it always opens your product.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';
// ============================================================
// KOVA — Hero + Marquee + About Sections
// ============================================================

import Link from 'next/link';
import { EyebrowPill } from '../ui/Atom';
import { ImageSlot } from './ImageSlot';
import Image from 'next/image';
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

      {/* Grid layout */}
      <div className="relative max-w-[1280px] mx-auto px-5 md:px-8 grid md:grid-cols-2 items-center gap-10 py-16 md:py-20 lg:py-24">

        {/* ── Left: copy ── */}
        <div className="relative z-10">
          <div className="mb-5" style={{ animation: 'fadeUp 0.65s ease both' }}>
            <EyebrowPill>Now live · Join 48K+ sellers</EyebrowPill>
          </div>

          <h1
            className="font-extrabold leading-[0.95] tracking-[-0.03em] text-[#0D0D0D] mb-6"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 6vw, 5.5rem)',
              animation: 'fadeUp 0.65s 0.1s ease both',
            }}
          >
            One place.<br />
            <span className="text-[#E8622A] italic">Everything</span><br />
            <span
              style={{
                WebkitTextStroke: '2.5px #2A5C45',
                color: 'transparent',
              }}
            >
              you need.
            </span>
          </h1>

          <p
            className="text-[1.05rem] font-light text-black/58 max-w-[400px] leading-[1.8] mb-8"
            style={{ animation: 'fadeUp 0.65s 0.18s ease both' }}
          >
            Physical goods, digital products, freelance services — buy and sell anything, from anyone, anywhere in the world.
          </p>

          <div
            className="flex flex-wrap gap-3"
            style={{ animation: 'fadeUp 0.65s 0.26s ease both' }}
          >
            <Link
              href="/shopping"
              className="px-7 py-[0.9rem] rounded-full bg-[#E8622A] text-white font-medium text-[1rem] hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(232,98,42,0.35)] transition-all duration-250"
            >
              Start shopping
            </Link>
            <Link
              href="/sellers"
              className="px-7 py-[0.9rem] rounded-full border border-black/20 text-[#0D0D0D] font-medium text-[1rem] hover:border-black/60 hover:bg-black/[0.04] transition-all duration-200"
            >
              Become a seller →
            </Link>
          </div>
        </div>

        {/* ── Right: image frame ── */}
        <div
          className="relative h-[480px] md:h-[540px]"
          style={{ animation: 'fadeUp 0.75s 0.12s ease both' }}
        >
          <div className="relative w-full h-full rounded-[24px] overflow-hidden">
            {/* SWAP: <Image src="/images/hero-main.jpg" alt="Marketplace" fill className="object-cover" /> */}
            <Image src="/images/hero-main.jpg" alt="Marketplace" fill className="object-cover" />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2A5C45]/10 to-transparent pointer-events-none" />
          </div>

          {/* Floating badge — sellers this week */}
          <div className="absolute bottom-5 left-5 bg-[#F5F0E8]/95 backdrop-blur-md rounded-[14px] px-4 py-3 flex items-center gap-3 shadow-lg">
            <div className="flex">
              {[
                '/images/avatar-1.jpg',
                '/images/avatar-2.jpg',
                '/images/avatar-3.jpg',
              ].map((src, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white -mr-2 last:mr-0 overflow-hidden bg-[#D4CFC5]">
                  <img
                    src={src}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
            <div className="ml-2">
              <p className="text-[0.78rem] font-bold text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
                New sellers this week
              </p>
              <p className="text-[0.68rem] text-black/44">1,240 joined · 4.9★ avg</p>
            </div>
          </div>

          {/* Floating stat — payout */}
          <div className="absolute top-5 right-5 bg-[#E8622A] rounded-[14px] px-5 py-3 text-center shadow-[0_4px_20px_rgba(232,98,42,0.3)]">
            <p className="font-extrabold text-[1.35rem] text-white leading-none" style={{ fontFamily: 'var(--font-display)' }}>$2.1M</p>
            <p className="text-[0.66rem] text-white/72 uppercase tracking-[0.08em] mt-1">Paid out</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── MarqueeStrip ──────────────────────────────────────────

export function MarqueeStrip() {
  // Duplicate for seamless loop
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="overflow-hidden bg-[#0D0D0D] py-[0.85rem]" aria-hidden="true">
      <div
        className="flex gap-10 whitespace-nowrap"
        style={{ animation: 'marquee 22s linear infinite' }}
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-4 text-[#F5F0E8]/60 text-[0.76rem] font-bold tracking-[0.12em] uppercase" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="w-1 h-1 rounded-full bg-[#E8622A] flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── AboutSection ──────────────────────────────────────────
// "What KOVA does" — comes right after hero

export function AboutSection() {
  return (
    <section className="bg-[#F5F0E8] py-20 md:py-28">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">

        {/* Header */}
        <div className="max-w-[600px] mb-16 reveal">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] uppercase text-black/36 mb-3">
            What KOVA does
          </p>
          <h2
            className="font-extrabold text-[#0D0D0D] leading-[1.05] tracking-[-0.02em] mb-5"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            The marketplace that connects{' '}
            <span className="text-[#E8622A] italic">buyers and sellers</span>{' '}
            — seamlessly.
          </h2>
          <p className="text-[1rem] text-black/58 leading-[1.8]">
            KOVA isn&apos;t just a store. It&apos;s a two-sided platform where anyone can discover products and services — and where sellers get the tools to upload, manage, and grow their business from day one.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-5 reveal-stagger">

          {/* Card 1 — Buyers */}
          <div className="bg-white rounded-[20px] p-7 border border-black/[0.07] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="w-11 h-11 rounded-full bg-[#E8622A]/[0.12] flex items-center justify-center mb-5">
              <span className="text-[#E8622A] text-xl">🛍</span>
            </div>
            <h3 className="font-bold text-[1.05rem] mb-2 text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
              Buyers discover everything
            </h3>
            <p className="text-[0.9rem] text-black/54 leading-relaxed">
              From handcrafted physical goods to premium digital templates and expert services — browse thousands of listings across every category.
            </p>
          </div>

          {/* Card 2 — Sellers */}
          <div className="bg-[#0D0D0D] rounded-[20px] p-7 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="w-11 h-11 rounded-full bg-[#E8622A]/20 flex items-center justify-center mb-5">
              <span className="text-[#E8622A] text-xl">📦</span>
            </div>
            <h3 className="font-bold text-[1.05rem] mb-2 text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              Sellers upload and grow
            </h3>
            <p className="text-[0.9rem] text-[#F5F0E8]/80 leading-relaxed">
              List your products in minutes. Get access to a global audience, seller analytics, reviews, and instant payouts — all in one dashboard.
            </p>
          </div>

          {/* Card 3 — Platform */}
          <div className="bg-[#2A5C45] rounded-[20px] p-7 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="w-11 h-11 rounded-full bg-white/[0.12] flex items-center justify-center mb-5">
              <span className="text-white text-xl">🔒</span>
            </div>
            <h3 className="font-bold text-[1.05rem] mb-2 text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              Safe and transparent
            </h3>
            <p className="text-[0.9rem] text-[#F5F0E8]/55 leading-relaxed">
              Every transaction is protected. Buyer guarantees, seller verification, escrow payments, and a dispute resolution system built for trust.
            </p>
          </div>
        </div>

        {/* Bottom visual — split layout */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 items-center reveal">
          {/* Image */}
          <div className="relative h-[340px] rounded-[20px] overflow-hidden">
            {/* SWAP: <Image src="/images/about-sellers.jpg" alt="Sellers using KOVA" fill className="object-cover" /> */}
            <Image src="/images/about-sellers.jpg" alt="About section — seller dashboard or product upload" fill className="object-cover" />
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '48K+',  sub: 'Active sellers worldwide' },
              { num: '190+',  sub: 'Countries reached' },
              { num: '$2.1M', sub: 'Paid out to creators' },
              { num: '4.9★',  sub: 'Average seller rating' },
            ].map(stat => (
              <div key={stat.num} className="bg-white rounded-[16px] p-6 border border-black/[0.07]">
                <p className="font-extrabold text-[2.2rem] leading-none text-[#0D0D0D] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  {stat.num}
                </p>
                <p className="text-[0.82rem] text-black/48">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
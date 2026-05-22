'use client';
// ============================================================
// KOVA — /sellers/dashboard
// Premium seller command center. Conversion-first layout.
// Visual hierarchy: earnings → orders → listings → actions
// ============================================================

import Link from 'next/link';
import { DashboardStats } from '../../Component/dashboard/dashboardStats';
import { DashboardProducts } from '../../Component/dashboard/dashboardProducts';
import { DashboardOrders, EarningsChart } from '../../Component/dashboard/dashboardOrders';

// ── Seller header banner ──────────────────────────────────

function SellerBanner() {
  return (
    <div className="relative rounded-[18px] sm:rounded-[24px] overflow-hidden mb-6 sm:mb-8">
      {/* Background */}
      <img
        src="/images/dashboard-banner.jpg"
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(100deg, rgba(13,13,13,0.92) 0%, rgba(13,13,13,0.6) 55%, rgba(232,98,42,0.2) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-5 sm:px-8 py-6 sm:py-8 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5 sm:gap-6">
        <div>
          {/* Seller badge */}
          <div className="inline-flex items-center gap-2 bg-[#E8622A]/20 border border-[#E8622A]/30 rounded-full px-3 py-1 mb-3 sm:mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8622A]" />
            <span className="text-[0.66rem] sm:text-[0.7rem] font-semibold text-[#E8622A] uppercase tracking-[0.1em]">
              Verified Seller
            </span>
          </div>

          <h1
            className="font-extrabold text-[#F5F0E8] leading-[1.0] tracking-[-0.02em] mb-2"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.35rem, 6vw, 2.4rem)' }}
          >
            Good morning, Marvel. 👋
          </h1>
          <p className="text-[#F5F0E8]/55 text-[0.82rem] sm:text-[0.9rem]">
            You have <span className="text-[#E8622A] font-semibold">3 new orders</span> waiting for review.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col xs:flex-row flex-wrap gap-2.5 sm:gap-3 w-full md:w-auto">
          <Link
            href="/sellers/new"
            className="px-5 py-2.5 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(232,98,42,0.4)] transition-all duration-200 flex items-center justify-center gap-2 text-center"
          >
            <span className="text-base leading-none">+</span>
            New product
          </Link>
          <Link
            href="/shopping"
            className="px-5 py-2.5 rounded-full border border-[#F5F0E8]/20 text-[#F5F0E8] text-sm font-medium hover:border-[#F5F0E8]/45 hover:bg-[#F5F0E8]/[0.06] transition-all duration-200 text-center"
          >
            View your store →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function SellerDashboard() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Dark top bar */}
      <div className="bg-[#0D0D0D] px-4 sm:px-5 md:px-8 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="inline-flex items-center gap-2 min-w-0">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="#1A1A1A" />
              <rect x="9" y="8" width="4" height="20" rx="2" fill="#F5F0E8" />
              <path d="M13 18 L24 8" stroke="#E8622A" strokeWidth="4" strokeLinecap="round" />
              <path d="M13 18 L24 28" stroke="#F5F0E8" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <span
              className="font-extrabold text-[1.02rem] sm:text-[1.1rem] text-[#F5F0E8] tracking-[-0.02em] truncate"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              K<span className="text-[#E8622A]">O</span>VA
            </span>
          </Link>

          <span className="text-[#F5F0E8]/20 text-sm hidden sm:inline">/</span>
          <span className="text-[#F5F0E8]/50 text-[0.78rem] sm:text-sm truncate hidden sm:inline">
            Seller Dashboard
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <Link
            href="/sellers/new"
            className="hidden sm:block text-[0.8rem] text-[#F5F0E8]/60 hover:text-[#F5F0E8] transition-colors"
          >
            + Add product
          </Link>
          <div className="w-8 h-8 rounded-full bg-[#E8622A] flex items-center justify-center text-white text-sm font-bold">
            M
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8 py-6 sm:py-8">
        {/* Banner */}
        <SellerBanner />

        {/* Stats row */}
        <div className="mb-6 sm:mb-8">
          <DashboardStats />
        </div>

        {/* Middle row — chart + quick tip */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-5 sm:gap-6 mb-6 sm:mb-8">
          <EarningsChart />

          {/* Performance tip card */}
          <div className="bg-[#0D0D0D] rounded-[16px] sm:rounded-[20px] p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <span className="text-[0.66rem] sm:text-[0.68rem] font-semibold text-[#E8622A] uppercase tracking-[0.1em]">
                💡 Tip of the week
              </span>
              <h3
                className="font-bold text-[0.98rem] sm:text-[1.05rem] text-[#F5F0E8] mt-3 mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Add 3+ images to boost conversions
              </h3>
              <p className="text-[0.82rem] sm:text-[0.85rem] text-[#F5F0E8]/50 leading-relaxed">
                Listings with multiple images convert 62% better. Update your top products today.
              </p>
            </div>
            <Link
              href="/sellers/new"
              className="mt-5 sm:mt-6 inline-flex items-center gap-2 text-[0.8rem] sm:text-[0.82rem] font-medium text-[#E8622A] hover:opacity-70 transition-opacity"
            >
              Update listings →
            </Link>
          </div>
        </div>

        {/* Bottom row — orders + payout */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-5 sm:gap-6 mb-6 sm:mb-8">
          <DashboardOrders />

          {/* Payout summary */}
          <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-5 sm:p-6">
            <h2
              className="font-bold text-[0.95rem] sm:text-[1rem] text-[#0D0D0D] mb-5"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Payout summary
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Available balance', value: '$1,240.00', highlight: true },
                { label: 'Pending clearance', value: '$380.00', highlight: false },
                { label: 'Total earned (all time)', value: '$4,280.00', highlight: false },
                { label: 'KOVA fee (5%)', value: '-$214.00', highlight: false },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex justify-between items-center py-3 ${
                    row.highlight
                      ? 'bg-[#E8622A]/[0.06] px-4 rounded-[12px] -mx-4'
                      : 'border-b border-black/[0.05]'
                  }`}
                >
                  <span className="text-[0.8rem] sm:text-[0.85rem] text-black/55">{row.label}</span>
                  <span
                    className={`font-bold text-[0.9rem] sm:text-[0.95rem] ${
                      row.highlight ? 'text-[#E8622A]' : 'text-[#0D0D0D]'
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="w-full mt-6 py-3 rounded-full bg-[#0D0D0D] text-[#F5F0E8] text-sm font-medium hover:bg-[#E8622A] transition-all duration-200"
            >
              Request payout
            </button>
          </div>
        </div>

        {/* Full width products table */}
        <DashboardProducts />
      </div>
    </div>
  );
}
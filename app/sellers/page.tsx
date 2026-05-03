// ============================================================
// KOVA — /sellers
// Seller landing: hero, perks, how-to-start, FAQ, CTA.
// ============================================================

import Link from 'next/link';
import { ImageSlot } from '../Component/ImageSlot';
import { SectionLabel } from '../ui/Atom';
const PERKS = [
  {
    icon: '🌍',
    title: 'Global reach',
    desc: 'List once and instantly reach buyers across 190+ countries with zero extra effort.',
  },
  {
    icon: '💸',
    title: 'Instant payouts',
    desc: 'Get paid fast. Withdraw to your bank, mobile money, or preferred payment method.',
  },
  {
    icon: '📊',
    title: 'Seller analytics',
    desc: 'See who\'s viewing your listings, what\'s converting, and where your buyers are from.',
  },
  {
    icon: '🛡️',
    title: 'Built-in trust',
    desc: 'Verified seller badges, rating system, and dispute resolution — all handled for you.',
  },
  {
    icon: '⚡',
    title: 'List in minutes',
    desc: 'Simple product upload. Add images, set your price, write a description — done.',
  },
  {
    icon: '🎯',
    title: 'Low fees',
    desc: 'We only earn when you earn. Transparent fee structure, no hidden charges.',
  },
];

const STEPS = [
  { n: '01', title: 'Create your seller account', desc: 'Sign up free. Your buyer account doubles as your seller account — no separate login needed.' },
  { n: '02', title: 'Set up your seller profile', desc: 'Add your store name, bio, and profile image. First impressions matter — make yours count.' },
  { n: '03', title: 'Upload your first product', desc: 'Add photos, write your description, set your price. Physical, digital, or service — all supported.' },
  { n: '04', title: 'Start earning', desc: 'Your listing goes live instantly. Share it or let KOVA\'s discovery engine bring buyers to you.' },
];

const FAQS = [
  { q: 'Is it free to list on KOVA?', a: 'Yes. Creating a seller account and listing products is completely free. We charge a small transaction fee only when you make a sale.' },
  { q: 'What can I sell on KOVA?', a: 'Physical goods, digital products (templates, courses, designs, music), and services (freelance work, consulting, coaching). If it has value, you can sell it.' },
  { q: 'How do I get paid?', a: 'Once an order is confirmed, funds are released to your KOVA wallet. You can withdraw to your bank account, mobile money, or supported payment platforms at any time.' },
  { q: 'Can I sell from Nigeria or other African countries?', a: 'Absolutely. KOVA is built with global sellers in mind — including African creators, makers, and entrepreneurs. We support local payout methods.' },
  { q: 'How do I handle shipping for physical products?', a: 'You set your own shipping terms. KOVA provides tools to define shipping zones, rates, and delivery estimates. We also integrate with major courier services.' },
];

// ── FAQ accordion item ────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-black/[0.08] last:border-0">
      <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none select-none">
        <span
          className="font-semibold text-[0.95rem] text-[#0D0D0D]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {q}
        </span>
        <span className="flex-shrink-0 w-6 h-6 rounded-full border border-black/15 flex items-center justify-center text-black/50 group-open:rotate-45 transition-transform duration-200 text-lg leading-none">
          +
        </span>
      </summary>
      <p className="pb-5 text-[0.9rem] text-black/55 leading-relaxed">
        {a}
      </p>
    </details>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function SellersPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* ── Hero ── */}
      <section className="bg-[#0D0D0D] pt-14 pb-20 overflow-hidden relative">
        {/* Ambient blob */}
        <div
          aria-hidden="true"
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: '#E8622A', top: -150, right: -100 }}
        />

        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-10 items-center relative z-10">
          <div>
            <SectionLabel light>Sell on KOVA</SectionLabel>
            <h1
              className="font-extrabold text-[#F5F0E8] leading-[0.97] tracking-[-0.03em] mb-6"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              }}
            >
              Your products.<br />
              The world&apos;s<br />
              <span className="text-[#E8622A] italic">marketplace.</span>
            </h1>
            <p className="text-[1rem] text-[#F5F0E8]/55 leading-[1.8] mb-8 max-w-[420px]">
              Join 48,000+ sellers already growing their business on KOVA. List for free, reach global buyers, and get paid fast.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#start"
                className="px-7 py-[0.9rem] rounded-full bg-[#E8622A] text-white font-medium hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(232,98,42,0.35)] transition-all duration-250"
              >
                Start selling free
              </Link>
              <Link
                href="#faq"
                className="px-7 py-[0.9rem] rounded-full border border-[#F5F0E8]/20 text-[#F5F0E8] font-medium hover:border-[#F5F0E8]/45 hover:bg-[#F5F0E8]/[0.05] transition-all duration-200"
              >
                See how it works
              </Link>
            </div>
          </div>

          {/* Hero image */}
            <div className="relative h-[380px] rounded-[24px] overflow-hidden">
              <img
                src="/images/sellers-hero.jpg"
                alt="Seller dashboard"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#E8622A]/10 to-transparent pointer-events-none" />
                    </div>
                    </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="bg-[#E8622A] py-6">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { n: '48K+',  l: 'Active sellers' },
            { n: '190+',  l: 'Countries' },
            { n: '$2.1M', l: 'Paid out' },
            { n: 'Free',  l: 'To get started' },
          ].map(s => (
            <div key={s.n}>
              <p className="font-extrabold text-white text-[1.8rem] leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                {s.n}
              </p>
              <p className="text-white/70 text-[0.8rem] mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Perks ── */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="text-center max-w-[500px] mx-auto mb-14">
            <SectionLabel>Why sellers choose KOVA</SectionLabel>
            <h2
              className="font-extrabold text-[#0D0D0D] leading-[1.05] tracking-[-0.02em]"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
            >
              Everything you need to grow
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PERKS.map(perk => (
              <div
                key={perk.title}
                className="bg-white rounded-[18px] p-6 border border-black/[0.07] hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-full bg-[#E8622A]/[0.1] flex items-center justify-center text-xl mb-4">
                  {perk.icon}
                </div>
                <h3
                  className="font-bold text-[1rem] text-[#0D0D0D] mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {perk.title}
                </h3>
                <p className="text-[0.875rem] text-black/54 leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to start ── */}
      <section id="start" className="bg-[#0D0D0D] py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="mb-12">
            <SectionLabel light>Get started</SectionLabel>
            <h2
              className="font-extrabold text-[#F5F0E8] leading-[1.05] tracking-[-0.02em]"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
            >
              Start selling in 4 steps
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map(step => (
              <div
                key={step.n}
                className="group p-6 rounded-[16px] border border-[#F5F0E8]/[0.08] border-l-[3px] border-l-[#F5F0E8]/[0.06] hover:bg-[#E8622A]/[0.14] hover:border-[#E8622A] hover:border-l-[#E8622A] hover:-translate-y-[3px] transition-all duration-300"
              >
                <p
                  className="font-extrabold text-[2.4rem] text-[#E8622A] opacity-50 leading-none mb-4 group-hover:opacity-90 transition-opacity"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {step.n}
                </p>
                <p
                  className="font-bold text-[1rem] text-[#F5F0E8] mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {step.title}
                </p>
                <p className="text-[0.84rem] text-[#F5F0E8]/50 leading-relaxed group-hover:text-[#F5F0E8]/85 transition-colors">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/shopping"
              className="inline-block px-9 py-[1rem] rounded-full bg-[#E8622A] text-white font-medium text-[1rem] hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(232,98,42,0.35)] transition-all duration-250"
            >
              Create your seller account →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 md:py-28">
        <div className="max-w-[760px] mx-auto px-5 md:px-8">
          <div className="text-center mb-12">
            <SectionLabel>Questions</SectionLabel>
            <h2
              className="font-extrabold text-[#0D0D0D] leading-[1.05] tracking-[-0.02em]"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
            >
              Frequently asked
            </h2>
          </div>

          <div className="bg-white rounded-[20px] border border-black/[0.07] px-6 md:px-8">
            {FAQS.map(faq => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="pb-20 px-5 md:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="relative bg-[#E8622A] rounded-[28px] px-8 md:px-16 py-16 text-center overflow-hidden">
            <div aria-hidden="true" className="absolute w-[420px] h-[420px] rounded-full bg-white/[0.07] -top-[120px] -right-[90px] pointer-events-none" />
            <div aria-hidden="true" className="absolute w-[260px] h-[260px] rounded-full bg-white/[0.07] -bottom-[90px] -left-[60px] pointer-events-none" />
            <h2
              className="relative font-extrabold text-white leading-[1.05] tracking-[-0.02em] mb-3"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
            >
              Ready to start selling?
            </h2>
            <p className="relative text-white/72 mb-8 max-w-[400px] mx-auto">
              Join thousands of sellers already earning on KOVA. Free to start, no credit card needed.
            </p>
            <Link
              href="#start"
              className="relative inline-block px-9 py-[0.9rem] rounded-full bg-white text-[#E8622A] font-medium hover:scale-[1.03] hover:shadow-md transition-all duration-200"
            >
              Get started free
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
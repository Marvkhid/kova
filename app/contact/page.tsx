// ============================================================
// KOVA — /contact
// Direct contact channels. No fake form submissions — the mailto
// handler opens the user's email client with everything prefilled.
// ============================================================

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — KOVA',
  description:
    'Get in touch with the KOVA team — questions about orders, selling, listings or partnerships.',
};

const CONTACT_EMAIL = 'adeniyimarv@gmail.com';
const CONTACT_PHONE_DISPLAY = '0810 738 7326';
const CONTACT_PHONE_TEL = '+2348107387326';

const TOPICS = [
  {
    photo: '/images/seed/photo/electronics/electronics-p05.jpg',
    title: 'Order or product question',
    body: 'Questions about a listing, an order or a seller? Include the product link when you write.',
  },
  {
    photo: '/images/seed/photo/furniture/furniture-p05.jpg',
    title: 'Selling on KOVA',
    body: 'Everything about opening a store is on the Sell page — but we are happy to help you get set up.',
  },
  {
    photo: '/images/seed/photo/fashion/fashion-p05.jpg',
    title: 'Report a listing',
    body: 'Something looks wrong or dishonest? Send the product link and we will review it.',
  },
  {
    photo: '/images/seed/photo/interior-home/interior-home-p05.jpg',
    title: 'Partnerships',
    body: 'Brands, creators and organisations — tell us what you have in mind.',
  },
];

export default function ContactPage() {
  return (
    <div className="bg-[#F5F0E8] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8 py-12 sm:py-16">
        <div className="max-w-[640px] mb-10 sm:mb-12">
          <span className="inline-block text-[0.66rem] font-semibold tracking-[0.18em] uppercase text-[#E8622A] bg-[#E8622A]/[0.08] rounded-full px-4 py-1.5 mb-5">
            Contact
          </span>
          <h1
            className="font-extrabold text-[#0D0D0D] leading-[1.02] tracking-[-0.03em] mb-4"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 7vw, 3rem)' }}
          >
            Talk to us.
          </h1>
          <p className="text-black/50 text-[0.95rem] leading-relaxed">
            Questions about an order, selling, or anything else — email us and we will get back
            to you. For anything urgent, call during business hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-4 sm:gap-5">
          {/* Direct channels */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#0D0D0D] rounded-[16px] sm:rounded-[20px] p-6 sm:p-7 text-[#F5F0E8]">
              <h2 className="font-extrabold text-[1.02rem] mb-5" style={{ fontFamily: 'var(--font-display)' }}>
                Direct contact
              </h2>
              <a href={`mailto:${CONTACT_EMAIL}`} className="group flex items-start gap-3 mb-4">
                <span className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/seed/photo/digital-products/digital-products-p05.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.64rem] uppercase tracking-[0.1em] text-[#F5F0E8]/35 mb-0.5">Email</span>
                  <span className="block text-[0.86rem] font-medium break-all group-hover:text-[#E8622A] transition-colors">{CONTACT_EMAIL}</span>
                </span>
              </a>
              <a href={`tel:${CONTACT_PHONE_TEL}`} className="group flex items-start gap-3">
                <span className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/seed/photo/electronics/electronics-p08.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
                </span>
                <span>
                  <span className="block text-[0.64rem] uppercase tracking-[0.1em] text-[#F5F0E8]/35 mb-0.5">Phone</span>
                  <span className="block text-[0.86rem] font-medium group-hover:text-[#E8622A] transition-colors">{CONTACT_PHONE_DISPLAY}</span>
                </span>
              </a>
            </div>

            <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-6 sm:p-7">
              <h2 className="font-extrabold text-[0.98rem] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                Response times
              </h2>
              <ul className="space-y-2.5 text-[0.83rem] text-black/55">
                <li className="flex justify-between gap-3"><span>Email enquiries</span><span className="font-medium text-[#0D0D0D]">Within 1 business day</span></li>
                <li className="flex justify-between gap-3"><span>Phone lines</span><span className="font-medium text-[#0D0D0D]">Mon–Fri, 9am–6pm</span></li>
                <li className="flex justify-between gap-3"><span>Reported listings</span><span className="font-medium text-[#0D0D0D]">Prioritised</span></li>
              </ul>
            </div>
          </div>

          {/* Topic cards */}
          <div>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {TOPICS.map((t) => (
                <div key={t.title} className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-6 flex flex-col">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#E8622A]/[0.1] flex-shrink-0 mb-4" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.photo} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <h3 className="font-bold text-[0.95rem] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    {t.title}
                  </h3>
                  <p className="text-[0.83rem] text-black/50 leading-relaxed mb-5 flex-1">{t.body}</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`KOVA — ${t.title}`)}`}
                    className="text-[0.8rem] font-medium text-[#E8622A] hover:opacity-70 transition-opacity"
                  >
                    Email about this →
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-6 sm:p-7">
              <h2 className="font-extrabold text-[0.98rem] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Before you write
              </h2>
              <p className="text-[0.83rem] text-black/50 leading-relaxed mb-4">
                Sellers can manage listings, view stats and handle their store from the{' '}
                <Link href="/sellers/dashboard" className="text-[#E8622A] font-medium hover:opacity-70">seller dashboard</Link>.
                Buyers can find orders and saved items in{' '}
                <Link href="/profile" className="text-[#E8622A] font-medium hover:opacity-70">your profile</Link>.
              </p>
              <p className="text-[0.78rem] text-black/40">
                When reporting a problem, include the product link — it helps us act fast.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

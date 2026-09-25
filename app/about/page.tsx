import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — Kova',
  description:
    'Kova is a digital marketplace connecting buyers and sellers. Discover products from independent sellers, or open your own store and sell physical and digital products.',
};

const VALUES = [
  {
    title: 'Real products, real sellers',
    body: 'Every listing on Kova belongs to a real seller — an individual or a business. What you see is what someone actually listed.',
  },
  {
    title: 'Physical and digital, side by side',
    body: 'Sell handmade goods, fashion, crafts and other physical products — or courses, templates, ebooks and digital products. Sellers tell us what kind of product they are listing, and the platform is built around that.',
  },
  {
    title: 'Discoverable by design',
    body: 'New products surface in New Arrivals the moment they are published. No gatekeepers, no manual approval queue between a seller and the marketplace.',
  },
  {
    title: 'Built for sharing',
    body: 'Every published product gets a stable public link and a QR code. Post it on WhatsApp, print it on a flyer, add it to an Instagram bio — the link keeps working.',
  },
];

const STEPS = [
  { n: '01', title: 'Discover', body: 'Browse categories, search the marketplace, or scan a product QR code you found out in the world. No account needed to look around.' },
  { n: '02', title: 'Open a store', body: 'Sign in once — Google works — and activate a seller account from the same login. Store name, address, done.' },
  { n: '03', title: 'List your products', body: 'Physical products guide you through uploading front, back, side and detail shots. Digital products get their own listing flow.' },
  { n: '04', title: 'Publish and share', body: 'Publish when you are ready. Your listing goes live with a permanent URL and a QR code you can share anywhere.' },
];

export default function AboutPage() {
  return (
    <div className="bg-[#F5F0E8]">
      {/* Hero */}
      <section className="px-4 sm:px-5 md:px-8 pt-14 sm:pt-20 pb-12 sm:pb-16">
        <div className="max-w-[1280px] mx-auto">
          <div className="max-w-[720px]">
            <span className="inline-block text-[0.66rem] font-semibold tracking-[0.18em] uppercase text-[#E8622A] bg-[#E8622A]/[0.08] rounded-full px-4 py-1.5 mb-6">
              About Kova
            </span>
            <h1
              className="font-extrabold text-[#0D0D0D] leading-[1.02] tracking-[-0.03em] mb-6"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 8vw, 3.6rem)' }}
            >
              A marketplace where buyers and sellers meet.
            </h1>
            <p className="text-black/55 text-[1rem] sm:text-[1.1rem] leading-relaxed max-w-[620px]">
              Kova is a digital marketplace built to connect people who make and sell things with the people
              looking for them. Anyone can browse and discover products from independent sellers. Anyone with
              an account can open a store and start selling — physical goods or digital products — in minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 sm:px-5 md:px-8 pb-12 sm:pb-16">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-6 sm:p-8">
                <h2 className="font-extrabold text-[1.02rem] sm:text-[1.15rem] mb-2.5" style={{ fontFamily: 'var(--font-display)' }}>
                  {v.title}
                </h2>
                <p className="text-[0.88rem] text-black/50 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 sm:px-5 md:px-8 pb-12 sm:pb-16">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="font-extrabold text-[1.4rem] sm:text-[1.8rem] tracking-[-0.02em] mb-7" style={{ fontFamily: 'var(--font-display)' }}>
            How Kova works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-white rounded-[16px] border border-black/[0.07] p-6">
                <span className="text-[#E8622A] font-extrabold text-[0.9rem] tracking-[0.06em]" style={{ fontFamily: 'var(--font-display)' }}>
                  {s.n}
                </span>
                <h3 className="font-bold text-[0.98rem] mt-3 mb-2">{s.title}</h3>
                <p className="text-[0.82rem] text-black/50 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision + CTA */}
      <section className="px-4 sm:px-5 md:px-8 pb-16 sm:pb-24">
        <div className="max-w-[1280px] mx-auto">
          <div className="bg-[#0D0D0D] rounded-[20px] sm:rounded-[24px] px-6 sm:px-10 py-10 sm:py-14 text-center">
            <h2
              className="text-[#F5F0E8] font-extrabold leading-[1.08] tracking-[-0.02em] mb-4 mx-auto max-w-[640px]"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 5vw, 2.2rem)' }}
            >
              One platform. Every seller. Every product.
            </h2>
            <p className="text-[#F5F0E8]/55 text-[0.92rem] sm:text-[1rem] leading-relaxed max-w-[560px] mx-auto mb-8">
              We are building Kova to be the simplest way to put a real product in front of real buyers — with
              honest listings, stable links and tools that respect both sides of the marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/shopping"
                className="px-7 py-3 rounded-full bg-[#F5F0E8] text-[#0D0D0D] font-medium hover:bg-white transition-colors"
              >
                Browse the marketplace
              </Link>
              <Link
                href="/sell"
                className="px-7 py-3 rounded-full bg-[#E8622A] text-white font-medium hover:bg-[#F07A48] transition-colors"
              >
                Start selling
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// KOVA — /about
// Mission, values, team, story. Premium immersive layout.
// ============================================================

import Link from 'next/link';

const VALUES = [
  { icon: '🌍', title: 'Global by design',    desc: 'Built for sellers and buyers everywhere — not just major markets. KOVA works across 190+ countries with local payment support.' },
  { icon: '⚡', title: 'Speed over friction',  desc: 'List in minutes, not days. Buy in seconds, not steps. We obsess over removing every unnecessary click.' },
  { icon: '🤝', title: 'Seller-first',         desc: 'We only earn when you earn. Our fee structure, tools, and roadmap are built around seller success.' },
  { icon: '🔒', title: 'Trust as a feature',  desc: 'Verified sellers, buyer protection, escrow payments. Trust isn\'t a policy — it\'s part of the product.' },
  { icon: '🎨', title: 'Quality over quantity',desc: 'We curate. Every category has standards. Great products deserve a great platform.' },
  { icon: '📈', title: 'Built to grow',        desc: 'Analytics, reviews, SEO, and discovery tools that help every seller scale — from first listing to full business.' },
];

const TEAM = [
  { name: 'Adeniyi Marvel',   role: 'Founder & CEO',         img: 'team-marvel.jpg' },
  { name: 'Zara Okonkwo',     role: 'Head of Product',        img: 'team-zara.jpg' },
  { name: 'Kwame Asante',     role: 'Lead Engineer',          img: 'team-kwame.jpg' },
  { name: 'Priya Nair',       role: 'Head of Design',         img: 'team-priya.jpg' },
];

const MILESTONES = [
  { year: '2023', title: 'Idea born',         desc: 'KOVA started as a question: why is it so hard for African creators to sell globally?' },
  { year: '2024', title: 'First build',       desc: 'The first version of KOVA launched in private beta with 200 hand-picked sellers.' },
  { year: '2025', title: '10K sellers',       desc: 'We crossed 10,000 active sellers and $500K in total seller payouts.' },
  { year: '2026', title: 'Going global',      desc: 'KOVA opens to buyers and sellers in 190+ countries with full multi-currency support.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* ── Hero ── */}
      <section className="relative bg-[#0D0D0D] pt-20 pb-24 overflow-hidden">
        <div aria-hidden="true"
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: '#E8622A', top: -200, right: -100 }}/>
        <div aria-hidden="true"
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.04] pointer-events-none"
          style={{ background: '#2A5C45', bottom: -100, left: -80 }}/>

        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative z-10">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] uppercase text-[#F5F0E8]/30 mb-4">
            Our story
          </p>
          <h1
            className="font-extrabold text-[#F5F0E8] leading-[0.95] tracking-[-0.03em] mb-6 max-w-[760px]"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 7vw, 6rem)' }}
          >
            Built for the<br />
            world&apos;s{' '}
            <span className="text-[#E8622A] italic">creators.</span>
          </h1>
          <p className="text-[1.05rem] text-[#F5F0E8]/50 max-w-[520px] leading-[1.8]">
            KOVA exists because great products deserve global reach. We&apos;re building the marketplace that puts sellers first — everywhere.
          </p>
        </div>
      </section>

      {/* ── Mission statement ── */}
      <section className="py-20 md:py-28 bg-[#F5F0E8]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="max-w-[760px]">
            <p className="text-[0.7rem] font-medium tracking-[0.14em] uppercase text-black/35 mb-4">
              Our mission
            </p>
            <h2
              className="font-extrabold text-[#0D0D0D] leading-[1.05] tracking-[-0.03em] mb-8"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
            >
              To make buying and selling{' '}
              <span className="text-[#E8622A] italic">radically simple</span>{' '}
              for everyone, everywhere.
            </h2>
            <p className="text-[1rem] text-black/55 leading-[1.9] mb-5">
              We saw too many talented creators — designers, artisans, educators, freelancers — without a platform that truly served them. Existing marketplaces were built for big brands, not independent sellers. They were slow, expensive, and designed for markets that didn&apos;t include most of the world.
            </p>
            <p className="text-[1rem] text-black/55 leading-[1.9]">
              So we built KOVA. A marketplace that starts with the seller, obsesses over the buyer experience, and works for anyone with something valuable to offer — from Lagos to London, Manila to Miami.
            </p>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="bg-[#0D0D0D] py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] uppercase text-[#F5F0E8]/30 mb-4">
            How we got here
          </p>
          <h2
            className="font-extrabold text-[#F5F0E8] leading-[1.05] tracking-[-0.02em] mb-14"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
          >
            The KOVA timeline
          </h2>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-[1px] bg-[#F5F0E8]/[0.08]" aria-hidden="true"/>

            <div className="flex flex-col gap-12">
              {MILESTONES.map((m, i) => (
                <div key={m.year}
                  className={`relative flex flex-col md:flex-row gap-6 md:gap-12 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                  {/* Dot */}
                  <div className="absolute left-[11px] md:left-1/2 md:-translate-x-1/2 top-1 w-4 h-4 rounded-full bg-[#E8622A] border-[3px] border-[#0D0D0D] z-10"/>

                  {/* Content */}
                  <div className={`pl-10 md:pl-0 md:w-1/2 ${i % 2 === 0 ? 'md:text-right md:pr-14' : 'md:pl-14'}`}>
                    <p className="font-extrabold text-[#E8622A] text-[1rem] mb-1"
                      style={{ fontFamily: 'var(--font-display)' }}>
                      {m.year}
                    </p>
                    <p className="font-bold text-[#F5F0E8] text-[1.1rem] mb-2"
                      style={{ fontFamily: 'var(--font-display)' }}>
                      {m.title}
                    </p>
                    <p className="text-[0.875rem] text-[#F5F0E8]/45 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                  <div className="hidden md:block md:w-1/2"/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 md:py-28 bg-[#F5F0E8]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] uppercase text-black/35 mb-4">
            What we believe
          </p>
          <h2
            className="font-extrabold text-[#0D0D0D] leading-[1.05] tracking-[-0.02em] mb-12 max-w-[480px]"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
          >
            Our values
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUES.map(v => (
              <div key={v.title}
                className="bg-white rounded-[20px] p-6 border border-black/[0.07] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <div className="w-11 h-11 rounded-full bg-[#E8622A]/[0.1] flex items-center justify-center text-xl mb-4">
                  {v.icon}
                </div>
                <h3 className="font-bold text-[1rem] text-[#0D0D0D] mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  {v.title}
                </h3>
                <p className="text-[0.875rem] text-black/52 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="bg-[#EDE8DF] py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] uppercase text-black/35 mb-4">
            The people
          </p>
          <h2
            className="font-extrabold text-[#0D0D0D] leading-[1.05] tracking-[-0.02em] mb-12"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
          >
            Who builds KOVA
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {TEAM.map(member => (
              <div key={member.name} className="group">
                <div className="aspect-square rounded-[20px] overflow-hidden bg-[#D4CFC5] mb-4 relative">
                  <img
                    src={`/images/${member.img}`}
                    alt={member.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    className="transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                </div>
                <p className="font-bold text-[0.95rem] text-[#0D0D0D]"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  {member.name}
                </p>
                <p className="text-[0.78rem] text-black/45 mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#F5F0E8] py-16 md:py-20">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="relative bg-[#E8622A] rounded-[28px] px-8 md:px-16 py-16 text-center overflow-hidden">
            <div aria-hidden="true" className="absolute w-[420px] h-[420px] rounded-full bg-white/[0.07] -top-[120px] -right-[90px] pointer-events-none"/>
            <div aria-hidden="true" className="absolute w-[260px] h-[260px] rounded-full bg-white/[0.07] -bottom-[90px] -left-[60px] pointer-events-none"/>
            <h2
              className="relative font-extrabold text-white leading-[1.05] tracking-[-0.02em] mb-3"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Ready to be part of it?
            </h2>
            <p className="relative text-white/72 mb-8 max-w-[400px] mx-auto">
              Join the marketplace built for creators, makers, and sellers everywhere.
            </p>
            <div className="relative flex flex-wrap gap-3 justify-center">
              <Link href="/shopping"
                className="px-8 py-[0.9rem] rounded-full bg-white text-[#E8622A] font-medium hover:scale-[1.03] hover:shadow-md transition-all duration-200">
                Start shopping
              </Link>
              <Link href="/sellers"
                className="px-8 py-[0.9rem] rounded-full border border-white/40 text-white font-medium hover:border-white hover:bg-white/[0.08] transition-all duration-200">
                Start selling →
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
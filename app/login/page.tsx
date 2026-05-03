'use client';
// ============================================================
// KOVA — /login
// Netflix-style dark split layout.
// Left: full background image with KOVA branding overlay
// Right: login / signup form with tab switcher
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { LoginForm }  from '../Component/sections/loginForm';
import { SignupForm } from '../Component/sections/signUpForm';

type Tab = 'login' | 'signup';
 
function TabSwitcher({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex bg-black/[0.06] rounded-full p-1 mb-8">
      {(['login', 'signup'] as Tab[]).map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={[
            'flex-1 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize',
            active === tab
              ? 'bg-white text-[#0D0D0D] shadow-sm'
              : 'text-black/50 hover:text-black/80',
          ].join(' ')}
        >
          {tab === 'login' ? 'Log in' : 'Sign up'}
        </button>
      ))}
    </div>
  );
}
 
export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('login');
 
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
 
      {/* ── MOBILE: full-width hero image (shows above form on small screens) ── */}
      <div className="relative w-full h-[260px] sm:h-[320px] lg:hidden overflow-hidden">
        <img
          src="/images/auth-bg.jpg"
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Dark overlay on mobile image */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(13,13,13,0.45) 0%, rgba(13,13,13,0.75) 100%)',
          }}
        />
        {/* Trust stats over mobile image */}
        <div className="absolute bottom-6 left-6 right-6 flex gap-6 z-10">
          {[
            { n: '48K+', l: 'Sellers' },
            { n: '190+', l: 'Countries' },
            { n: '4.9★', l: 'Rating' },
          ].map(s => (
            <div key={s.n}>
              <p className="font-extrabold text-[1.2rem] text-[#F5F0E8] leading-none"
                style={{ fontFamily: 'var(--font-display)' }}>
                {s.n}
              </p>
              <p className="text-[0.72rem] text-[#F5F0E8]/55 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
 
      {/* ── DESKTOP: left image panel ── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
 
        <img
          src="/images/auth-bg.jpg"
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
 
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(13,13,13,0.85) 0%, rgba(13,13,13,0.5) 60%, rgba(232,98,42,0.15) 100%)',
          }}
        />
 
        {/* Bottom copy only — no logo overlay */}
        <div className="relative z-10 mt-auto">
          <p
            className="font-extrabold text-[#F5F0E8] leading-[1.0] tracking-[-0.03em] mb-4"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.5vw, 3.2rem)' }}
          >
            Buy. Sell.<br />
            <span className="text-[#E8622A] italic">Grow.</span>
          </p>
          <p className="text-[#F5F0E8]/55 text-[1rem] leading-relaxed max-w-[380px]">
            Join 48,000+ buyers and sellers already building their future on KOVA.
          </p>
          <div className="flex gap-6 mt-8">
            {[
              { n: '48K+', l: 'Sellers' },
              { n: '190+', l: 'Countries' },
              { n: '4.9★', l: 'Rating' },
            ].map(s => (
              <div key={s.n}>
                <p className="font-extrabold text-[1.4rem] text-[#F5F0E8] leading-none"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  {s.n}
                </p>
                <p className="text-[0.75rem] text-[#F5F0E8]/45 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      {/* ── Form panel (mobile + desktop) ── */}
      <div className="flex-1 flex flex-col justify-center bg-[#F5F0E8] px-6 py-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-[420px] mx-auto">
 
          {/* Logo — shows on all screen sizes */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="#0D0D0D"/>
              <rect x="9" y="8" width="4" height="20" rx="2" fill="#F5F0E8"/>
              <path d="M13 18 L24 8" stroke="#E8622A" strokeWidth="4" strokeLinecap="round"/>
              <path d="M13 18 L24 28" stroke="#F5F0E8" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            <span className="font-extrabold text-[1.25rem] tracking-[-0.03em] text-[#0D0D0D]"
              style={{ fontFamily: 'var(--font-display)' }}>
              K<span className="text-[#E8622A]">O</span>VA
            </span>
          </Link>
 
          {/* Heading */}
          <div className="mb-7">
            <h1
              className="font-extrabold text-[#0D0D0D] leading-[1.05] tracking-[-0.02em] mb-2"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2rem)' }}
            >
              {tab === 'login' ? 'Welcome back.' : 'Join KOVA.'}
            </h1>
            <p className="text-[0.9rem] text-black/48">
              {tab === 'login'
                ? 'Log in to your account to continue.'
                : 'Create your free account in seconds.'}
            </p>
          </div>
 
          <TabSwitcher active={tab} onChange={setTab} />
 
          {tab === 'login'
            ? <LoginForm  onSwitchTab={() => setTab('signup')} />
            : <SignupForm onSwitchTab={() => setTab('login')}  />
          }
 
        </div>
      </div>
 
    </div>
  );
}
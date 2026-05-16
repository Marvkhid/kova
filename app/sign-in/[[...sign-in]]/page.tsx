// ============================================================
// KOVA — /sign-in
// Clerk sign-in with full KOVA branding.
// Responsive: image top on mobile, left panel on desktop.
// ============================================================

import { SignIn } from '@clerk/nextjs';
 
export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F5F0E8]">
 
      {/* ── Mobile hero strip ── */}
      <div className="relative h-[200px] lg:hidden overflow-hidden flex-shrink-0">
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
            background: 'linear-gradient(to bottom, rgba(13,13,13,0.3) 0%, rgba(13,13,13,0.85) 100%)',
          }}
        />
        {/* Logo on mobile */}
        <div className="absolute bottom-5 left-6">
          <a href="/" className="inline-flex items-center gap-2">
            <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="#1A1A1A"/>
              <rect x="9" y="8" width="4" height="20" rx="2" fill="#F5F0E8"/>
              <path d="M13 18 L24 8" stroke="#E8622A" strokeWidth="4" strokeLinecap="round"/>
              <path d="M13 18 L24 28" stroke="#F5F0E8" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            <span
              className="font-extrabold text-[1.2rem] tracking-[-0.03em] text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              K<span className="text-[#E8622A]">O</span>VA
            </span>
          </a>
        </div>
        {/* Stats on mobile */}
        <div className="absolute bottom-5 right-6 flex gap-5">
          {[{ n: '48K+', l: 'Sellers' }, { n: '4.9★', l: 'Rating' }].map(s => (
            <div key={s.n} className="text-right">
              <p className="font-extrabold text-[1rem] text-white leading-none"
                style={{ fontFamily: 'var(--font-display)' }}>{s.n}</p>
              <p className="text-[0.65rem] text-white/50 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
 
      {/* ── Desktop left panel ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-12 xl:p-16 overflow-hidden flex-shrink-0">
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
            background: 'linear-gradient(135deg, rgba(13,13,13,0.9) 0%, rgba(13,13,13,0.55) 55%, rgba(232,98,42,0.12) 100%)',
          }}
        />
 
        {/* Logo */}
        <a href="/" className="relative z-10 inline-flex items-center gap-2.5 w-fit group">
          <svg width="38" height="38" viewBox="0 0 36 36" fill="none"
            className="transition-transform duration-300 group-hover:scale-105">
            <rect width="36" height="36" rx="10" fill="#1A1A1A"/>
            <rect x="9" y="8" width="4" height="20" rx="2" fill="#F5F0E8"/>
            <path d="M13 18 L24 8" stroke="#E8622A" strokeWidth="4" strokeLinecap="round"/>
            <path d="M13 18 L24 28" stroke="#F5F0E8" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <span className="font-extrabold text-[1.4rem] tracking-[-0.03em] text-white"
            style={{ fontFamily: 'var(--font-display)' }}>
            K<span className="text-[#E8622A]">O</span>VA
          </span>
        </a>
 
        {/* Bottom copy */}
        <div className="relative z-10">
          <h2
            className="font-extrabold text-white leading-[0.97] tracking-[-0.03em] mb-4"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 3.5vw, 3.4rem)' }}
          >
            Buy. Sell.<br />
            <span className="text-[#E8622A] italic">Grow.</span>
          </h2>
          <p className="text-white/48 text-[0.95rem] leading-relaxed max-w-[340px] mb-8">
            Join 48,000+ buyers and sellers already building their future on KOVA.
          </p>
 
          {/* Stats */}
          <div className="flex gap-8">
            {[
              { n: '48K+',  l: 'Active sellers' },
              { n: '190+',  l: 'Countries' },
              { n: '4.9★',  l: 'Avg rating' },
            ].map(s => (
              <div key={s.n}>
                <p className="font-extrabold text-[1.5rem] text-white leading-none"
                  style={{ fontFamily: 'var(--font-display)' }}>{s.n}</p>
                <p className="text-[0.72rem] text-white/38 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      {/* ── Right — form panel ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16 bg-[#F5F0E8] min-h-0">
        <div className="w-full max-w-[400px] mx-auto">
 
          {/* Logo — desktop only (hidden on mobile, shown on left panel) */}
          <div className="hidden lg:block mb-8">
            <a href="/" className="inline-flex items-center gap-2 group">
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none"
                className="transition-transform duration-300 group-hover:scale-105">
                <rect width="36" height="36" rx="10" fill="#0D0D0D"/>
                <rect x="9" y="8" width="4" height="20" rx="2" fill="#F5F0E8"/>
                <path d="M13 18 L24 8" stroke="#E8622A" strokeWidth="4" strokeLinecap="round"/>
                <path d="M13 18 L24 28" stroke="#F5F0E8" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </a>
          </div>
 
          {/* Heading */}
          <div className="mb-7">
            <h1
              className="font-extrabold text-[#0D0D0D] tracking-[-0.02em] leading-[1.05] mb-1.5"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2rem)' }}
            >
              Welcome back.
            </h1>
            <p className="text-[0.88rem] text-black/45">
              Sign in to your KOVA account to continue.
            </p>
          </div>
 
          {/* Clerk SignIn — appearance overrides KOVA branding */}
          <SignIn
            appearance={{
              layout: {
                showOptionalFields: false,
              },
              elements: {
                // Root
                rootBox:           'w-full',
                card:              'bg-transparent shadow-none border-none p-0 w-full gap-0',
                cardBox:           'shadow-none border-none bg-transparent w-full',
 
                // Hide Clerk's own header — we have ours above
                headerTitle:       'hidden',
                headerSubtitle:    'hidden',
                header:            'hidden',
 
                // Social buttons
                socialButtonsBlockButton:
                  'w-full border border-black/[0.1] bg-white text-[#0D0D0D] rounded-[12px] h-[46px] font-medium text-[0.88rem] hover:bg-black/[0.03] hover:border-black/20 transition-all mb-0',
                socialButtonsBlockButtonText: 'font-medium text-[0.88rem]',
                socialButtonsProviderIcon:    'w-5 h-5',
 
                // Divider
                dividerRow:        'my-5',
                dividerLine:       'bg-black/[0.08]',
                dividerText:       'text-black/30 text-[0.7rem] uppercase tracking-[0.1em] px-3',
 
                // Form fields
                formFieldRow:      'mb-4',
                formFieldLabel:    'text-[0.8rem] font-semibold text-[#0D0D0D]/62 mb-1.5 block',
                formFieldInput:
                  'w-full bg-white border border-black/[0.09] rounded-[12px] h-[46px] px-4 text-[0.9rem] text-[#0D0D0D] placeholder:text-black/25 outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/12 transition-all',
                formFieldInputShowPasswordButton: 'text-black/35 hover:text-black/60',
 
                // Action link (forgot password etc)
                formFieldAction:   'text-[#E8622A] text-[0.78rem] font-medium hover:opacity-70 transition-opacity',
 
                // Primary button
                formButtonPrimary:
                  'w-full bg-[#E8622A] hover:bg-[#F07A48] text-white rounded-full h-[48px] font-medium text-[0.95rem] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(232,98,42,0.32)] active:scale-[0.98] mt-1',
 
                // Footer
                footer:            'mt-5',
                footerAction:      'text-center',
                footerActionText:  'text-black/45 text-[0.85rem]',
                footerActionLink:  'text-[#E8622A] font-medium hover:opacity-70 transition-opacity ml-1',
 
                // Error / alert
                formFieldErrorText: 'text-red-500 text-[0.75rem] mt-1',
                alertText:          'text-[0.82rem]',
                alert:              'rounded-[10px] border',
 
                // "Secured by Clerk" badge — hide it
                footer__branded:   'hidden',
                internal:          'hidden',
              },
              variables: {
                colorPrimary:      '#E8622A',
                colorBackground:   '#F5F0E8',
                colorInputBackground: '#ffffff',
                colorText:         '#0D0D0D',
                colorTextSecondary:'rgba(13,13,13,0.5)',
                colorDanger:       '#E53E3E',
                borderRadius:      '12px',
                fontFamily:        'var(--font-body)',
                fontSize:          '0.9rem',
                spacingUnit:       '16px',
              },
            }}
            forceRedirectUrl="/shopping"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  );
}
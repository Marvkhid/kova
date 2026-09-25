'use client';

// ============================================================
// KOVA — RouteProgress
// Refined top progress bar during <Link> navigations.
// Feedback only — never blocks interaction.
// ============================================================

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);

  // Any internal link click starts the bar; arriving at the new
  // route (pathname/searchParams change) or a 6s timeout stops it.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const anchor = (e.target as HTMLElement)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';
      if (!href.startsWith('/') || href.startsWith('//') || anchor.target === '_blank') return;
      if (href === pathname) return;
      setPending(true);
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick);
  }, [pathname]);

  useEffect(() => {
    setPending(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => setPending(false), 6000);
    return () => clearTimeout(t);
  }, [pending]);

  if (!pending) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none"
    >
      <div
        className="h-full bg-[#E8622A]"
        style={{
          width: '85%',
          transition: 'width 6s cubic-bezier(0.1, 0.6, 0.3, 0.9)',
        }}
      />
    </div>
  );
}

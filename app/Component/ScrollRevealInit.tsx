'use client';

// ============================================================
// KOVA — Scroll Reveal init
// BUG FIXED HERE: the old version queried .reveal elements ONCE,
// 120ms after mount. Sections that hydrated/rendered after that
// (streamed data, slow devices, bfcache restores) were never
// observed — but body.reveal-ready had already hidden them, so
// they stayed opacity:0 forever (the "blank space" on the
// homepage).
// Fix:
//   1. Run at mount (no 120ms race).
//   2. Re-scan with a MutationObserver so any .reveal element
//      added later is observed automatically.
//   3. Mark is-visible immediately for elements already in
//      viewport at scan time.
//   4. Safety net: every 2.5s anything still hidden becomes
//      visible regardless (content can never be lost).
//   5. Handles bfcache restores (pageshow event).
// ============================================================

import { useEffect } from 'react';

const SELECTORS = ['.reveal', '.reveal-stagger', '.reveal-left', '.reveal-right', '.reveal-scale'];

export function ScrollRevealInit() {
  useEffect(() => {
    document.body.classList.add('reveal-ready');

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll<HTMLElement>(SELECTORS.join(', ')).forEach((el) => {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' },
    );

    const observed = new WeakSet<HTMLElement>();

    const scan = () => {
      document.querySelectorAll<HTMLElement>(SELECTORS.join(', ')).forEach((el) => {
        if (observed.has(el)) return;
        observed.add(el);
        // Elements already on screen must not wait for a scroll event.
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-visible');
          return;
        }
        observer.observe(el);
      });
    };

    scan();

    // New content (client-rendered sections, paginated lists) is
    // picked up automatically instead of being left invisible.
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    // Absolute safety net: nothing may stay hidden for more than 2.5s.
    const failsafe = setInterval(() => {
      document.querySelectorAll<HTMLElement>(SELECTORS.join(', ')).forEach((el) => {
        if (!el.classList.contains('is-visible')) el.classList.add('is-visible');
      });
    }, 2500);
    // One pass is enough once the page is settled.
    const stopFailsafe = setTimeout(() => clearInterval(failsafe), 10000);

    // Back/forward cache restore can leave mid-transition state.
    const onShow = () => scan();
    window.addEventListener('pageshow', onShow);

    return () => {
      observer.disconnect();
      mo.disconnect();
      clearInterval(failsafe);
      clearTimeout(stopFailsafe);
      window.removeEventListener('pageshow', onShow);
      document.body.classList.remove('reveal-ready');
    };
  }, []);

  return null;
}

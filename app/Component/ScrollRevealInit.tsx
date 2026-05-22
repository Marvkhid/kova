'use client';

import { useEffect } from 'react';

export function ScrollRevealInit() {
  useEffect(() => {
    const timer = setTimeout(() => {
      document.body.classList.add('reveal-ready');

      const selectors = [
        '.reveal',
        '.reveal-stagger',
        '.reveal-left',
        '.reveal-right',
        '.reveal-scale',
      ].join(', ');

      const els = Array.from(
        document.querySelectorAll<HTMLElement>(selectors),
      );

      // Fallback: if IntersectionObserver is unavailable, show all
      if (!('IntersectionObserver' in window)) {
        els.forEach((el) => el.classList.add('is-visible'));
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
        {
          threshold: 0.05,
          rootMargin: '0px 0px -20px 0px',
        },
      );

      els.forEach((el) => observer.observe(el));

      // Cleanup observer when component unmounts
      return () => observer.disconnect();
    }, 120);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove('reveal-ready');
    };
  }, []);

  return null;
}
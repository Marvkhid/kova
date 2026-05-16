'use client';

import { useEffect } from 'react';

export function ScrollRevealInit() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Add class to body — activates hidden state for reveal elements
      document.body.classList.add('reveal-ready');

      const selectors = [
        '.reveal',
        '.reveal-stagger',
        '.reveal-left',
        '.reveal-right',
        '.reveal-scale',
      ].join(', ');

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
      );

      document.querySelectorAll<HTMLElement>(selectors)
        .forEach(el => observer.observe(el));
    }, 150);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove('reveal-ready');
    };
  }, []);

  return null;
}
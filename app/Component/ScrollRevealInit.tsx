'use client';

import { useEffect } from 'react';

export function ScrollRevealInit() {
  useEffect(() => {
    // Add class to body — this activates the hidden state for reveal elements
    // If JS is slow, elements stay visible (no flash of invisible content)
    document.body.classList.add('reveal-animate');

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
      {
        threshold:  0.08,
        rootMargin: '0px 0px -32px 0px',
      }
    );

    // Query after a tick so all sections are in the DOM
    const timer = setTimeout(() => {
      document.querySelectorAll<HTMLElement>(selectors)
        .forEach(el => observer.observe(el));
    }, 50);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.body.classList.remove('reveal-animate');
    };
  }, []);

  return null;
}
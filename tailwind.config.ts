// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './*.{js,ts,jsx,tsx}',
  ],

  darkMode: ['selector', '[data-theme="dark"]'],

  theme: {
    extend: {
      colors: {
        kova: {
          black:          '#0D0D0D',
          cream:          '#F5F0E8',
          'cream-dark':   '#EDE8DF',
          orange:         '#E8622A',
          'orange-light': '#F07A48',
          green:          '#2A5C45',
          'green-light':  '#3D8C6A',
          purple:         '#3B2F6E',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body:    ['var(--font-body)',    'sans-serif'],
      },
      height: {
        nav: '64px',
      },
      maxWidth: {
        site: '1280px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%':      { transform: 'translateY(-18px) scale(1.03)' },
        },
        'float-medium': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%':      { transform: 'translateY(14px) rotate(4deg)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(22px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.95)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        toastOut: {
          from: { opacity: '1', transform: 'translateY(0) scale(1)' },
          to:   { opacity: '0', transform: 'translateY(8px) scale(0.95)' },
        },
      },
      animation: {
        'marquee':      'marquee 22s linear infinite',
        'float-slow':   'float-slow 9s ease-in-out infinite',
        'float-medium': 'float-medium 11s ease-in-out infinite',
        'fade-up':      'fadeUp 0.65s ease both',
        'fade-in':      'fadeIn 0.4s ease both',
        'toast-in':     'toastIn 0.36s cubic-bezier(0.22,1,0.36,1) both',
        'toast-out':    'toastOut 0.32s cubic-bezier(0.22,1,0.36,1) forwards',
      },
    },
  },

  plugins: [],
};

export default config;
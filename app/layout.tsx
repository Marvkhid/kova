import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import './globals.css';

import { CartProvider }     from '@/features/cart/CartContext';
import { ToastProvider }    from './Component/ToastContext';
import { ToastContainer }   from './Component/ToastContainer';
import { Navbar }           from './Component/Navbar';
import { Footer }           from './Component/Footer';
import { ScrollRevealInit } from './Component/ScrollRevealInit';

const syne = Syne({
  subsets:  ['latin'],
  weight:   ['400', '700', '800'],
  variable: '--font-display',
  display:  'swap',
});

const dmSans = DM_Sans({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  style:    ['normal', 'italic'],
  variable: '--font-body',
  display:  'swap',
});

export const metadata: Metadata = {
  title:       'KOVA — Konnect · Offer · Value · Anywhere',
  description: 'The marketplace where buyers and sellers meet, transact, and grow.',
  icons: {
    icon:  '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 pt-[64px]">
              {children}
            </main>
            <Footer />
            <ToastContainer />
            <ScrollRevealInit />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
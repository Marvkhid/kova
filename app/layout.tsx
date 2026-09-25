import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Syne, DM_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

import { CartProvider } from '@/features/cart/CartContext';
import { WishlistProvider } from '@/lib/hooks/useWishlist';
import { ToastProvider } from './Component/ToastContext';
import { ToastContainer } from './Component/ToastContainer';
import { Navbar } from './Component/Navbar';
import { BottomNav } from './Component/BottomNav';
import { Footer } from './Component/Footer';
import { ScrollRevealInit } from './Component/ScrollRevealInit';
import { AuthBridge } from './Component/AuthBridge';
import { RouteProgress } from './Component/RouteProgress';
import { CartPanelProvider } from '@/features/cart/cartPanel';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kova-shopp.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'KOVA — Konnect · Offer · Value · Anywhere',
    template: '%s · KOVA',
  },
  description:
    'KOVA is the marketplace where buyers and sellers meet. Discover products from independent sellers, or open your own store in minutes.',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'KOVA',
    title: 'KOVA — the marketplace where buyers and sellers meet',
    description:
      'Discover products from independent sellers, or open your own store in minutes.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
        <head>
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        </head>
        <body className="min-h-screen flex flex-col">
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <CartPanelProvider>
                  <AuthBridge />
                  <Suspense fallback={null}>
                    <RouteProgress />
                  </Suspense>
                  <Navbar />
                  <main className="flex-1 pt-[64px] pb-[72px] md:pb-0">{children}</main>
                  <Footer />
                  <BottomNav />
                  <ToastContainer />
                  <ScrollRevealInit />
                </CartPanelProvider>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
          {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
        </body>
      </html>
    </ClerkProvider>
  );
}

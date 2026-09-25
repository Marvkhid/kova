// ============================================================
// KOVA — Proxy (route protection)
// Public: browsing, search, products, seller landing, auth.
// Protected: dashboards, wishlist, checkout, admin.
// Server-side authorization is ALSO enforced by the API —
// this only handles the redirect UX.
// ============================================================

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/products(.*)',
  '/shopping(.*)',
  '/search(.*)',
  '/deals(.*)',
  '/services(.*)',
  '/sellers',           // seller landing page
  '/sellers/store(.*)', // legacy public store path
  '/store(.*)',         // public shop pages /store/[slug]
  '/about(.*)',
  '/contact(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/login(.*)',
  '/api/webhook(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    // Basic auth check here; the ADMIN role is verified server-side
    // by the API (a BUYER signed-in user will simply see no data).
    await auth.protect();
  } else if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

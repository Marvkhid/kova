// ============================================================
// KOVA — Proxy (edge middleware)
// Runs on the Vercel Edge for every request that reaches the app.
//
// Two responsibilities:
//   1. /admin is not indexable and gets a strict referrer policy.
//   2. Same-origin /api fallback — when the frontend resolves the
//      API URL to the app's own origin (NEXT_PUBLIC_API_URL unset on
//      vercel.app), rewrite /api/* to the real backend host so the
//      frontend and API actually connect.
//
// Auth note: Clerk middleware was removed together with the Clerk
// sign-in/sign-up widgets — the Clerk instance required a phone
// number as a mandatory identifier and rejected Nigerian (+234)
// numbers entirely, blocking sign-up for Nigerian users. The
// first-party email + password auth (/register, /login) has no
// such restriction.
//
// KOVA's authorization is enforced end-to-end by the API
// (JWT bearer auth + role guards on every protected endpoint)
// and pages self-gate client-side (signed-out users are
// redirected to /login by the shared auth hooks).
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('X-Robots-Tag', 'noindex');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  // Same-origin /api fallback → rewrite to the real backend host.
  // Only applies when NEXT_PUBLIC_API_BACKEND_URL is configured (Vercel
  // production). Local dev uses NEXT_PUBLIC_API_URL directly, so this
  // path is never hit there.
  const backend = process.env.NEXT_PUBLIC_API_BACKEND_URL;
  if (backend && request.nextUrl.pathname.startsWith('/api')) {
    const url = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      backend,
    );
    return NextResponse.rewrite(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

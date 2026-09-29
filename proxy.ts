// ============================================================
// KOVA — Proxy (edge middleware)
// KOVA's authorization is enforced end-to-end by the API
// (JWT bearer auth + role guards on every protected endpoint)
// and pages self-gate client-side (signed-out users are
// redirected to /login by the shared auth hooks).
//
// Clerk middleware was removed together with the Clerk sign-in/
// sign-up widgets: the Clerk instance required a phone number
// as a mandatory identifier and rejected Nigerian (+234)
// numbers entirely, blocking sign-up for Nigerian users. The
// first-party email + password auth (/register, /login) has no
// such restriction.
//
// Network-level tweaks live here:
//   • /admin is not indexable and gets a strict referrer policy.
// ============================================================

import { NextResponse, type NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('X-Robots-Tag', 'noindex');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

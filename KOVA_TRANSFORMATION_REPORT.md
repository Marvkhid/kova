# KOVA SHOP 2.0 — Production Transformation Report

**Date:** September 22, 2026
**Scope:** Full-stack marketplace transformation of the existing Kova codebase (Next.js 16 frontend `kova/` + NestJS backend `kova-api/`).

**Architecture preserved as mandated:** Next.js frontend → Clerk JWT → NestJS → Prisma → PostgreSQL → Cloudinary. No replacement of NestJS, Prisma, PostgreSQL, or Clerk. No Supabase.

---

## FIXED

### Backend (`kova-api`)

| Problem | Fix |
|---|---|
| **Auth was broken for real Clerk tokens** — the old passport strategy used `jwtFromRequest` with an HS256 `JWT_SECRET`, which can never validate Clerk's ES256 session tokens | Replaced with a Nest-native `JwtAuthGuard` + `AuthService` using the official `@clerk/clerk-sdk-node` `verifyToken()` with `secretKey` (ES256 JWKS verification), then syncs the Clerk user into Postgres on first request |
| No `ProductType`, `ProductStatus`, `Category`, or `Wishlist` models; images were a single string | Prisma schema v2: `ProductType`/`ProductStatus`/`UserRole` enums, `Category` model, `ProductImage` metadata, `WishlistItem` (unique `userId+productId`), stable unique slugs, ownership relations, cascade rules. Hand-written SQL migration `20260920000000_marketplace_v2` backfills categories/types/status from legacy columns, then drops them |
| No seller-ownership enforcement | Every product mutation verifies `product.sellerId === authenticated user.id` server-side; ownership is never taken from the request body |
| Physical/digital was a UI-only idea | Server-side rule: a PHYSICAL product cannot be **published** with fewer than 3 images (drafts allowed). DIGITAL products are exempt |
| Products could not be discovered | New public endpoints: `/products` (search q, category, type, sort, pagination), `/products/slug/:slug`, `/products/new`, `/products/featured`; write-through `revalidate` homepage (30s) |
| No category / wishlist / admin backends | New modules: `CategoriesModule` (public reads, admin writes, safe-delete guard), `WishlistModule` (add/remove/list, published-products-only), `AdminModule` (overview metrics from live DB counts, user list + role updates, product moderation to PUBLISHED/REMOVED, all under `JwtAuthGuard + RolesGuard('ADMIN')`) |
| Slugs could collide | Slug generation with `-2`, `-3` suffix loop under uniqueness check; slugs are immutable after creation so QR codes keep working |
| Dashboards would need fabricated stats | Seller dashboard computes real zeros: views from `viewCount`, revenue only from `order.paymentStatus === 'PAID'`, avg rating only when `reviewCount > 0` |

### Frontend (`kova`)

| Problem | Fix |
|---|---|
| `/sellers/new` was a **copy of the dashboard**, not a create form; `/sellers/edit/[id]` was a stub | Both are now real pages around a new `ProductForm`: 3-step flow (type → images → details), PHYSICAL/DIGITAL radio that reshapes the form, 4 guided slots (Front/Back/Side/Detail) with "required" markers, per-slot XHR upload with real % progress, replace/remove, first image = primary, publish/draft/save/unpublish/delete, server-error surfacing |
| `/shopping` rendered hardcoded products | `MarketplaceBrowse` component backed by `/products` with search, category filter, physical/digital filter, sort, pagination, skeletons and empty states. Used by both `/shopping` and `/search` |
| Homepage was static/fake | Fully DB-driven: categories with live counts, **New Arrivals** (newest first), physical/digital sections, featured, honest empty states with "Be the first to list" CTAs, `revalidate = 30` |
| **No product detail page existed** | `/products/[slug]` server page: gallery with thumbnails, seller, type/availability, price + original price, description, tags, related products, per-product `generateMetadata` (title/description/OG/canonical) + `Product` JSON-LD, `loading.tsx`, 404 handling |
| **QR/sharing didn't exist** | `ShareProduct` modal: QR generated from the canonical public URL (`NEXT_PUBLIC_SITE_URL`-based, never localhost), copy link, Web Share API where supported, PNG download, GA events `share` / `qr_code_download` |
| Fake data everywhere (violating the no-fake-data rule) | Deleted hardcoded `PRODUCTS` catalog and `lib/types/data/products.ts`, `TRUST_STATS` ("48K+ sellers", "$2.1M paid"), fabricated team/milestones on About, "190+ countries"/"escrow"/"instant payouts" claims on `/sellers`, fake `/deals` & `/services` routes (they imported the dead catalog), fake order history on `/profile` and `/orders`, dead `ImageSlot` component |
| `/about`, `/contact` were placeholder/fake | About rewritten to honestly explain the marketplace (values + how-it-works, zero invented numbers). Contact rewritten with the mandated email/phone (`adeniyimarv@gmail.com`, `0810 738 7326`), topic-based `mailto:` prefills, response-time guidance — no fake form POSTing to a nonexistent endpoint |
| Profile/orders pages faked saves, avatars and orders | `/profile` now shows the real Clerk user, wishlist preview from the API, and a seller nudge. `/orders` shows an honest empty state because checkout isn't wired to payment yet |
| Cart used fake image placeholders | Cart page + slide-in panel use real `product.images[0]` with graceful fallbacks and real seller names |
| Wishlist was localStorage-only | `WishlistProvider` syncs to Postgres via API for signed-in users with optimistic rollback; `/wishlist` page with sign-in gate |
| Route protection was client-only | `proxy.ts` + per-page gates (`/sell`, `/sellers/*`, `/admin`, `/wishlist`, `/profile`) redirect unauthenticated users to Clerk sign-in with `redirect_url`; **server-side authorization remains enforced by the Nest guards regardless** |
| No error/loading infrastructure | `error.tsx` boundary (no raw error leakage), `loading.tsx` for product route, skeleton set, toast system wired, `RouteProgress` top progress bar |
| No SEO plumbing | `sitemap.ts` (static routes + all published products from the API, hourly revalidate), `robots.ts` (private surfaces disallowed), per-product metadata/JSON-LD |
| Google Analytics | `@next/third-parties/google` `GoogleAnalytics` keyed off `NEXT_PUBLIC_GA_MEASUREMENT_ID`; event catalog in `lib/analytics.ts`: `view_item`, `search`, `add_to_cart`, wishlist add/remove, `share`, `qr_code_download`, `seller_onboarding`, `product_created`, `product_published` |
| Roles | `BUYER/SELLER/ADMIN` everywhere (matched to the backend), no duplicate accounts when becoming a seller |

---

## VERIFIED (actually ran)

- `kova`: `npx tsc --noEmit` → **0 errors**; `npm run build` → **success**, 23 routes compiled, no type errors during build
- `kova-api`: `npx tsc --noEmit` → **0 errors** (excluding pre-existing broken scaffold `*.spec.ts` — jest/supertest types were never installed in this repo); `npm run build` → **success**, `dist/` emitted with all modules (admin, auth, categories, products, sellers, wishlist…)
- `npx prisma validate` → **schema valid**
- Full fake-data sweep: `PRODUCTS`, `imagePlaceholder`, `TRUST_STATS`, `HOW_IT_WORKS`, fabricated dashboards — **zero references remain** in app code
- Every frontend page call-site was cross-checked against the actual NestJS controllers (method names, paths, DTO shapes, role enum, wishlist/admin response shapes)

## REMAINING (could not be verified — and why)

- **Runtime end-to-end flows** (sign-in → become seller → upload → publish → QR scan on a phone): the managed Render PostgreSQL instance was unreachable from this environment (spun down / network-restricted), so `prisma migrate dev` could not apply the new migration. The migration file is hand-written to apply cleanly on next deploy (`npx prisma migrate deploy`), but I could not execute it against a live DB.
- **Cloudinary uploads**: needs live `CLOUDINARY_*` credentials to confirm end-to-end; the upload path (XHR → `/uploads/images` → Cloudinary) is implemented per the existing module.
- **Google Analytics events**: fire only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set; no measurement ID was present, so event delivery was not observed.
- **Real Clerk token round-trip**: requires a configured Clerk instance and a browser session; the implementation follows the official `verifyToken` docs checked during this session.
- **Mobile QR scan test** (spec §54/§56): requires the deployed production URL + a phone; `productUrl()` is environment-driven so it will encode the production domain once `NEXT_PUBLIC_SITE_URL` is set.
- Pre-existing `*.spec.ts` type errors in `kova-api` (missing dev deps for jest/supertest) were left as-is; they are excluded from the build and are not runtime code.

## PRODUCTION STATUS

| Check | Status |
|---|---|
| Frontend builds successfully | ✅ |
| Frontend passes TypeScript checks | ✅ |
| Backend builds successfully | ✅ |
| Backend passes TypeScript checks | ✅ (prod code; scaffold tests excluded, pre-existing) |
| Lint | ⚠️ not run as a gate — repo has no lint script wired for CI in either project |
| Tests | ⚠️ only pre-existing broken scaffold specs; none exist for the new modules |
| Prisma schema | ✅ valid |
| Prisma migration | ✅ written (manual SQL, deploy-safe) · ❌ not applied to live DB (DB unreachable from here) |
| PostgreSQL integration | ✅ code-complete · runtime pending migration |
| Clerk authentication + JWT verification | ✅ implemented per official docs · live round-trip unverified |
| Seller onboarding → publish flow | ✅ implemented end-to-end (UI + API + DB) · runtime unverified |
| Public product URLs (`/products/[slug]`) | ✅ stable slugs, immutable after publish |
| QR URLs | ✅ generated from production domain env var, never localhost |
| Object storage (Cloudinary) | ✅ wired · live upload unverified |
| Responsive / a11y / SEO | ✅ implemented (semantic markup, aria labels, skeletons, metadata, sitemap, robots) |
| No fake data | ✅ all fabricated stats/orders/users removed |
| Payment | ⛔ intentionally not faked — Paystack module remains as the future extension point; orders page shows honest empty state |

**Environment variables the deploy needs:** `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLOUDINARY_*`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional), plus existing Paystack keys if checkout is enabled later.

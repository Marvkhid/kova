# KOVA — Phase 2 Report: Realistic Data, Reviews, Seller Ratings & Order Tracking

Continues `KOVA_TRANSFORMATION_REPORT.md` (marketplace core). This phase added the
reputation and fulfilment layers plus a realistic demo dataset. Architecture unchanged:
Next.js → NestJS → Prisma → PostgreSQL, Clerk auth, Cloudinary storage.

## FIXED

**Database (schema v3 + migrations)**
- Money is now `Decimal(12,2)` across products/orders/order_items — no float arithmetic for Naira.
- `OrderEvent` append-only timeline table; `OrderItem.fulfillmentStatus` per-item lifecycle; `trackingNumber`/`carrier` on items.
- `Review`: `title`, `verifiedPurchase` (server-computed), `ReviewStatus` moderation enum; one review per user per product (DB unique).
- New `SellerReview` model: 1–5 overall + communication / product accuracy / packaging / delivery dimensions, one per buyer per store.
- `OrderStatus` extended (PAID, PACKED, IN_TRANSIT, OUT_FOR_DELIVERY).
- Migration split into two files (`…v3_enums` then `…v3`) because PostgreSQL cannot use enum values added in the same transaction.
- Backfills: legacy reviews verified against real PAID orders; item fulfilment derived from order status; one OrderEvent per legacy order.

**Backend**
- Reviews module v2: product reviews with **server-side verified-purchase** (from real PAID OrderItems — the client can never assert it), rating distribution + averages computed from rows, seller-rating ride-along on verified purchases only, admin moderation (hide/restore) with aggregate recalculation.
- Orders module v2: buyer create/list/detail with authorization (buyer→own, seller→orders containing their items with PII stripped, admin→all), forward-only fulfilment transitions, **sellers can never mark DELIVERED**, digital items bypass logistics states, payment confirmation writes PAID events, seller order view with city-level shipping privacy.
- Public store payload now includes the owner's `id` (for review aggregates) and a `store-all` slug list endpoint for the sitemap.

**Seed system (development demo data — clearly labelled)**
- `prisma/seed-data.ts` — single fictional catalog: 5 Nigerian demo stores (fashion/beauty, electronics, home/furniture, digital education, wellness), 18 demo buyers, 90+ catalog items with structured, meaningful description data (materials, dimensions, features, formats, contents), realistic ₦ pricing ranges, review comment pools with `{material}/{feature}/{city}` slots. No real people or businesses.
- `prisma/catalog.ts` — deterministic expansion to **~200 distinct products** (colour/size/named variants, unique slugs, first-party image paths).
- `prisma/seed.ts` — wipes only `demo_`-keyed rows, rebuilds categories → sellers → buyers → products (95% published, honest share of drafts/out-of-stock) → **real PAID order chains with full OrderEvent timelines** → product reviews (verified via the same lookup production uses) → seller reviews → recomputes rating aggregates from Review rows (same math as the API) → runs 9 data-quality assertions that fail the seed if violated. Deterministic (mulberry32), refuses to run with `NODE_ENV=production` unless explicitly overridden.
- `scripts/generate-seed-images.ts` + 801 generated first-party SVG assets under `kova/public/images/seed/` — every seeded image URL resolves to a real file, labelled "KOVA · DEMO". No invented external URLs.
- Demo logins note: demo users exist in Postgres; to act as one, mirror the `demo_` clerkIds in your Clerk dev instance (documented in the seed output).

**Frontend**
- `ReviewSection` on every product page: summary + star distribution chart + paginated list, all from the API; review form gated on server-decided eligibility; edit/delete own review; optional seller rating at submit.
- `/store/[slug]` public store pages: banner/logo, verified badge, location, seller rating + dimensions from `SellerReview` rows, product grid, Store JSON-LD. Product pages link "Visit store" here.
- `/orders` rewritten: real order list, expandable cards with items/totals, and a **tracking timeline rendered only from OrderEvent rows** (physical 8-step or digital 3-step; cancelled state) — nothing client-inferred.
- Seller dashboard gained an **Orders** tab: fulfilment queue with status filters, carrier/tracking input at the shipping step, digital items one-click deliver, honest empty states.
- Admin dashboard gained **Orders** and **Reviews** tabs (moderation queue for product + seller reviews).
- Currency: `formatPrice` now emits Nigerian Naira (`₦125,500`), product form relabelled to ₦, JSON-LD `priceCurrency` → NGN; sitemap includes store pages.

## VERIFIED

- `kova`: `tsc --noEmit` → **0 errors**; `npm run build` → **success** (23 routes incl. `/store/[slug]`).
- `kova-api`: `tsc --noEmit` → **0 errors** (non-test); `npm run build` → **success**; `prisma validate` → **valid**; `prisma generate` → client regenerated.
- Image generator executed: 801 files written, folder structure matches seeded URLs by construction (same catalog expansion module).
- Seed script + generator compile and the seed's safety guard (production refusal) is in place.

## REMAINING (not verified — external services unreachable)

- **Database execution**: the Render PostgreSQL instance is still unreachable from this environment (P1017). The migrations and seed are written and type-checked but **have not been applied/run against a live database**. Run on next deploy/dev machine:
  `npx prisma migrate deploy && npm run db:seed-images && npm run db:seed`
- **Live runtime checks** that depend on the above: product pages showing reviews, store pages with ratings, order timelines from seeded events, seller dashboard order queue, admin moderation — all wired to real endpoints but only verifiable once the DB + API run.
- **Cloudinary upload, Clerk token round-trip, Paystack** — need live credentials (unchanged from phase 1).

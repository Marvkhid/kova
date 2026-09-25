import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { ProductCard } from '@/app/Component/ProductCard';
import { SectionLabel } from '@/app/ui/Atom';
import type { SellerStore, SellerReviewSummary } from '@/lib/types';

// Store pages are dynamic: newly published products appear promptly.
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getStore(slug: string, page = 1): Promise<SellerStore | null> {
  try {
    return await api.getStore(slug, page);
  } catch {
    return null;
  }
}

async function getSellerRating(userId: string): Promise<SellerReviewSummary | null> {
  try {
    const res = await api.getSellerReviews(userId, 1, 5);
    return res.summary;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore(slug);
  if (!store) return { title: 'Store not found' };
  return {
    title: `${store.storeName} — Kova store`,
    description:
      store.description?.slice(0, 155) ??
      `Shop ${store.storeName}'s products on Kova${store.location ? ` — ${store.location}` : ''}.`,
    alternates: { canonical: `/store/${store.storeSlug}` },
  };
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[0.9rem]" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? 'text-[#E8A020]' : 'text-black/15'} aria-hidden="true">★</span>
      ))}
    </span>
  );
}

const DIMENSION_LABELS: Record<string, string> = {
  communication: 'Communication',
  productAccuracy: 'Product accuracy',
  packaging: 'Packaging',
  deliveryExperience: 'Delivery experience',
};

export default async function StorePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const store = await getStore(slug, page);
  if (!store) notFound();

  // The paginated store payload carries owner + catalogue at the top level
  const rating = store.userId ? await getSellerRating(store.userId) : null;
  const products = store.products ?? store.user?.products ?? [];
  const ownerName = store.ownerName ?? store.user?.name ?? store.storeName;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.storeName,
    description: store.description ?? undefined,
    address: store.location ? { '@type': 'PostalAddress', addressLocality: store.location, addressCountry: 'NG' } : undefined,
    ...(rating && rating.total > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.average,
            reviewCount: rating.total,
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Banner */}
      <div className="relative h-44 sm:h-60 bg-[#141310] overflow-hidden">
        {store.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={store.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : null}
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8">
        {/* Identity card */}
        <div className="bg-white border border-black/[0.07] rounded-[18px] p-5 sm:p-7 -mt-16 relative shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-[#0D0D0D] text-[#F5F0E8] flex items-center justify-center font-extrabold text-2xl flex-shrink-0 overflow-hidden shadow-md"
              style={{ fontFamily: 'var(--font-display)' }}>
              {store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={store.logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                store.storeName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  className="font-extrabold text-[#0D0D0D] tracking-[-0.02em] leading-tight"
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 2rem)' }}
                >
                  {store.storeName}
                </h1>
                {store.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[0.62rem] font-bold uppercase tracking-[0.06em] text-[#2A5C45] bg-[#2A5C45]/[0.08] px-2 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-[0.8rem] text-black/45 mt-1">
                {store.location ? `${store.location}, Nigeria · ` : ''}
                {products.length} published product{products.length === 1 ? '' : 's'}
              </p>

              {/* Seller rating — from SellerReview rows only */}
              <div className="mt-2.5">
                {rating && rating.total > 0 ? (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1.5">
                      <span className="font-extrabold text-[1.05rem] text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
                        {rating.average.toFixed(1)}
                      </span>
                      <Stars value={rating.average} />
                    </span>
                    <span className="text-[0.74rem] text-black/45">
                      {rating.total} buyer rating{rating.total === 1 ? '' : 's'}
                    </span>
                  </div>
                ) : (
                  <p className="text-[0.74rem] text-black/40">No buyer ratings yet — new store.</p>
                )}
              </div>
            </div>
          </div>

          {store.description && (
            <p className="text-[0.86rem] text-black/60 leading-[1.75] mt-5 pt-5 border-t border-black/[0.06] whitespace-pre-line">
              {store.description}
            </p>
          )}

          {/* Rating dimensions — only when buyers actually scored them */}
          {rating?.dimensions && Object.values(rating.dimensions).some((d) => d !== null) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-black/[0.06]">
              {Object.entries(rating.dimensions).map(([key, value]) =>
                value !== null ? (
                  <div key={key} className="bg-[#F5F0E8]/70 rounded-[12px] p-3">
                    <p className="text-[0.62rem] uppercase tracking-[0.08em] text-black/40 mb-1">
                      {DIMENSION_LABELS[key] ?? key}
                    </p>
                    <p className="font-bold text-[0.95rem] text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
                      {value.toFixed(1)}★
                    </p>
                  </div>
                ) : null,
              )}
            </div>
          )}
        </div>

        {/* Products */}
        <section className="py-10 sm:py-14">
          <SectionLabel>From this store</SectionLabel>
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2
              className="font-extrabold text-[#0D0D0D] leading-tight tracking-[-0.02em]"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 4vw, 1.9rem)' }}
            >
              Products by {ownerName}
            </h2>
            {typeof store.totalProducts === 'number' && (
              <p className="text-[0.78rem] text-black/40 flex-shrink-0">
                {store.totalProducts} {store.totalProducts === 1 ? 'product' : 'products'}
                {(store.pages ?? 1) > 1 && ` · page ${store.page} of ${store.pages}`}
              </p>
            )}
          </div>

          {products.length === 0 ? (
            <div className="bg-white border border-black/[0.07] rounded-[16px] p-8 text-center">
              <p className="text-[0.9rem] text-black/50">
                This store hasn't published any products yet.
              </p>
              <Link href="/shopping" className="inline-block mt-4 text-[0.8rem] font-semibold text-[#E8622A] hover:opacity-70 transition-opacity">
                Browse the marketplace →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination — real catalogue size, real pages */}
          {(store.pages ?? 1) > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-9" aria-label="Store catalogue pages">
              {page > 1 && (
                <Link
                  href={`/store/${slug}?page=${page - 1}`}
                  className="px-4 py-2 rounded-full border border-black/[0.12] text-[0.8rem] font-medium text-[#0D0D0D] hover:border-black/30 transition-colors"
                >
                  ← Prev
                </Link>
              )}
              {Array.from({ length: Math.min(7, store.pages ?? 1) }, (_, i) => {
                const total = store.pages ?? 1;
                const start = Math.max(1, Math.min(page - 3, total - 6));
                return start + i;
              }).map((n) => (
                <Link
                  key={n}
                  href={`/store/${slug}?page=${n}`}
                  aria-current={n === page ? 'page' : undefined}
                  className={[
                    'w-9 h-9 rounded-full flex items-center justify-center text-[0.8rem] font-medium transition-colors',
                    n === page
                      ? 'bg-[#0D0D0D] text-[#F5F0E8]'
                      : 'border border-black/[0.12] text-[#0D0D0D] hover:border-black/30',
                  ].join(' ')}
                >
                  {n}
                </Link>
              ))}
              {page < (store.pages ?? 1) && (
                <Link
                  href={`/store/${slug}?page=${page + 1}`}
                  className="px-4 py-2 rounded-full border border-black/[0.12] text-[0.8rem] font-medium text-[#0D0D0D] hover:border-black/30 transition-colors"
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}

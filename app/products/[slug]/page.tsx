// ============================================================
// KOVA — /products/[slug]
// The canonical, permanent product URL. QR codes and shared
// links always resolve here.
// ============================================================

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { ProductGallery } from '@/app/Component/ProductGallery';
import { ProductActions } from './ProductActions';
import { ProductCard } from '@/app/Component/ProductCard';
import { ReviewSection } from '@/app/Component/ReviewSection';
import { SectionLabel } from '@/app/ui/Atom';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';

// Product pages are dynamic: unpublished/removed products must
// disappear promptly, and new views must be counted.
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await api.getProductBySlug(slug);
  } catch {
    return null;
  }
}

async function getRelated(categorySlug?: string, excludeId?: string): Promise<Product[]> {
  if (!categorySlug) return [];
  try {
    const res = await api.listProducts({ category: categorySlug, limit: 8 });
    return res.products.filter((p) => p.id !== excludeId).slice(0, 4);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return { title: 'Product not found' };
  }

  const description =
    product.description?.slice(0, 155) ??
    `${product.name} by ${product.seller?.sellerProfile?.storeName ?? 'a KOVA seller'}`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      url: `/products/${product.slug}`,
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelated(product.category?.slug, product.id);
  const storeName = product.seller?.sellerProfile?.storeName ?? product.seller?.name ?? 'KOVA Seller';
  const discounted = Boolean(product.originalPrice && product.originalPrice > product.price);

  // Structured data for search engines
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: { '@type': 'Brand', name: storeName },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'NGN',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(product.rating > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8 pt-5 sm:pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.74rem] sm:text-[0.8rem] text-black/45">
          <Link href="/" className="hover:text-[#E8622A] transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/shopping" className="hover:text-[#E8622A] transition-colors">Browse</Link>
          {product.category && (
            <>
              <span aria-hidden="true">/</span>
              <Link
                href={`/shopping?category=${product.category.slug}`}
                className="hover:text-[#E8622A] transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span className="text-black/70 truncate max-w-[160px] sm:max-w-[240px]">{product.name}</span>
        </nav>
      </div>

      {/* ── Main ── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8 py-6 sm:py-8">
        <div className="grid lg:grid-cols-2 gap-7 sm:gap-10 items-start">
          {/* Gallery */}
          <div className="lg:sticky lg:top-[84px]">
            <ProductGallery
              images={product.images}
              alt={product.name}
              productType={product.productType}
              categorySlug={product.category?.slug}
            />
          </div>

          {/* Info column */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {product.productType === 'DIGITAL' ? (
                  <span className="inline-flex items-center gap-1.5 bg-[#3B2F6E]/[0.08] text-[#3B2F6E] text-[0.66rem] font-semibold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full border border-[#3B2F6E]/[0.15]">
                    Digital product
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-[#2A5C45]/[0.08] text-[#2A5C45] text-[0.66rem] font-semibold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full border border-[#2A5C45]/[0.15]">
                    Physical product
                  </span>
                )}
                {product.category && (
                  <span className="text-[0.68rem] text-black/40 uppercase tracking-[0.08em]">
                    {product.category.name}
                  </span>
                )}
              </div>

              <h1
                className="font-extrabold text-[#0D0D0D] leading-[1.05] tracking-[-0.02em] mb-3"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 5vw, 2.4rem)' }}
              >
                {product.name}
              </h1>

              <div className="flex items-baseline gap-2.5 mb-1">
                <span
                  className="font-extrabold text-[1.6rem] sm:text-[1.9rem] text-[#0D0D0D]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {formatPrice(product.price)}
                </span>
                {discounted && (
                  <>
                    <span className="text-[0.95rem] text-black/35 line-through">
                      {formatPrice(product.originalPrice!)}
                    </span>
                    <span className="text-[0.72rem] font-bold text-[#2A5C45] bg-[#2A5C45]/[0.08] px-2 py-0.5 rounded-full">
                      Save {Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-[0.72rem] text-black/35 mb-4">
                {product.viewCount ?? 0} view{(product.viewCount ?? 0) === 1 ? '' : 's'}
                {' · '}
                {product.inStock ? 'Available' : 'Currently unavailable'}
              </p>

              {/* Seller card */}
              <div className="flex items-center gap-3 bg-white border border-black/[0.07] rounded-[14px] p-3.5 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#0D0D0D] text-[#F5F0E8] flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden">
                  {product.seller?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.seller.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (storeName.charAt(0) || 'K').toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.62rem] uppercase tracking-[0.08em] text-black/35">Sold by</p>
                  <p className="font-semibold text-[0.88rem] text-[#0D0D0D] truncate" style={{ fontFamily: 'var(--font-display)' }}>
                    {storeName}
                  </p>
                </div>
                {product.seller?.sellerProfile?.storeSlug && (
                  <Link
                    href={`/store/${product.seller.sellerProfile.storeSlug}`}
                    className="text-[0.72rem] font-medium text-[#E8622A] hover:opacity-70 transition-opacity flex-shrink-0"
                  >
                    Visit store →
                  </Link>
                )}
              </div>
            </div>

            {/* Actions */}
            <ProductActions product={product} />

            {/* Description */}
            <div className="bg-white border border-black/[0.07] rounded-[16px] p-5 sm:p-6">
              <h2
                className="font-bold text-[0.95rem] text-[#0D0D0D] mb-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                About this product
              </h2>
              <p className="text-[0.86rem] sm:text-[0.9rem] text-black/60 leading-[1.75] whitespace-pre-line">
                {product.description}
              </p>

              {product.productType === 'DIGITAL' && (
                <p className="text-[0.76rem] text-black/40 mt-4 pt-4 border-t border-black/[0.06] leading-relaxed">
                  This is a digital product listing. Contact the seller through the details on
                  this page to arrange access or delivery — KOVA will clearly indicate here once
                  automated digital delivery is supported.
                </p>
              )}

              {product.productType === 'PHYSICAL' && product.images.length >= 3 && (
                <p className="text-[0.76rem] text-black/40 mt-4 pt-4 border-t border-black/[0.06] leading-relaxed">
                  Shown from {product.images.length} angles — tap the thumbnails above to inspect
                  every view before you buy.
                </p>
              )}

              {(product.tags?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {product.tags!.map((tag) => (
                    <Link
                      key={tag}
                      href={`/shopping?q=${encodeURIComponent(tag)}`}
                      className="text-[0.68rem] text-black/45 bg-black/[0.04] hover:bg-black/[0.08] transition-colors px-2.5 py-1 rounded-full"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Reviews (server-computed aggregates, verified purchases) ── */}
        <ReviewSection
          productId={product.id}
          sellerId={product.seller?.id}
          sellerName={storeName}
        />

        {/* ── Related ── */}
        {related.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <SectionLabel>You may also like</SectionLabel>
            <h2
              className="font-extrabold text-[#0D0D0D] leading-tight tracking-[-0.02em] mb-6"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 4vw, 1.9rem)' }}
            >
              More in {product.category?.name ?? 'the marketplace'}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

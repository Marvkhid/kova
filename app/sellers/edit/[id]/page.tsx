'use client';
// ============================================================
// KOVA — /sellers/edit/[id]
// Edit an existing listing. The backend enforces ownership —
// this page simply renders the shared ProductForm pre-filled
// from the live product.
// ============================================================

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { api, ApiError } from '@/lib/api';
import { ProductForm } from '@/app/Component/ProductForm';
import { SellerPageShell } from '@/app/Component/SellerPageShell';
import type { Product } from '@/lib/types';

export default function EditProductPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [state, setState] = useState<'loading' | 'ready' | 'forbidden' | 'notfound'>('loading');
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(`/sellers/edit/${id ?? ''}`)}`);
      return;
    }
    if (!isLoaded || !isSignedIn || !id) return;

    let cancelled = false;
    api
      .getProduct(id)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        setState('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setState(err instanceof ApiError && err.status === 404 ? 'notfound' : 'forbidden');
      });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, id, router]);

  if (!isLoaded || state === 'loading') {
    return (
      <SellerPageShell breadcrumb="Edit listing" title="Edit listing" wide>
        <div className="flex flex-col gap-4" aria-busy="true">
          <div className="h-28 bg-black/[0.04] rounded-[16px] animate-pulse" />
          <div className="h-64 bg-black/[0.04] rounded-[16px] animate-pulse" />
        </div>
      </SellerPageShell>
    );
  }

  if (!isSignedIn) return null; // redirect in flight

  if (state === 'notfound' || state === 'forbidden') {
    return (
      <SellerPageShell breadcrumb="Edit listing" title="Listing unavailable" wide>
        <div className="bg-white rounded-[16px] border border-black/[0.07] p-8 text-center">
          <p className="font-bold text-[1rem] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            {state === 'notfound' ? 'This listing does not exist' : 'You cannot edit this listing'}
          </p>
          <p className="text-[0.84rem] text-black/45 mb-5">
            {state === 'notfound'
              ? 'It may have been deleted.'
              : 'Only the seller who created a listing can edit it.'}
          </p>
          <button
            type="button"
            onClick={() => router.push('/sellers/dashboard')}
            className="px-6 py-2.5 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </SellerPageShell>
    );
  }

  return (
    <SellerPageShell
      breadcrumb={product ? `Edit: ${product.name}` : 'Edit listing'}
      title="Edit listing"
      subtitle="Renaming a product keeps its original web address, so shared links and QR codes keep working."
      wide
    >
      <ProductForm productId={id} sellerReady />
    </SellerPageShell>
  );
}

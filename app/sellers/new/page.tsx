'use client';
// ============================================================
// KOVA — /sellers/new
// Create a new listing. Requires authentication; requires a
// seller profile to publish (drafts are still allowed so a new
// seller never loses work).
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { api, ApiError } from '@/lib/api';
import { ProductForm } from '@/app/Component/ProductForm';
import { SellerPageShell } from '@/app/Component/SellerPageShell';

export default function NewProductPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [sellerReady, setSellerReady] = useState<boolean | null>(null); // null = checking

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in?redirect_url=%2Fsellers%2Fnew');
      return;
    }
    if (isLoaded && isSignedIn) {
      let cancelled = false;
      api
        .getMySellerProfile()
        .then(() => {
          if (!cancelled) setSellerReady(true);
        })
        .catch((err) => {
          if (cancelled) return;
          // 404 → user has no seller profile yet; anything else = server issue
          setSellerReady(!(err instanceof ApiError && err.status === 404));
        });
      return () => {
        cancelled = true;
      };
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || sellerReady === null) {
    return (
      <SellerPageShell breadcrumb="New listing" title="Create a listing" wide>
        <div className="flex flex-col gap-4" aria-busy="true">
          <div className="h-28 bg-black/[0.04] rounded-[16px] animate-pulse" />
          <div className="h-64 bg-black/[0.04] rounded-[16px] animate-pulse" />
        </div>
      </SellerPageShell>
    );
  }

  if (!isSignedIn) return null; // redirect in flight

  return (
    <SellerPageShell
      breadcrumb="New listing"
      title="Create a listing"
      subtitle="Three steps: what you are selling, its photos, and the details."
      wide
    >
      {!sellerReady && (
        <div className="mb-6 bg-[#F5F0E8] border border-[#E8622A]/25 rounded-[14px] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-[0.82rem] text-black/60 flex-1">
            <strong className="text-[#0D0D0D]">One thing first:</strong> you need a seller profile before this
            listing can go live. Setting one up takes under a minute and uses your existing account.
          </p>
          <Link
            href="/sell"
            className="flex-shrink-0 px-5 py-2.5 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors text-center"
          >
            Set up now →
          </Link>
        </div>
      )}
      <ProductForm sellerReady={sellerReady} />
    </SellerPageShell>
  );
}

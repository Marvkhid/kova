'use client';
// ============================================================
// KOVA — Product Reviews section
// Everything renders from the API:
//   • summary + star distribution  ← GET /reviews/product/:id
//   • review list (paginated)      ← same endpoint
//   • review-form eligibility      ← GET /reviews/mine/:productId
//     (the server decides verified-purchase status — the client
//     can never assert it)
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { api, ApiError } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type {
  ProductReviewPage,
  MyReviewStatus,
  ProductReview,
} from '@/lib/types';

const DATE_FMT = new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const px = size === 'md' ? 'text-[1.05rem]' : 'text-[0.85rem]';
  return (
    <span className={`inline-flex items-center gap-0.5 ${px}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? 'text-[#E8A020]' : 'text-black/15'} aria-hidden="true">★</span>
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: ProductReview & { title?: string | null; verifiedPurchase?: boolean } }) {
  return (
    <article className="border-b border-black/[0.06] py-5 last:border-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-full bg-[#0D0D0D] text-[#F5F0E8] flex items-center justify-center text-[0.7rem] font-bold flex-shrink-0 overflow-hidden">
            {review.user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={review.user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              (review.user?.name ?? 'K').charAt(0).toUpperCase()
            )}
          </span>
          <div className="min-w-0">
            <p className="text-[0.84rem] font-semibold text-[#0D0D0D] truncate">
              {review.user?.name ?? 'Kova shopper'}
            </p>
            <p className="text-[0.68rem] text-black/35">
              {review.createdAt ? DATE_FMT.format(new Date(review.createdAt)) : ''}
            </p>
          </div>
        </div>
        {review.verifiedPurchase && (
          <span className="flex-shrink-0 inline-flex items-center gap-1 text-[0.62rem] font-bold uppercase tracking-[0.06em] text-[#2A5C45] bg-[#2A5C45]/[0.08] px-2 py-1 rounded-full">
            ✓ Verified purchase
          </span>
        )}
      </div>
      <div className="mb-2"><Stars value={review.rating} /></div>
      {review.title && (
        <p className="text-[0.86rem] font-semibold text-[#0D0D0D] mb-1">{review.title}</p>
      )}
      {review.comment && (
        <p className="text-[0.84rem] text-black/60 leading-[1.7] whitespace-pre-line">{review.comment}</p>
      )}
    </article>
  );
}

// ── Review form ───────────────────────────────────────────

function ReviewForm({
  productId,
  sellerId,
  sellerName,
  existing,
  onSubmitted,
}: {
  productId: string;
  sellerId?: string;
  sellerName: string;
  existing: MyReviewStatus['review'];
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState<number>(existing?.rating ?? 0);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateSeller, setRateSeller] = useState(false);
  const [sellerRating, setSellerRating] = useState(0);
  const [sellerComment, setSellerComment] = useState('');

  const isEdit = Boolean(existing);

  async function submit() {
    if (rating === 0) { setError('Please choose a star rating'); return; }
    setBusy(true); setError(null);
    try {
      if (isEdit && existing) {
        await api.updateReview(existing.id, { rating, title: title || undefined, comment: comment || undefined });
      } else {
        await api.submitReview({
          productId,
          rating,
          title: title || undefined,
          comment: comment || undefined,
          sellerRating: rateSeller && sellerRating > 0
            ? { rating: sellerRating, comment: sellerComment || undefined }
            : undefined,
        });
      }
      onSubmitted();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not submit your review');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!existing) return;
    setBusy(true); setError(null);
    try {
      await api.deleteMyReview(existing.id);
      onSubmitted();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not delete your review');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-[#F5F0E8]/60 border border-black/[0.07] rounded-[14px] p-5 mb-6">
      <h3 className="font-bold text-[0.95rem] text-[#0D0D0D] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
        {isEdit ? 'Edit your review' : 'Write a review'}
      </h3>

      {error && (
        <p role="alert" className="text-[0.78rem] text-[#B3261E] bg-[#B3261E]/[0.06] rounded-lg px-3 py-2 mb-3">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 mb-4">
        <span className="text-[0.8rem] text-black/50">Your rating</span>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i} star${i > 1 ? 's' : ''}`}
              onMouseEnter={() => setHover(i)}
              onClick={() => setRating(i)}
              className={`text-[1.5rem] leading-none transition-transform hover:scale-110 ${
                i <= (hover || rating) ? 'text-[#E8A020]' : 'text-black/15'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Headline (optional) — e.g. Exactly as described"
        maxLength={120}
        className="w-full text-[0.84rem] bg-white border border-black/[0.1] rounded-[10px] px-3.5 py-2.5 mb-3 outline-none focus:border-[#E8622A] transition-colors"
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What did you think? Details help other shoppers — materials, sizing, delivery, how it performs."
        rows={4}
        maxLength={2000}
        className="w-full text-[0.84rem] bg-white border border-black/[0.1] rounded-[10px] px-3.5 py-2.5 mb-4 outline-none focus:border-[#E8622A] transition-colors resize-y"
      />

      {/* Optional seller rating — only offered alongside a product review */}
      {!isEdit && sellerId && (
        <div className="border-t border-black/[0.07] pt-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rateSeller}
              onChange={(e) => setRateSeller(e.target.checked)}
              className="accent-[#E8622A] w-4 h-4"
            />
            <span className="text-[0.8rem] text-black/60">
              Also rate your experience with <strong>{sellerName}</strong>
            </span>
          </label>
          {rateSeller && (
            <div className="mt-3">
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Seller rating: ${i} stars`}
                    onClick={() => setSellerRating(i)}
                    className={`text-[1.25rem] leading-none ${i <= sellerRating ? 'text-[#E8A020]' : 'text-black/15'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <input
                value={sellerComment}
                onChange={(e) => setSellerComment(e.target.value)}
                placeholder="How was communication, dispatch, packaging? (optional)"
                maxLength={1000}
                className="w-full text-[0.8rem] bg-white border border-black/[0.1] rounded-[10px] px-3 py-2 outline-none focus:border-[#E8622A] transition-colors"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={busy || rating === 0}
          className="bg-[#0D0D0D] text-[#F5F0E8] text-[0.8rem] font-semibold px-5 py-2.5 rounded-[10px] disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {busy ? 'Saving…' : isEdit ? 'Update review' : 'Submit review'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="text-[0.78rem] text-[#B3261E] hover:underline disabled:opacity-40"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────

export function ReviewSection({ productId, sellerId, sellerName }: {
  productId: string;
  sellerId?: string;
  sellerName: string;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const [data, setData] = useState<ProductReviewPage | null>(null);
  const [mine, setMine] = useState<MyReviewStatus | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api.getProductReviews(productId, p, 10);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const loadMine = useCallback(async () => {
    if (!isSignedIn) { setMine(null); return; }
    try {
      setMine(await api.getMyReviewStatus(productId));
    } catch {
      setMine(null);
    }
  }, [productId, isSignedIn]);

  useEffect(() => { load(page); }, [load, page]);
  useEffect(() => { loadMine(); }, [loadMine]);

  const refresh = useCallback(() => {
    loadMine();
    load(page);
    setShowForm(false);
  }, [load, loadMine, page]);

  const summary = data?.summary;

  return (
    <section className="mt-12 sm:mt-16">
      <h2
        className="font-extrabold text-[#0D0D0D] leading-tight tracking-[-0.02em] mb-6"
        style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 4vw, 1.9rem)' }}
      >
        Customer reviews
      </h2>

      <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">
        {/* Summary column */}
        <div className="bg-white border border-black/[0.07] rounded-[16px] p-5 lg:sticky lg:top-[84px]">
          {loading && !summary ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 w-28 bg-black/[0.06] rounded" />
              <div className="h-3 w-full bg-black/[0.05] rounded" />
              <div className="h-3 w-4/5 bg-black/[0.05] rounded" />
            </div>
          ) : !summary || summary.total === 0 ? (
            <>
              <p className="text-[2rem] font-extrabold text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>—</p>
              <p className="text-[0.8rem] text-black/45 mt-1 mb-4">
                No reviews yet on this product.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-[2.4rem] leading-none font-extrabold text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
                  {summary.average.toFixed(1)}
                </span>
                <Stars value={summary.average} size="md" />
              </div>
              <p className="text-[0.76rem] text-black/40 mb-4">
                Based on {summary.total} review{summary.total === 1 ? '' : 's'}
              </p>
              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = summary.distribution[star] ?? 0;
                  const pct = summary.total ? Math.round((count / summary.total) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[0.7rem] text-black/50 w-6">{star}★</span>
                      <div className="flex-1 h-2 bg-black/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-[#E8A020] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[0.68rem] text-black/35 w-6 text-right tabular-nums">{count}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Write / edit review CTA */}
          <div className="mt-5 pt-4 border-t border-black/[0.06]">
            {isLoaded && isSignedIn && mine ? (
              mine.review ? (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="w-full text-[0.78rem] font-semibold text-[#0D0D0D] bg-black/[0.05] hover:bg-black/[0.09] transition-colors rounded-[10px] py-2.5"
                >
                  Edit your review
                </button>
              ) : mine.verifiedPurchase ? (
                showForm ? null : (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="w-full text-[0.78rem] font-semibold text-[#F5F0E8] bg-[#0D0D0D] hover:opacity-90 transition-opacity rounded-[10px] py-2.5"
                  >
                    Write a review
                  </button>
                )
              ) : (
                <p className="text-[0.72rem] text-black/40 leading-relaxed">
                  Reviews are for shoppers who bought this product. Place an order and
                  your review will carry a <strong>Verified purchase</strong> badge.
                </p>
              )
            ) : (
              <p className="text-[0.72rem] text-black/40 leading-relaxed">
                Sign in to review after purchase.
              </p>
            )}
          </div>
        </div>

        {/* List column */}
        <div>
          {isLoaded && isSignedIn && showForm && mine && (
            <ReviewForm
              productId={productId}
              sellerId={sellerId}
              sellerName={sellerName}
              existing={mine.review}
              onSubmitted={refresh}
            />
          )}

          {loading && !data ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse border-b border-black/[0.06] pb-5">
                  <div className="h-4 w-40 bg-black/[0.06] rounded mb-2" />
                  <div className="h-3 w-full bg-black/[0.05] rounded mb-1.5" />
                  <div className="h-3 w-2/3 bg-black/[0.05] rounded" />
                </div>
              ))}
            </div>
          ) : !data || data.reviews.length === 0 ? (
            <div className="text-[0.84rem] text-black/45 bg-white border border-black/[0.07] rounded-[14px] p-6">
              No written reviews yet{summary && summary.total > 0 ? ` — ${summary.total} rating${summary.total === 1 ? '' : 's'} so far.` : '.'}
            </div>
          ) : (
            <>
              {data.reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
              {data.pages > 1 && (
                <div className="flex items-center justify-between mt-5">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="text-[0.78rem] font-medium disabled:opacity-30 hover:text-[#E8622A] transition-colors"
                  >
                    ← Previous
                  </button>
                  <span className="text-[0.72rem] text-black/40">Page {data.page} of {data.pages}</span>
                  <button
                    type="button"
                    disabled={page >= data.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="text-[0.78rem] font-medium disabled:opacity-30 hover:text-[#E8622A] transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

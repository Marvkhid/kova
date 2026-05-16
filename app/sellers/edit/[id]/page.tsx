'use client';
// ============================================================
// KOVA — /sellers/edit/[id]
// Edit an existing product listing.
// Pre-fills all fields from product data.
// ============================================================

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/Component/ToastContext';
import { PRODUCTS } from '@/lib/types/data/products';
import { formatPrice } from '@/lib/utils';
import type { ProductCategory, ProductBadge } from '@/lib/types';
import { notFound } from 'next/navigation';

// ── Shared field styles ───────────────────────────────────

const inputClass = [
  'w-full rounded-[12px] bg-[#F5F0E8] border border-black/[0.09]',
  'text-[0.9rem] text-[#0D0D0D] placeholder:text-black/30',
  'px-4 h-[46px]',
  'outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/15',
  'transition-all duration-200',
].join(' ');

const textareaClass = [
  'w-full rounded-[12px] bg-[#F5F0E8] border border-black/[0.09]',
  'text-[0.9rem] text-[#0D0D0D] placeholder:text-black/30',
  'px-4 py-3 resize-none',
  'outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/15',
  'transition-all duration-200',
].join(' ');

function FormField({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.82rem] font-semibold text-[#0D0D0D]/70 flex items-center gap-1">
        {label}
        {required && <span className="text-[#E8622A]">*</span>}
      </label>
      {children}
      {hint && <p className="text-[0.72rem] text-black/35">{hint}</p>}
    </div>
  );
}

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'fashion',  label: 'Fashion & Style' },
  { value: 'digital',  label: 'Digital Products' },
  { value: 'services', label: 'Services' },
  { value: 'physical', label: 'Physical Goods' },
  { value: 'art',      label: 'Art & Crafts' },
  { value: 'courses',  label: 'Courses & Learning' },
];

// ── Page ──────────────────────────────────────────────────

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) notFound();

  const router = useRouter();
  const { addToast } = useToast();

  const [name,        setName]        = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price,       setPrice]       = useState(String(product.price));
  const [category,    setCategory]    = useState<ProductCategory>(product.category);
  const [badge,       setBadge]       = useState<ProductBadge | ''>(product.badge ?? '');
  const [tags,        setTags]        = useState(product.tags?.join(', ') ?? '');
  const [loading,     setLoading]     = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price || !category) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    setLoading(true);
    // ── Replace with real API PATCH call ──
    await new Promise(r => setTimeout(r, 1200));
    addToast(`"${name}" updated successfully.`);
    setLoading(false);
    router.push('/sellers/dashboard');
  }

  async function handleDelete() {
    if (!confirm(`Permanently delete "${product!.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    // ── Replace with real API DELETE call ──
    await new Promise(r => setTimeout(r, 1000));
    addToast(`"${product!.name}" has been removed.`, 'info');
    setDeleting(false);
    router.push('/sellers/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* Top bar */}
      <div className="bg-[#0D0D0D] px-5 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="#1A1A1A"/>
              <rect x="9" y="8" width="4" height="20" rx="2" fill="#F5F0E8"/>
              <path d="M13 18 L24 8" stroke="#E8622A" strokeWidth="4" strokeLinecap="round"/>
              <path d="M13 18 L24 28" stroke="#F5F0E8" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </Link>
          <span className="text-[#F5F0E8]/20 text-sm">/</span>
          <Link href="/sellers/dashboard" className="text-[#F5F0E8]/50 text-sm hover:text-[#F5F0E8] transition-colors">
            Dashboard
          </Link>
          <span className="text-[#F5F0E8]/20 text-sm">/</span>
          <span className="text-[#F5F0E8]/80 text-sm truncate max-w-[160px]">Edit: {product.name}</span>
        </div>
        <Link href="/sellers/dashboard"
          className="text-[0.8rem] text-[#F5F0E8]/50 hover:text-[#F5F0E8] transition-colors">
          ← Back
        </Link>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-10">

        {/* Page title */}
        <div className="mb-10">
          <h1
            className="font-extrabold text-[#0D0D0D] leading-[1.0] tracking-[-0.03em] mb-1"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}
          >
            Edit listing
          </h1>
          <p className="text-[0.9rem] text-black/40">
            Changes go live immediately after saving.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-start">

          {/* ── Form ── */}
          <form onSubmit={handleSave} className="flex flex-col gap-6">

            {/* Current image */}
            <div className="bg-white rounded-[20px] border border-black/[0.07] p-5 flex gap-4 items-center">
              <div className="w-20 h-20 rounded-[14px] overflow-hidden flex-shrink-0 bg-[#EDE8DF]">
                <img
                  src={`/images/${product.imagePlaceholder}.jpg`}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[0.88rem] text-[#0D0D0D] mb-1">Current image</p>
                <p className="text-[0.75rem] text-black/40 mb-3">{product.imagePlaceholder}.jpg</p>
                <label className="inline-flex items-center gap-2 text-[0.78rem] font-medium text-[#E8622A] cursor-pointer hover:opacity-70 transition-opacity">
                  <input type="file" accept="image/*" className="sr-only"/>
                  📷 Replace image
                </label>
              </div>
            </div>

            <FormField label="Product name" required>
              <input type="text" className={inputClass} value={name} onChange={e => setName(e.target.value)}/>
            </FormField>

            <FormField label="Description" required hint="Aim for 80–160 words.">
              <textarea className={textareaClass} rows={5} value={description} onChange={e => setDescription(e.target.value)}/>
            </FormField>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Price (USD)" required>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35">$</span>
                  <input type="number" min="0" step="0.01" className={inputClass + ' pl-7'}
                    value={price} onChange={e => setPrice(e.target.value)}/>
                </div>
              </FormField>

              <FormField label="Category" required>
                <select className={inputClass + ' appearance-none cursor-pointer'}
                  value={category} onChange={e => setCategory(e.target.value as ProductCategory)}>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Badge">
                <select className={inputClass + ' appearance-none cursor-pointer'}
                  value={badge} onChange={e => setBadge(e.target.value as ProductBadge | '')}>
                  <option value="">No badge</option>
                  <option value="new">New</option>
                  <option value="hot">Hot</option>
                  <option value="sale">Sale</option>
                </select>
              </FormField>

              <FormField label="Tags" hint="Comma-separated">
                <input type="text" className={inputClass} value={tags} onChange={e => setTags(e.target.value)}/>
              </FormField>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 h-[52px] rounded-full font-medium text-[1rem] bg-[#E8622A] text-white hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(232,98,42,0.35)] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
                {loading ? (
                  <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Saving…</>
                ) : '💾 Save changes'}
              </button>
              <Link href="/sellers/dashboard"
                className="h-[52px] px-6 rounded-full border border-black/15 text-black/60 font-medium flex items-center justify-center hover:border-black/30 hover:text-black transition-all duration-200">
                Cancel
              </Link>
            </div>

            {/* Danger zone */}
            <div className="border border-red-200 rounded-[16px] p-5 mt-2">
              <p className="font-semibold text-[0.88rem] text-red-600 mb-1">Danger zone</p>
              <p className="text-[0.8rem] text-black/45 mb-4">
                Permanently delete this listing. This action cannot be undone.
              </p>
              <button type="button" onClick={handleDelete} disabled={deleting}
                className="px-5 py-2.5 rounded-full border border-red-300 text-red-500 text-sm font-medium hover:bg-red-50 hover:border-red-400 transition-all duration-200 disabled:opacity-50 flex items-center gap-2">
                {deleting ? 'Deleting…' : '🗑 Delete listing'}
              </button>
            </div>

          </form>

          {/* ── Sidebar stats ── */}
          <div className="sticky top-[90px] flex flex-col gap-4">

            {/* Current stats */}
            <div className="bg-white rounded-[20px] border border-black/[0.07] p-5">
              <p className="font-bold text-[0.95rem] text-[#0D0D0D] mb-4"
                style={{ fontFamily: 'var(--font-display)' }}>
                Listing performance
              </p>
              {[
                { label: 'Total sold',   value: `${product.buyCount ?? 0} units` },
                { label: 'Rating',       value: product.rating ? `${product.rating}★ (${product.reviewCount} reviews)` : 'No reviews yet' },
                { label: 'Current price',value: formatPrice(product.price) },
                { label: 'Category',     value: product.category },
                { label: 'Status',       value: 'Live' },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2.5 border-b border-black/[0.05] last:border-0">
                  <span className="text-[0.8rem] text-black/45">{row.label}</span>
                  <span className="text-[0.8rem] font-semibold text-[#0D0D0D] capitalize">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Quick preview */}
            <div className="bg-white rounded-[20px] border border-black/[0.07] overflow-hidden">
              <div className="aspect-video relative bg-[#EDE8DF]">
                <img
                  src={`/images/${product.imagePlaceholder}.jpg`}
                  alt={product.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="p-4">
                <p className="text-[0.68rem] text-[#E8622A] uppercase tracking-[0.07em] mb-1">Your Store</p>
                <p className="font-bold text-[0.95rem] text-[#0D0D0D]"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  {name}
                </p>
                <p className="font-extrabold text-[1.1rem] text-[#0D0D0D] mt-2"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  {price ? `$${price}` : formatPrice(product.price)}
                </p>
              </div>
            </div>

            {/* View live */}
            <Link href={`/shopping/${product.id}`}
              className="w-full py-3 rounded-full border border-black/15 text-black/60 font-medium text-sm text-center hover:border-black/30 hover:text-black transition-all duration-200">
              View live listing →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
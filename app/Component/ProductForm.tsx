'use client';
// ============================================================
// KOVA — ProductForm
// The serious listing form used by /sellers/new and /sellers/edit/[id].
//   • PHYSICAL / DIGITAL selector drives the whole form
//   • Physical: 4 guided image slots (Front / Back / Side / Detail),
//     first 3 required to publish — mirrored server-side
//   • Digital: optional cover, description carries the weight
//   • Real upload progress (XHR), preview, replace, remove
//   • First filled slot = primary image
// The backend stays authoritative; this UI mirrors its rules so
// sellers get feedback before the API rejects them.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useToast } from './ToastContext';
import { track } from '@/lib/analytics';
import type { Category, Product, ProductType, ProductStatus } from '@/lib/types';

// ── Constants ─────────────────────────────────────────────

const MIN_PHYSICAL_IMAGES = 3; // must match the API
const MAX_FILE_MB = 5;

const PHYSICAL_SLOTS = [
  { label: 'Front view', hint: 'The main shot buyers see first', required: true },
  { label: 'Back view', hint: 'Show the reverse / detailing', required: true },
  { label: 'Side view', hint: 'Left or right profile', required: true },
  { label: 'Detail / top', hint: 'Texture, stitching, ports — up close', required: false },
] as const;

const DIGITAL_SLOTS = [{ label: 'Cover image', hint: 'Optional — a strong cover boosts clicks' }] as const;

// ── Field styles ──────────────────────────────────────────

const inputClass = [
  'w-full rounded-[12px] bg-[#F5F0E8] border border-black/[0.09]',
  'text-[0.88rem] text-[#0D0D0D] placeholder:text-black/30',
  'px-4 h-[44px] sm:h-[46px]',
  'outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/15',
  'transition-all duration-200',
].join(' ');

const textareaClass = [
  'w-full rounded-[12px] bg-[#F5F0E8] border border-black/[0.09]',
  'text-[0.88rem] text-[#0D0D0D] placeholder:text-black/30',
  'px-4 py-3 resize-y min-h-[130px]',
  'outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/15',
  'transition-all duration-200',
].join(' ');

function FormField({
  label,
  required,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[0.8rem] font-semibold text-[#0D0D0D]/70 flex items-center gap-1">
        {label}
        {required && <span className="text-[#E8622A]" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[0.72rem] text-red-500" role="alert">{error}</p>
      ) : (
        hint && <p className="text-[0.7rem] text-black/35">{hint}</p>
      )}
    </div>
  );
}

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────

export interface ProductFormHandle {
  /** Product being edited, or null in create mode. */
  product: Product | null;
}

export function ProductForm({
  productId,
  sellerReady,
}: {
  productId?: string;          // present → edit mode
  sellerReady: boolean;        // has a seller profile (can publish)
}) {
  const router = useRouter();
  const { addToast } = useToast();

  const isEdit = Boolean(productId);

  // ── Data loading ──
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, maybeProduct] = await Promise.all([
          api.getCategories(),
          productId ? api.getProduct(productId) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setCategories(cats);
        setProduct(maybeProduct);
        setLoadState('ready');
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          addToast('That product does not exist.', 'error');
          router.replace('/sellers/dashboard');
          return;
        }
        setLoadState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, addToast, router]);

  // ── Form state ──
  const [productType, setProductType] = useState<ProductType>('PHYSICAL');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [tags, setTags] = useState('');
  const [inStock, setInStock] = useState(true);
  const [images, setImages] = useState<(string | undefined)[]>([undefined, undefined, undefined, undefined]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  const [saving, setSaving] = useState<'draft' | 'publish' | 'save' | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Prefill once the product arrives (edit mode)
  useEffect(() => {
    if (!product) return;
    setProductType(product.productType);
    setName(product.name);
    setDescription(product.description ?? '');
    setPrice(String(product.price));
    if (product.originalPrice) setOriginalPrice(String(product.originalPrice));
    if (product.category?.slug) setCategorySlug(product.category.slug);
    if (product.tags?.length) setTags(product.tags.join(', '));
    setInStock(product.inStock);
    const filled: (string | undefined)[] = [...(product.images ?? [])];
    while (filled.length < 4) filled.push(undefined);
    setImages(filled.slice(0, Math.max(4, filled.length)));
  }, [product]);

  const slots = productType === 'PHYSICAL' ? PHYSICAL_SLOTS : DIGITAL_SLOTS;
  const filledCount = images.filter(Boolean).length;
  const usableImages = useMemo(() => images.filter((i): i is string => Boolean(i)), [images]);

  // Switching type resets slots that no longer apply (keep first cover)
  function handleTypeChange(next: ProductType) {
    if (next === productType) return;
    setProductType(next);
    setImages((prev) => (next === 'DIGITAL' ? [prev[0]] : [prev[0], prev[1], prev[2], prev[3]]));
    setErrors((prev) => {
      const { images: _drop, ...rest } = prev;
      return rest;
    });
  }

  // ── Image upload per slot ──
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeSlotRef = useRef<number | null>(null);

  function openPicker(slotIndex: number) {
    activeSlotRef.current = slotIndex;
    fileInputRef.current?.click();
  }

  const handleFilesPicked = useCallback(
    async (fileList: FileList | null) => {
      const slot = activeSlotRef.current;
      if (!fileList?.length || slot === null) return;
      const file = fileList[0];

      if (!file.type.startsWith('image/')) {
        addToast('That file is not an image.', 'error');
        return;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        addToast(`Images must be under ${MAX_FILE_MB}MB.`, 'error');
        return;
      }

      setUploadingSlot(slot);
      setUploadPct(0);
      try {
        const [url] = await api.uploadImagesWithProgress([file], setUploadPct);
        setImages((prev) => {
          const next = [...prev];
          next[slot] = url;
          return next;
        });
        setErrors((prev) => ({ ...prev, images: '' }));
      } catch (err) {
        addToast(err instanceof ApiError ? err.message : 'Upload failed. Please try again.', 'error');
      } finally {
        setUploadingSlot(null);
        activeSlotRef.current = null;
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [addToast],
  );

  function removeImage(slot: number) {
    setImages((prev) => prev.map((img, i) => (i === slot ? undefined : img)));
  }

  // ── Validation (mirrors backend rules) ──
  function validate(): boolean {
    const next: Record<string, string> = {};
    if (name.trim().length < 3) next.name = 'Product name must be at least 3 characters.';
    if (description.trim().length < 20) next.description = 'Describe the product in at least 20 characters.';
    const p = parseFloat(price);
    if (!price || Number.isNaN(p) || p <= 0) next.price = 'Enter a price greater than zero.';
    if (originalPrice) {
      const op = parseFloat(originalPrice);
      if (Number.isNaN(op) || op < 0) next.originalPrice = 'Original price must be a positive number.';
      else if (!next.price && op <= p) next.originalPrice = 'Original price should be higher than the current price.';
    }
    if (!categorySlug) next.category = 'Choose a category.';
    if (productType === 'PHYSICAL' && filledCount < MIN_PHYSICAL_IMAGES) {
      next.images = `Physical products need at least ${MIN_PHYSICAL_IMAGES} images (front, back, side) before publishing.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function buildPayload() {
    return {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      ...(originalPrice ? { originalPrice: parseFloat(originalPrice) } : {}),
      productType,
      categorySlug,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      images: usableImages,
      inStock,
    };
  }

  // ── Submit ──
  async function submit(intent: 'draft' | 'publish' | 'save') {
    setServerErrors([]);
    if (!validate()) {
      addToast('Please fix the highlighted fields.', 'error');
      return;
    }

    setSaving(intent);
    try {
      if (isEdit && product) {
        const updated = await api.updateProduct(product.id, buildPayload());
        if (intent === 'publish' && updated.status !== 'PUBLISHED') {
          await api.publishProduct(product.id);
          track.productPublished({ id: product.id, productType });
        }
        addToast('Listing updated.');
        track.productCreated({ id: product.id, productType, published: intent === 'publish' });
        router.push('/sellers/dashboard');
      } else {
        const created = await api.createProduct({ ...buildPayload(), publish: intent === 'publish' });
        track.productCreated({ id: created.id, productType, published: intent === 'publish' });
        addToast(
          intent === 'publish'
            ? 'Product published — it is now live on the marketplace.'
            : 'Draft saved. Publish it when you are ready.',
        );
        router.push('/sellers/dashboard');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setServerErrors(err.details ?? [err.message]);
        addToast(err.details?.[0] ?? err.message, 'error');
      } else {
        setServerErrors(['Something went wrong. Please try again.']);
      }
    } finally {
      setSaving(null);
    }
  }

  async function togglePublish() {
    if (!product) return;
    setTogglingStatus(true);
    try {
      if (product.status === 'PUBLISHED') {
        await api.unpublishProduct(product.id);
        addToast('Listing unpublished — it is hidden from the marketplace.');
      } else {
        await api.publishProduct(product.id);
        track.productPublished({ id: product.id, productType });
        addToast('Listing published.');
      }
      const refreshed = await api.getProduct(product.id);
      setProduct(refreshed);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerErrors(err.details ?? [err.message]);
        addToast(err.details?.[0] ?? err.message, 'error');
      }
    } finally {
      setTogglingStatus(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    if (!window.confirm(`Permanently delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.deleteProduct(product.id);
      addToast('Listing deleted.', 'info');
      router.push('/sellers/dashboard');
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Could not delete the listing.', 'error');
      setDeleting(false);
    }
  }

  // ── Loading / error states ──
  if (loadState === 'loading') {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading form">
        <div className="h-10 w-64 bg-black/[0.06] rounded-[12px] animate-pulse" />
        <div className="h-24 bg-black/[0.04] rounded-[16px] animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-black/[0.04] rounded-[12px] animate-pulse" />
          <div className="h-16 bg-black/[0.04] rounded-[12px] animate-pulse" />
        </div>
        <div className="h-40 bg-black/[0.04] rounded-[16px] animate-pulse" />
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="bg-white rounded-[16px] border border-black/[0.07] p-8 text-center">
        <p className="font-bold text-[1rem] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Could not load the form
        </p>
        <p className="text-[0.84rem] text-black/45 mb-5">
          The server did not respond. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="px-6 py-2.5 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentStatus: ProductStatus | undefined = product?.status;
  const slotsForType = slots;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(isEdit ? 'save' : 'publish');
      }}
      className="flex flex-col gap-6"
      noValidate
    >
      {/* Hidden shared file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => handleFilesPicked(e.target.files)}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* ── Step 1 · What are you selling? ── */}
      <section className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-5 sm:p-6">
        <p className="text-[0.66rem] font-medium tracking-[0.14em] uppercase text-black/36 mb-1">Step 1</p>
        <h2 className="font-extrabold text-[1.05rem] sm:text-[1.2rem] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          What are you selling?
        </h2>
        <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Product type">
          {([
            {
              value: 'PHYSICAL' as ProductType,
              title: 'Physical product',
              desc: 'Shipped to the buyer. Requires at least 3 photos.',
              photo: '/images/seed/photo/furniture/furniture-p08.jpg',
            },
            {
              value: 'DIGITAL' as ProductType,
              title: 'Digital product',
              desc: 'Courses, ebooks, templates, software, designs.',
              photo: '/images/seed/photo/digital-products/digital-products-p04.jpg',
            },
          ]).map((opt) => {
            const selected = productType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => handleTypeChange(opt.value)}
                className={[
                  'flex items-start gap-3 p-4 rounded-[14px] border text-left transition-all duration-200',
                  selected
                    ? 'border-[#E8622A] bg-[#E8622A]/[0.06] shadow-[0_0_0_1px_#E8622A]'
                    : 'border-black/[0.09] hover:border-black/25',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex-shrink-0 w-10 h-10 rounded-full overflow-hidden transition-colors',
                    selected ? 'ring-2 ring-[#E8622A]' : '',
                  ].join(' ')}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={opt.photo} alt="" className="w-full h-full object-cover" loading="lazy" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-[0.92rem] text-[#0D0D0D]">{opt.title}</span>
                  <span className="block text-[0.76rem] text-black/45 leading-snug mt-0.5">{opt.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Step 2 · Images ── */}
      <section className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-5 sm:p-6">
        <p className="text-[0.66rem] font-medium tracking-[0.14em] uppercase text-black/36 mb-1">Step 2</p>
        <h2 className="font-extrabold text-[1.05rem] sm:text-[1.2rem] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          {productType === 'PHYSICAL' ? 'Product photos' : 'Cover image'}
        </h2>
        {productType === 'PHYSICAL' ? (
          <p className="text-[0.78rem] sm:text-[0.82rem] text-black/45 leading-relaxed mb-1 max-w-[560px]">
            Buyers cannot touch your product — your photos are the product. Listings with clear front, back
            and side views earn far more trust and far fewer refund requests. Upload at least{' '}
            <strong className="text-[#0D0D0D]">3 different angles</strong>; the first image becomes the
            main product photo.
          </p>
        ) : (
          <p className="text-[0.78rem] sm:text-[0.82rem] text-black/45 leading-relaxed mb-1 max-w-[560px]">
            A cover is optional for digital products — a detailed description does the selling here.
          </p>
        )}
        {productType === 'PHYSICAL' && (
          <p className="text-[0.72rem] text-[#E8622A] mb-4" aria-live="polite">
            {filledCount}/{MIN_PHYSICAL_IMAGES} required images uploaded
            {filledCount >= MIN_PHYSICAL_IMAGES ? ' ✓' : ''}
          </p>
        )}

        <div className={['grid gap-3', productType === 'PHYSICAL' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 sm:max-w-[300px]'].join(' ')}>
          {slotsForType.map((slot, i) => {
            const url = images[i];
            const isUploading = uploadingSlot === i;
            return (
              <div key={slot.label} className="flex flex-col gap-1.5">
                <div
                  className={[
                    'relative aspect-square rounded-[14px] overflow-hidden border transition-all duration-200',
                    url ? 'border-black/[0.09]' : 'border-dashed border-[#B5AFA5] bg-[#F5F0E8]',
                    errors.images && productType === 'PHYSICAL' && i < MIN_PHYSICAL_IMAGES && !url
                      ? 'border-red-300' : '',
                  ].join(' ')}
                >
                  {url ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`${slot.label} of ${name || 'product'}`} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 flex justify-between items-center p-1.5 bg-gradient-to-t from-black/55 to-transparent">
                        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.06em] text-white/90">
                          {i === 0 ? 'Main' : slot.label.split(' ')[0]}
                        </span>
                        <span className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openPicker(i)}
                            className="w-6 h-6 rounded-full bg-white/90 text-black/70 text-[0.65rem] flex items-center justify-center hover:bg-white transition-colors"
                            aria-label={`Replace ${slot.label}`}
                          >
                            ⟳
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="w-6 h-6 rounded-full bg-white/90 text-red-500 text-[0.65rem] flex items-center justify-center hover:bg-white transition-colors"
                            aria-label={`Remove ${slot.label}`}
                          >
                            ×
                          </button>
                        </span>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openPicker(i)}
                      disabled={uploadingSlot !== null}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-black/40 hover:text-[#E8622A] hover:bg-[#E8622A]/[0.04] transition-colors disabled:opacity-50"
                      aria-label={`Upload ${slot.label}`}
                    >
                      {isUploading ? (
                        <>
                          <Spinner className="text-[#E8622A]" />
                          <span className="text-[0.66rem] font-medium tabular-nums">{uploadPct}%</span>
                          <span className="absolute bottom-2 left-3 right-3 h-[3px] rounded-full bg-black/10 overflow-hidden">
                            <span
                              className="block h-full bg-[#E8622A] rounded-full transition-all duration-200"
                              style={{ width: `${uploadPct}%` }}
                            />
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-full h-full flex items-center justify-center" aria-hidden="true">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/images/seed/photo/electronics/electronics-p07.jpg" alt="" className="w-full h-full object-cover opacity-80" loading="lazy" />
                          </span>
                          <span className="absolute inset-0 bg-black/35" />
                          <span className="relative z-10 flex flex-col items-center gap-0.5">
                            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.06em]">{slot.label}</span>
                            <span className="text-[0.6rem] leading-tight px-2 text-center opacity-70">{slot.hint}</span>
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                {productType === 'PHYSICAL' && i < MIN_PHYSICAL_IMAGES && (
                  <span className={['text-[0.6rem] uppercase tracking-[0.08em] font-medium', url ? 'text-[#2A5C45]' : 'text-black/35'].join(' ')}>
                    {url ? '✓ uploaded' : 'required'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {errors.images && <p className="text-[0.74rem] text-red-500 mt-2" role="alert">{errors.images}</p>}
      </section>

      {/* ── Step 3 · Details ── */}
      <section className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-5 sm:p-6 flex flex-col gap-4">
        <div>
          <p className="text-[0.66rem] font-medium tracking-[0.14em] uppercase text-black/36 mb-1">Step 3</p>
          <h2 className="font-extrabold text-[1.05rem] sm:text-[1.2rem]" style={{ fontFamily: 'var(--font-display)' }}>
            {productType === 'DIGITAL' ? 'Describe it well — this is everything' : 'Product details'}
          </h2>
        </div>

        <FormField label="Product name" required error={errors.name} htmlFor="pf-name" hint={`${120 - name.length} characters left`}>
          <input
            id="pf-name"
            type="text"
            className={inputClass}
            value={name}
            maxLength={120}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Handwoven leather tote — full-grain"
          />
        </FormField>

        <FormField
          label="Description"
          required
          error={errors.description}
          htmlFor="pf-desc"
          hint={
            productType === 'DIGITAL'
              ? 'What exactly does the buyer get? Scope, format, what is included — be specific.'
              : 'Condition, materials, measurements, what is included. Aim for 80–160 words.'
          }
        >
          <textarea
            id="pf-desc"
            className={textareaClass}
            rows={6}
            value={description}
            maxLength={5000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              productType === 'DIGITAL'
                ? 'e.g. A 42-page Notion template for tracking freelance invoices, with automatic totals in USD and NGN…'
                : 'e.g. Brand new, never used. Full-grain leather, brass fittings, fits a 15" laptop…'
            }
          />
        </FormField>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Price (₦)" required error={errors.price} htmlFor="pf-price">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35" aria-hidden="true">$</span>
              <input
                id="pf-price"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                className={inputClass + ' pl-8'}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </FormField>

          <FormField label="Original price" error={errors.originalPrice} htmlFor="pf-oprice" hint="Optional — shows a strikethrough deal">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35" aria-hidden="true">$</span>
              <input
                id="pf-oprice"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                className={inputClass + ' pl-8'}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Category" required error={errors.category} htmlFor="pf-cat">
            <select
              id="pf-cat"
              className={inputClass + ' appearance-none cursor-pointer'}
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
            >
              <option value="" disabled>
                {categories.length ? 'Select a category…' : 'Loading categories…'}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tags" htmlFor="pf-tags" hint="Comma-separated — helps buyers find you">
            <input
              id="pf-tags"
              type="text"
              className={inputClass}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="leather, handmade, tote"
            />
          </FormField>
        </div>

        <label className="flex items-center gap-2.5 text-[0.82rem] text-black/60 cursor-pointer select-none w-fit">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="w-4 h-4 accent-[#E8622A]"
          />
          Available for purchase
        </label>
      </section>

      {/* ── Server-side validation errors ── */}
      {serverErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-[14px] p-4" role="alert">
          <p className="font-semibold text-[0.84rem] text-red-600 mb-1.5">The server rejected this listing:</p>
          <ul className="list-disc pl-5 text-[0.78rem] text-red-500 space-y-0.5">
            {serverErrors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {isEdit ? (
          <>
            <button
              type="submit"
              disabled={saving !== null}
              className="flex-1 h-[50px] rounded-full font-medium bg-[#E8622A] text-white hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(232,98,42,0.35)] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:transform-none flex items-center justify-center gap-2"
            >
              {saving === 'save' ? <><Spinner /> Saving…</> : 'Save changes'}
            </button>
            {currentStatus === 'PUBLISHED' ? (
              <button
                type="button"
                onClick={togglePublish}
                disabled={togglingStatus}
                className="h-[50px] px-6 rounded-full border border-black/15 text-[#0D0D0D] font-medium hover:border-black/30 transition-all duration-200 disabled:opacity-60"
              >
                {togglingStatus ? 'Working…' : 'Unpublish'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => submit('publish')}
                disabled={saving !== null}
                className="h-[50px] px-6 rounded-full bg-[#0D0D0D] text-[#F5F0E8] font-medium hover:bg-black transition-all duration-200 disabled:opacity-60"
              >
                {saving === 'publish' ? <><Spinner /> Publishing…</> : currentStatus === 'DRAFT' ? 'Publish now' : 'Publish again'}
              </button>
            )}
          </>
        ) : (
          <>
            <button
              type="submit"
              disabled={saving !== null}
              className="flex-1 h-[50px] rounded-full font-medium bg-[#E8622A] text-white hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(232,98,42,0.35)] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:transform-none flex items-center justify-center gap-2"
            >
              {saving === 'publish' ? <><Spinner /> Publishing…</> : 'Publish listing'}
            </button>
            <button
              type="button"
              onClick={() => submit('draft')}
              disabled={saving !== null}
              className="h-[50px] px-6 rounded-full border border-black/15 text-[#0D0D0D] font-medium hover:border-black/30 transition-all duration-200 disabled:opacity-60"
            >
              {saving === 'draft' ? <><Spinner /> Saving…</> : 'Save as draft'}
            </button>
          </>
        )}
        <Link
          href="/sellers/dashboard"
          className="h-[50px] px-6 rounded-full border border-black/15 text-black/60 font-medium flex items-center justify-center hover:border-black/30 hover:text-black transition-all duration-200"
        >
          Cancel
        </Link>
      </div>

      {!sellerReady && !isEdit && (
        <p className="text-[0.74rem] text-black/40">
          You can save drafts, but publishing requires an active seller profile.
        </p>
      )}

      {/* ── Danger zone (edit only) ── */}
      {isEdit && product && (
        <div className="border border-red-200 rounded-[14px] p-4 sm:p-5">
          <p className="font-semibold text-[0.84rem] text-red-600 mb-1">Danger zone</p>
          <p className="text-[0.78rem] text-black/45 mb-4">
            Permanently delete this listing. Its public URL and QR code will stop working.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2.5 rounded-full border border-red-300 text-red-500 text-sm font-medium hover:bg-red-50 hover:border-red-400 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {deleting ? <><Spinner /> Deleting…</> : 'Delete listing'}
          </button>
        </div>
      )}
    </form>
  );
}

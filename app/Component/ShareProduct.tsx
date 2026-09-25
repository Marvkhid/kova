'use client';

// ============================================================
// KOVA — ShareProduct
// Share modal for product listings:
//   • Copy link (canonical /products/[slug] URL)
//   • Native share (Web Share API where supported)
//   • QR code generated from the real product URL + PNG download
// The QR always resolves to the public product page — never a
// temporary dashboard route.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useToast } from './ToastContext';
import { track } from '@/lib/analytics';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

export function productUrl(slug: string): string {
  if (typeof window !== 'undefined' && !SITE_URL) {
    return `${window.location.origin}/products/${slug}`;
  }
  return `${SITE_URL}/products/${slug}`;
}

interface ShareProductProps {
  product: { id: string; name: string; slug: string };
  open: boolean;
  onClose: () => void;
}

export function ShareProduct({ product, open, onClose }: ShareProductProps) {
  const { addToast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const url = productUrl(product.slug);

  // Generate the QR from the actual public URL
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setGenerating(true);
    QRCode.toDataURL(url, {
      width: 480,
      margin: 2,
      color: { dark: '#0D0D0D', light: '#F5F0E8' },
      errorCorrectionLevel: 'M',
    })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      })
      .finally(() => {
        if (!cancelled) setGenerating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, url]);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  // Escape closes + focus trap-lite
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      addToast('Product link copied.');
      track.shareProduct({ id: product.id, method: 'copy_link' });
    } catch {
      addToast('Could not copy the link.', 'error');
    }
  }, [url, addToast, product.id]);

  const nativeShare = useCallback(async () => {
    try {
      await navigator.share({
        title: product.name,
        text: `Check out ${product.name} on KOVA`,
        url,
      });
      track.shareProduct({ id: product.id, method: 'native_share' });
    } catch {
      // user dismissed the share sheet — not an error
    }
  }, [product.name, product.id, url]);

  const downloadQr = useCallback(() => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `kova-qr-${product.slug}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    addToast('QR code downloaded — anyone who scans it lands on this product.');
    track.qrDownload({ id: product.id });
  }, [qrDataUrl, product.slug, product.id, addToast]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Share ${product.name}`}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-[#F5F0E8] rounded-[20px] sm:rounded-[24px] w-full max-w-[400px] p-6 sm:p-7 shadow-2xl outline-none"
        style={{ animation: 'modalIn 220ms cubic-bezier(0.16,1,0.3,1)' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close share dialog"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-black/40 hover:text-black hover:bg-black/[0.06] transition-colors"
        >
          ×
        </button>

        <h2
          className="font-extrabold text-[1.1rem] sm:text-[1.2rem] text-[#0D0D0D] leading-tight pr-8"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Share this product
        </h2>
        <p className="text-[0.78rem] sm:text-[0.82rem] text-black/45 mt-1 mb-5 truncate">
          {product.name}
        </p>

        {/* QR preview */}
        <div className="flex justify-center mb-5">
          <div className="bg-white rounded-[16px] border border-black/[0.08] p-4">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR code linking to ${product.name}`}
                width={180}
                height={180}
                className="block"
              />
            ) : (
              <div
                className="w-[180px] h-[180px] bg-[#EDE8DF] rounded-[8px] animate-pulse flex items-center justify-center text-[0.68rem] text-black/40"
                aria-live="polite"
              >
                {generating ? 'Generating QR…' : 'QR unavailable'}
              </div>
            )}
          </div>
        </div>

        {/* URL row */}
        <div className="flex items-center gap-2 bg-white border border-black/[0.08] rounded-full pl-4 pr-1 py-1 mb-4">
          <span className="flex-1 text-[0.72rem] sm:text-[0.78rem] text-black/55 truncate select-all">
            {url}
          </span>
          <button
            type="button"
            onClick={copyLink}
            className="flex-shrink-0 px-4 py-2 rounded-full bg-[#0D0D0D] text-[#F5F0E8] text-[0.74rem] font-medium hover:bg-[#E8622A] transition-colors"
          >
            Copy
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          {canNativeShare && (
            <button
              type="button"
              onClick={nativeShare}
              className="flex-1 h-[44px] rounded-full border border-black/15 text-[#0D0D0D] text-sm font-medium hover:border-black/30 transition-colors"
            >
              Share…
            </button>
          )}
          <button
            type="button"
            onClick={downloadQr}
            disabled={!qrDataUrl}
            className="flex-1 h-[44px] rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download QR
          </button>
        </div>

        <p className="text-[0.66rem] text-black/35 text-center mt-4 leading-relaxed">
          The QR code opens this exact product page on KOVA — safe to print, post or send.
        </p>
      </div>
    </div>
  );
}

/** Compact trigger button used on dashboards and cards. */
export function ShareButton({
  product,
  className = '',
  label = 'Share',
}: {
  product: { id: string; name: string; slug: string };
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={className}
        aria-label={`Share ${product.name}`}
      >
        {label}
      </button>
      <ShareProduct product={product} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

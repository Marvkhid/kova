'use client';

// ============================================================
// KOVA — ProductGallery
// Product image gallery: main image + thumbnails + hover zoom.
// The first image is the primary product image.
// ============================================================

import { useRef, useState } from 'react';
import { productPhoto } from '@/lib/photo-fallback';

interface ProductGalleryProps {
  images: string[];
  alt: string;
  productType?: 'PHYSICAL' | 'DIGITAL';
  categorySlug?: string | null;
}

export function ProductGallery({ images, alt, productType, categorySlug }: ProductGalleryProps) {
  const safeImages = (images ?? []).filter(Boolean);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const frameRef = useRef<HTMLDivElement>(null);

  if (safeImages.length === 0) {
    return (
      <div className="relative w-full aspect-square rounded-[18px] sm:rounded-[24px] overflow-hidden bg-[#EDE8DF] border border-black/[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productPhoto({ categorySlug, name: alt })}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/85 backdrop-blur text-[0.68rem] font-medium text-black/45 px-3 py-1 rounded-full">
          Seller photos coming soon
        </span>
      </div>
    );
  }

  function handleMove(e: React.MouseEvent) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  const manyImages = safeImages.length > 1;

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        ref={frameRef}
        className="relative w-full aspect-square rounded-[18px] sm:rounded-[24px] overflow-hidden bg-[#EDE8DF] border border-black/[0.06] select-none"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMove}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={safeImages[active]}
          src={safeImages[active]}
          alt={`${alt} — image ${active + 1} of ${safeImages.length}`}
          className="w-full h-full"
          style={{
            objectFit: 'cover',
            transformOrigin: `${origin.x}% ${origin.y}%`,
            transform: zoom ? 'scale(1.75)' : 'scale(1)',
            transition: 'transform 240ms ease-out',
            cursor: zoom ? 'zoom-out' : 'zoom-in',
          }}
        />

        {productType === 'DIGITAL' && (
          <span className="absolute top-3 left-3 inline-flex items-center bg-[#3B2F6E]/90 text-[#F5F0E8] text-[0.62rem] font-semibold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full">
            Digital product
          </span>
        )}

        {manyImages && (
          <span className="absolute bottom-3 right-3 bg-black/55 text-white text-[0.66rem] font-medium px-2.5 py-1 rounded-full">
            {active + 1} / {safeImages.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {manyImages && (
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${Math.min(safeImages.length, 5)}, minmax(0, 1fr))`,
          }}
          role="tablist"
          aria-label={`${alt} images`}
        >
          {safeImages.slice(0, 5).map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`View image ${i + 1}`}
              onClick={() => setActive(i)}
              className={[
                'relative aspect-square rounded-[10px] sm:rounded-[12px] overflow-hidden',
                'border-2 transition-all duration-200',
                active === i
                  ? 'border-[#E8622A] shadow-[0_2px_10px_rgba(232,98,42,0.25)]'
                  : 'border-transparent hover:border-black/20 opacity-80 hover:opacity-100',
              ].join(' ')}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

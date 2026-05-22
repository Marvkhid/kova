'use client';
// ============================================================
// KOVA — ImageSlot
// A flexible image placeholder.
// Replace <ImageSlot> with <Image> or <img> when real assets are ready.
// ============================================================

interface ImageSlotProps {
  label?: string;
  fill?: boolean;      // absolute inset-0 for overlay/fill usage
  className?: string;
  rounded?: boolean;   // full circle when true
}

export function ImageSlot({
  label,
  fill = false,
  className = '',
  rounded = false,
}: ImageSlotProps) {
  const base = [
    'flex items-center justify-center', // ✅ fixed
    'bg-[#EDE8DF] border border-dashed border-[#B5AFA5]',
    'text-[#7A746C] text-[0.62rem] sm:text-[0.68rem] font-medium tracking-[0.08em] uppercase',
    'text-center px-2 sm:px-3',
    fill ? 'absolute inset-0' : 'relative w-full h-full',
    rounded ? 'rounded-full' : 'rounded-[inherit]',
    className,
  ].join(' ');

  return (
    <div className={base} aria-label={label ?? 'Image placeholder'} role="img">
      <span className="opacity-60 leading-snug max-w-[120px]">
        {label ?? 'image'}
      </span>
    </div>
  );
}
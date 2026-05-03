'use client';
// ============================================================
// KOVA — ImageSlot
// A flexible image placeholder.
// Replace the entire <ImageSlot> with <Image> or <img> when
// you have your real assets. The parent div controls sizing.
//
// Usage:
//   <div className="relative w-full h-64">
//     <ImageSlot label="Hero image" fill />
//   </div>
//
//   Swap:
//   <div className="relative w-full h-64">
//     <Image src="/images/hero.jpg" alt="Hero" fill className="object-cover" />
//   </div>
// ============================================================

interface ImageSlotProps {
  label?:     string;
  fill?:      boolean;   // position: absolute, inset-0 (for overlapping layouts)
  className?: string;
  rounded?:   boolean;
}

export function ImageSlot({ label, fill = false, className = '', rounded = false }: ImageSlotProps) {
  const base = [
    'flex items-center justify-content-center',
    'bg-[#EDE8DF] border border-dashed border-[#B5AFA5]',
    'text-[#7A746C] text-[0.68rem] font-medium tracking-[0.08em] uppercase',
    'text-center px-3',
    fill   ? 'absolute inset-0' : 'relative w-full h-full',
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
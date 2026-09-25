// ============================================================
// KOVA — Skeletons
// Loading placeholders matching real layouts. Server-component
// friendly (no client JS needed).
// ============================================================

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-[16px] sm:rounded-[18px] border border-black/[0.07] overflow-hidden">
      <div className="w-full aspect-square bg-[#EDE8DF] animate-pulse" />
      <div className="px-3 sm:px-4 pt-3 pb-4">
        <div className="h-2 w-16 bg-black/[0.07] rounded-full mb-2 animate-pulse" />
        <div className="h-3.5 w-3/4 bg-black/[0.09] rounded-full mb-2 animate-pulse" />
        <div className="h-3 w-1/2 bg-black/[0.06] rounded-full mb-3 animate-pulse" />
        <div className="h-5 w-20 bg-black/[0.09] rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-5" aria-busy="true">
      <div className="h-2.5 w-20 bg-black/[0.07] rounded-full mb-3 animate-pulse" />
      <div className="h-7 w-24 bg-black/[0.09] rounded-full animate-pulse" />
    </div>
  );
}

export function StatsRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

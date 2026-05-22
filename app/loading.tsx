// ============================================================
// KOVA — Global Loading Skeleton
// Shows while pages are loading. Netflix-style dark skeleton.
// ============================================================

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] pt-[64px]">
      {/* Hero skeleton */}
      <div className="relative h-[360px] sm:h-[480px] md:h-[560px] bg-[#161616] overflow-hidden">
        <div className="absolute inset-0 shimmer" />
        <div className="absolute bottom-8 sm:bottom-12 left-4 sm:left-8 md:left-16 flex flex-col gap-3 sm:gap-4">
          <div className="h-2.5 sm:h-3 w-20 sm:w-24 rounded-full bg-[#2A2A2A]" />
          <div className="h-8 sm:h-10 w-52 sm:w-64 md:w-96 rounded-[10px] bg-[#2A2A2A]" />
          <div className="h-8 sm:h-10 w-40 sm:w-48 md:w-72 rounded-[10px] bg-[#2A2A2A]" />
          <div className="h-3.5 sm:h-4 w-56 sm:w-80 rounded-full bg-[#222]" />
          <div className="flex gap-3 mt-2">
            <div className="h-10 sm:h-11 w-28 sm:w-36 rounded-full bg-[#2A2A2A]" />
            <div className="h-10 sm:h-11 w-28 sm:w-36 rounded-full bg-[#1E1E1E]" />
          </div>
        </div>
      </div>

      {/* Section skeleton */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8 py-10 sm:py-14">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div className="flex flex-col gap-3">
            <div className="h-2.5 w-20 rounded-full bg-[#1E1E1E]" />
            <div className="h-6 sm:h-7 w-40 sm:w-48 rounded-[8px] bg-[#1E1E1E]" />
          </div>
          <div className="h-4 w-14 sm:w-16 rounded-full bg-[#1E1E1E]" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#161616] rounded-[16px] sm:rounded-[18px] overflow-hidden">
              <div className="aspect-square bg-[#1E1E1E] relative overflow-hidden">
                <div className="absolute inset-0 shimmer" />
              </div>
              <div className="p-3 sm:p-4 flex flex-col gap-2.5">
                <div className="h-2 w-16 rounded-full bg-[#1E1E1E]" />
                <div className="h-4 w-full rounded-[6px] bg-[#1E1E1E]" />
                <div className="h-3 w-24 rounded-full bg-[#1A1A1A]" />
                <div className="flex justify-between items-center mt-1">
                  <div className="h-5 w-12 rounded-[6px] bg-[#1E1E1E]" />
                  <div className="w-8 h-8 rounded-full bg-[#1E1E1E]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 sm:mt-16 flex flex-col gap-4">
          <div className="h-2.5 w-20 rounded-full bg-[#1E1E1E]" />
          <div className="h-6 sm:h-7 w-44 sm:w-56 rounded-[8px] bg-[#1E1E1E]" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#161616] rounded-[16px] sm:rounded-[18px] overflow-hidden">
                <div className="aspect-square bg-[#1E1E1E] relative overflow-hidden">
                  <div className="absolute inset-0 shimmer" />
                </div>
                <div className="p-3 sm:p-4 flex flex-col gap-2.5">
                  <div className="h-2 w-16 rounded-full bg-[#1E1E1E]" />
                  <div className="h-4 w-full rounded-[6px] bg-[#1E1E1E]" />
                  <div className="h-5 w-12 rounded-[6px] bg-[#1E1E1E] mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.04) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}
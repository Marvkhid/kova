// ============================================================
// KOVA — /products/[slug] loading state
// ============================================================

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 md:px-8 py-6 sm:py-8">
        <div className="h-3 w-48 bg-black/[0.06] rounded-full mb-6 animate-pulse" />
        <div className="grid lg:grid-cols-2 gap-7 sm:gap-10 items-start">
          <div>
            <div className="w-full aspect-square rounded-[18px] sm:rounded-[24px] bg-[#EDE8DF] animate-pulse" />
            <div className="grid grid-cols-4 gap-2 mt-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-[10px] bg-[#EDE8DF] animate-pulse" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-5 w-28 bg-black/[0.06] rounded-full animate-pulse" />
            <div className="h-9 w-3/4 bg-black/[0.09] rounded-full animate-pulse" />
            <div className="h-8 w-32 bg-black/[0.09] rounded-full animate-pulse" />
            <div className="h-14 bg-white border border-black/[0.07] rounded-[14px] animate-pulse" />
            <div className="h-[50px] rounded-full bg-black/[0.07] animate-pulse" />
            <div className="h-[46px] rounded-full bg-black/[0.05] animate-pulse" />
            <div className="h-40 bg-white border border-black/[0.07] rounded-[16px] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

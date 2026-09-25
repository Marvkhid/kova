'use client';

// ============================================================
// KOVA — Global error boundary
// Catches render/runtime errors in the route tree. Offers a
// retry; never leaks raw error details to the user.
// ============================================================

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] bg-[#F5F0E8] flex items-center justify-center px-4">
      <div className="bg-white rounded-[20px] border border-black/[0.07] p-8 sm:p-10 text-center max-w-[440px] w-full">
        <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-5" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/seed/photo/interior-home/interior-home-p07.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <h1 className="font-extrabold text-[1.2rem] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Something went wrong
        </h1>
        <p className="text-[0.86rem] text-black/45 mb-6 leading-relaxed">
          An unexpected error occurred. You can try again — if it keeps happening, please contact us.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-6 py-2.5 rounded-full bg-[#E8622A] text-white text-sm font-medium hover:bg-[#F07A48] transition-colors"
          >
            Try again
          </button>
          <a
            href="/contact"
            className="px-6 py-2.5 rounded-full border border-black/12 text-black/60 text-sm font-medium hover:border-black/30 transition-colors"
          >
            Contact support
          </a>
        </div>
        {error.digest && <p className="text-[0.66rem] text-black/25 mt-5">Reference: {error.digest}</p>}
      </div>
    </div>
  );
}

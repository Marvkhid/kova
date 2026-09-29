export function VerifiedSellerBadge({
  className = '',
  variant = 'chip',
}: {
  className?: string;
  variant?: 'chip' | 'inline';
}) {
  const icon = (
    <svg
      width={variant === 'chip' ? 11 : 13}
      height={variant === 'chip' ? 11 : 13}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 1.5 14.8 4l3.6-.4 1.1 3.5 3 2-1.5 3.4 1.5 3.4-3 2-1.1 3.5-3.6-.4L12 23.5 9.2 21l-3.6.4-1.1-3.5-3-2L3 12.5 1.5 9.1l3-2 1.1-3.5L9.2 4 12 1.5Zm-1.2 14.6 6-6-1.4-1.4-4.6 4.6-2.2-2.2L7.2 12.5l3.6 3.6Z" />
    </svg>
  );
  if (variant === 'inline') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.06em] text-[#2A5C45] ${className}`}
      >
        {icon}
        Verified Seller
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-[0.05em] text-[#2A5C45] bg-[#2A5C45]/[0.1] px-2 py-[3px] rounded-full whitespace-nowrap ${className}`}
    >
      {icon}
      Verified
    </span>
  );
}

// ============================================================
// KOVA — /search
// Search-focused entry point into the marketplace.
// ============================================================

import { MarketplaceBrowse } from '../Component/MarketplaceBrowse';

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; type?: string }>;
}

export const metadata = {
  title: 'Search',
  description: 'Search products, sellers and tags across the KOVA marketplace.',
};

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <MarketplaceBrowse
      initialQuery={params.q ?? ''}
      initialCategory={params.category ?? ''}
      initialType={params.type ?? ''}
      initialSort="new"
    />
  );
}

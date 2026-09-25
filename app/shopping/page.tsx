// ============================================================
// KOVA — /shopping
// The live marketplace. Server shell passes URL params to the
// shared client browse experience (API-driven).
// ============================================================

import { MarketplaceBrowse } from '../Component/MarketplaceBrowse';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
    sort?: string;
    store?: string;
  }>;
}

export const metadata = {
  title: 'Browse the marketplace',
  description:
    'Discover physical goods, digital products and services from independent KOVA sellers.',
};

export default async function ShoppingPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <MarketplaceBrowse
      initialQuery={params.q ?? ''}
      initialCategory={params.category ?? ''}
      initialType={params.type ?? ''}
      initialSort={params.sort ?? 'new'}
      lockStore={params.store}
    />
  );
}

'use client';
// ============================================================
// KOVA — Dashboard Products Table
// ============================================================

import Link from 'next/link';
import { useState } from 'react';
import { PRODUCTS } from '../../../lib/types/data/products';
import { formatPrice } from '@/lib/utils';

export function DashboardProducts() {
  const [deleting, setDeleting] = useState<string | null>(null);

  function handleDelete(id: string, name: string) {
    if (!confirm(`Remove "${name}" from your listings?`)) return;
    setDeleting(id);
    // Replace with real API call
    setTimeout(() => setDeleting(null), 1000);
  }

  return (
    <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] overflow-hidden">
      {/* Table header */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-black/[0.06]">
        <div>
          <h2
            className="font-bold text-[0.95rem] sm:text-[1rem] text-[#0D0D0D]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your listings
          </h2>
          <p className="text-[0.72rem] sm:text-[0.75rem] text-black/40 mt-0.5">
            {PRODUCTS.length} products
          </p>
        </div>

        <Link
          href="/sellers/new"
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-[#E8622A] text-white text-[0.82rem] sm:text-sm font-medium hover:bg-[#F07A48] hover:-translate-y-[1px] transition-all duration-200 whitespace-nowrap"
        >
          <span className="text-base sm:text-lg leading-none">+</span>
          Add product
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="border-b border-black/[0.05]">
              {['Product', 'Category', 'Price', 'Sales', 'Rating', 'Status', ''].map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-3 text-[0.72rem] font-semibold text-black/35 uppercase tracking-[0.08em]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-black/[0.04]">
            {PRODUCTS.map((product) => (
              <tr key={product.id} className="hover:bg-black/[0.018] transition-colors group">
                {/* Product */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] overflow-hidden bg-[#EDE8DF] flex-shrink-0">
                      <img
                        src={`/images/${product.imagePlaceholder}.jpg`}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-[0.88rem] text-[#0D0D0D] leading-snug">
                        {product.name}
                      </p>
                      {product.badge && (
                        <span
                          className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full ${
                            product.badge === 'new'
                              ? 'bg-black/[0.08] text-black/60'
                              : product.badge === 'hot'
                              ? 'bg-[#2A5C45]/10 text-[#2A5C45]'
                              : 'bg-[#E8622A]/10 text-[#E8622A]'
                          }`}
                        >
                          {product.badge.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4">
                  <span className="text-[0.8rem] text-black/50 capitalize">{product.category}</span>
                </td>

                {/* Price */}
                <td className="px-6 py-4">
                  <p className="font-semibold text-[0.88rem] text-[#0D0D0D]">
                    {formatPrice(product.price)}
                  </p>
                  {product.originalPrice && (
                    <p className="text-[0.72rem] text-black/35 line-through">
                      {formatPrice(product.originalPrice)}
                    </p>
                  )}
                </td>

                {/* Sales */}
                <td className="px-6 py-4">
                  <span className="text-[0.8rem] text-black/60">
                    {product.buyCount?.toLocaleString() ?? '—'}
                  </span>
                </td>

                {/* Rating */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <span className="text-[#F4A438] text-sm">★</span>
                    <span className="text-[0.8rem] text-black/60">{product.rating ?? '—'}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium text-[#2A5C45] bg-[#2A5C45]/[0.08] px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2A5C45]" />
                    Live
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/sellers/edit/${product.id}`}
                      className="text-[0.75rem] font-medium text-black/50 hover:text-[#0D0D0D] transition-colors px-2 py-1 rounded-[6px] hover:bg-black/[0.05]"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={deleting === product.id}
                      className="text-[0.75rem] font-medium text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded-[6px] hover:bg-red-50"
                    >
                      {deleting === product.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden divide-y divide-black/[0.05]">
        {PRODUCTS.map((product) => (
          <div key={product.id} className="px-4 sm:px-5 py-3.5 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[10px] overflow-hidden bg-[#EDE8DF] flex-shrink-0">
                <img
                  src={`/images/${product.imagePlaceholder}.jpg`}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[0.84rem] sm:text-[0.88rem] text-[#0D0D0D] truncate">
                  {product.name}
                </p>
                <p className="text-[0.72rem] sm:text-[0.75rem] text-black/45">
                  {formatPrice(product.price)} · {product.buyCount} sold
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/sellers/edit/${product.id}`}
                  className="text-[0.74rem] text-[#E8622A] font-medium"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id, product.name)}
                  disabled={deleting === product.id}
                  className="text-[0.74rem] text-red-500 font-medium"
                >
                  {deleting === product.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
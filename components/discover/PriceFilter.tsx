'use client';

import React, { useState, useEffect } from 'react';
import { useDiscoverFilters } from '@/hooks/useDiscoverFilters';

export function PriceFilter() {
  const { filters, setFilter } = useDiscoverFilters();
  const [maxPrice, setMaxPrice] = useState<string>(filters.maxPrice ? String(filters.maxPrice) : '');

  // Sync state with URL when it changes externally
  useEffect(() => {
    if (filters.maxPrice !== undefined) {
      setMaxPrice(String(filters.maxPrice));
    } else {
      setMaxPrice('');
    }
  }, [filters.maxPrice]);

  const applyPrice = () => {
    if (maxPrice) {
      setFilter('maxPrice', Number(maxPrice));
    } else {
      setFilter('maxPrice', undefined);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-black">Presupuesto</h3>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">$</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
            placeholder="Máx."
            className="w-full border-2 border-black pl-8 pr-3 py-2 font-bold text-black focus:outline-none focus:ring-0 focus:border-blue-600 rounded-none transition-colors"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center w-6 h-6 border-2 border-black group-hover:bg-gray-100 transition-colors bg-white">
          <input
            type="checkbox"
            checked={!!filters.hasDiscount}
            onChange={(e) => setFilter('hasDiscount', e.target.checked)}
            className="peer sr-only"
          />
          {filters.hasDiscount && (
            <svg className="w-4 h-4 text-black pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>
        <span className="font-bold uppercase text-sm text-black">Solo Ofertas</span>
      </label>
    </div>
  );
}

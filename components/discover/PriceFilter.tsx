'use client';

import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { useDiscoverFilters } from '@/hooks/useDiscoverFilters';

const PRESETS = [500, 1000, 2000, 5000];

export function PriceFilter() {
  const { filters, setFilter } = useDiscoverFilters();
  const [maxPrice, setMaxPrice] = useState<string>(filters.maxPrice ? String(filters.maxPrice) : '');

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
      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Presupuesto máx.</span>

      {/* Presets rápidos */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setMaxPrice(String(p));
              setFilter('maxPrice', p);
            }}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all duration-200 ${
              filters.maxPrice === p
                ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                : 'bg-transparent text-zinc-400 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            ${p.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Input personalizado */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm pointer-events-none">$</span>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          onBlur={applyPrice}
          onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
          placeholder="Personalizado"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
        />
      </div>

      {/* Solo Ofertas */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div
          className={`relative flex items-center justify-center w-5 h-5 rounded-md border transition-all duration-200 ${
            filters.hasDiscount
              ? 'bg-white border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]'
              : 'bg-transparent border-white/20 group-hover:border-white/40'
          }`}
        >
          <input
            type="checkbox"
            checked={!!filters.hasDiscount}
            onChange={(e) => setFilter('hasDiscount', e.target.checked)}
            className="peer sr-only"
          />
          {filters.hasDiscount && (
            <svg className="w-3 h-3 text-black pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Tag className="w-3 h-3 text-green-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors">
            Solo ofertas
          </span>
        </div>
      </label>
    </div>
  );
}

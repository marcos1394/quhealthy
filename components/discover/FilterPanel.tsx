'use client';

import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { ModalityFilter } from './ModalityFilter';
import { PriceFilter } from './PriceFilter';
import { useDiscoverFilters } from '@/hooks/useDiscoverFilters';

export function FilterPanel() {
  const { filters, clearFilters } = useDiscoverFilters();

  const hasActiveFilters = Object.keys(filters).some((k) => {
    const val = filters[k as keyof typeof filters];
    return val !== undefined && val !== false && val !== '';
  });

  return (
    <div className="bg-gray-900/50 border border-white/5 rounded-[2rem] p-5 space-y-6 sticky top-24 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">Filtros</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-red-400 transition-colors"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/5" />

      <ModalityFilter />

      <div className="w-full h-px bg-white/5" />

      <PriceFilter />

      <div className="w-full h-px bg-white/5" />

      {/* Ubicación (próximamente) */}
      <div className="space-y-2">
        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Ubicación</span>
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">
          Búsqueda por ciudad — próximamente
        </p>
      </div>
    </div>
  );
}

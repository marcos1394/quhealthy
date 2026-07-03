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
    <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] p-5 space-y-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#111]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-black dark:text-white" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">Filtros</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-black dark:bg-white" />

      <ModalityFilter />

      <div className="w-full h-px bg-black dark:bg-white" />

      <PriceFilter />

      <div className="w-full h-px bg-black dark:bg-white" />

      {/* Ubicación (próximamente) */}
      <div className="space-y-2">
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Ubicación</span>
        <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">
          Búsqueda por ciudad — próximamente
        </p>
      </div>
    </div>
  );
}

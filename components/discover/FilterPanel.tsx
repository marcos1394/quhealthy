'use client';

import React from 'react';
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
    <div className="bg-white border-4 border-black p-6 space-y-8 sticky top-24">
      <div className="flex items-center justify-between border-b-4 border-black pb-4">
        <h2 className="text-xl font-black uppercase tracking-tight text-black">Filtros</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-bold uppercase underline decoration-2 hover:text-gray-600 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      <ModalityFilter />
      
      <div className="h-1 w-full bg-black/10"></div>
      
      <PriceFilter />

      <div className="h-1 w-full bg-black/10"></div>
      
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-black">Ubicación</h3>
        {/* Usamos el input de búsqueda global o uno local */}
        <p className="text-xs font-bold text-gray-500 uppercase">
          La búsqueda por ciudad se configurará pronto
        </p>
      </div>
    </div>
  );
}

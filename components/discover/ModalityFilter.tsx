'use client';

import React from 'react';
import { useDiscoverFilters } from '@/hooks/useDiscoverFilters';

export function ModalityFilter() {
  const { filters, setFilter } = useDiscoverFilters();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-black">Modalidad</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('modality', '')}
          className={`px-4 py-2 text-sm font-bold uppercase border-2 rounded-none transition-colors ${
            !filters.modality
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-black hover:bg-gray-100'
          }`}
        >
          Cualquiera
        </button>
        <button
          onClick={() => setFilter('modality', 'IN_PERSON')}
          className={`px-4 py-2 text-sm font-bold uppercase border-2 rounded-none transition-colors ${
            filters.modality === 'IN_PERSON'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-black hover:bg-gray-100'
          }`}
        >
          Presencial
        </button>
        <button
          onClick={() => setFilter('modality', 'ONLINE')}
          className={`px-4 py-2 text-sm font-bold uppercase border-2 rounded-none transition-colors ${
            filters.modality === 'ONLINE'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-black hover:bg-gray-100'
          }`}
        >
          Online
        </button>
      </div>
    </div>
  );
}

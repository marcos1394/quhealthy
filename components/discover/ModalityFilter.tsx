'use client';

import React from 'react';
import { useDiscoverFilters } from '@/hooks/useDiscoverFilters';

const OPTIONS = [
  { label: 'Cualquiera', value: '' },
  { label: 'Presencial', value: 'IN_PERSON' },
  { label: 'Online', value: 'ONLINE' },
  { label: 'Híbrido', value: 'HYBRID' },
];

export function ModalityFilter() {
  const { filters, setFilter } = useDiscoverFilters();

  return (
    <div className="space-y-3">
      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Modalidad</span>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => {
          const isActive = filters.modality === opt.value || (!filters.modality && opt.value === '');
          return (
            <button
              key={opt.value}
              onClick={() => setFilter('modality', opt.value)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all duration-200 ${
                isActive
                  ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                  : 'bg-transparent text-zinc-400 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

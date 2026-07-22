'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from 'lucide-react';
import { useDiscoverFilters } from '@/hooks/useDiscoverFilters';
import { Slider } from '@/components/ui/slider';

const PRESETS = [5, 10, 20, 50];

export function DistanceFilter() {
  const { filters, setFilter } = useDiscoverFilters();
  const [radiusKm, setRadiusKm] = useState<number>(filters.radiusKm || 50);

  useEffect(() => {
    if (filters.radiusKm !== undefined) {
      setRadiusKm(filters.radiusKm);
    } else {
      setRadiusKm(50);
    }
  }, [filters.radiusKm]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 mb-1">
        <Navigation className="w-3 h-3 text-gray-500" strokeWidth={2} />
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Distancia Máx. (KM)</span>
      </div>

      {/* Presets rápidos */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setRadiusKm(p);
              setFilter('radiusKm', p);
            }}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 ${
              filters.radiusKm === p
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]'
                : 'bg-white text-black border-black dark:bg-[#0a0a0a] dark:text-white dark:border-white hover:shadow-[2px_2px_0_0_#000] dark:hover:shadow-[2px_2px_0_0_#fff]'
            }`}
          >
            {p} km
          </button>
        ))}
      </div>

      <div className="pt-6 pb-2 px-2">
        <Slider
          value={[radiusKm]}
          max={100}
          step={5}
          onValueChange={(val) => {
            setRadiusKm(val[0]);
          }}
          onValueCommit={(val) => {
            setFilter('radiusKm', val[0]);
          }}
          className="w-full"
        />
        <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500">
          <span>0</span>
          <span>{radiusKm} km</span>
          <span>100+</span>
        </div>
      </div>
    </div>
  );
}

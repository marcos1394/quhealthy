'use client';

import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { ModalityFilter } from './ModalityFilter';
import { PriceFilter } from './PriceFilter';
import { DistanceFilter } from './DistanceFilter';
import { useDiscoverFilters } from '@/hooks/useDiscoverFilters';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

interface FilterPanelProps {
 isCollapsed?: boolean;
 onToggle?: () => void;
}

export function FilterPanel({ isCollapsed = false, onToggle }: FilterPanelProps) {
 const searchParams = useSearchParams();
 const searchType = searchParams.get('type') || 'STORE';
 
 const { filters, clearFilters } = useDiscoverFilters();

 const hasActiveFilters = Object.keys(filters).some((k) => {
 const val = filters[k as keyof typeof filters];
 return val !== undefined && val !== false && val !== '';
 });

 return (
  <div className={cn(
    "bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl sticky top-24 transition-all duration-300",
    isCollapsed ? "p-3 w-[60px] flex flex-col items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a1a1a]" : "p-5 w-[300px] space-y-6"
  )}
  onClick={isCollapsed && onToggle ? onToggle : undefined}>
  
  {/* Header */}
  <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
    <div className="flex items-center gap-2">
      <button 
        onClick={(e) => {
          if (!isCollapsed) {
            e.stopPropagation();
            onToggle?.();
          }
        }}
        className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-[#1a1a1a] hover:bg-white dark:hover:bg-[#222] hover:shadow-sm transition-all cursor-pointer"
 title={isCollapsed ? "Mostrar filtros" : "Ocultar filtros"}
 >
 <SlidersHorizontal className="w-3.5 h-3.5 text-black dark:text-white" />
 </button>
 {!isCollapsed && <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">Filtros</h2>}
 </div>
 {!isCollapsed && hasActiveFilters && (
 <button
 onClick={clearFilters}
 className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors"
 >
 <X className="w-3 h-3" />
 Limpiar
 </button>
 )}
 </div>

 {!isCollapsed && (
 <>
 {/* Divider */}
 <div className="w-full h-px bg-black dark:bg-white" />

 {/* Filtro de Modalidad: Solo para Cursos, Servicios y Paquetes */}
 {['COURSE', 'SERVICE', 'PACKAGE'].includes(searchType) && (
 <>
 <ModalityFilter />
 <div className="w-full h-px bg-black dark:bg-white" />
 </>
 )}

 {/* Filtro de Precio: Para Productos, Cursos, Servicios y Paquetes (oculto en Tiendas) */}
 {searchType !== 'STORE' && (
 <>
 <PriceFilter />
 <div className="w-full h-px bg-black dark:bg-white" />
 </>
 )}

 {/* Ubicación y Distancia */}
 <div className="space-y-4">
 <DistanceFilter />
 <div className="w-full h-px bg-black dark:bg-white" />
 <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Ubicación</span>
 <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">
 Búsqueda por ciudad — próximamente
 </p>
 </div>
 </>
 )}
 </div>
 );
}

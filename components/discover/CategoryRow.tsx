// components/discover/CategoryRow.tsx
"use client";

import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiscoverProvider } from '@/types/discover';
import { ProviderCard } from './ProviderCard';

interface CategoryRowProps {
  title: string;
  subtitle?: string;
  providers: DiscoverProvider[];
}

export const CategoryRow: React.FC<CategoryRowProps> = ({ title, subtitle, providers }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  // Si no hay proveedores para esta categoría, no renderizamos la fila para no dejar espacios vacíos
  if (!providers || providers.length === 0) return null;

  // Funciones para los botones de flecha en escritorio (Desktop)
  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 1.5 : clientWidth / 1.5;
      rowRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative flex flex-col w-full py-6 group">
      
      {/* --- HEADER DE LA FILA --- */}
      <div className="px-4 md:px-8 mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-zinc-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        
        {/* Botón sutil para "Ver todos" */}
        <button className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors hidden sm:flex items-center">
          Ver todos <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* --- BOTONES DE SCROLL (Solo visibles en Desktop al hacer hover) --- */}
      <div className="hidden sm:block">
        <Button
          variant="ghost"
          size="default"
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-black/80 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="default"
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-black/80 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* --- CARRUSEL HORIZONTAL --- */}
      {/* Utilizamos 'snap-x snap-mandatory' para el efecto magnético en móviles.
        El 'custom-scrollbar' esconde la barra de scroll fea.
      */}
      <div 
        ref={rowRef}
        className="flex overflow-x-auto gap-4 px-4 md:px-8 pb-8 pt-2 snap-x snap-mandatory scroll-smooth custom-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Oculta la barra en Firefox/IE
      >
        {providers.map((provider) => (
          <div key={provider.id} className="snap-start shrink-0">
            <ProviderCard provider={provider} />
          </div>
        ))}

        {/* Espaciador final para que la última tarjeta no quede pegada al borde derecho */}
        <div className="w-4 shrink-0 sm:hidden" />
      </div>

    </div>
  );
};
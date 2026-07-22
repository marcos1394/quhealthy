"use client";

import React, { useState } from 'react';
import { Search, Map as MapIcon, LayoutGrid, SlidersHorizontal, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useDiscoverContext } from './context/DiscoverContext';
import { SortDropdown } from '@/components/discover/SortDropdown';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FilterPanel } from '@/components/discover/FilterPanel';

export const MarketplaceHeader = ({ 
  locationDeclined, 
  setLocationDeclined, 
  showSuccess, 
  requestLocation 
}: { 
  locationDeclined: boolean, 
  setLocationDeclined: (val: boolean) => void, 
  showSuccess: boolean, 
  requestLocation: () => void 
}) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    searchType, 
    setSearchType, 
    viewMode, 
    setViewMode, 
    isMapImmersive,
    isValidating,
    coordinates
  } = useDiscoverContext();

  const isGeoLoading = false; // We can get this from context or pass it as prop, for now false since it's just UX
  const geoError = false;

  return (
    <div className={cn("absolute top-6 left-4 right-4 md:left-8 md:right-8 z-20 flex flex-col gap-3 pointer-events-none transition-all duration-500", isMapImmersive ? "-translate-y-[150%] opacity-0" : "translate-y-0 opacity-100")}>
      <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
        <form 
          onSubmit={(e) => e.preventDefault()}
          className="pointer-events-auto w-full md:w-[500px] lg:w-[480px] xl:w-[500px] shrink-0 flex items-center bg-white dark:bg-[#111] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 transition-shadow focus-within:shadow-xl overflow-hidden"
        >
          <div className="flex-1 flex items-center px-4 h-14 relative">
            {isValidating ? (
              <Loader2 className="w-5 h-5 text-teal-500 mr-3 shrink-0 animate-spin" strokeWidth={2} />
            ) : (
              <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" strokeWidth={2} />
            )}
            <Input
              placeholder="Busca especialistas, clínicas o servicios..."
              className="bg-transparent border-none p-0 h-full text-[13px] font-medium text-black dark:text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="hidden md:flex items-center gap-1 px-2 border-l border-gray-200 dark:border-gray-800 h-8">
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "rounded-xl h-10 w-10 p-0 transition-colors",
                viewMode === 'MAP' ? "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => setViewMode('MAP')}
            >
              <MapIcon className="w-4 h-4" strokeWidth={2} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "rounded-xl h-10 w-10 p-0 transition-colors",
                viewMode === 'GRID' ? "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => setViewMode('GRID')}
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={2} />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                type="button"
                variant="ghost" 
                className={cn(
                  "rounded-none border-l border-gray-200 dark:border-gray-800 h-14 w-14 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] p-0 shrink-0 transition-colors",
                  searchType !== 'STORE' ? "text-teal-600 dark:text-teal-400" : "text-gray-500 dark:text-gray-400"
                )}
              >
                <SlidersHorizontal className="w-5 h-5" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl p-1">
              <DropdownMenuItem 
                onClick={() => setSearchType('STORE')}
                className={cn("text-[13px] font-medium px-4 py-2.5 rounded-lg cursor-pointer mb-1 focus:bg-gray-50 dark:focus:bg-[#1a1a1a]", searchType === 'STORE' && "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400")}
              >
                Clínicas y Especialistas
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSearchType('SERVICE')}
                className={cn("text-[13px] font-medium px-4 py-2.5 rounded-lg cursor-pointer mb-1 focus:bg-gray-50 dark:focus:bg-[#1a1a1a]", searchType === 'SERVICE' && "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400")}
              >
                Consultas y Procedimientos
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSearchType('PACKAGE')}
                className={cn("text-[13px] font-medium px-4 py-2.5 rounded-lg cursor-pointer mb-1 focus:bg-gray-50 dark:focus:bg-[#1a1a1a]", searchType === 'PACKAGE' && "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400")}
              >
                Paquetes de Salud
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSearchType('PRODUCT')}
                className={cn("text-[13px] font-medium px-4 py-2.5 rounded-lg cursor-pointer focus:bg-gray-50 dark:focus:bg-[#1a1a1a]", searchType === 'PRODUCT' && "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400")}
              >
                Farmacia y Productos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </form>

        <div className="flex-shrink-0 pointer-events-auto flex gap-2 overflow-x-auto md:flex-wrap no-scrollbar pb-1 pt-1 px-1 -mx-1 flex-1">
          {/* Mobile Filter Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  className="rounded-xl border-gray-200 dark:border-gray-800 h-10 px-4 text-xs font-medium bg-white dark:bg-[#111] text-gray-700 dark:text-gray-200 shadow-sm"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2 text-teal-600 dark:text-teal-400" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent position="bottom" className="h-[85vh] p-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] rounded-t-[2rem] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
                <div className="h-full overflow-y-auto px-4 py-8">
                  <FilterPanel isCollapsed={false} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        <div className="flex-shrink-0 pointer-events-auto pl-2">
          <SortDropdown />
        </div>
      </div>

      {((!coordinates && !locationDeclined) || showSuccess) && (
        <div className="pointer-events-auto md:w-[460px] flex flex-col gap-4 p-5 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] transition-all duration-300">
          
          {showSuccess ? (
            <div className="flex items-center gap-3 py-1">
              <div className="bg-black dark:bg-white text-white dark:text-black p-1.5 shrink-0">
                <MapPin className="w-4 h-4" strokeWidth={2} />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-[11px] font-bold text-black dark:text-white uppercase tracking-widest leading-none">
                  UBICACIÓN CONFIRMADA
                </h4>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                  BUSCANDO OPCIONES CERCANAS...
                </p>
              </div>
            </div>
          ) : isGeoLoading && !geoError ? (
            <div className="flex items-center gap-3 py-1">
              <Loader2 className="w-5 h-5 text-black dark:text-white shrink-0 animate-spin" strokeWidth={2} />
              <div className="flex flex-col gap-1">
                <h4 className="text-[11px] font-bold text-black dark:text-white uppercase tracking-widest leading-none">
                  VERIFICANDO PERMISOS
                </h4>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                  REVISA LA ALERTA DE TU NAVEGADOR
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                {geoError ? (
                  <div className="bg-gray-100 dark:bg-[#111] p-1.5 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-black dark:text-white opacity-50" strokeWidth={1.5} />
                  </div>
                ) : (
                  <MapPin className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5" strokeWidth={1.5} />
                )}
                
                <div className="flex flex-col gap-2">
                  <h4 className="text-[11px] font-bold text-black dark:text-white uppercase tracking-widest leading-none">
                    {geoError ? "PERMISO DENEGADO" : "ENCUENTRA OPCIONES CERCA DE TI"}
                  </h4>
                  <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-relaxed">
                    {geoError 
                      ? "TU NAVEGADOR BLOQUEÓ EL ACCESO. PARA ACTIVARLO, HAZ CLIC EN EL ÍCONO DEL CANDADO (🔒) EN LA BARRA DE DIRECCIONES, O UTILIZA EL BUSCADOR MANUAL ARRIBA." 
                      : "PERMÍTENOS CONOCER TU UBICACIÓN PARA MOSTRARTE LOS ESPECIALISTAS Y SERVICIOS DISPONIBLES EN TU ZONA."}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-1">
                {geoError ? (
                  <Button 
                    onClick={() => setLocationDeclined(true)} 
                    className="flex-1 bg-black text-white dark:bg-white dark:text-black rounded-none text-[9px] font-bold uppercase tracking-widest h-10 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    ENTENDIDO
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => requestLocation()} 
                      className="flex-1 bg-black text-white dark:bg-white dark:text-black rounded-none text-[9px] font-bold uppercase tracking-widest h-10 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                      PERMITIR
                    </Button>
                    <Button 
                      onClick={() => setLocationDeclined(true)} 
                      variant="outline"
                      className="flex-1 rounded-none text-[9px] font-bold uppercase tracking-widest h-10 border-black dark:border-white bg-transparent hover:bg-gray-100 dark:hover:bg-[#111] text-black dark:text-white transition-colors"
                    >
                      AHORA NO
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

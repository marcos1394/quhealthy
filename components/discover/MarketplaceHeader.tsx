"use client";

import React, { useState } from 'react';
import { Search, Map as MapIcon, LayoutGrid, SlidersHorizontal, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useDiscoverContext } from './context/DiscoverContext';
import { SortDropdown } from '@/components/discover/SortDropdown';

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
          className="pointer-events-auto w-full md:w-[460px] lg:w-[400px] xl:w-[460px] shrink-0 flex gap-0 shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.05)] border border-black dark:border-gray-800"
        >
          <div className="flex-1 flex items-center bg-white dark:bg-[#0a0a0a] px-4 h-14 relative">
            {isValidating ? (
              <Loader2 className="w-5 h-5 text-gray-400 mr-3 shrink-0 animate-spin" strokeWidth={2} />
            ) : (
              <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" strokeWidth={2} />
            )}
            <Input
              placeholder="ESPECIALIDAD, CLÍNICA O NOMBRE..."
              className="bg-transparent border-none p-0 h-full text-xs font-bold uppercase tracking-widest text-black dark:text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="hidden md:flex border-l border-gray-300 dark:border-gray-800 h-14 bg-white dark:bg-[#0a0a0a]">
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "rounded-none h-full w-14 hover:bg-gray-100 dark:hover:bg-[#111] p-0 transition-colors",
                viewMode === 'MAP' ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-400"
              )}
              onClick={() => setViewMode('MAP')}
            >
              <MapIcon className="w-5 h-5" strokeWidth={1.5} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "rounded-none h-full w-14 border-l border-gray-300 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-[#111] p-0 transition-colors",
                viewMode === 'GRID' ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-400"
              )}
              onClick={() => setViewMode('GRID')}
            >
              <LayoutGrid className="w-5 h-5" strokeWidth={1.5} />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                type="button"
                variant="ghost" 
                className={cn(
                  "rounded-none border-l border-gray-300 dark:border-gray-800 h-14 w-14 hover:bg-gray-100 dark:hover:bg-[#111] p-0 shrink-0 transition-colors",
                  searchType !== 'STORE' ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-[#0a0a0a]"
                )}
              >
                <SlidersHorizontal className={cn("w-5 h-5", searchType !== 'STORE' ? "text-white dark:text-black" : "text-black dark:text-white")} strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-black border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
              <DropdownMenuItem 
                className={cn("cursor-pointer font-bold uppercase tracking-widest text-xs focus:bg-gray-100 dark:focus:bg-gray-900 rounded-none", searchType === 'STORE' && "bg-gray-100 dark:bg-gray-900")} 
                onClick={() => setSearchType('STORE')}>
                Tiendas / Clínicas
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={cn("cursor-pointer font-bold uppercase tracking-widest text-xs focus:bg-gray-100 dark:focus:bg-gray-900 rounded-none", searchType === 'PRODUCT' && "bg-gray-100 dark:bg-gray-900")} 
                onClick={() => setSearchType('PRODUCT')}>
                Productos
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={cn("cursor-pointer font-bold uppercase tracking-widest text-xs focus:bg-gray-100 dark:focus:bg-gray-900 rounded-none", searchType === 'COURSE' && "bg-gray-100 dark:bg-gray-900")} 
                onClick={() => setSearchType('COURSE')}>
                Cursos
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={cn("cursor-pointer font-bold uppercase tracking-widest text-xs focus:bg-gray-100 dark:focus:bg-gray-900 rounded-none", searchType === 'PACKAGE' && "bg-gray-100 dark:bg-gray-900")} 
                onClick={() => setSearchType('PACKAGE')}>
                Paquetes
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={cn("cursor-pointer font-bold uppercase tracking-widest text-xs focus:bg-gray-100 dark:focus:bg-gray-900 rounded-none", searchType === 'SERVICE' && "bg-gray-100 dark:bg-gray-900")} 
                onClick={() => setSearchType('SERVICE')}>
                Servicios
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </form>

        <div className="flex-shrink-0 pointer-events-auto flex gap-2 overflow-x-auto md:flex-wrap no-scrollbar pb-1 pt-1 px-1 -mx-1 flex-1">
          {/* Quick Filters - Here we can add the ones that update useDiscoverFilters in the future, for now omitted or simplified */}
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

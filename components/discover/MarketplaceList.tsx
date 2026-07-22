"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, PlayCircle, Star, Navigation, ChevronRight, User, Image as ImageIcon, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDiscoverContext } from './context/DiscoverContext';
import { useSessionStore } from '@/stores/SessionStore';
import { useMyFavorites } from '@/hooks/useMyFavorites';
import { useProviderScore } from '@/hooks/useProviderScore';
import { ProviderScoreBadge } from '@/components/provider/ProviderScoreBadge';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { DiscoverProvider } from '@/types/discover';
import { ProviderScoreResponse } from '@/types/providerScore';
import { DiscoverItemCard } from '@/components/discover/DiscoverItemCard';
import { FilterPanel } from '@/components/discover/FilterPanel';
import { DiscoverSkeleton } from './DiscoverSkeleton';

// ── Tarjeta de Proveedor (Movida desde page.tsx) ──
const MapProviderCard = ({
  provider,
  isSelected,
  isFavorited,
  scoreData,
  canUseFavorites,
  onClick,
  onHover,
  onLeave,
  onAuthRequired,
}: {
  provider: DiscoverProvider & { distanceKm?: number },
  isSelected: boolean,
  isFavorited: boolean,
  scoreData?: ProviderScoreResponse,
  canUseFavorites: boolean,
  onClick: () => void,
  onHover: () => void,
  onLeave: () => void,
  onAuthRequired: () => void,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    if ((isHovered || isSelected) && videoRef.current) {
      videoRef.current.play().catch(() => console.log("Autoplay bloqueado"));
    } else if (!isHovered && !isSelected && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, isSelected]);

  const mediaOpacityClasses = cn(
    "absolute inset-0 w-full h-full transition-opacity duration-500",
    (isHovered || isSelected) && provider.previewVideoUrl ? "opacity-0" : "opacity-100"
  );

  const hasValidImage = provider.imageUrl && !imgError;
  const hasValidLogo = provider.logoUrl && !logoError;

  return (
    <div
      onMouseEnter={() => { setIsHovered(true); onHover(); }}
      onMouseLeave={() => { setIsHovered(false); onLeave(); }}
      onClick={onClick}
      className={cn(
        "relative w-72 shrink-0 md:w-full self-start bg-white dark:bg-[#0a0a0a] transition-all cursor-pointer flex flex-col group border",
        isSelected 
          ? "border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] z-10" 
          : "border-gray-300 dark:border-gray-800 hover:border-black dark:hover:border-white"
      )}
    >
      {provider.isPromoted && (
        <div className="bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-2">
          <Award className="w-3 h-3" strokeWidth={2} /> RECOMENDADO POR LA RED
        </div>
      )}

      <div className="h-40 md:h-48 w-full relative overflow-hidden bg-gray-100 dark:bg-[#111] border-b border-gray-200 dark:border-gray-800">
        
        {provider.previewVideoUrl && !isHovered && !isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
            <PlayCircle className="w-10 h-10 text-white opacity-80" strokeWidth={1} />
          </div>
        )}

        {hasValidImage ? (
          <img
            src={provider.imageUrl}
            alt={provider.name}
            onError={() => setImgError(true)}
            className={cn(mediaOpacityClasses, "object-cover")}
          />
        ) : (
          <div className={cn(mediaOpacityClasses, "flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]")}>
            <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-3 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)]">
              <ImageIcon className="w-6 h-6 text-gray-300 dark:text-gray-700" strokeWidth={1.5} />
            </div>
          </div>
        )}

        {provider.previewVideoUrl && (
          <video
            ref={videoRef}
            src={provider.previewVideoUrl}
            muted
            loop
            playsInline
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
              isHovered || isSelected ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          <ProviderScoreBadge scoreData={scoreData} />
          {(provider.discountPercentage ?? 0) > 0 && (
            <span className="border border-black bg-black text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#fff]">
              -{provider.discountPercentage}%
            </span>
          )}
        </div>
        
        <div className="absolute top-3 right-3 z-20">
          <FavoriteButton 
            entityType="PROVIDER" 
            entityId={provider.id} 
            initialIsFavorite={isFavorited}
            brandColor={provider.color}
            onAuthRequired={!canUseFavorites ? onAuthRequired : undefined}
          />
        </div>

        <div className="absolute bottom-3 left-3 bg-white dark:bg-black border border-black dark:border-white px-2 py-1 flex items-center gap-1.5 z-20">
          <Star className="w-3 h-3 text-black dark:text-white fill-current" strokeWidth={1} />
          <span className="text-[10px] font-bold text-black dark:text-white leading-none mt-0.5">
            {provider.rating > 0 ? provider.rating.toFixed(1) : 'Nuevo'}
          </span>
          {provider.reviews > 0 && (
            <span className="text-[9px] text-gray-500 ml-1">({provider.reviews})</span>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col bg-white dark:bg-[#0a0a0a]">
        
        <div className="flex items-start justify-between gap-4 mb-1">
          <div className="flex flex-col min-w-0">
            <h3 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white leading-tight line-clamp-2">
              {provider.name}
            </h3>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">
              {provider.category || 'ESPECIALISTA'}
            </span>
          </div>
          
          {hasValidLogo ? (
            <img 
              src={provider.logoUrl} 
              alt="Logo" 
              onError={() => setLogoError(true)}
              className="w-10 h-10 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black flex-shrink-0 object-cover" 
            />
          ) : (
            <div className="w-10 h-10 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111] flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-3" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">TARIFA BASE</span>
            <div className="flex items-baseline gap-2">
              {(provider.basePrice && provider.basePrice > 0) ? (
                <>
                  <span className="text-sm font-bold text-black dark:text-white tracking-tight">
                    ${provider.basePrice}
                  </span>
                  {provider.compareAtPrice && provider.compareAtPrice > provider.basePrice && (
                    <span className="text-[10px] text-gray-400 line-through">
                      ${provider.compareAtPrice}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[10px] font-bold text-black dark:text-white tracking-widest uppercase">
                  Previa Valoración
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">DISTANCIA</span>
            <span className="flex items-center text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              <Navigation className="w-3 h-3 mr-1.5" strokeWidth={2} />
              {provider.distanceKm ? `${provider.distanceKm.toFixed(1)} KM` : '--'}
            </span>
          </div>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/store/${provider.slug}`);
          }}
          className="w-full rounded-none h-12 text-[10px] font-bold uppercase tracking-widest flex justify-between px-5 transition-all border-0 text-white hover:opacity-90"
          style={{ backgroundColor: provider.color || '#000' }}
        >
          Acceder a Expediente 
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
};


export const MarketplaceList = ({ setAuthGateContext, setAuthGateOpen }: { setAuthGateContext: any, setAuthGateOpen: any }) => {
  const { 
    viewMode, 
    searchType, 
    providers, 
    items, 
    isLoading,
    isReachingEnd,
    isLoadingMore,
    loadMore,
    isMapImmersive,
    selectedId,
    setSelectedId,
    setHoveredId,
    isFiltersOpen,
    setIsFiltersOpen,
    coordinates,
    calculateDistance,
    map
  } = useDiscoverContext();

  const { isAuthenticated, _hasHydrated, isLoading: isSessionLoading, token } = useSessionStore();
  const canUseFavorites = _hasHydrated && !isSessionLoading && isAuthenticated && !!token;
  
  const currentEntityForFavs = searchType === 'STORE' ? 'PROVIDER' : (searchType as 'PACKAGE' | 'COURSE' | 'PRODUCT' | 'SERVICE');
  const { favoriteIds } = useMyFavorites(currentEntityForFavs);
  
  const { batchScores, fetchBatchScores } = useProviderScore();

  useEffect(() => {
    if (providers && providers.length > 0) {
      const providerIds = providers.map(p => p.id);
      fetchBatchScores(providerIds);
    }
  }, [providers, fetchBatchScores]);

  const handleSelectProvider = (provider: any) => {
    setSelectedId(provider.id);
    if (map && provider.lat && provider.lng) {
      map.panTo({ lat: provider.lat, lng: provider.lng });
      map.setZoom(14);
    }
  };

  const handleAuthRequired = (context: 'favorite' | 'booking' = 'favorite') => {
    setAuthGateContext(context);
    setAuthGateOpen(true);
  };

  const enrichedProviders = useMemo(() => {
    if (!providers) return [];
    return providers.map(p => {
      let distance = undefined;
      if (coordinates && p.lat && p.lng) {
        distance = calculateDistance(coordinates.lat, coordinates.lng, p.lat, p.lng);
      }
      return { ...p, distanceKm: distance };
    });
  }, [providers, coordinates, calculateDistance]);

  if (isLoading) {
    return (
      <div className={cn("absolute z-20 pointer-events-none transition-all duration-500", 
        viewMode === "MAP" 
          ? cn("bottom-6 left-0 w-full md:top-28 md:bottom-6 md:left-8 md:w-[460px] md:overflow-hidden md:flex md:flex-col", isMapImmersive ? "translate-y-[150%] md:-translate-x-[150%] opacity-0" : "translate-y-0 opacity-100") 
          : "top-32 left-4 right-4 md:left-8 md:right-8 md:bottom-8 bottom-4"
      )}>
        <DiscoverSkeleton />
      </div>
    );
  }

  return (
    <div className={cn("absolute z-20 pointer-events-none transition-all duration-500", 
      viewMode === "MAP" 
        ? cn("bottom-6 left-0 w-full md:top-28 md:bottom-6 md:left-8 md:w-[460px] md:overflow-hidden md:flex md:flex-col", isMapImmersive ? "translate-y-[150%] md:-translate-x-[150%] opacity-0" : "translate-y-0 opacity-100") 
        : "top-32 left-4 right-4 md:left-8 md:right-8 md:bottom-8 bottom-4"
    )}>
      {(searchType === 'STORE' ? enrichedProviders.length === 0 : items.length === 0) ? (
        <div className="w-[90%] md:w-full mx-auto bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-10 text-center pointer-events-auto shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
          <Search className="w-8 h-8 text-black dark:text-white mx-auto mb-6" strokeWidth={1.5} />
          <h3 className="text-black dark:text-white font-bold text-sm uppercase tracking-widest mb-2">
            BÚSQUEDA SIN COINCIDENCIAS
          </h3>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-light">
            AMPLÍE LOS PARÁMETROS O ELIMINE FILTROS PARA VISUALIZAR RESULTADOS GLOBALES.
          </p>
        </div>
      ) : (
        <div className={cn("w-full pointer-events-auto custom-scrollbar", viewMode === "MAP" ? "flex overflow-x-auto overflow-y-hidden gap-3 pb-4 md:flex-col md:flex-1 md:overflow-x-hidden md:overflow-y-auto md:gap-3 md:pb-6 px-4 md:px-0" : "pb-20 md:pb-0 flex gap-8 max-w-7xl mx-auto")}>
          
          {viewMode === "GRID" && (
            <aside className={cn("hidden md:block flex-shrink-0 transition-all duration-300", isFiltersOpen ? "w-[300px]" : "w-[60px]")}>
              <FilterPanel 
                isCollapsed={!isFiltersOpen} 
                onToggle={() => setIsFiltersOpen(!isFiltersOpen)} 
              />
            </aside>
          )}

          <div className={cn(viewMode === "GRID" ? (isFiltersOpen ? "flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start transition-all duration-300" : "flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start transition-all duration-300") : "flex gap-3 md:flex-col md:gap-3 w-full")}>
            
            <AnimatePresence>
              {searchType === 'STORE' ? enrichedProviders.map((provider) => (
                <MapProviderCard
                  key={`card-${provider.id}`}
                  provider={provider}
                  isSelected={selectedId === provider.id}
                  isFavorited={favoriteIds.has(provider.id)}
                  scoreData={batchScores[provider.id]}
                  canUseFavorites={canUseFavorites}
                  onClick={() => handleSelectProvider(provider)}
                  onHover={() => setHoveredId(provider.id)}
                  onLeave={() => setHoveredId(null)}
                  onAuthRequired={() => handleAuthRequired('favorite')}
                />
              )) : items.map((item) => (
                <DiscoverItemCard
                  key={`item-card-${item.id}`}
                  item={item}
                  isFavorited={favoriteIds.has(item.id)}
                  canUseFavorites={canUseFavorites}
                  onAuthRequired={() => handleAuthRequired('favorite')}
                />
              ))}
            </AnimatePresence>

            {!isReachingEnd && viewMode === "GRID" && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center mt-8 mb-8 w-full">
                <Button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="h-12 px-8 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all rounded-none font-bold uppercase tracking-widest text-[11px]"
                >
                  {isLoadingMore ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2} /> CARGANDO...</>
                  ) : (
                    "CARGAR MÁS OPCIONES"
                  )}
                </Button>
              </div>
            )}
          </div>

          {!isReachingEnd && viewMode === "MAP" && (
            <div className="w-full shrink-0 flex justify-center mt-12 mb-8 pr-4 md:pr-0">
              <Button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="h-12 px-8 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all rounded-none font-bold uppercase tracking-widest text-[11px]"
              >
                {isLoadingMore ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2} /> CARGANDO...</>
                ) : (
                  "CARGAR MÁS OPCIONES"
                )}
              </Button>
            </div>
          )}
          <div className="w-6 md:hidden flex-shrink-0" />
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  PlayCircle,
  Star,
  Navigation,
  ChevronRight,
  User,
  Image as ImageIcon,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDiscoverContext } from "./context/DiscoverContext";
import { useSessionStore } from "@/stores/SessionStore";
import { useMyFavorites } from "@/hooks/useMyFavorites";
import { useProviderScore } from "@/hooks/useProviderScore";
import { ProviderScoreBadge } from "@/components/provider/ProviderScoreBadge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { DiscoverProvider } from "@/types/discover";
import { ProviderScoreResponse } from "@/types/providerScore";
import { DiscoverItemCard } from "@/components/discover/DiscoverItemCard";
import { FilterPanel } from "@/components/discover/FilterPanel";
import { ProviderCard } from "@/components/discover/ProviderCard";
import { DiscoverSkeleton } from "./DiscoverSkeleton";

export const MarketplaceList = ({
  setAuthGateContext,
  setAuthGateOpen,
}: {
  setAuthGateContext: any;
  setAuthGateOpen: any;
}) => {
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
    map,
  } = useDiscoverContext();

  const {
    isAuthenticated,
    _hasHydrated,
    isLoading: isSessionLoading,
    token,
  } = useSessionStore();
  const canUseFavorites =
    _hasHydrated && !isSessionLoading && isAuthenticated && !!token;

  const currentEntityForFavs =
    searchType === "STORE"
      ? "PROVIDER"
      : (searchType as "PACKAGE" | "COURSE" | "PRODUCT" | "SERVICE");
  const { favoriteIds } = useMyFavorites(currentEntityForFavs);

  const { batchScores, fetchBatchScores } = useProviderScore();

  useEffect(() => {
    if (providers && providers.length > 0) {
      const providerIds = providers.map((p) => p.id);
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

  const handleAuthRequired = (context: "favorite" | "booking" = "favorite") => {
    setAuthGateContext(context);
    setAuthGateOpen(true);
  };

  const enrichedProviders = useMemo(() => {
    if (!providers) return [];
    return providers.map((p) => {
      let distance = undefined;
      if (coordinates && p.lat && p.lng) {
        distance = calculateDistance(
          coordinates.lat,
          coordinates.lng,
          p.lat,
          p.lng,
        );
      }
      return { ...p, distanceKm: distance };
    });
  }, [providers, coordinates, calculateDistance]);

  if (isLoading) {
    return (
      <div
        className={cn(
          "absolute z-20 pointer-events-none transition-all duration-500",
          viewMode === "MAP"
            ? cn(
                "bottom-6 left-0 w-full md:top-28 md:bottom-6 md:left-8 md:w-[460px] md:overflow-hidden md:flex md:flex-col",
                isMapImmersive
                  ? "translate-y-[150%] md:-translate-x-[150%] opacity-0"
                  : "translate-y-0 opacity-100",
              )
            : "top-32 left-4 right-4 md:left-8 md:right-8 md:bottom-8 bottom-4",
        )}
      >
        <DiscoverSkeleton />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute z-20 pointer-events-none transition-all duration-500",
        viewMode === "MAP"
          ? cn(
              "bottom-6 left-0 w-full md:top-28 md:bottom-6 md:left-8 md:w-[460px] md:overflow-hidden md:flex md:flex-col",
              isMapImmersive
                ? "translate-y-[150%] md:-translate-x-[150%] opacity-0"
                : "translate-y-0 opacity-100",
            )
          : "top-32 left-4 right-4 md:left-8 md:right-8 md:bottom-8 bottom-4",
      )}
    >
      {(
        searchType === "STORE"
          ? enrichedProviders.length === 0
          : items.length === 0
      ) ? (
        <div className="w-[90%] md:w-full mx-auto bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 p-10 text-center pointer-events-auto shadow-sm rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
          <div className="bg-white dark:bg-black p-4 rounded-full shadow-sm mb-4">
            <Search
              className="w-8 h-8 text-teal-600 dark:text-teal-400"
              strokeWidth={1.5}
            />
          </div>
          <h3 className="text-gray-900 dark:text-white font-semibold text-lg tracking-tight mb-2">
            No encontramos coincidencias
          </h3>
          <p className="text-gray-500 text-sm font-medium max-w-sm mx-auto">
            Intenta ampliando los parámetros de tu búsqueda o eliminando algunos
            filtros.
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "w-full pointer-events-auto custom-scrollbar h-full overflow-y-auto",
            viewMode === "MAP"
              ? "flex overflow-x-auto overflow-y-hidden gap-3 pb-4 md:flex-col md:flex-1 md:overflow-x-hidden md:overflow-y-auto md:gap-3 md:pb-6 px-4 md:px-0"
              : "pb-20 md:pb-0 flex gap-8 max-w-7xl mx-auto",
          )}
        >
          {viewMode === "GRID" && (
            <aside
              className={cn(
                "hidden md:block flex-shrink-0 transition-all duration-300",
                isFiltersOpen ? "w-[300px]" : "w-[60px]",
              )}
            >
              <FilterPanel
                isCollapsed={!isFiltersOpen}
                onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
              />
            </aside>
          )}

          <div
            className={cn(
              viewMode === "GRID"
                ? isFiltersOpen
                  ? "flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start transition-all duration-300"
                  : "flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start transition-all duration-300"
                : "flex gap-3 md:flex-col md:gap-3 w-full",
            )}
          >
            <AnimatePresence>
              {searchType === "STORE"
                ? enrichedProviders.map((provider) => (
                    <ProviderCard
                      key={`card-${provider.id}`}
                      provider={provider}
                      isSelected={selectedId === provider.id}
                      isFavorited={favoriteIds.has(provider.id)}
                      scoreData={batchScores[provider.id]}
                      canUseFavorites={canUseFavorites}
                      onClick={() => handleSelectProvider(provider)}
                      onHover={() => setHoveredId(provider.id)}
                      onLeave={() => setHoveredId(null)}
                      onAuthRequired={() => handleAuthRequired("favorite")}
                    />
                  ))
                : items.map((item) => (
                    <DiscoverItemCard
                      key={`item-card-${item.id}`}
                      item={item}
                      isFavorited={favoriteIds.has(item.id)}
                      canUseFavorites={canUseFavorites}
                      onAuthRequired={() => handleAuthRequired("favorite")}
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
                    <>
                      <Loader2
                        className="w-4 h-4 mr-2 animate-spin"
                        strokeWidth={2}
                      />{" "}
                      CARGANDO...
                    </>
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
                  <>
                    <Loader2
                      className="w-4 h-4 mr-2 animate-spin"
                      strokeWidth={2}
                    />{" "}
                    CARGANDO...
                  </>
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

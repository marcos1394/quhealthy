"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { useDiscoverContext } from "./context/DiscoverContext";
import { useSessionStore } from "@/stores/SessionStore";
import { useMyFavorites } from "@/hooks/useMyFavorites";
import { useProviderScore } from "@/hooks/useProviderScore";
import { DiscoverItemCard } from "@/components/discover/DiscoverItemCard";
import { FilterPanel } from "@/components/discover/FilterPanel";
import { ProviderCard } from "@/components/discover/ProviderCard";
import { DiscoverSkeleton } from "./DiscoverSkeleton";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface MarketplaceListProps {
  setAuthGateContext: (ctx: any) => void;
  setAuthGateOpen: (open: boolean) => void;
}

export const MarketplaceList: React.FC<MarketplaceListProps> = ({
  setAuthGateContext,
  setAuthGateOpen,
}) => {
  const t = useTranslations("Discover.MarketplaceList");

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
          p.lng
        );
      }
      return { ...p, distanceKm: distance };
    });
  }, [providers, coordinates, calculateDistance]);

  // ── ESTADO CARGANDO (SKELETON) ───────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className={cn(
          "absolute z-20 pointer-events-none transition-all duration-300 font-sans",
          viewMode === "MAP"
            ? cn(
                "bottom-6 left-0 w-full md:top-28 md:bottom-6 md:left-8 md:w-[460px] md:overflow-hidden md:flex md:flex-col",
                isMapImmersive
                  ? "translate-y-[150%] md:-translate-x-[150%] opacity-0"
                  : "translate-y-0 opacity-100"
              )
            : "top-32 left-4 right-4 md:left-8 md:right-8 md:bottom-8 bottom-4"
        )}
      >
        <DiscoverSkeleton />
      </div>
    );
  }

  const hasNoResults =
    searchType === "STORE"
      ? enrichedProviders.length === 0
      : items.length === 0;

  return (
    <div
      className={cn(
        "absolute z-20 pointer-events-none transition-all duration-300 font-sans",
        viewMode === "MAP"
          ? cn(
              "bottom-6 left-0 w-full md:top-28 md:bottom-6 md:left-8 md:w-[460px] md:overflow-hidden md:flex md:flex-col",
              isMapImmersive
                ? "translate-y-[150%] md:-translate-x-[150%] opacity-0"
                : "translate-y-0 opacity-100"
            )
          : "top-32 left-4 right-4 md:left-8 md:right-8 md:bottom-8 bottom-4"
      )}
    >
      {hasNoResults ? (
        /* ── ESTADO SIN RESULTADOS ─────────────────────────────────── */
        <div className="w-[92%] md:w-full mx-auto bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-8 sm:p-10 text-center pointer-events-auto shadow-sm rounded-3xl flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
            <Search className="w-7 h-7" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <h3 className="text-gray-900 dark:text-white font-bold text-base sm:text-lg tracking-tight">
              {t("no_results_title")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium max-w-sm mx-auto leading-relaxed">
              {t("no_results_desc")}
            </p>
          </div>
        </div>
      ) : (
        /* ── CONTENEDOR PRINCIPAL DE RESULTADOS ──────────────────────── */
        <div
          className={cn(
            "w-full pointer-events-auto custom-scrollbar h-full overflow-y-auto",
            viewMode === "MAP"
              ? "flex overflow-x-auto overflow-y-hidden gap-3.5 pb-4 md:flex-col md:flex-1 md:overflow-x-hidden md:overflow-y-auto md:gap-3.5 md:pb-6 px-4 md:px-0"
              : "pb-20 md:pb-0 flex gap-6 max-w-7xl mx-auto"
          )}
        >
          {/* Panel Lateral de Filtros (Vista GRID) */}
          {viewMode === "GRID" && (
            <aside
              className={cn(
                "hidden md:block shrink-0 transition-all duration-300",
                isFiltersOpen ? "w-[300px]" : "w-[60px]"
              )}
            >
              <FilterPanel
                isCollapsed={!isFiltersOpen}
                onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
              />
            </aside>
          )}

          {/* Rejilla/Lista de Tarjetas */}
          <div
            className={cn(
              viewMode === "GRID"
                ? isFiltersOpen
                  ? "flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start transition-all duration-300"
                  : "flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start transition-all duration-300"
                : "flex gap-3.5 md:flex-col md:gap-3.5 w-full"
            )}
          >
            <>
              {searchType === "STORE"
                ? enrichedProviders.map((provider) => (
                    <ProviderCard
                      key={`card-${provider.id}`}
                      provider={provider}
                      isSelected={selectedId === provider.id}
                      isFavorited={favoriteIds.has(provider.id)}
                      scoreData={batchScores[provider.id]}
                      canUseFavorites={canUseFavorites}
                      isGrid={viewMode === "GRID"}
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
                      isGrid={viewMode === "GRID"}
                      isFavorited={favoriteIds.has(item.id)}
                      canUseFavorites={canUseFavorites}
                      onAuthRequired={() => handleAuthRequired("favorite")}
                    />
                  ))}
            </>

            {/* Cargar más en Modo GRID */}
            {!isReachingEnd && viewMode === "GRID" && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex justify-center mt-6 mb-8 w-full">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? (
                    <>
                      <QhSpinner size="sm" className="text-white" />
                      <span>{t("loading")}</span>
                    </>
                  ) : (
                    <span>{t("load_more")}</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Cargar más en Modo MAP */}
          {!isReachingEnd && viewMode === "MAP" && (
            <div className="w-full shrink-0 flex justify-center mt-6 mb-8 pr-4 md:pr-0">
              <button
                type="button"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <>
                    <QhSpinner size="sm" className="text-white" />
                    <span>{t("loading")}</span>
                  </>
                ) : (
                  <span>{t("load_more")}</span>
                )}
              </button>
            </div>
          )}

          <div className="w-6 md:hidden shrink-0" />
        </div>
      )}
    </div>
  );
};
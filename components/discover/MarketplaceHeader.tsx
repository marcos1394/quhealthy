"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import {
  Search,
  Map as MapIcon,
  LayoutGrid,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { QhSpinner } from "@/components/ui/QhSpinner";

import { cn } from "@/lib/utils";
import { useDiscoverContext } from "./context/DiscoverContext";
import { SortDropdown } from "@/components/discover/SortDropdown";
import { FilterPanel } from "@/components/discover/FilterPanel";

export const MarketplaceHeader = ({
  locationDeclined,
  setLocationDeclined,
  showSuccess,
  requestLocation,
}: {
  locationDeclined: boolean;
  setLocationDeclined: (val: boolean) => void;
  showSuccess: boolean;
  requestLocation: () => void;
}) => {
  const t = useTranslations("Discover.MarketplaceHeader");

  const {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    viewMode,
    setViewMode,
    isMapImmersive,
    isValidating,
    coordinates,
  } = useDiscoverContext();

  const isGeoLoading = false;
  const geoError = false;

  return (
    <div
      className={cn(
        "absolute top-6 left-4 right-4 md:left-8 md:right-8 z-20 flex flex-col gap-3 pointer-events-none transition-all duration-300 font-sans",
        isMapImmersive
          ? "-translate-y-[150%] opacity-0"
          : "translate-y-0 opacity-100"
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
        {/* ── BARRA DE BÚSQUEDA Y NAVEGACIÓN ─────────────────────────── */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="pointer-events-auto w-full md:w-[500px] lg:w-[480px] xl:w-[500px] shrink-0 flex items-center bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 transition-shadow focus-within:shadow-lg overflow-hidden h-12 sm:h-14"
        >
          <div className="flex-1 flex items-center px-4 h-full relative">
            {isValidating ? (
              <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400 mr-3 shrink-0" />
            ) : (
              <Search
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-3 shrink-0"
                strokeWidth={2}
              />
            )}
            <Input
              placeholder={t("search_placeholder")}
              className="bg-transparent border-none p-0 h-full text-xs sm:text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Selector de Vista (Mapa vs Grid) */}
          <div className="hidden md:flex items-center gap-1 px-2 border-l border-gray-100 dark:border-gray-800/80 h-8">
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "rounded-xl h-9 w-9 p-0 transition-colors cursor-pointer",
                viewMode === "MAP"
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 shadow-2xs"
                  : "text-gray-400 hover:bg-gray-50 dark:hover:bg-[#111]"
              )}
              onClick={() => setViewMode("MAP")}
            >
              <MapIcon className="w-4 h-4" strokeWidth={2} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "rounded-xl h-9 w-9 p-0 transition-colors cursor-pointer",
                viewMode === "GRID"
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 shadow-2xs"
                  : "text-gray-400 hover:bg-gray-50 dark:hover:bg-[#111]"
              )}
              onClick={() => setViewMode("GRID")}
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={2} />
            </Button>
          </div>

          {/* Filtro por Tipo de Entidad */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "rounded-none border-l border-gray-100 dark:border-gray-800/80 h-12 sm:h-14 w-12 sm:w-14 hover:bg-gray-50 dark:hover:bg-[#111] p-0 shrink-0 transition-colors cursor-pointer",
                  searchType !== "STORE"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                )}
              >
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-1.5 font-sans"
            >
              <DropdownMenuItem
                onClick={() => setSearchType("STORE")}
                className={cn(
                  "text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer mb-1 focus:bg-gray-50 dark:focus:bg-[#111]",
                  searchType === "STORE" &&
                    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                )}
              >
                {t("type_store")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSearchType("SERVICE")}
                className={cn(
                  "text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer mb-1 focus:bg-gray-50 dark:focus:bg-[#111]",
                  searchType === "SERVICE" &&
                    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                )}
              >
                {t("type_service")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSearchType("PACKAGE")}
                className={cn(
                  "text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer mb-1 focus:bg-gray-50 dark:focus:bg-[#111]",
                  searchType === "PACKAGE" &&
                    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                )}
              >
                {t("type_package")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSearchType("COURSE")}
                className={cn(
                  "text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer mb-1 focus:bg-gray-50 dark:focus:bg-[#111]",
                  searchType === "COURSE" &&
                    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                )}
              >
                {t("type_course")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSearchType("FOUNDATION")}
                className={cn(
                  "text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer mb-1 focus:bg-gray-50 dark:focus:bg-[#111]",
                  searchType === "FOUNDATION" &&
                    "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                )}
              >
                {t("type_foundation")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSearchType("PRODUCT")}
                className={cn(
                  "text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer focus:bg-gray-50 dark:focus:bg-[#111]",
                  searchType === "PRODUCT" &&
                    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                )}
              >
                {t("type_product")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </form>

        {/* Trigger de Filtros para Móviles */}
        <div className="shrink-0 pointer-events-auto flex gap-2 overflow-x-auto md:flex-wrap no-scrollbar py-0.5 px-1 -mx-1 flex-1">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-xl border-gray-200 dark:border-gray-800 h-10 px-4 text-xs font-bold bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 shadow-2xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-2 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("filters")}</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                position="bottom"
                className="h-[85vh] p-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-t-3xl shadow-2xl font-sans"
              >
                <div className="h-full overflow-y-auto custom-scrollbar p-6">
                  <FilterPanel isCollapsed={false} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Dropdown Ordenamiento */}
        <div className="shrink-0 pointer-events-auto pl-2">
          <SortDropdown />
        </div>
      </div>

      {/* ── BANNER / PROMPT DE GEOLOCALIZACIÓN ─────────────────────── */}
      {((!coordinates && !locationDeclined) || showSuccess) && (
        <div className="pointer-events-auto md:w-[460px] flex flex-col gap-4 p-5 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl transition-all duration-300">
          {showSuccess ? (
            <div className="flex items-center gap-3 py-1">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="flex flex-col space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("location_confirmed_title")}
                </h4>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  {t("location_confirmed_desc")}
                </p>
              </div>
            </div>
          ) : isGeoLoading && !geoError ? (
            <div className="flex items-center gap-3 py-1">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                <QhSpinner size="sm" />
              </div>
              <div className="flex flex-col space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("verifying_permissions_title")}
                </h4>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  {t("verifying_permissions_desc")}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <MapPin className="w-5 h-5" strokeWidth={2} />
                </div>

                <div className="flex flex-col space-y-1">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                    {geoError
                      ? t("permission_denied_title")
                      : t("find_options_title")}
                  </h4>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {geoError
                      ? t("permission_denied_desc")
                      : t("find_options_desc")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                {geoError ? (
                  <Button
                    type="button"
                    onClick={() => setLocationDeclined(true)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-10 shadow-xs cursor-pointer border-0"
                  >
                    {t("btn_understood")}
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={() => requestLocation()}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-10 shadow-xs cursor-pointer border-0"
                    >
                      {t("btn_allow")}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setLocationDeclined(true)}
                      variant="outline"
                      className="flex-1 rounded-xl text-xs font-bold h-10 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors cursor-pointer shadow-2xs"
                    >
                      {t("btn_not_now")}
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
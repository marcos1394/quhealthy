"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useDiscoverContext } from "./context/DiscoverContext";

export const DiscoverSkeleton = () => {
  const { viewMode, isFiltersOpen } = useDiscoverContext();

  // Array de 8 tarjetas esqueleto para el estado de carga
  const skeletons = Array(8).fill(null);

  return (
    <div
      className={cn(
        "w-full pointer-events-auto custom-scrollbar font-sans transition-colors",
        viewMode === "MAP"
          ? "flex overflow-x-auto overflow-y-hidden gap-3 pb-4 md:flex-col md:flex-1 md:overflow-x-hidden md:overflow-y-auto md:gap-3 md:pb-6 px-4 md:px-0"
          : "pb-20 md:pb-0 flex gap-6 max-w-7xl mx-auto"
      )}
    >
      {/* ── PANEL DE FILTROS SKELETON (Solo vista GRID) ──────────────── */}
      {viewMode === "GRID" && (
        <aside
          className={cn(
            "hidden md:block shrink-0 transition-all duration-300",
            isFiltersOpen ? "w-[280px]" : "w-[60px]"
          )}
        >
          <div
            className={cn(
              "bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 animate-pulse rounded-3xl shadow-2xs",
              isFiltersOpen ? "h-[480px] w-full" : "h-[60px] w-full"
            )}
          />
        </aside>
      )}

      {/* ── CONTENEDOR DE TARJETAS SKELETON ────────────────────────────── */}
      <div
        className={cn(
          viewMode === "GRID"
            ? isFiltersOpen
              ? "flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start"
              : "flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start"
            : "flex gap-3 md:flex-col md:gap-3 w-full"
        )}
      >
        {skeletons.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "relative w-72 shrink-0 md:w-full self-start bg-white dark:bg-[#0a0a0a] flex flex-col border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-2xs animate-pulse p-4 space-y-4"
            )}
          >
            {/* Imagen Esqueleto */}
            <div className="h-40 md:h-44 w-full bg-gray-200/60 dark:bg-gray-800/60 rounded-2xl" />

            {/* Bloque de Información Esqueleto */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col space-y-2 w-full">
                  <div className="h-4 bg-gray-200/60 dark:bg-gray-800/60 rounded-xl w-3/4" />
                  <div className="h-3 bg-gray-200/60 dark:bg-gray-800/60 rounded-lg w-1/3" />
                </div>
                <div className="w-9 h-9 bg-gray-200/60 dark:bg-gray-800/60 rounded-xl shrink-0" />
              </div>

              <div className="w-full h-px bg-gray-100 dark:bg-gray-800/80 my-1" />

              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200/60 dark:bg-gray-800/60 rounded-lg w-16" />
                <div className="h-4 bg-gray-200/60 dark:bg-gray-800/60 rounded-lg w-12" />
              </div>

              <div className="w-full h-11 bg-gray-200/60 dark:bg-gray-800/60 rounded-xl mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
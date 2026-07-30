"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useRef } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { DiscoverProvider } from "@/types/discover";
import { ProviderCard } from "./ProviderCard";

interface CategoryRowProps {
  title: string;
  subtitle?: string;
  providers: DiscoverProvider[];
}

export const CategoryRow: React.FC<CategoryRowProps> = ({
  title,
  subtitle,
  providers,
}) => {
  const t = useTranslations("Discover.CategoryRow");
  const rowRef = useRef<HTMLDivElement>(null);

  // Si no hay proveedores en esta categoría, omitimos el render para evitar espacios vacíos
  if (!providers || providers.length === 0) return null;

  // Manejo de desplazamiento horizontal en pantallas de escritorio
  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount =
        direction === "left" ? -clientWidth / 1.5 : clientWidth / 1.5;
      rowRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative flex flex-col w-full py-4 sm:py-6 group font-sans transition-colors">
      {/* ── HEADER DE LA FILA ───────────────────────────────────────── */}
      <div className="px-4 sm:px-6 md:px-8 mb-3 sm:mb-4 flex items-end justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* Acceso directo "Ver todos" */}
        <button
          type="button"
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors hidden sm:flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>{t("view_all")}</span>
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* ── CONTROLES DE NAVEGACIÓN (Desktop Hover) ────────────────── */}
      <div className="hidden md:block">
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Desplazar a la izquierda"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-2xl bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 flex items-center justify-center cursor-pointer hover:border-emerald-500/30"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Desplazar a la derecha"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-2xl bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 flex items-center justify-center cursor-pointer hover:border-emerald-500/30"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      {/* ── CARRUSEL HORIZONTAL DE PROVEEDORES ────────────────────── */}
      <div
        ref={rowRef}
        className="flex overflow-x-auto gap-4 sm:gap-5 px-4 sm:px-6 md:px-8 pb-4 pt-1 snap-x snap-mandatory scroll-smooth custom-scrollbar select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {providers.map((provider) => (
          <div key={provider.id} className="snap-start shrink-0">
            <ProviderCard provider={provider} />
          </div>
        ))}

        {/* Espaciador final para suavizar el borde en dispositivos móviles */}
        <div className="w-2 shrink-0 sm:hidden" />
      </div>
    </div>
  );
};
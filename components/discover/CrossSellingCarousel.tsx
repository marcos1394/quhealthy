"use client";

/* eslint-disable @next/next/no-img-element */

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { ChevronRight, ShoppingBag, ArrowRight } from "lucide-react";

import { discoverService } from "@/services/discover.service";
import { cn } from "@/lib/utils";

interface CrossSellingCarouselProps {
  itemType: "COURSE" | "PRODUCT";
  title: string;
  subtitle?: string;
}

export const CrossSellingCarousel: React.FC<CrossSellingCarouselProps> = ({
  itemType,
  title,
  subtitle,
}) => {
  const t = useTranslations("Discover.CrossSellingCarousel");

  const { data: items, isLoading } = useSWR(
    ["/discover/cross-selling", itemType],
    () => discoverService.getCrossSellingRecommendations(itemType, 10),
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // 2 minutos de caché para recomendaciones
    }
  );

  // ── ESTADO CARGANDO (SKELETON SOFT HEALTH) ───────────────────────────
  if (isLoading) {
    return (
      <div className="py-6 sm:py-8 w-full font-sans">
        <div className="flex space-x-4 overflow-x-auto custom-scrollbar pb-4 select-none">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="min-w-[260px] sm:min-w-[300px] h-48 bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-3xl animate-pulse p-4 space-y-3"
            >
              <div className="w-full h-24 bg-gray-200/60 dark:bg-gray-800/60 rounded-2xl" />
              <div className="w-3/4 h-4 bg-gray-200/60 dark:bg-gray-800/60 rounded-lg" />
              <div className="w-1/2 h-3 bg-gray-200/60 dark:bg-gray-800/60 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="py-6 sm:py-8 w-full border-t border-gray-100 dark:border-gray-800/80 mt-6 font-sans transition-colors">
      {/* ── HEADER DE LA SECCIÓN ────────────────────────────────────── */}
      <div className="flex justify-between items-end mb-4 sm:mb-6 gap-4">
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          href={`/discover?type=${itemType.toLowerCase()}`}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors shrink-0 group"
        >
          <span>{t("view_all")}</span>
          <ChevronRight
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </Link>
      </div>

      {/* ── CARRUSEL HORIZONTAL ──────────────────────────────────────── */}
      <div
        className="flex overflow-x-auto gap-4 sm:gap-5 pb-4 snap-x snap-mandatory scroll-smooth custom-scrollbar select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/item/${item.id}`}
            className="min-w-[260px] sm:min-w-[300px] max-w-[320px] bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 group snap-start flex flex-col justify-between"
          >
            {/* Contenedor de Imagen */}
            <div className="h-32 bg-gray-50 dark:bg-[#050505] relative overflow-hidden shrink-0">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                  <ShoppingBag className="w-8 h-8 opacity-40" strokeWidth={1.5} />
                </div>
              )}

              {item.category && (
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md text-[10px] font-bold px-2.5 py-0.5 rounded-full text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 shadow-2xs">
                  {item.category}
                </div>
              )}
            </div>

            {/* Detalles del Ítem */}
            <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
              <div className="space-y-1">
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white tracking-tight line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed min-h-[32px]">
                  {item.description || t("no_description")}
                </p>
              </div>

              {/* Precio y Acción */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <span className="font-bold font-mono text-sm sm:text-base text-gray-900 dark:text-white">
                  ${item.price != null ? item.price.toFixed(2) : "0.00"}
                </span>

                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>{t("view_details")}</span>
                  <ArrowRight
                    className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
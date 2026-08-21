"use client";

/* eslint-disable @next/next/no-img-element */

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Clock, Navigation, Stethoscope, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { generateSlug } from "@/lib/utils";
import { DiscoverItem } from "@/types/discover";

export const DiscoverServiceCard = ({ item }: { item: DiscoverItem }) => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Discover.DiscoverServiceCard");

  const handleProviderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/store/${item.providerSlug}`);
  };

  const href = `/${locale}/market/item/${item.id}-${generateSlug(item.name)}`;

  return (
    <Link
      href={href}
      className="group flex flex-col w-full bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 transition-all duration-200 cursor-pointer rounded-3xl shadow-2xs hover:shadow-md font-sans select-none overflow-hidden block"
    >
      {/* ── IMAGEN DE PORTADA ───────────────────────────────────────── */}
      <div className="relative aspect-video w-full bg-gray-50 dark:bg-[#050505] overflow-hidden border-b border-gray-100 dark:border-gray-800/80">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-700 gap-1.5">
            <Stethoscope className="w-7 h-7 opacity-40" strokeWidth={1.5} />
            <span className="font-bold text-[10px] tracking-wider uppercase text-gray-400">
              {t("no_image")}
            </span>
          </div>
        )}

        {/* Insignias Semánticas */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap z-10">
          {item.modality && (
            <Badge className="bg-white/95 dark:bg-[#0a0a0a]/95 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 text-[10px] font-bold tracking-wide rounded-full shadow-2xs backdrop-blur-md px-2.5 py-0.5">
              {item.modality === "IN_PERSON"
                ? t("modality_in_person")
                : item.modality === "ONLINE"
                ? t("modality_online")
                : t("modality_hybrid")}
            </Badge>
          )}

          {(item.discountPercentage ?? 0) > 0 && (
            <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 text-[9px] font-mono font-bold tracking-wide rounded-full border-none shadow-2xs backdrop-blur-md px-2 py-0.5">
              -{item.discountPercentage}% OFF
            </Badge>
          )}
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL ─────────────────────────────────────── */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-1.5">
          <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white leading-snug line-clamp-2 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {item.name}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {item.description || item.category || t("no_description")}
          </p>

          {/* Información del Proveedor */}
          <div className="flex items-center gap-2 pt-2">
            <div className="shrink-0 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xs p-0.5 flex items-center justify-center">
              {item.providerLogoUrl ? (
                <img
                  src={item.providerLogoUrl}
                  alt={item.providerName}
                  className="w-full h-full object-contain object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <User className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                </div>
              )}
            </div>

            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
              <span
                onClick={handleProviderClick}
                className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate hover:underline hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {item.providerName}
              </span>
              {item.distanceKm !== undefined && (
                <span className="text-[10px] text-gray-400 font-medium flex items-center mt-0.5">
                  <Navigation className="w-2.5 h-2.5 mr-1 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>
                    {t("distance", {
                      distance: item.distanceKm.toFixed(1),
                    })}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── FOOTER: PRECIO Y DURACIÓN ─────────────────────────────── */}
        <div className="mt-auto flex justify-between items-end border-t border-gray-100 dark:border-gray-800/80 pt-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              {t("investment")}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-bold font-mono text-gray-900 dark:text-white leading-none">
                ${item.price?.toLocaleString()}
              </span>
              {item.compareAtPrice && item.compareAtPrice > item.price && (
                <span className="text-[10px] font-mono text-gray-400 line-through">
                  ${item.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {item.durationMinutes && (
            <div className="flex items-center text-[10px] font-bold font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-full px-2.5 py-1 shadow-2xs">
              <Clock className="w-3 h-3 mr-1 text-gray-400" strokeWidth={2} />
              <span>
                {item.durationMinutes} {t("min_short")}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
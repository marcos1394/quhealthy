"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Clock,
  Navigation,
  ShoppingBag,
  Package,
  BookOpen,
  Stethoscope,
  Calendar,
  CreditCard,
  GraduationCap,
  Star,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, generateSlug } from "@/lib/utils";
import { DiscoverItem } from "@/types/discover";
import { useBookingStore } from "@/hooks/useBookingStore";
import { StorefrontItem } from "@/types/storefront";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
export const DiscoverItemCard = ({
  item,
  isFavorited = false,
  onAuthRequired,
  canUseFavorites = true,
  isGrid = false,
}: {
  item: DiscoverItem;
  isFavorited?: boolean;
  onAuthRequired?: () => void;
  canUseFavorites?: boolean;
  isGrid?: boolean;
}) => {
  const t = useTranslations("Discover.DiscoverItemCard");
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "es";

  const { setProvider, addToCart } = useBookingStore();

  const handleProviderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/store/${item.providerSlug}`);
  };

  const handleItemClick = () => {
    router.push(
      `/store/${item.providerSlug}?autoShow=${item.id}&type=${item.type}`
    );
  };

  // Acción primaria del CTA según tipo de item
  const handleCTA = (e: React.MouseEvent) => {
    e.stopPropagation();

    setProvider(
      item.providerId,
      item.providerSlug,
      item.providerName,
      item.providerColor
    );

    const cartItem: StorefrontItem = {
      id: item.id,
      type: item.type,
      category: item.category || "",
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      durationMinutes: item.durationMinutes,
      modality: item.modality as any,
      compareAtPrice: item.compareAtPrice,
      quantity: item.stockQuantity,
      isDigital: item.isDigital,
      requiresEvaluation: item.requiresEvaluation,
    };

    addToCart(cartItem, item.providerSlug);

    if (item.type === "SERVICE") {
      router.push(`/patient/booking/${item.providerSlug}?serviceId=${item.id}`);
    } else {
      router.push(`/store/${item.providerSlug}?openCart=true`);
    }
  };

  const getTypeConfig = () => {
    switch (item.type) {
      case "SERVICE":
        return {
          icon: <Stethoscope className="w-3 h-3 mr-1" strokeWidth={2} />,
          label: t("type_service"),
          ctaLabel: t("cta_service"),
          ctaIcon: <Calendar className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />,
        };
      case "PRODUCT":
        return {
          icon: <ShoppingBag className="w-3 h-3 mr-1" strokeWidth={2} />,
          label: t("type_product"),
          ctaLabel: t("cta_product"),
          ctaIcon: <CreditCard className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />,
        };
      case "PACKAGE":
        return {
          icon: <Package className="w-3 h-3 mr-1" strokeWidth={2} />,
          label: t("type_package"),
          ctaLabel: t("cta_package"),
          ctaIcon: <CreditCard className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />,
        };
      case "COURSE":
        return {
          icon: <BookOpen className="w-3 h-3 mr-1" strokeWidth={2} />,
          label: t("type_course"),
          ctaLabel: t("cta_course"),
          ctaIcon: <GraduationCap className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />,
        };
      default:
        return {
          icon: null,
          label: t("type_item"),
          ctaLabel: t("cta_item"),
          ctaIcon: null,
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleItemClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleItemClick();
        }
      }}
      className={cn(
        "group flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 transition-all duration-200 cursor-pointer rounded-3xl shadow-2xs hover:shadow-md font-sans select-none overflow-hidden relative self-start",
        isGrid ? "w-full" : "w-72 shrink-0 md:w-full"
      )}
    >
      {/* ── IMAGEN DE PORTADA ───────────────────────────────────────── */}
      <div className="relative aspect-video w-full bg-gray-50 dark:bg-[#050505] overflow-hidden border-b border-gray-100 dark:border-gray-800/80">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="font-bold tracking-wider uppercase text-xs flex items-center">
              {typeConfig.icon} {typeConfig.label}
            </span>
          </div>
        )}

        {/* Insignias e Indicadores */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-col items-start z-10">
          <Badge className="bg-white/95 dark:bg-[#0a0a0a]/95 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 text-[10px] font-bold tracking-wide rounded-full shadow-2xs backdrop-blur-md px-2.5 py-0.5">
            <span className="flex items-center">
              {typeConfig.icon} {typeConfig.label}
            </span>
          </Badge>
          <div className="flex gap-1.5">
            {item.modality && (
              <Badge className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-[9px] font-bold tracking-wide rounded-full border-none shadow-2xs px-2 py-0.5">
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

        {/* Botón de Favoritos */}
        <div className="absolute top-3 right-3 z-20">
          <FavoriteButton
            entityType={
              item.type as "SERVICE" | "PRODUCT" | "PACKAGE" | "COURSE"
            }
            entityId={item.id}
            initialIsFavorite={isFavorited}
            brandColor={item.providerColor || "#059669"}
            onAuthRequired={!canUseFavorites ? onAuthRequired : undefined}
          />
        </div>

        {/* Calificación / Rating */}
        <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md rounded-full px-2.5 py-0.5 flex items-center gap-1 z-20 shadow-2xs border border-gray-100 dark:border-gray-800">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" strokeWidth={2} />
          <span className="text-[11px] font-bold font-mono text-gray-900 dark:text-white leading-none mt-0.5">
            {item.averageRating !== undefined && item.averageRating > 0
              ? item.averageRating.toFixed(1)
              : t("new_badge")}
          </span>
          {item.reviewCount !== undefined && item.reviewCount > 0 && (
            <span className="text-[10px] font-mono font-medium text-gray-400">
              ({item.reviewCount})
            </span>
          )}
        </div>
      </div>

      {/* ── CUERPO DE LA TARJETA ────────────────────────────────────── */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-2">
          {/* Título e Ítem */}
          <Link
            href={`/${locale}/market/item/${item.id}-${generateSlug(item.name)}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer block"
          >
            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-snug line-clamp-2 tracking-tight">
              {item.name}
            </h3>
          </Link>
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 line-clamp-1 capitalize">
            {(item.category || item.description).toLowerCase()}
          </p>

          {/* Proveedor / Especialista */}
          <div className="flex items-center gap-2 pt-1">
            <div className="shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xs">
              {item.providerLogoUrl ? (
                <img
                  src={item.providerLogoUrl}
                  alt={item.providerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <User className="w-3 h-3 text-gray-400" strokeWidth={2} />
                </div>
              )}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
              <button
                type="button"
                onClick={handleProviderClick}
                className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate hover:underline text-left cursor-pointer"
              >
                {item.providerName}
              </button>
              {item.distanceKm !== undefined && (
                <span className="text-[10px] text-gray-400 font-medium flex items-center mt-0.5">
                  <Navigation className="w-2.5 h-2.5 mr-1 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>
                    {t("distance_prefix", {
                      distance: item.distanceKm.toFixed(1),
                    })}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="w-full h-px bg-gray-100 dark:border-gray-800/80" />

        {/* Precio y Duración */}
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                {item.type === "SERVICE"
                  ? t("price_rate")
                  : item.type === "COURSE"
                  ? t("price_enrollment")
                  : t("price_price")}
              </span>
              <div className="flex items-baseline gap-1.5">
                {item.price > 0 ? (
                  <>
                    <span className="text-base sm:text-lg font-bold font-mono text-gray-900 dark:text-white leading-none">
                      ${item.price.toLocaleString()}
                    </span>
                    {item.compareAtPrice &&
                      item.compareAtPrice > item.price && (
                        <span className="text-[10px] font-mono text-gray-400 line-through">
                          ${item.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                  </>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {t("quote_required")}
                  </span>
                )}
              </div>
            </div>

            {item.durationMinutes &&
              (item.type === "SERVICE" || item.type === "COURSE") && (
                <div className="flex items-center text-[10px] font-bold font-mono text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-full px-2.5 py-1 shadow-2xs">
                  <Clock className="w-3 h-3 mr-1 text-gray-400" strokeWidth={2} />
                  <span>
                    {item.durationMinutes} {t("min_short")}
                  </span>
                </div>
              )}
          </div>

          {/* CTA Principal */}
          <button
            type="button"
            onClick={handleCTA}
            className="w-full rounded-xl h-11 text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-white shadow-xs hover:shadow-md hover:opacity-95 cursor-pointer border-0"
            style={{ backgroundColor: item.providerColor || "#059669" }}
          >
            {typeConfig.ctaIcon}
            <span>{typeConfig.ctaLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
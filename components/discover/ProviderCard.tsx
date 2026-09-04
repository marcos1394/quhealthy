"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-doctor/button-has-type */

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Award,
  PlayCircle,
  Star,
  Navigation,
  ChevronRight,
  User,
  ChevronLeft,
  Video,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { DiscoverProvider } from "@/types/discover";
import { getSpecialtyTheme } from "@/lib/mapPins";
import { ProviderScoreBadge } from "@/components/provider/ProviderScoreBadge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { ProviderScoreResponse } from "@/types/providerScore";

interface ProviderCardProps {
  provider: DiscoverProvider & { distanceKm?: number };
  isSelected?: boolean;
  isFavorited?: boolean;
  scoreData?: ProviderScoreResponse;
  canUseFavorites?: boolean;
  isGrid?: boolean;
  onClick?: () => void;
  onHover?: () => void;
  onLeave?: () => void;
  onAuthRequired?: () => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  isSelected = false,
  isFavorited = false,
  scoreData,
  canUseFavorites = false,
  isGrid = false,
  onClick,
  onHover,
  onLeave,
  onAuthRequired = () => {},
}) => {
  const t = useTranslations("Discover.ProviderCard");
  const router = useRouter();

  const specTheme = getSpecialtyTheme(
    provider.category || provider.specialty,
    provider.role
  );

  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Galería de imágenes con fallback
  const images =
    provider.galleryUrls && provider.galleryUrls.length > 0
      ? provider.galleryUrls
      : [provider.imageUrl];

  useEffect(() => {
    if ((isHovered || isSelected) && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Reproducción automática restringida por el navegador
      });
    } else if (!isHovered && !isSelected && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, isSelected]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onHover) onHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onLeave) onLeave();
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/store/${provider.slug}`);
    }
  };

  const hasValidImage = images[currentImageIndex] && !imgError;
  const hasValidLogo = provider.logoUrl && !logoError;
  const showVideo = provider.previewVideoUrl && (isHovered || isSelected);

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
      className={cn(
        "relative bg-white dark:bg-[#0a0a0a] transition-all duration-200 cursor-pointer flex flex-col group rounded-3xl font-sans select-none overflow-hidden",
        isGrid ? "w-full h-full" : "w-72 shrink-0 md:w-full self-start",
        isSelected
          ? "border-2 border-emerald-500 shadow-md z-10"
          : "border border-gray-100 dark:border-gray-800 shadow-2xs hover:shadow-md hover:border-emerald-500/30"
      )}
    >
      {/* Insignia de Patrocinado / Recomendado */}
      {provider.isPromoted && (
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs z-30 flex items-center gap-1">
          <Award className="w-3 h-3" strokeWidth={2} />
          <span>{t("recommended")}</span>
        </div>
      )}

      {/* ── ÁREA MULTIMEDIA ─────────────────────────────────────────── */}
      <div className="h-48 md:h-56 w-full relative overflow-hidden bg-gray-50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800/80">
        {/* Indicador de Reproducción de Video */}
        {provider.previewVideoUrl && !isHovered && !isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 pointer-events-none">
            <PlayCircle
              className="w-10 h-10 text-white opacity-80"
              strokeWidth={1.5}
            />
          </div>
        )}

        {/* Imagen principal o galería */}
        {!showVideo && hasValidImage ? (
          <img
            src={images[currentImageIndex]}
            alt={provider.name}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          !showVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-[#050505] text-gray-300 dark:text-gray-700">
              <User className="w-10 h-10 opacity-40" strokeWidth={1.5} />
            </div>
          )
        )}

        {/* Controles de Navegación del Carrusel */}
        {!showVideo && images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              aria-label="Imagen anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white/90 dark:bg-[#0a0a0a]/90 text-gray-800 dark:text-gray-200 rounded-full shadow-2xs z-30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-gray-100 dark:border-gray-800"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Imagen siguiente"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white/90 dark:bg-[#0a0a0a]/90 text-gray-800 dark:text-gray-200 rounded-full shadow-2xs z-30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-gray-100 dark:border-gray-800"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>

            {/* Paginación */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-30">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1 transition-all rounded-full",
                    idx === currentImageIndex
                      ? "w-3 bg-white"
                      : "w-1 bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Reproductor de Video */}
        {provider.previewVideoUrl && (
          <video
            ref={videoRef}
            src={provider.previewVideoUrl}
            muted
            loop
            playsInline
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
              showVideo ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        {/* Insignias Superpuestas */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start">
          <ProviderScoreBadge scoreData={scoreData} />
          {(provider.discountPercentage ?? 0) > 0 && (
            <span className="bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 font-mono font-bold px-2 py-0.5 rounded-full text-[9px] shadow-2xs backdrop-blur-md">
              -{provider.discountPercentage}% OFF
            </span>
          )}
          {provider.isPremium && (
            <span className="bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full text-[9px] shadow-2xs backdrop-blur-md flex items-center gap-1 border border-amber-200 dark:border-amber-900/40">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{t("top_badge")}</span>
            </span>
          )}
        </div>

        {/* Botón de Favoritos */}
        <div
          className="absolute top-3 right-3 z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <FavoriteButton
            entityType="PROVIDER"
            entityId={provider.id}
            initialIsFavorite={isFavorited}
            brandColor={provider.color || "#059669"}
            onAuthRequired={!canUseFavorites ? onAuthRequired : undefined}
          />
        </div>

        {/* Rating Flotante */}
        <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md rounded-full px-2.5 py-0.5 flex items-center gap-1 z-20 shadow-2xs border border-gray-100 dark:border-gray-800">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" strokeWidth={2} />
          <span className="text-[11px] font-bold font-mono text-gray-900 dark:text-white leading-none mt-0.5">
            {provider.rating > 0 ? provider.rating.toFixed(1) : t("new_badge")}
          </span>
          {provider.reviews > 0 && (
            <span className="text-[10px] font-mono font-medium text-gray-400">
              ({provider.reviews})
            </span>
          )}
        </div>
      </div>

      {/* ── CUERPO Y DETALLES ───────────────────────────────────────── */}
      <div className="p-4 sm:p-5 flex flex-col justify-between grow space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col min-w-0 space-y-1.5">
            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-snug line-clamp-2 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {provider.name}
            </h3>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight w-fit transition-colors shadow-2xs"
              style={{
                backgroundColor: `${specTheme.primaryColor}14`,
                color: specTheme.primaryColor,
                border: `1px solid ${specTheme.primaryColor}28`,
              }}
            >
              <svg
                className="w-3 h-3 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={specTheme.iconSvgPath} />
              </svg>
              <span className="capitalize truncate max-w-[160px]">
                {(provider.category || specTheme.label).toLowerCase()}
              </span>
            </div>
          </div>

          <div className="w-11 h-11 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            {hasValidLogo ? (
              <img
                src={provider.logoUrl}
                alt={provider.name}
                onError={() => setLogoError(true)}
                className="w-full h-full object-contain object-center"
              />
            ) : (
              <User className="w-5 h-5 text-gray-400" strokeWidth={2} />
            )}
          </div>
        </div>

        {/* Modalidades y Disponibilidad */}
        {((provider.offersTelemedicine ||
          provider.hasTelemedicine ||
          provider.modalities?.includes("ONLINE")) ||
          provider.availableToday) && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {(provider.offersTelemedicine ||
              provider.hasTelemedicine ||
              provider.modalities?.includes("ONLINE")) && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40">
                <Video className="w-2.5 h-2.5" />
                <span>En línea</span>
              </span>
            )}
            {provider.availableToday && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Hoy disponible</span>
              </span>
            )}
          </div>
        )}

        <div className="w-full h-px bg-gray-100 dark:bg-gray-800/80" />

        {/* Datos de Tarifa y Ubicación */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              {t("consultation_from")}
            </span>
            <div className="flex items-baseline gap-1.5">
              {provider.basePrice && provider.basePrice > 0 ? (
                <>
                  <span className="text-sm sm:text-base font-bold font-mono text-gray-900 dark:text-white leading-none">
                    ${provider.basePrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">MXN</span>
                  {provider.compareAtPrice &&
                    provider.compareAtPrice > provider.basePrice && (
                      <span className="text-[10px] font-mono text-gray-400 line-through ml-1">
                        ${provider.compareAtPrice.toLocaleString()}
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

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              {t("location_label")}
            </span>
            <div className="flex items-center gap-1.5">
              {provider.locationsCount && provider.locationsCount > 1 && (
                <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 px-1.5 py-0.5 rounded-full border border-sky-100 dark:border-sky-900/50">
                  +{provider.locationsCount - 1} suc.
                </span>
              )}
              <span className="flex items-center text-[10px] font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-full px-2.5 py-1 shadow-2xs">
                <Navigation
                  className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2}
                />
                <span>
                  {provider.distanceKm
                    ? t("distance_km", {
                        distance: provider.distanceKm.toFixed(1),
                      })
                    : t("location_not_specified")}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Botón de Acción Principal */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/store/${provider.slug}`);
          }}
          className="w-full rounded-xl h-11 text-xs font-bold transition-all text-white shadow-xs hover:shadow-md hover:opacity-95 cursor-pointer border-0 flex justify-center items-center gap-2 group/btn"
          style={{
            backgroundColor:
              provider.color || specTheme.primaryColor || "#059669",
          }}
        >
          <span>{t("view_profile")}</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
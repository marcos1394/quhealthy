"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  HeartHandshake,
  ShieldCheck,
  Award,
  Layers,
  PlayCircle,
  Navigation,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

import { FoundationPublicStorefront } from "@/types/foundation";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { cn } from "@/lib/utils";

interface FoundationCardProps {
  foundation: FoundationPublicStorefront & { distanceKm?: number; lat?: number; lng?: number };
  isSelected?: boolean;
  isFavorited?: boolean;
  canUseFavorites?: boolean;
  isGrid?: boolean;
  onClick?: () => void;
  onHover?: () => void;
  onLeave?: () => void;
  onAuthRequired?: () => void;
}

export const FoundationCard: React.FC<FoundationCardProps> = ({
  foundation,
  isSelected = false,
  isFavorited = false,
  canUseFavorites = false,
  isGrid = false,
  onClick,
  onHover,
  onLeave,
  onAuthRequired = () => {},
}) => {
  const router = useRouter();

  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  const title = foundation.brandName || foundation.legalName;
  const programsCount = foundation.programs?.length || foundation.totalActiveProgramsCount || 0;
  const primaryCause =
    foundation.primaryCauses && foundation.primaryCauses.length > 0
      ? foundation.primaryCauses[0]
      : foundation.organizationType || "Asistencia Social";

  // Galería de imágenes con fallback
  const images =
    foundation.galleryUrls && foundation.galleryUrls.length > 0
      ? foundation.galleryUrls
      : foundation.bannerUrl
      ? [foundation.bannerUrl]
      : foundation.logoUrl
      ? [foundation.logoUrl]
      : [];

  const videoUrl = foundation.videoUrl;

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
      router.push(`/foundation/${foundation.id}`);
    }
  };

  const hasValidImage = images[currentImageIndex] && !imgError;
  const hasValidLogo = foundation.logoUrl && !logoError;
  const showVideo = videoUrl && (isHovered || isSelected);
  const primaryColor = foundation.primaryColor || "#e11d48";

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
          ? "border-2 border-rose-500 shadow-md z-10"
          : "border border-gray-100 dark:border-gray-800 shadow-2xs hover:shadow-md hover:border-rose-500/40"
      )}
    >
      {/* ── ÁREA MULTIMEDIA ─────────────────────────────────────────── */}
      <div className="h-48 md:h-56 w-full relative overflow-hidden bg-gray-50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800/80">
        {/* Indicador de Reproducción de Video */}
        {videoUrl && !isHovered && !isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 pointer-events-none">
            <PlayCircle
              className="w-10 h-10 text-white opacity-90 drop-shadow-md"
              strokeWidth={1.5}
            />
          </div>
        )}

        {/* Imagen principal o galería */}
        {!showVideo && hasValidImage ? (
          <img
            src={images[currentImageIndex]}
            alt={title}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          !showVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100/50 dark:from-[#0a0a0a] dark:to-rose-950/20 text-rose-300 dark:text-rose-800">
              <Building2 className="w-12 h-12 opacity-50" strokeWidth={1.5} />
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
                    idx === currentImageIndex ? "w-3 bg-white" : "w-1 bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Reproductor de Video */}
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            loop
            playsInline
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
              showVideo ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        {/* Insignias Superpuestas en esquina superior izquierda */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start">
          <span className="bg-rose-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider shadow-2xs backdrop-blur-md flex items-center gap-1">
            <HeartHandshake className="w-3 h-3" />
            <span>{foundation.organizationType || "OSC"}</span>
          </span>

          {foundation.isAuthorizedDonatary && (
            <span className="bg-indigo-600/90 text-white font-bold px-2 py-0.5 rounded-full text-[9px] shadow-2xs backdrop-blur-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Donataria SAT</span>
            </span>
          )}

          {foundation.cluniNumber && (
            <span className="bg-black/60 text-white/95 font-mono font-medium px-2 py-0.5 rounded-full text-[8.5px] shadow-2xs backdrop-blur-md">
              CLUNI: {foundation.cluniNumber}
            </span>
          )}
        </div>

        {/* Botón de Favoritos en esquina superior derecha */}
        <div
          className="absolute top-3 right-3 z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <FavoriteButton
            entityType="FOUNDATION"
            entityId={foundation.id}
            initialIsFavorite={isFavorited}
            brandColor={primaryColor}
            onAuthRequired={!canUseFavorites ? onAuthRequired : undefined}
          />
        </div>

        {/* Badge Flotante de Programas Activos en esquina inferior derecha */}
        <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md rounded-full px-2.5 py-0.5 flex items-center gap-1 z-20 shadow-2xs border border-gray-100 dark:border-gray-800">
          <Layers className="w-3.5 h-3.5 text-rose-500" strokeWidth={2} />
          <span className="text-[11px] font-bold font-mono text-gray-900 dark:text-white leading-none mt-0.5">
            {programsCount} {programsCount === 1 ? "Programa" : "Programas"}
          </span>
        </div>
      </div>

      {/* ── CUERPO Y DETALLES ───────────────────────────────────────── */}
      <div className="p-4 sm:p-5 flex flex-col justify-between grow space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col min-w-0 space-y-0.5">
            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-snug line-clamp-2 tracking-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              {title}
            </h3>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 capitalize truncate">
              {primaryCause.toLowerCase()}
            </span>
          </div>

          <div className="w-10 h-10 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            {hasValidLogo ? (
              <img
                src={foundation.logoUrl}
                alt={title}
                onError={() => setLogoError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-5 h-5 text-rose-400" strokeWidth={2} />
            )}
          </div>
        </div>

        {/* Misión Institucional breve */}
        {foundation.mission && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-normal">
            {foundation.mission}
          </p>
        )}

        <div className="w-full h-px bg-gray-100 dark:bg-gray-800/80" />

        {/* Datos de Apoyo y Ubicación */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              Apoyo Social
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                100% Subsidio / Gratuito
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              Sede
            </span>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center text-[10px] font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-full px-2.5 py-1 shadow-2xs">
                <Navigation
                  className="w-3 h-3 mr-1 text-rose-600 dark:text-rose-400"
                  strokeWidth={2}
                />
                <span className="truncate max-w-[110px]">
                  {foundation.addressCity || "Sinaloa"}
                </span>
                {foundation.distanceKm !== undefined && (
                  <span className="ml-1 text-gray-400 font-mono">
                    • {foundation.distanceKm.toFixed(1)} km
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Botón de Acción Principal */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/foundation/${foundation.id}`);
          }}
          className="w-full rounded-xl h-11 text-xs font-bold transition-all text-white shadow-xs hover:shadow-md hover:opacity-95 cursor-pointer border-0 flex justify-center items-center gap-2"
          style={{ backgroundColor: primaryColor }}
        >
          <span>Ver Programas & Solicitar Apoyo</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

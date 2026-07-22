"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  PlayCircle,
  Star,
  Navigation,
  ChevronRight,
  User,
  Image as ImageIcon,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DiscoverProvider } from "@/types/discover";
import { ProviderScoreBadge } from "@/components/provider/ProviderScoreBadge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { ProviderScoreResponse } from "@/types/providerScore";

interface ProviderCardProps {
  provider: DiscoverProvider & { distanceKm?: number };
  isSelected?: boolean;
  isFavorited?: boolean;
  scoreData?: ProviderScoreResponse;
  canUseFavorites?: boolean;
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

  // Gallery Array Fallback
  const images =
    provider.galleryUrls && provider.galleryUrls.length > 0
      ? provider.galleryUrls
      : [provider.imageUrl];

  useEffect(() => {
    if ((isHovered || isSelected) && videoRef.current) {
      videoRef.current.play().catch(() => console.log("Autoplay bloqueado"));
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={cn(
        "relative w-72 shrink-0 md:w-full self-start bg-white dark:bg-[#111] transition-all cursor-pointer flex flex-col group rounded-2xl",
        isSelected
          ? "border-2 border-teal-500 shadow-xl z-10"
          : "border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-gray-200 dark:hover:border-gray-700",
      )}
    >
      {provider.isPromoted && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md z-30 flex items-center gap-1.5">
          <Award className="w-3 h-3" strokeWidth={2} /> RECOMENDADO
        </div>
      )}

      {/* ÁREA MULTIMEDIA */}
      <div className="h-48 md:h-56 w-full relative overflow-hidden bg-gray-50 dark:bg-black rounded-t-2xl border-b border-gray-100 dark:border-gray-800">
        {/* Indicador Play (Solo si tiene video y no está reproduciendo) */}
        {provider.previewVideoUrl && !isHovered && !isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 pointer-events-none">
            <PlayCircle
              className="w-10 h-10 text-white opacity-80"
              strokeWidth={1}
            />
          </div>
        )}

        {/* Galería (Múltiples o Singular) */}
        {!showVideo && hasValidImage ? (
          <img
            src={images[currentImageIndex]}
            alt={provider.name}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          !showVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-[#0a0a0a]">
              <div className="bg-white/50 dark:bg-black/50 p-4 rounded-full backdrop-blur-sm">
                <User
                  className="w-8 h-8 text-gray-300 dark:text-gray-600"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          )
        )}

        {/* Controles del Carrusel */}
        {!showVideo && images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white text-black rounded-full shadow-md z-30 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white text-black rounded-full shadow-md z-30 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Paginadores del Carrusel */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-30">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1 transition-all rounded-full border border-black/20",
                    idx === currentImageIndex
                      ? "w-3 bg-white"
                      : "w-1 bg-white/50",
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Video Player */}
        {provider.previewVideoUrl && (
          <video
            ref={videoRef}
            src={provider.previewVideoUrl}
            muted
            loop
            playsInline
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
              showVideo ? "opacity-100" : "opacity-0",
            )}
          />
        )}

        {/* Badges Flotantes */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          <ProviderScoreBadge scoreData={scoreData} />
          {(provider.discountPercentage ?? 0) > 0 && (
            <span className="bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-sm backdrop-blur-md">
              -{provider.discountPercentage}% OFF
            </span>
          )}
          {provider.isPremium && (
            <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-sm backdrop-blur-md flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> TOP
            </span>
          )}
        </div>

        {/* Favorito Flotante */}
        <div
          className="absolute top-3 right-3 z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <FavoriteButton
            entityType="PROVIDER"
            entityId={provider.id}
            initialIsFavorite={isFavorited}
            brandColor={provider.color}
            onAuthRequired={!canUseFavorites ? onAuthRequired : undefined}
          />
        </div>

        {/* Badge Flotante Rating */}
        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl px-2.5 py-1 flex items-center gap-1.5 z-20 shadow-sm border border-black/5 dark:border-white/10">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
          <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 leading-none mt-0.5">
            {provider.rating > 0 ? provider.rating.toFixed(1) : "Nuevo"}
          </span>
          {provider.reviews > 0 && (
            <span className="text-[10px] text-gray-500 ml-0.5">
              ({provider.reviews})
            </span>
          )}
        </div>
      </div>

      {/* ÁREA DE INFORMACIÓN */}
      <div className="p-5 flex flex-col bg-transparent rounded-b-2xl">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex flex-col min-w-0">
            <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
              {provider.name}
            </h3>
            <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400 mt-1 capitalize">
              {(provider.category || "Especialista").toLowerCase()}
            </span>
          </div>

          {hasValidLogo ? (
            <img
              src={provider.logoUrl}
              alt="Logo"
              onError={() => setLogoError(true)}
              className="w-12 h-12 rounded-full border border-gray-100 dark:border-gray-800 bg-white dark:bg-black flex-shrink-0 object-cover shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-full border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center flex-shrink-0 shadow-sm">
              <User className="w-5 h-5 text-gray-400" strokeWidth={2} />
            </div>
          )}
        </div>

        <div className="w-full h-px bg-gray-100 dark:bg-gray-800/50 my-4" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-gray-400 mb-0.5">
              Consulta desde
            </span>
            <div className="flex items-baseline gap-2">
              {provider.basePrice && provider.basePrice > 0 ? (
                <>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    ${provider.basePrice}
                  </span>
                  {provider.compareAtPrice &&
                    provider.compareAtPrice > provider.basePrice && (
                      <span className="text-[10px] text-gray-400 line-through">
                        ${provider.compareAtPrice}
                      </span>
                    )}
                </>
              ) : (
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                  Por cotizar
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-medium text-gray-400 mb-0.5">
              Ubicación
            </span>
            <span className="flex items-center text-[11px] font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-full px-2.5 py-1">
              <Navigation
                className="w-3 h-3 mr-1 text-teal-500"
                strokeWidth={2}
              />
              {provider.distanceKm
                ? `a ${provider.distanceKm.toFixed(1)} km`
                : "No especificada"}
            </span>
          </div>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/store/${provider.slug}`);
          }}
          className="w-full rounded-xl h-11 text-xs font-semibold flex justify-center items-center gap-2 transition-all text-white shadow-md hover:shadow-lg hover:opacity-90"
          style={{ backgroundColor: provider.color || "#0d9488" }}
        >
          Ver Perfil
        </Button>
      </div>
    </div>
  );
};

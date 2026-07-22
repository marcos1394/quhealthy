"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Award, PlayCircle, Star, Navigation, ChevronRight, User, Image as ImageIcon, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DiscoverProvider } from '@/types/discover';
import { ProviderScoreBadge } from '@/components/provider/ProviderScoreBadge';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { ProviderScoreResponse } from '@/types/providerScore';

interface ProviderCardProps {
  provider: DiscoverProvider & { distanceKm?: number };
  isSelected?: boolean;
  isFavorited: boolean;
  scoreData?: ProviderScoreResponse;
  canUseFavorites: boolean;
  onClick?: () => void;
  onHover?: () => void;
  onLeave?: () => void;
  onAuthRequired: () => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  isSelected = false,
  isFavorited,
  scoreData,
  canUseFavorites,
  onClick,
  onHover,
  onLeave,
  onAuthRequired,
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Gallery Array Fallback
  const images = provider.galleryUrls && provider.galleryUrls.length > 0 
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
        "relative w-72 shrink-0 md:w-full self-start bg-white dark:bg-[#0a0a0a] transition-all cursor-pointer flex flex-col group border",
        isSelected 
          ? "border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] z-10" 
          : "border-gray-300 dark:border-gray-800 hover:border-black dark:hover:border-white"
      )}
    >
      {provider.isPromoted && (
        <div className="bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-2">
          <Award className="w-3 h-3" strokeWidth={2} /> RECOMENDADO POR LA RED
        </div>
      )}

      {/* ÁREA MULTIMEDIA */}
      <div className="h-48 md:h-56 w-full relative overflow-hidden bg-gray-100 dark:bg-[#111] border-b border-gray-200 dark:border-gray-800">
        
        {/* Indicador Play (Solo si tiene video y no está reproduciendo) */}
        {provider.previewVideoUrl && !isHovered && !isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 pointer-events-none">
            <PlayCircle className="w-10 h-10 text-white opacity-80" strokeWidth={1} />
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
        ) : !showVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-3 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)]">
              <ImageIcon className="w-6 h-6 text-gray-300 dark:text-gray-700" strokeWidth={1.5} />
            </div>
          </div>
        )}

        {/* Controles del Carrusel */}
        {!showVideo && images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white text-black border border-black shadow-[2px_2px_0_0_#000] z-30 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white text-black border border-black shadow-[2px_2px_0_0_#000] z-30 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    idx === currentImageIndex ? "w-3 bg-white" : "w-1 bg-white/50"
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
              showVideo ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        {/* Badges Flotantes */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          <ProviderScoreBadge scoreData={scoreData} />
          {(provider.discountPercentage ?? 0) > 0 && (
            <span className="border border-black bg-black text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#fff]">
              -{provider.discountPercentage}%
            </span>
          )}
          {provider.isPremium && (
            <span className="border border-yellow-500 bg-yellow-400 text-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#000]">
              TOP
            </span>
          )}
        </div>
        
        {/* Favorito Flotante */}
        <div className="absolute top-3 right-3 z-30" onClick={(e) => e.stopPropagation()}>
          <FavoriteButton 
            entityType="PROVIDER" 
            entityId={provider.id} 
            initialIsFavorite={isFavorited}
            brandColor={provider.color}
            onAuthRequired={!canUseFavorites ? onAuthRequired : undefined}
          />
        </div>

        {/* Badge Flotante Rating */}
        <div className="absolute bottom-3 right-3 bg-white dark:bg-black border border-black dark:border-white px-2 py-1 flex items-center gap-1.5 z-20 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]">
          <Star className="w-3 h-3 text-black dark:text-white fill-current" strokeWidth={1} />
          <span className="text-[10px] font-bold text-black dark:text-white leading-none mt-0.5">
            {provider.rating > 0 ? provider.rating.toFixed(1) : 'Nuevo'}
          </span>
          {provider.reviews > 0 && (
            <span className="text-[9px] text-gray-500 ml-1">({provider.reviews})</span>
          )}
        </div>
      </div>

      {/* ÁREA DE INFORMACIÓN */}
      <div className="p-5 flex flex-col bg-white dark:bg-[#0a0a0a]">
        
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex flex-col min-w-0">
            <h3 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white leading-tight line-clamp-2">
              {provider.name}
            </h3>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">
              {provider.category || 'ESPECIALISTA'}
            </span>
          </div>
          
          {hasValidLogo ? (
            <img 
              src={provider.logoUrl} 
              alt="Logo" 
              onError={() => setLogoError(true)}
              className="w-12 h-12 border border-black dark:border-gray-700 bg-white dark:bg-black flex-shrink-0 object-cover shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,1)]" 
            />
          ) : (
            <div className="w-12 h-12 border border-black dark:border-gray-700 bg-gray-50 dark:bg-[#111] flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,1)]">
              <User className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-4" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">TARIFA BASE</span>
            <div className="flex items-baseline gap-2">
              {(provider.basePrice && provider.basePrice > 0) ? (
                <>
                  <span className="text-base font-bold text-black dark:text-white tracking-tight leading-none">
                    ${provider.basePrice}
                  </span>
                  {provider.compareAtPrice && provider.compareAtPrice > provider.basePrice && (
                    <span className="text-[10px] text-gray-400 line-through">
                      ${provider.compareAtPrice}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[10px] font-bold text-black dark:text-white tracking-widest uppercase bg-gray-100 dark:bg-gray-900 px-2 py-1">
                  Previa Valoración
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">DISTANCIA</span>
            <span className="flex items-center text-[11px] font-bold uppercase tracking-widest text-black dark:text-white bg-gray-100 dark:bg-gray-900 px-2 py-1">
              <Navigation className="w-3 h-3 mr-1.5" strokeWidth={2} />
              {provider.distanceKm ? `${provider.distanceKm.toFixed(1)} KM` : '--'}
            </span>
          </div>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/store/${provider.slug}`);
          }}
          className="w-full rounded-none h-12 text-[10px] font-bold uppercase tracking-widest flex justify-between px-5 transition-all border border-black text-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] dark:hover:shadow-[4px_4px_0_0_#fff]"
          style={{ backgroundColor: provider.color || '#000', borderColor: provider.color || '#000' }}
        >
          Acceder a Expediente 
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
};
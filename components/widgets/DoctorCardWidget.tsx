import React, { useState, useRef, useEffect } from 'react';
import { DoctorCardWidget as DoctorCardWidgetType } from '@quhealthy/health-os-contract';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import {
  Award,
  PlayCircle,
  Star,
  User,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';

interface Props {
  widget: DoctorCardWidgetType;
  onAction?: (action: any) => void;
  isSelected?: boolean;
}

export const DoctorCardWidget: React.FC<Props> = ({ widget, onAction, isSelected = false }) => {
  const { data, actions } = widget;
  
  const brandColor = data.primaryColor || '#10b981'; // Default to quhealthy-green
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Gallery Array Fallback
  const images = data.galleryUrls && data.galleryUrls.length > 0 
    ? data.galleryUrls 
    : (data.bannerUrl ? [data.bannerUrl] : (data.imageUrl ? [data.imageUrl] : []));

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
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const hasValidImage = images.length > 0 && images[currentImageIndex] && !imgError;
  const hasValidLogo = data.imageUrl && !logoError;
  const showVideo = data.previewVideoUrl && (isHovered || isSelected);

  // Parse actions
  const primaryAction = actions?.find(a => a.type === 'reserve');
  const secondaryAction = actions?.find(a => a.type === 'open');

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative w-full min-w-0 self-start bg-white dark:bg-[#111] transition-all flex flex-col group rounded-2xl h-full overflow-hidden",
        isSelected
          ? "border-2 shadow-xl z-10"
          : "border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-gray-200 dark:hover:border-gray-700"
      )}
      style={isSelected ? { borderColor: brandColor } : {}}
    >
      {data.isPromoted && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md z-30 flex items-center gap-1.5" style={{ backgroundColor: brandColor }}>
          <Award className="w-3 h-3" strokeWidth={2} /> RECOMENDADO
        </div>
      )}

      {/* MULTIMEDIA AREA */}
      <div className="h-48 md:h-56 w-full relative overflow-hidden bg-gray-50 dark:bg-black rounded-t-2xl border-b border-gray-100 dark:border-gray-800 shrink-0">
        {data.previewVideoUrl && !isHovered && !isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 pointer-events-none">
            <PlayCircle
              className="w-10 h-10 text-white opacity-80"
              strokeWidth={1}
            />
          </div>
        )}

        {!showVideo && hasValidImage ? (
          <img
            src={images[currentImageIndex]}
            alt={data.name}
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

        {!showVideo && images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Imagen anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white text-black rounded-full shadow-md z-30 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Siguiente imagen"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white text-black rounded-full shadow-md z-30 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-30">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  aria-label={`Ir a la imagen ${idx + 1}`}
                  className={cn(
                    "h-1 transition-all rounded-full border border-black/20",
                    idx === currentImageIndex
                      ? "w-3 bg-white"
                      : "w-1 bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}

        {data.previewVideoUrl && (
          <video
            ref={videoRef}
            src={data.previewVideoUrl}
            muted
            loop
            playsInline
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
              showVideo ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {(data.discountPercentage ?? 0) > 0 && (
            <span className="bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-sm backdrop-blur-md">
              -{data.discountPercentage}% OFF
            </span>
          )}
        </div>

        <div
          className="absolute top-3 right-3 z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <FavoriteButton
            entityType="PROVIDER"
            entityId={data.id}
            initialIsFavorite={false} // Chat context
            brandColor={brandColor}
          />
        </div>

        {(data.rating || data.reviewCount) && (
          <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl px-2.5 py-1 flex items-center gap-1.5 z-20 shadow-sm border border-black/5 dark:border-white/10">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
            <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 leading-none mt-0.5">
              {data.rating ? data.rating.toFixed(1) : "Nuevo"}
            </span>
            {data.reviewCount && data.reviewCount > 0 && (
              <span className="text-[10px] text-gray-500 ml-0.5">
                ({data.reviewCount})
              </span>
            )}
          </div>
        )}
      </div>

      {/* INFO AREA */}
      <div className="p-4 sm:p-5 flex flex-col bg-transparent rounded-b-2xl flex-1 justify-between min-w-0">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2 min-w-0">
            <div className="flex flex-col min-w-0">
              <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 leading-snug line-clamp-2" title={data.name}>
                {data.name}
              </h3>
              <span className="text-[11px] font-medium mt-1 capitalize" style={{ color: brandColor }}>
                {(data.specialty || "Especialista").toLowerCase()}
              </span>
            </div>

            {hasValidLogo ? (
              <img
                src={data.imageUrl}
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

          {data.bio && (
            <div className="text-xs text-muted-foreground mt-2 line-clamp-2 italic border-l-2 pl-2" style={{ borderLeftColor: brandColor }}>
              "{data.bio}"
            </div>
          )}

          <div className="w-full h-px bg-gray-100 dark:bg-gray-800/50 my-4" />

          <div className="flex items-start justify-between gap-3 mb-4 min-w-0">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-medium text-gray-400 mb-0.5">
                Consulta desde
              </span>
              <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                {data.price && data.price > 0 ? (
                  <>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      ${data.price}
                    </span>
                    {data.compareAtPrice &&
                      data.compareAtPrice > data.price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ${data.compareAtPrice}
                        </span>
                      )}
                  </>
                ) : (
                  <span className="text-xs font-semibold" style={{ color: brandColor }}>
                    Por cotizar
                  </span>
                )}
              </div>
            </div>

            {data.nextAvailableSlot && (
              <div className="flex flex-col items-end shrink-0 max-w-[48%]">
                <span className="text-[10px] font-medium text-gray-400 mb-0.5">
                  Próxima cita
                </span>
                <span className="flex items-center text-[11px] font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-full px-2.5 py-1 max-w-full">
                  <Clock className="w-3 h-3 mr-1 shrink-0" strokeWidth={2} style={{ color: brandColor }} />
                  <span className="truncate">{data.nextAvailableSlot}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        {actions && actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAction) onAction(secondaryAction);
                }}
                className="flex-1 w-full min-w-0 rounded-xl h-11 text-xs font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Ver Perfil
              </Button>
            )}
            {primaryAction && (
              <Button
                variant="success"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAction) onAction(primaryAction);
                }}
                className="flex-1 w-full min-w-0 rounded-xl h-11 text-xs font-semibold text-white shadow-md hover:shadow-lg hover:opacity-90"
                style={{ backgroundColor: brandColor }}
              >
                Reservar
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

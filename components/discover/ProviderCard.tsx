// components/discover/ProviderCard.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, MapPin, Sparkles, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DiscoverProvider } from '@/types/discover';

interface ProviderCardProps {
  provider: DiscoverProvider;
  className?: string;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider, className }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Lógica para reproducir/pausar el video dinámicamente
  useEffect(() => {
    if (isHovered && videoRef.current) {
      videoRef.current.play().catch(e => console.log("Autoplay bloqueado:", e));
    } else if (!isHovered && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reinicia el video al salir
    }
  }, [isHovered]);

  const handleClick = () => {
    router.push(`/store/${provider.slug}`);
  };

  return (
    <div 
      className={cn(
        "group relative flex flex-col w-[280px] sm:w-[320px] shrink-0 cursor-pointer overflow-hidden rounded-[2rem] bg-gray-900/50 border border-white/5 transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1",
        className ? className : " " 
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* --- GLOW DE FONDO (Usa el color del doctor) --- */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-xl pointer-events-none"
        style={{ backgroundColor: provider.color }}
      />

      {/* --- ÁREA MULTIMEDIA (Aspect Ratio 16:9 tipo Netflix) --- */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-950 rounded-t-[2rem]">
        
        {/* 1. Imagen estática (Siempre visible inicialmente) */}
        <img 
          src={provider.imageUrl} 
          alt={provider.name} 
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105",
            isHovered && provider.previewVideoUrl ? "opacity-0" : "opacity-100"
          )}
        />

        {/* 2. Video reproductor (Solo se muestra en Hover) */}
        {provider.previewVideoUrl && (
          <video
            ref={videoRef}
            src={provider.previewVideoUrl}
            muted
            loop
            playsInline
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        {/* Gradiente para que el texto resalte */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent opacity-80" />

        {/* Badges Flotantes */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {provider.isPremium && (
            <Badge className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold tracking-wider text-[10px] uppercase shadow-xl">
              <Sparkles className="w-3 h-3 mr-1 text-yellow-400" /> Premium
            </Badge>
          )}
        </div>

        {/* Indicador de Video (Muestra un pequeño icono si tiene video pero no está en hover) */}
        {provider.previewVideoUrl && !isHovered && (
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md rounded-full p-1.5 border border-white/10">
            <PlayCircle className="w-4 h-4 text-white/70" />
          </div>
        )}

        {/* Logo del Proveedor (Avatar superpuesto) */}
        {provider.logoUrl && (
          <div className="absolute -bottom-5 right-4 w-12 h-12 rounded-xl border-2 border-gray-950 overflow-hidden shadow-lg z-10 bg-gray-800">
            <img src={provider.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* --- ÁREA DE INFORMACIÓN --- */}
      <div className="p-5 flex-1 flex flex-col z-10 relative bg-[#09090b]/80 backdrop-blur-xl">
        
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="border-white/10 text-zinc-400 text-[10px] uppercase font-semibold">
            {provider.category}
          </Badge>
          <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-white">{provider.rating || '4.9'}</span>
            <span className="text-[10px] text-zinc-500">({provider.reviews || 'Nuevo'})</span>
          </div>
        </div>

        <h3 className="font-bold text-lg text-white leading-tight line-clamp-1 group-hover:text-purple-400 transition-colors pr-8">
          {provider.name}
        </h3>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="flex items-center text-xs text-zinc-500 font-medium">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            {provider.distanceKm ? `${provider.distanceKm.toFixed(1)} km cerca` : 'Calculando...'}
          </span>
          <span 
            className="text-xs font-bold transition-all"
            style={{ color: provider.color }}
          >
            Ver perfil &rarr;
          </span>
        </div>
      </div>

    </div>
  );
};
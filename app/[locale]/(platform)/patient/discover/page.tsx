"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import {
  Loader2, Search, SlidersHorizontal, Star,
  ChevronRight, Sparkles, Navigation, PlayCircle, MapPin
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { useDiscover } from '@/hooks/useDiscover';
import { useGeolocation } from '@/hooks/useGeolocation';
import { DiscoverProvider } from '@/types/discover';

const libraries: ("places" | "geometry")[] = ["places"];
const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 25.7904, lng: -108.9858 };

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
];

const mapOptions: google.maps.MapOptions = {
  styles: darkMapStyle,
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: 'greedy',
  clickableIcons: false,
};

// Provider Card
const MapProviderCard = ({
  provider,
  isSelected,
  onClick,
  onHover,
  onLeave
}: {
  provider: DiscoverProvider & { distanceKm?: number },
  isSelected: boolean,
  onClick: () => void,
  onHover: () => void,
  onLeave: () => void
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if ((isHovered || isSelected) && videoRef.current) {
      videoRef.current.play().catch(() => console.log("Autoplay blocked"));
    } else if (!isHovered && !isSelected && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, isSelected]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onMouseEnter={() => { setIsHovered(true); onHover(); }}
      onMouseLeave={() => { setIsHovered(false); onLeave(); }}
      onClick={onClick}
      className={cn(
        "relative flex-shrink-0 w-[85vw] md:w-full snap-center rounded-[2rem] p-1 transition-all duration-300 cursor-pointer overflow-hidden group",
        isSelected ? "shadow-2xl" : "hover:shadow-xl"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500 blur-md pointer-events-none",
          isSelected ? "opacity-50" : "opacity-0 group-hover:opacity-30"
        )}
        style={{ backgroundColor: provider.color }}
      />

      <div className={cn(
        "relative h-full bg-slate-950/80 backdrop-blur-2xl rounded-[1.8rem] border flex flex-col overflow-hidden transition-colors",
        isSelected ? "border-white/20" : "border-slate-700/30 hover:border-slate-600/50"
      )}>

        {/* Media */}
        <div className="h-32 md:h-40 w-full relative overflow-hidden bg-slate-950">
          <img
            src={provider.imageUrl || '/placeholder-banner.jpg'}
            alt={provider.name}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105",
              (isHovered || isSelected) && provider.previewVideoUrl ? "opacity-0" : "opacity-80"
            )}
          />

          {provider.previewVideoUrl && (
            <video
              ref={videoRef}
              src={provider.previewVideoUrl}
              muted
              loop
              playsInline
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
                isHovered || isSelected ? "opacity-100" : "opacity-0"
              )}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

          {provider.previewVideoUrl && !isHovered && !isSelected && (
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md rounded-full p-1.5 border border-white/10">
              <PlayCircle className="w-4 h-4 text-white/80" />
            </div>
          )}

          {provider.isPremium && (
            <Badge className="absolute top-3 left-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold tracking-wider text-[10px] uppercase shadow-xl">
              <Sparkles className="w-3 h-3 mr-1 text-amber-400" /> Premium
            </Badge>
          )}

          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-white">{provider.rating || '4.9'}</span>
            <span className="text-[10px] text-slate-400">({provider.reviews || '0'})</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-lg text-white leading-tight line-clamp-1">{provider.name}</h3>
            {provider.logoUrl && (
              <img src={provider.logoUrl} alt="Logo" className="w-8 h-8 rounded-full border border-white/10 bg-slate-900 flex-shrink-0 object-cover" />
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
            <Badge variant="outline" className="border-slate-700 text-slate-300 font-medium truncate max-w-[120px]">
              {provider.category || 'Especialista'}
            </Badge>
            <span className="flex items-center text-medical-400 font-medium">
              <Navigation className="w-3 h-3 mr-1" />
              {provider.distanceKm ? `${provider.distanceKm.toFixed(1)} km` : '...'}
            </span>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Disponible hoy</span>
            <Button
              size="sm"
              className={cn(
                "rounded-xl font-bold transition-all h-8 px-4",
                isSelected ? "text-white shadow-lg" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              )}
              style={isSelected ? { backgroundColor: provider.color, boxShadow: `0 4px 20px -5px ${provider.color}` } : {}}
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/provider/store/${provider.slug}`, '_blank');
              }}
            >
              Ver Tienda <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Component
const DiscoverMapContent = () => {
  const t = useTranslations('PatientDiscover');
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const { providers, isLoading: isFetchingProviders } = useDiscover();
  const { coordinates, calculateDistance } = useGeolocation();

  const enrichedProviders = useMemo(() => {
    if (!providers) return [];

    return providers.map(p => {
      let distance = undefined;
      if (coordinates && p.lat && p.lng) {
        distance = calculateDistance(coordinates.lat, coordinates.lng, p.lat, p.lng);
      }
      return { ...p, distanceKm: distance };
    })
      .sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999))
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [providers, coordinates, calculateDistance, searchQuery]);

  const mapCenter = useMemo(() => {
    if (coordinates) return { lat: coordinates.lat, lng: coordinates.lng };
    return defaultCenter;
  }, [coordinates]);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const handleSelectProvider = (provider: typeof enrichedProviders[0]) => {
    setSelectedId(provider.id);
    if (map && provider.lat && provider.lng) {
      map.panTo({ lat: provider.lat, lng: provider.lng });
      map.setZoom(15);
    }
  };

  if (isFetchingProviders) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-medical-500 animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-slate-950 overflow-hidden selection:bg-medical-500/30 font-sans">

      <div className="absolute inset-0 z-0">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={coordinates ? 13 : 11}
          center={mapCenter}
          onLoad={onMapLoad}
          onClick={() => setSelectedId(null)}
          options={mapOptions}
        >
          {coordinates && (
            <MarkerF
              position={{ lat: coordinates.lat, lng: coordinates.lng }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#3b82f6',
                fillOpacity: 1,
                strokeWeight: 4,
                strokeColor: '#ffffff',
                scale: 8,
              }}
            />
          )}

          {enrichedProviders.map((provider) => {
            const isSelected = selectedId === provider.id;
            const isHovered = hoveredId === provider.id;

            if (!provider.lat || !provider.lng) return null;

            return (
              <MarkerF
                key={`marker-${provider.id}`}
                position={{ lat: provider.lat, lng: provider.lng }}
                onClick={() => handleSelectProvider(provider)}
                onMouseOver={() => setHoveredId(provider.id)}
                onMouseOut={() => setHoveredId(null)}
                icon={{
                  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                  fillColor: isSelected || isHovered ? provider.color : '#475569',
                  fillOpacity: 1,
                  strokeWeight: isSelected ? 2 : 1,
                  strokeColor: isSelected ? '#ffffff' : '#1e293b',
                  scale: isSelected ? 1.8 : 1.5,
                  anchor: new google.maps.Point(12, 24),
                }}
                zIndex={isSelected ? 10 : 1}
              />
            );
          })}
        </GoogleMap>
      </div>

      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-950/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/90 to-transparent z-10 pointer-events-none md:hidden" />

      {/* Search Bar */}
      <div className="absolute top-6 left-4 right-4 md:left-8 md:w-[420px] z-20">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-medical-500 to-medical-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-slate-950/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl px-4 py-3 shadow-2xl">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <Input
                placeholder={t('search_placeholder')}
                className="bg-transparent border-none p-0 h-auto text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="ghost" size="default" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 ml-2 rounded-xl">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {!coordinates && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400/90 text-xs font-medium backdrop-blur-md">
            <MapPin className="w-4 h-4" /> Activa tu ubicación para ver resultados exactos
          </div>
        )}
      </div>

      {/* Provider Cards */}
      <div className="absolute bottom-6 left-0 w-full md:top-36 md:bottom-8 md:left-8 md:w-[420px] z-20 pointer-events-none">

        {enrichedProviders.length === 0 ? (
          <div className="w-[90%] md:w-full mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 text-center pointer-events-auto">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg">{t('no_results')}</h3>
            <p className="text-slate-400 text-sm mt-2">{t('no_results_desc')}</p>
          </div>
        ) : (
          <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto w-full h-full gap-4 px-4 md:px-0 custom-scrollbar pointer-events-auto snap-x snap-mandatory pb-4 md:pb-0">
            <AnimatePresence>
              {enrichedProviders.map((provider) => (
                <MapProviderCard
                  key={`card-${provider.id}`}
                  provider={provider}
                  isSelected={selectedId === provider.id}
                  onClick={() => handleSelectProvider(provider)}
                  onHover={() => setHoveredId(provider.id)}
                  onLeave={() => setHoveredId(null)}
                />
              ))}
            </AnimatePresence>
            <div className="w-4 md:hidden flex-shrink-0" />
          </div>
        )}
      </div>

    </div>
  );
};

// Wrapper
export default function DiscoverPageWrapper() {
  const t = useTranslations('SettingsSubscription.patient_discover');
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  if (loadError) return <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-rose-400 p-4 text-center">Error connecting to Google Maps.</div>;

  if (!isLoaded) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-medical-500 animate-spin" />
        <p className="text-slate-500 text-sm font-medium animate-pulse">{t('loading')}</p>
      </div>
    </div>
  );

  return <DiscoverMapContent />;
}
"use client"
/* eslint-disable react-doctor/click-events-have-key-events */;
/* eslint-disable react-doctor/js-combine-iterations */

import React, { useState, useCallback, useMemo, useRef, useEffect, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { useTheme } from 'next-themes';
import {
  Search, SlidersHorizontal, Star,
  ChevronRight, PlayCircle, MapPin, Award,
  Navigation, Heart
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useDiscover } from '@/hooks/useDiscover';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useMyFavorites } from '@/hooks/useMyFavorites';
import { DiscoverProvider } from '@/types/discover';
import { useRouter, useSearchParams } from 'next/navigation';

import { useProviderScore } from '@/hooks/useProviderScore';
import { ProviderScoreResponse } from '@/types/providerScore';
import { ProviderScoreBadge } from '@/components/provider/ProviderScoreBadge';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { useSessionStore } from '@/stores/SessionStore';
import { AuthGateModal } from '@/components/shared/AuthGateModal';

const libraries: ("places" | "geometry")[] = ["places"];
const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 25.7904, lng: -108.9858 };

// ☀️ ESTILO MODO CLARO (Simplificado y Técnico)
const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#000000" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#000000" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#cccccc" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
];

// 🌙 ESTILO MODO OSCURO (Terminal)
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#111111" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#222222" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050505" }] },
];

// ── Tarjeta de Proveedor Arquitectónica (Versión Pública) ──
const MapProviderCard = ({
  provider,
  isSelected,
  isFavorited,
  scoreData,
  canUseFavorites,
  onClick,
  onHover,
  onLeave,
  onAuthRequired,
}: {
  provider: DiscoverProvider & { distanceKm?: number },
  isSelected: boolean,
  isFavorited: boolean,
  scoreData?: ProviderScoreResponse,
  canUseFavorites: boolean,
  onClick: () => void,
  onHover: () => void,
  onLeave: () => void,
  onAuthRequired: () => void,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const t = useTranslations('PatientDiscover');

  useEffect(() => {
    if ((isHovered || isSelected) && videoRef.current) {
      videoRef.current.play().catch(() => console.log("Autoplay bloqueado"));
    } else if (!isHovered && !isSelected && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, isSelected]);

  return (
    <div
      onMouseEnter={() => { setIsHovered(true); onHover(); }}
      onMouseLeave={() => { setIsHovered(false); onLeave(); }}
      onClick={onClick}
      className={cn(
        "relative flex-shrink-0 w-[85vw] md:w-full snap-center bg-white dark:bg-[#0a0a0a] transition-all cursor-pointer flex flex-col group border",
        isSelected 
          ? "border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] z-10" 
          : "border-gray-300 dark:border-gray-800 hover:border-black dark:hover:border-white"
      )}
    >
      {/* 🚀 PATROCINADO HEADER (Opcional) */}
      {provider.isPromoted && (
        <div className="bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-2">
          <Award className="w-3 h-3" strokeWidth={2} /> RECOMENDADO POR LA RED
        </div>
      )}

      {/* 📸 ÁREA MEDIA (Video / Imagen) */}
      <div className="h-40 md:h-48 w-full relative overflow-hidden bg-gray-100 dark:bg-[#111] border-b border-gray-200 dark:border-gray-800">
        
        {/* Play Overlay (Solo si tiene video y no está activo) */}
        {provider.previewVideoUrl && !isHovered && !isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
            <PlayCircle className="w-10 h-10 text-white opacity-80" strokeWidth={1} />
          </div>
        )}

        <img
          src={provider.imageUrl || '/placeholder-banner.jpg'}
          alt={provider.name}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 grayscale group-hover:grayscale-0",
            (isHovered || isSelected) && provider.previewVideoUrl ? "opacity-0" : "opacity-100"
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
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
              isHovered || isSelected ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        {/* Badges Flotantes Strictos */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          <ProviderScoreBadge scoreData={scoreData} />
          {provider.discountPercentage && provider.discountPercentage > 0 && (
            <span className="border border-black bg-black text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#fff]">
              -{provider.discountPercentage}%
            </span>
          )}
        </div>
        
        {/* Favorito Component — con Auth Gate para visitantes */}
        <div className="absolute top-3 right-3 z-20">
          <FavoriteButton 
             entityType="PROVIDER" 
             entityId={provider.id} 
             initialIsFavorite={isFavorited}
             brandColor={provider.color}
             onAuthRequired={!canUseFavorites ? onAuthRequired : undefined}
          />
        </div>

        {/* Rating Block */}
        <div className="absolute bottom-3 left-3 bg-white dark:bg-black border border-black dark:border-white px-2 py-1 flex items-center gap-1.5 z-20">
          <Star className="w-3 h-3 text-black dark:text-white fill-current" strokeWidth={1} />
          <span className="text-[10px] font-bold text-black dark:text-white leading-none mt-0.5">{provider.rating || '4.9'}</span>
        </div>
      </div>

      {/* 📄 INFO BLOCK */}
      <div className="p-5 flex-1 flex flex-col bg-white dark:bg-[#0a0a0a]">
        
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex flex-col">
            <h3 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white leading-tight line-clamp-2">
              {provider.name}
            </h3>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">
              {provider.category || 'ESPECIALISTA'}
            </span>
          </div>
          {provider.logoUrl && (
            <img 
              src={provider.logoUrl} 
              alt="Logo" 
              className="w-10 h-10 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black flex-shrink-0 object-cover" 
            />
          )}
        </div>

        <div className="flex items-center justify-between mt-auto mb-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">TARIFA BASE</span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-black dark:text-white tracking-tight">
                ${provider.basePrice || 0}
              </span>
              {provider.compareAtPrice && provider.compareAtPrice > (provider.basePrice || 0) && (
                <span className="text-[10px] text-gray-400 line-through">
                  ${provider.compareAtPrice}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">DISTANCIA</span>
            <span className="flex items-center text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              <Navigation className="w-3 h-3 mr-1.5" strokeWidth={2} />
              {provider.distanceKm ? `${provider.distanceKm.toFixed(1)} KM` : '--'}
            </span>
          </div>
        </div>

        {/* CTA BUTTON */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/store/${provider.slug}`);
          }}
          className={cn(
            "w-full rounded-none h-12 text-[10px] font-bold uppercase tracking-widest flex justify-between px-5 transition-all border",
            isSelected 
              ? "text-white border-transparent" 
              : "bg-gray-100 dark:bg-[#111] text-black dark:text-white border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-black"
          )}
          style={isSelected ? { backgroundColor: provider.color } : {}}
        >
          {t('btn_view_store', { defaultValue: 'Acceder a Expediente' })} 
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
};

// ── MAIN MAP COMPONENT (Versión Pública) ──
const DiscoverMapContent = () => {
  const t = useTranslations('PatientDiscover');
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get('q') ?? searchParams.get('provider') ?? '';
  const [{ map, searchQuery, hasDiscountFilter, selectedId, hoveredId }, dispatch] = React.useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case 'SET_MAP': return { ...state, map: typeof action.payload === 'function' ? action.payload(state.map) : action.payload };
        case 'SET_SEARCHQUERY': return { ...state, searchQuery: typeof action.payload === 'function' ? action.payload(state.searchQuery) : action.payload };
        case 'SET_HASDISCOUNTFILTER': return { ...state, hasDiscountFilter: typeof action.payload === 'function' ? action.payload(state.hasDiscountFilter) : action.payload };
        case 'SET_SELECTEDID': return { ...state, selectedId: typeof action.payload === 'function' ? action.payload(state.selectedId) : action.payload };
        case 'SET_HOVEREDID': return { ...state, hoveredId: typeof action.payload === 'function' ? action.payload(state.hoveredId) : action.payload };
        default: return state;
      }
    },
    {
      map: null, searchQuery: initialSearchQuery, hasDiscountFilter: false, selectedId: null, hoveredId: null
    }
  );

  const setMap = (val: any) => dispatch({ type: 'SET_MAP', payload: val });
  const setSearchQuery = (val: any) => dispatch({ type: 'SET_SEARCHQUERY', payload: val });
  const setHasDiscountFilter = (val: any) => dispatch({ type: 'SET_HASDISCOUNTFILTER', payload: val });
  const setSelectedId = (val: any) => dispatch({ type: 'SET_SELECTEDID', payload: val });
  const setHoveredId = (val: any) => dispatch({ type: 'SET_HOVEREDID', payload: val });

  // 🔐 Auth Gate State
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateContext, setAuthGateContext] = useState<'favorite' | 'booking'>('favorite');
    const [locationDeclined, setLocationDeclined] = useState(false);
  const { isAuthenticated, _hasHydrated, isLoading: isSessionLoading, token } = useSessionStore();
  const canUseFavorites = _hasHydrated && !isSessionLoading && isAuthenticated && !!token;

  const { providers, isLoading: isFetchingProviders } = useDiscover();
  const { coordinates, calculateDistance, requestLocation } = useGeolocation();
  const { resolvedTheme } = useTheme();

  const { batchScores, fetchBatchScores } = useProviderScore();
  // useMyFavorites ya tiene guard interno: si no hay token, devuelve Set vacío
  const { favoriteIds } = useMyFavorites('PROVIDER');

  useEffect(() => {
    if (providers && providers.length > 0) {
      const providerIds = providers.map(p => p.id);
      fetchBatchScores(providerIds);
    }
  }, [providers, fetchBatchScores]);

  const dynamicMapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: 'greedy',
    clickableIcons: false,
    styles: resolvedTheme === 'dark' ? darkMapStyle : lightMapStyle,
  }), [resolvedTheme]);

  const enrichedProviders = useMemo(() => {
    if (!providers) return [];

    return providers.map(p => {
      let distance = undefined;
      if (coordinates && p.lat && p.lng) {
        distance = calculateDistance(coordinates.lat, coordinates.lng, p.lat, p.lng);
      }
      return { ...p, distanceKm: distance };
    })
      .sort((a, b) => {
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;
        return (a.distanceKm || 9999) - (b.distanceKm || 9999);
      })
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(p => !hasDiscountFilter || (p.discountPercentage && p.discountPercentage > 0));
  }, [providers, coordinates, calculateDistance, searchQuery, hasDiscountFilter]);

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
      map.setZoom(14);
    }
  };

  const handleAuthRequired = (context: 'favorite' | 'booking' = 'favorite') => {
    setAuthGateContext(context);
    setAuthGateOpen(true);
  };

  if (isFetchingProviders) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <QhSpinner size="lg" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
            CARTOGRAFIANDO LA RED MÉDICA...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full h-full bg-gray-100 dark:bg-[#111] overflow-hidden selection:bg-gray-200 dark:selection:bg-white/20 font-sans transition-colors">

        {/* 🗺️ CAPA BASE: MAPA */}
        <div className="absolute inset-0 z-0">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={coordinates ? 13 : 11}
            center={mapCenter}
            onLoad={onMapLoad}
            onClick={() => setSelectedId(null)}
            options={dynamicMapOptions}
          >
            {/* Marcador del Paciente */}
            {coordinates && (
              <MarkerF
                position={{ lat: coordinates.lat, lng: coordinates.lng }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: '#000000', 
                  fillOpacity: 1,
                  strokeWeight: 4,
                  strokeColor: '#ffffff',
                  scale: 6,
                }}
                zIndex={100}
              />
            )}

            {/* Marcadores de Proveedores */}
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
                    fillColor: isSelected || isHovered ? provider.color : (resolvedTheme === 'dark' ? '#333' : '#999'),
                    fillOpacity: 1,
                    strokeWeight: isSelected ? 2 : 1,
                    strokeColor: isSelected ? '#ffffff' : '#000000', 
                    scale: isSelected ? 1.8 : 1.3,
                    anchor: new google.maps.Point(12, 24),
                  }}
                  zIndex={isSelected ? 50 : 10}
                />
              );
            })}
          </GoogleMap>
        </div>

        {/* 🔍 CAPA FLOTANTE: BUSCADOR ARQUITECTÓNICO */}
        <div className="absolute top-6 left-4 right-4 md:left-8 md:w-[460px] z-20 flex flex-col gap-3">
          
          <div className="flex gap-0 shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.05)] border border-black dark:border-gray-800">
            <div className="flex-1 flex items-center bg-white dark:bg-[#0a0a0a] px-4 h-14">
              <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" strokeWidth={2} />
              <Input
                placeholder="ESPECIALIDAD, CLÍNICA O NOMBRE..."
                className="bg-transparent border-none p-0 h-full text-xs font-bold uppercase tracking-widest text-black dark:text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button 
              variant="ghost" 
              className="rounded-none bg-white dark:bg-[#0a0a0a] border-l border-gray-300 dark:border-gray-800 h-14 w-14 hover:bg-gray-100 dark:hover:bg-[#111] p-0 shrink-0"
            >
              <SlidersHorizontal className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
            </Button>

            <Button 
              className={cn(
                "rounded-none h-14 px-6 text-[10px] font-bold uppercase tracking-widest border-l border-gray-300 dark:border-gray-800 transition-colors shrink-0",
                hasDiscountFilter 
                  ? "bg-black text-white dark:bg-white dark:text-black" 
                  : "bg-white text-gray-600 dark:bg-[#0a0a0a] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]"
              )}
              onClick={() => setHasDiscountFilter(!hasDiscountFilter)}
            >
              Ofertas
            </Button>
          </div>

          {!coordinates && !locationDeclined && (
            <div className="flex flex-col gap-4 p-5 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="flex flex-col gap-2">
                  <h4 className="text-[11px] font-bold text-black dark:text-white uppercase tracking-widest leading-none">
                    ENCUENTRA OPCIONES CERCA DE TI
                  </h4>
                  <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-relaxed">
                    PERMÍTENOS CONOCER TU UBICACIÓN PARA MOSTRARTE LOS ESPECIALISTAS Y SERVICIOS DISPONIBLES EN TU ZONA.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-1">
                <Button 
                  onClick={() => requestLocation()} 
                  className="flex-1 bg-black text-white dark:bg-white dark:text-black rounded-none text-[9px] font-bold uppercase tracking-widest h-10 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  PERMITIR
                </Button>
                <Button 
                  onClick={() => setLocationDeclined(true)} 
                  variant="outline"
                  className="flex-1 rounded-none text-[9px] font-bold uppercase tracking-widest h-10 border-black dark:border-white bg-transparent hover:bg-gray-100 dark:hover:bg-[#111] text-black dark:text-white transition-colors"
                >
                  AHORA NO
                </Button>
              </div>
            </div>
          )}
          {/* 👆 FIN DEL NUEVO BLOQUE 👆 */}
        </div>

        {/* 📇 CAPA FLOTANTE: FICHAS DE PROVEEDOR */}
        <div className="absolute bottom-6 left-0 w-full md:top-28 md:bottom-6 md:left-8 md:w-[460px] z-20 pointer-events-none">

          {enrichedProviders.length === 0 ? (
            <div className="w-[90%] md:w-full mx-auto bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-10 text-center pointer-events-auto shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
              <Search className="w-8 h-8 text-black dark:text-white mx-auto mb-6" strokeWidth={1.5} />
              <h3 className="text-black dark:text-white font-bold text-sm uppercase tracking-widest mb-2">
                BÚSQUEDA SIN COINCIDENCIAS
              </h3>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest font-light">
                AMPLÍE LOS PARÁMETROS O ELIMINE FILTROS PARA VISUALIZAR RESULTADOS GLOBALES.
              </p>
            </div>
          ) : (
            <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto w-full h-full gap-6 px-6 md:px-0 custom-scrollbar pointer-events-auto snap-x snap-mandatory pb-6 md:pb-0">
              <AnimatePresence>
                {enrichedProviders.map((provider) => (
                  <MapProviderCard
                    key={`card-${provider.id}`}
                    provider={provider}
                    isSelected={selectedId === provider.id}
                    isFavorited={favoriteIds.has(provider.id)}
                    scoreData={batchScores[provider.id]}
                    canUseFavorites={canUseFavorites}
                    onClick={() => handleSelectProvider(provider)}
                    onHover={() => setHoveredId(provider.id)}
                    onLeave={() => setHoveredId(null)}
                    onAuthRequired={() => handleAuthRequired('favorite')}
                  />
                ))}
              </AnimatePresence>
              <div className="w-6 md:hidden flex-shrink-0" />
            </div>
          )}
        </div>

      </div>

      {/* 🔐 AUTH GATE MODAL */}
      <AuthGateModal
        isOpen={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        icon={<Heart className="w-6 h-6" strokeWidth={1.5} />}
        title={authGateContext === 'favorite' ? 'GUARDA TUS FAVORITOS' : 'AGENDA TU CITA'}
        description={
          authGateContext === 'favorite'
            ? 'Crea una cuenta para guardar tus doctores favoritos y acceder a ellos cuando quieras.'
            : 'Regístrate para agendar citas con los mejores especialistas de la red.'
        }
      />
    </>
  );
};

// ── WRAPPER DE INICIALIZACIÓN ──
export default function PublicDiscoverPage() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  if (loadError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white dark:bg-[#0a0a0a] text-red-500 font-bold uppercase tracking-widest text-xs p-6 text-center">
        FALLO DE INTEGRACIÓN: API CARTOGRÁFICA INACCESIBLE.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] transition-colors">
        <QhSpinner size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
          INICIALIZANDO MOTOR GEOGRÁFICO...
        </p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] transition-colors">
          <QhSpinner size="lg" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
            INICIALIZANDO MOTOR GEOGRÁFICO...
          </p>
        </div>
      }
    >
      <DiscoverMapContent />
    </Suspense>
  );
}

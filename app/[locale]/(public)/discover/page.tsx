"use client"
/* eslint-disable react-doctor/click-events-have-key-events */;
/* eslint-disable react-doctor/js-combine-iterations */

import React, { useState, useCallback, useMemo, useRef, useEffect, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useTheme } from 'next-themes';
import {
 Search, SlidersHorizontal, Star,
 ChevronRight, PlayCircle, MapPin, Award,
 Navigation, Heart,
 Loader2, Image as ImageIcon, User, LayoutGrid, Map as MapIcon
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import { useDiscover } from '@/hooks/useDiscover';
import { useDiscoverItems } from '@/hooks/useDiscoverItems';
import { DiscoverItemCard } from '@/components/discover/DiscoverItemCard';
import { FilterPanel } from '@/components/discover/FilterPanel';
import { SortDropdown } from '@/components/discover/SortDropdown';
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
 const [imgError, setImgError] = useState(false);
 const [logoError, setLogoError] = useState(false);
 
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

 const mediaOpacityClasses = cn(
 "absolute inset-0 w-full h-full transition-opacity duration-500",
 (isHovered || isSelected) && provider.previewVideoUrl ? "opacity-0" : "opacity-100"
 );

 // Verificamos si existe la URL y si no ha fallado su carga
 const hasValidImage = provider.imageUrl && !imgError;
 const hasValidLogo = provider.logoUrl && !logoError;

 return (
 <div
 onMouseEnter={() => { setIsHovered(true); onHover(); }}
 onMouseLeave={() => { setIsHovered(false); onLeave(); }}
 onClick={onClick}
 className={cn(
 "relative w-72 shrink-0 md:w-full self-start bg-white dark:bg-[#0a0a0a] transition-all cursor-pointer flex flex-col group border",
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

 {/* 📸 ÁREA MEDIA (Video / Imagen / Fallback) */}
 <div className="h-40 md:h-48 w-full relative overflow-hidden bg-gray-100 dark:bg-[#111] border-b border-gray-200 dark:border-gray-800">
 
 {/* Play Overlay (Solo si tiene video y no está activo) */}
 {provider.previewVideoUrl && !isHovered && !isSelected && (
 <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
 <PlayCircle className="w-10 h-10 text-white opacity-80" strokeWidth={1} />
 </div>
 )}

 {hasValidImage ? (
 <img
 src={provider.imageUrl}
 alt={provider.name}
 onError={() => setImgError(true)}
 className={cn(
 mediaOpacityClasses,
 "object-cover"
 )}
 />
 ) : (
 <div className={cn(
 mediaOpacityClasses,
 "flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]"
 )}>
 <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-3 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.1)]">
 <ImageIcon className="w-6 h-6 text-gray-300 dark:text-gray-700" strokeWidth={1.5} />
 </div>
 </div>
 )}

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
 
 {/* 👇 LÍNEA CORREGIDA 👇 */}
 {(provider.discountPercentage ?? 0) > 0 && (
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
 <div className="p-5 flex flex-col bg-white dark:bg-[#0a0a0a]">
 
 {/* Nombre + Logo */}
 <div className="flex items-start justify-between gap-4 mb-1">
 <div className="flex flex-col min-w-0">
 <h3 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white leading-tight line-clamp-2">
 {provider.name}
 </h3>
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">
 {provider.category || 'ESPECIALISTA'}
 </span>
 </div>
 
 {hasValidLogo ? (
 <img 
 src={provider.logoUrl} 
 alt="Logo" 
 onError={() => setLogoError(true)}
 className="w-10 h-10 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black flex-shrink-0 object-cover" 
 />
 ) : (
 <div className="w-10 h-10 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111] flex items-center justify-center flex-shrink-0">
 <User className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
 </div>
 )}
 </div>

 {/* Separador */}
 <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-3" />

 {/* Tarifa + Distancia en línea */}
 <div className="flex items-center justify-between mb-3">
 <div className="flex flex-col">
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">TARIFA BASE</span>
 <div className="flex items-baseline gap-2">
 {(provider.basePrice && provider.basePrice > 0) ? (
 <>
 <span className="text-sm font-bold text-black dark:text-white tracking-tight">
 ${provider.basePrice}
 </span>
 {provider.compareAtPrice && provider.compareAtPrice > provider.basePrice && (
 <span className="text-[10px] text-gray-400 line-through">
 ${provider.compareAtPrice}
 </span>
 )}
 </>
 ) : (
 <span className="text-[10px] font-bold text-black dark:text-white tracking-widest uppercase">
 Previa Valoración
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
 className="w-full rounded-none h-12 text-[10px] font-bold uppercase tracking-widest flex justify-between px-5 transition-all border-0 text-white hover:opacity-90"
 style={{ backgroundColor: provider.color || '#000' }}
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
 const [{ map, searchQuery, searchType, viewMode, hasDiscountFilter, topRatedFilter, nearMeFilter, premiumFilter, selectedId, hoveredId, isFiltersOpen, isMapImmersive }, dispatch] = React.useReducer(
 (state: any, action: any) => {
 switch (action.type) {
 case 'SET_MAP': return { ...state, map: typeof action.payload === 'function' ? action.payload(state.map) : action.payload };
 case 'SET_SEARCHQUERY': return { ...state, searchQuery: typeof action.payload === 'function' ? action.payload(state.searchQuery) : action.payload };
 case 'SET_SEARCHTYPE': return { ...state, searchType: typeof action.payload === 'function' ? action.payload(state.searchType) : action.payload };
 case 'SET_HASDISCOUNTFILTER': return { ...state, hasDiscountFilter: typeof action.payload === 'function' ? action.payload(state.hasDiscountFilter) : action.payload };
 case 'SET_TOPRATEDFILTER': return { ...state, topRatedFilter: typeof action.payload === 'function' ? action.payload(state.topRatedFilter) : action.payload };
 case 'SET_NEARMEFILTER': return { ...state, nearMeFilter: typeof action.payload === 'function' ? action.payload(state.nearMeFilter) : action.payload };
 case 'SET_PREMIUMFILTER': return { ...state, premiumFilter: typeof action.payload === 'function' ? action.payload(state.premiumFilter) : action.payload };
 case 'SET_SELECTEDID': return { ...state, selectedId: typeof action.payload === 'function' ? action.payload(state.selectedId) : action.payload };
 case 'SET_HOVEREDID': return { ...state, hoveredId: typeof action.payload === 'function' ? action.payload(state.hoveredId) : action.payload };
 case 'SET_VIEWMODE': return { ...state, viewMode: typeof action.payload === 'function' ? action.payload(state.viewMode) : action.payload };
 case 'SET_ISFILTERSOPEN': return { ...state, isFiltersOpen: typeof action.payload === 'function' ? action.payload(state.isFiltersOpen) : action.payload };
 case 'SET_ISMAPIMMERSIVE': return { ...state, isMapImmersive: typeof action.payload === 'function' ? action.payload(state.isMapImmersive) : action.payload };
 default: return state;
 }
 },
 {
 map: null, searchQuery: initialSearchQuery, searchType: searchParams.get('type') || 'STORE', viewMode: 'MAP', hasDiscountFilter: false, topRatedFilter: false, nearMeFilter: false, premiumFilter: false, selectedId: null, hoveredId: null, isFiltersOpen: true, isMapImmersive: false
 }
 );

 const router = useRouter();
 const searchParamsHook = useSearchParams();

 const setMap = (val: any) => dispatch({ type: 'SET_MAP', payload: val });
 const setSearchQuery = (val: any) => dispatch({ type: 'SET_SEARCHQUERY', payload: val });
 const setIsMapImmersive = (val: any) => dispatch({ type: 'SET_ISMAPIMMERSIVE', payload: val });
 const setSearchType = (val: any) => {
 dispatch({ type: 'SET_SEARCHTYPE', payload: val });
 const params = new URLSearchParams(searchParamsHook.toString());
 params.set('type', val);
 router.replace(`/discover?${params.toString()}`);
 };
 const setHasDiscountFilter = (val: any) => dispatch({ type: 'SET_HASDISCOUNTFILTER', payload: val });
 const setTopRatedFilter = (val: any) => dispatch({ type: 'SET_TOPRATEDFILTER', payload: val });
 const setNearMeFilter = (val: any) => dispatch({ type: 'SET_NEARMEFILTER', payload: val });
 const setPremiumFilter = (val: any) => dispatch({ type: 'SET_PREMIUMFILTER', payload: val });
 const setSelectedId = (val: any) => dispatch({ type: 'SET_SELECTEDID', payload: val });
 const setHoveredId = (val: any) => dispatch({ type: 'SET_HOVEREDID', payload: val });
 const setViewMode = (val: any) => dispatch({ type: 'SET_VIEWMODE', payload: val });
 const setIsFiltersOpen = (val: any) => dispatch({ type: 'SET_ISFILTERSOPEN', payload: val });

 const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearchQuery);

 useEffect(() => {
 const handler = setTimeout(() => {
 setDebouncedSearchQuery(searchQuery);
 }, 500);
 return () => clearTimeout(handler);
 }, [searchQuery]);

 // 🔐 Auth Gate State
 const [authGateOpen, setAuthGateOpen] = useState(false);
 const [authGateContext, setAuthGateContext] = useState<'favorite' | 'booking'>('favorite');
 const [locationDeclined, setLocationDeclined] = useState(false);
 const [showSuccess, setShowSuccess] = useState(false);
 const { isAuthenticated, _hasHydrated, isLoading: isSessionLoading, token } = useSessionStore();
 const canUseFavorites = _hasHydrated && !isSessionLoading && isAuthenticated && !!token;
 
// Hook de Geolocation (Extraemos error e isLoading)
 const { coordinates, calculateDistance, error: geoError, isLoading: isGeoLoading, requestLocation } = useGeolocation(); 

 const { 
 providers, 
 isLoading: isLoadingProviders, 
 isValidating, 
 size: providerSize, 
 setSize: setProviderSize, 
 isReachingEnd: isReachingEndProviders,
 isLoadingMore: isLoadingMoreProviders
 } = useDiscover(debouncedSearchQuery, searchType);
 
 const { 
 items, 
 isLoading: isLoadingItems, 
 isValidating: isValidatingItems,
 size: itemSize,
 setSize: setItemSize,
 isReachingEnd: isReachingEndItems,
 isLoadingMore: isLoadingMoreItems
 } = useDiscoverItems({
 q: debouncedSearchQuery,
 type: searchType,
 lat: coordinates?.lat,
 lng: coordinates?.lng,
 isGeoLoading: isGeoLoading,
 });
 
 const isCurrentlyLoading = searchType === 'STORE' ? isLoadingProviders : isLoadingItems;
 const isCurrentlyValidating = searchType === 'STORE' ? isValidating : isValidatingItems;
 const isReachingEnd = searchType === 'STORE' ? isReachingEndProviders : isReachingEndItems;
 const isLoadingMore = searchType === 'STORE' ? isLoadingMoreProviders : isLoadingMoreItems;
 
 const handleLoadMore = () => {
 if (searchType === 'STORE') {
 setProviderSize(providerSize + 1);
 } else {
 setItemSize(itemSize + 1);
 }
 }; 
 const { resolvedTheme } = useTheme();

// Efecto: Cuando conseguimos la ubicación, mostramos mensaje de éxito 2.5 seg y lo cerramos
 useEffect(() => {
 if (coordinates) {
 setShowSuccess(true);
 const timer = setTimeout(() => {
 setShowSuccess(false);
 }, 2500);
 return () => clearTimeout(timer);
 }
 }, [coordinates]);

 const { batchScores, fetchBatchScores } = useProviderScore();
 // Determinamos qué tipo de favoritos cargar (PROVIDER si es STORE, o el tipo actual)
 const currentEntityForFavs = searchType === 'STORE' ? 'PROVIDER' : (searchType as 'PACKAGE' | 'COURSE' | 'PRODUCT' | 'SERVICE');
 const { favoriteIds } = useMyFavorites(currentEntityForFavs);

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
 .filter(p => !hasDiscountFilter || (p.discountPercentage && p.discountPercentage > 0))
 .filter(p => !topRatedFilter || (p.rating && p.rating >= 4.8))
 .filter(p => !nearMeFilter || (p.distanceKm !== undefined && p.distanceKm <= 5))
 .filter(p => !premiumFilter || p.isPremium);
 }, [providers, coordinates, calculateDistance, hasDiscountFilter, topRatedFilter, nearMeFilter, premiumFilter]);

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

 const handleMapClick = () => {
 setSelectedId(null);
 if (viewMode === 'MAP') {
 setIsMapImmersive(true);
 }
 };

 const handleAuthRequired = (context: 'favorite' | 'booking' = 'favorite') => {
 setAuthGateContext(context);
 setAuthGateOpen(true);
 };

 return (
 <>
 <div className={cn("relative w-full h-full overflow-hidden selection:bg-gray-200 dark:selection:bg-white/20 font-sans transition-colors", viewMode === "GRID" ? "bg-white dark:bg-[#0a0a0a] overflow-y-auto" : "bg-gray-100 dark:bg-[#111]")}>

 {/* 🗺️ CAPA BASE: MAPA */}
 <div className={cn("absolute inset-0 z-0", viewMode === "GRID" && "hidden md:block md:opacity-0 pointer-events-none")}>
 <GoogleMap
 mapContainerStyle={mapContainerStyle}
 zoom={coordinates ? 13 : 11}
 center={mapCenter}
 onLoad={onMapLoad}
 onClick={handleMapClick}
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

 
 {/* Marcadores de Proveedores (STORE) o Items */}
 {searchType === 'STORE' ? enrichedProviders.map((provider) => {
 const isSelected = selectedId === provider.id;
 const isHovered = hoveredId === provider.id;

 if (!provider.lat || !provider.lng) return null;

 return (
 <MarkerF
 key={`marker-store-${provider.id}`}
 position={{ lat: provider.lat, lng: provider.lng }}
 onClick={(e) => {
 if (e.domEvent) { e.domEvent.stopPropagation(); }
 handleSelectProvider(provider);
 }}
 onMouseOver={() => setHoveredId(provider.id)}
 onMouseOut={() => setHoveredId(null)}
 icon={{
 path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
 fillColor: isSelected || isHovered ? provider.color : provider.color,
 fillOpacity: isSelected || isHovered ? 1 : 0.8,
 strokeWeight: isSelected ? 2 : 1,
 strokeColor: isSelected ? '#ffffff' : '#000000', 
 scale: isSelected ? 1.8 : 1.3,
 anchor: new google.maps.Point(12, 24),
 }}
 zIndex={isSelected ? 50 : 10}
 >
 {isSelected && (
 <InfoWindowF
 position={{ lat: provider.lat, lng: provider.lng }}
 onCloseClick={() => setSelectedId(null)}
 options={{ pixelOffset: new google.maps.Size(0, -45) }}
 >
 <div className="p-2 min-w-[200px] max-w-[250px] font-sans">
 <div className="flex gap-3 items-start">
 <img 
 src={provider.logoUrl || provider.imageUrl} 
 alt={provider.name} 
 className="w-10 h-10 object-cover border border-gray-200 rounded-sm"
 />
 <div className="flex-1 min-w-0">
 <h4 className="font-bold text-[11px] uppercase tracking-wider text-black line-clamp-2 leading-tight">
 {provider.name}
 </h4>
 <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">
 {provider.category || 'Clínica / Tienda'}
 </p>
 </div>
 </div>
 <Button 
 onClick={(e) => {
 e.stopPropagation();
 router.push(`/store/${provider.slug}`);
 }}
 className="w-full mt-3 h-8 text-[9px] font-bold uppercase tracking-widest rounded-none text-white transition-opacity hover:opacity-90"
 style={{ backgroundColor: provider.color || '#000' }}
 >
 Ver Expediente
 </Button>
 </div>
 </InfoWindowF>
 )}
 </MarkerF>
 );
 }) : items.map((item) => {
 const isSelected = selectedId === item.id;
 const isHovered = hoveredId === item.id;

 if (!item.providerLat || !item.providerLng) return null;

 return (
 <MarkerF
 key={`marker-item-${item.id}`}
 position={{ lat: item.providerLat, lng: item.providerLng }}
 onClick={(e) => {
 if (e.domEvent) { e.domEvent.stopPropagation(); }
 setSelectedId(item.id);
 if (map) {
 map.panTo({ lat: item.providerLat!, lng: item.providerLng! });
 map.setZoom(14);
 }
 }}
 onMouseOver={() => setHoveredId(item.id)}
 onMouseOut={() => setHoveredId(null)}
 icon={{
 path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
 fillColor: isSelected || isHovered ? item.providerColor : item.providerColor,
 fillOpacity: isSelected || isHovered ? 1 : 0.8,
 strokeWeight: isSelected ? 2 : 1,
 strokeColor: isSelected ? '#ffffff' : '#000000', 
 scale: isSelected ? 1.8 : 1.3,
 anchor: new google.maps.Point(12, 24),
 }}
 zIndex={isSelected ? 50 : 10}
 >
 {isSelected && (
 <InfoWindowF
 position={{ lat: item.providerLat, lng: item.providerLng }}
 onCloseClick={() => setSelectedId(null)}
 options={{ pixelOffset: new google.maps.Size(0, -45) }}
 >
 <div className="p-2 min-w-[200px] max-w-[250px] font-sans">
 <div className="flex gap-3 items-start">
 <img 
 src={item.imageUrl || item.providerLogoUrl} 
 alt={item.name} 
 className="w-10 h-10 object-cover border border-gray-200 rounded-sm"
 />
 <div className="flex-1 min-w-0">
 <h4 className="font-bold text-[11px] uppercase tracking-wider text-black line-clamp-2 leading-tight">
 {item.name}
 </h4>
 <p className="text-[10px] font-bold text-black mt-1">
 ${item.price}
 </p>
 </div>
 </div>
 <Button 
 onClick={(e) => {
 e.stopPropagation();
 router.push(`/market/item/${item.id}`);
 }}
 className="w-full mt-3 h-8 text-[9px] font-bold uppercase tracking-widest rounded-none text-white transition-opacity hover:opacity-90"
 style={{ backgroundColor: item.providerColor || '#000' }}
 >
 Ver Detalles
 </Button>
 </div>
 </InfoWindowF>
 )}
 </MarkerF>
 );
 })}
</GoogleMap>
 </div>

 {/* 🗺️ BOTÓN FLOTANTE PARA SALIR DEL MODO INMERSIVO */}
 <AnimatePresence>
 {isMapImmersive && viewMode === "MAP" && (
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 className="absolute top-6 left-1/2 -translate-x-1/2 z-30"
 >
 <Button
 onClick={() => setIsMapImmersive(false)}
 className="bg-black text-white dark:bg-white dark:text-black shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:translate-y-1 hover:shadow-none transition-all"
 >
 <LayoutGrid className="w-4 h-4 mr-2" strokeWidth={2} />
 MOSTRAR INTERFAZ
 </Button>
 </motion.div>
 )}
 </AnimatePresence>

 {/* 🔍 CAPA FLOTANTE: BUSCADOR ARQUITECTÓNICO */}
 <div className={cn("absolute top-6 left-4 right-4 md:left-8 md:right-8 z-20 flex flex-col gap-3 pointer-events-none transition-all duration-500", isMapImmersive ? "-translate-y-[150%] opacity-0" : "translate-y-0 opacity-100")}>
 
 <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
 <form 
 onSubmit={(e) => e.preventDefault()}
 className="pointer-events-auto w-full md:w-[460px] lg:w-[400px] xl:w-[460px] shrink-0 flex gap-0 shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.05)] border border-black dark:border-gray-800"
 >
 <div className="flex-1 flex items-center bg-white dark:bg-[#0a0a0a] px-4 h-14 relative">
 {isCurrentlyValidating ? (
 <Loader2 className="w-5 h-5 text-gray-400 mr-3 shrink-0 animate-spin" strokeWidth={2} />
 ) : (
 <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" strokeWidth={2} />
 )}
 <Input
 placeholder="ESPECIALIDAD, CLÍNICA O NOMBRE..."
 className="bg-transparent border-none p-0 h-full text-xs font-bold uppercase tracking-widest text-black dark:text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 
 <div className="hidden md:flex border-l border-gray-300 dark:border-gray-800 h-14 bg-white dark:bg-[#0a0a0a]">
 <Button
 type="button"
 variant="ghost"
 className={cn(
 "rounded-none h-full w-14 hover:bg-gray-100 dark:hover:bg-[#111] p-0 transition-colors",
 viewMode === 'MAP' ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-400"
 )}
 onClick={() => setViewMode('MAP')}
 >
 <MapIcon className="w-5 h-5" strokeWidth={1.5} />
 </Button>
 <Button
 type="button"
 variant="ghost"
 className={cn(
 "rounded-none h-full w-14 border-l border-gray-300 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-[#111] p-0 transition-colors",
 viewMode === 'GRID' ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-400"
 )}
 onClick={() => setViewMode('GRID')}
 >
 <LayoutGrid className="w-5 h-5" strokeWidth={1.5} />
 </Button>
 </div>

 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button 
 type="button"
 variant="ghost" 
 className={cn(
 "rounded-none border-l border-gray-300 dark:border-gray-800 h-14 w-14 hover:bg-gray-100 dark:hover:bg-[#111] p-0 shrink-0 transition-colors",
 searchType !== 'STORE' ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-[#0a0a0a]"
 )}
 >
 <SlidersHorizontal className={cn("w-5 h-5", searchType !== 'STORE' ? "text-white dark:text-black" : "text-black dark:text-white")} strokeWidth={1.5} />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-black border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
 <DropdownMenuItem 
 className={cn("cursor-pointer font-bold uppercase tracking-widest text-xs focus:bg-gray-100 dark:focus:bg-gray-900 rounded-none", searchType === 'STORE' && "bg-gray-100 dark:bg-gray-900")} 
 onClick={() => setSearchType('STORE')}>
 Tiendas / Clínicas
 </DropdownMenuItem>
 <DropdownMenuItem 
 className={cn("cursor-pointer font-bold uppercase tracking-widest text-xs focus:bg-gray-100 dark:focus:bg-gray-900 rounded-none", searchType === 'PRODUCT' && "bg-gray-100 dark:bg-gray-900")} 
 onClick={() => setSearchType('PRODUCT')}>
 Productos
 </DropdownMenuItem>
 <DropdownMenuItem 
 className={cn("cursor-pointer font-bold uppercase tracking-widest text-xs focus:bg-gray-100 dark:focus:bg-gray-900 rounded-none", searchType === 'COURSE' && "bg-gray-100 dark:bg-gray-900")} 
 onClick={() => setSearchType('COURSE')}>
 Cursos
 </DropdownMenuItem>
 <DropdownMenuItem 
 className={cn("cursor-pointer font-bold uppercase tracking-widest text-xs focus:bg-gray-100 dark:focus:bg-gray-900 rounded-none", searchType === 'PACKAGE' && "bg-gray-100 dark:bg-gray-900")} 
 onClick={() => setSearchType('PACKAGE')}>
 Paquetes
 </DropdownMenuItem>
 <DropdownMenuItem 
 className={cn("cursor-pointer font-bold uppercase tracking-widest text-xs focus:bg-gray-100 dark:focus:bg-gray-900 rounded-none", searchType === 'SERVICE' && "bg-gray-100 dark:bg-gray-900")} 
 onClick={() => setSearchType('SERVICE')}>
 Servicios
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>

 </form>

 {/* ⚡ FILTROS RÁPIDOS */}
 <div className="pointer-events-auto flex gap-2 overflow-x-auto md:flex-wrap no-scrollbar pb-1 pt-1 px-1 -mx-1 flex-1">
 <Button 
 type="button"
 size="sm"
 variant="outline"
 className={cn(
 "rounded-full h-8 px-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border shrink-0",
 hasDiscountFilter 
 ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" 
 : "bg-white text-gray-700 dark:bg-black dark:text-gray-300 border-gray-300 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900"
 )}
 onClick={() => setHasDiscountFilter(!hasDiscountFilter)}
 >
 🏷️ Ofertas
 </Button>
 <Button 
 type="button"
 size="sm"
 variant="outline"
 className={cn(
 "rounded-full h-8 px-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border shrink-0",
 topRatedFilter 
 ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" 
 : "bg-white text-gray-700 dark:bg-black dark:text-gray-300 border-gray-300 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900"
 )}
 onClick={() => setTopRatedFilter(!topRatedFilter)}
 >
 ⭐ Top Calificados
 </Button>
 <Button 
 type="button"
 size="sm"
 variant="outline"
 className={cn(
 "rounded-full h-8 px-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border shrink-0",
 nearMeFilter 
 ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" 
 : "bg-white text-gray-700 dark:bg-black dark:text-gray-300 border-gray-300 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900"
 )}
 onClick={() => setNearMeFilter(!nearMeFilter)}
 >
 📍 Cerca de mí
 </Button>
 <Button 
 type="button"
 size="sm"
 variant="outline"
 className={cn(
 "rounded-full h-8 px-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border shrink-0",
 premiumFilter 
 ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" 
 : "bg-white text-gray-700 dark:bg-black dark:text-gray-300 border-gray-300 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900"
 )}
 onClick={() => setPremiumFilter(!premiumFilter)}
 >
 💎 Premium
 </Button>
 </div>
 
 <div className="flex-shrink-0 pointer-events-auto pl-2">
 <SortDropdown />
 </div>
 </div>

 {/* 👇 BLOQUE DE UBICACIÓN DINÁMICO 👇 */}
 {((!coordinates && !locationDeclined) || showSuccess) && (
 <div className="pointer-events-auto md:w-[460px] flex flex-col gap-4 p-5 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] transition-all duration-300">
 
 {showSuccess ? (
 // 🟢 ESTADO 1: ÉXITO
 <div className="flex items-center gap-3 py-1">
 <div className="bg-black dark:bg-white text-white dark:text-black p-1.5 shrink-0">
 <MapPin className="w-4 h-4" strokeWidth={2} />
 </div>
 <div className="flex flex-col gap-1">
 <h4 className="text-[11px] font-bold text-black dark:text-white uppercase tracking-widest leading-none">
 UBICACIÓN CONFIRMADA
 </h4>
 <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
 BUSCANDO OPCIONES CERCANAS...
 </p>
 </div>
 </div>
 ) : isGeoLoading && !geoError ? (
 // 🟡 ESTADO 2: CARGANDO
 <div className="flex items-center gap-3 py-1">
 <Loader2 className="w-5 h-5 text-black dark:text-white shrink-0 animate-spin" strokeWidth={2} />
 <div className="flex flex-col gap-1">
 <h4 className="text-[11px] font-bold text-black dark:text-white uppercase tracking-widest leading-none">
 VERIFICANDO PERMISOS
 </h4>
 <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
 REVISA LA ALERTA DE TU NAVEGADOR
 </p>
 </div>
 </div>
 ) : (
 // 🔴 ESTADO 3: SOLICITUD O BLOQUEO
 <>
 <div className="flex items-start gap-3">
 {geoError ? (
 <div className="bg-gray-100 dark:bg-[#111] p-1.5 shrink-0 mt-0.5">
 <MapPin className="w-4 h-4 text-black dark:text-white opacity-50" strokeWidth={1.5} />
 </div>
 ) : (
 <MapPin className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5" strokeWidth={1.5} />
 )}
 
 <div className="flex flex-col gap-2">
 <h4 className="text-[11px] font-bold text-black dark:text-white uppercase tracking-widest leading-none">
 {geoError ? "PERMISO DENEGADO" : "ENCUENTRA OPCIONES CERCA DE TI"}
 </h4>
 <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-relaxed">
 {geoError 
 ? "TU NAVEGADOR BLOQUEÓ EL ACCESO. PARA ACTIVARLO, HAZ CLIC EN EL ÍCONO DEL CANDADO (🔒) EN LA BARRA DE DIRECCIONES, O UTILIZA EL BUSCADOR MANUAL ARRIBA." 
 : "PERMÍTENOS CONOCER TU UBICACIÓN PARA MOSTRARTE LOS ESPECIALISTAS Y SERVICIOS DISPONIBLES EN TU ZONA."}
 </p>
 </div>
 </div>
 
 <div className="flex items-center gap-3 mt-1">
 {geoError ? (
 <Button 
 onClick={() => setLocationDeclined(true)} 
 className="flex-1 bg-black text-white dark:bg-white dark:text-black rounded-none text-[9px] font-bold uppercase tracking-widest h-10 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
 >
 ENTENDIDO
 </Button>
 ) : (
 <>
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
 </>
 )}
 </div>
 </>
 )}
 </div>
 )}
 {/* 👆 FIN DEL NUEVO BLOQUE 👆 */}
 </div>

 {/* 📇 CAPA FLOTANTE: FICHAS DE PROVEEDOR */}
 <div className={cn("absolute z-20 pointer-events-none transition-all duration-500", 
 viewMode === "MAP" 
 ? cn("bottom-6 left-0 w-full md:top-28 md:bottom-6 md:left-8 md:w-[460px] md:overflow-hidden md:flex md:flex-col", isMapImmersive ? "translate-y-[150%] md:-translate-x-[150%] opacity-0" : "translate-y-0 opacity-100") 
 : "top-32 left-4 right-4 md:left-8 md:right-8 md:bottom-8 bottom-4"
 )}>

 {(searchType === 'STORE' ? enrichedProviders.length === 0 : items.length === 0) ? (
 isCurrentlyLoading ? (
 <div className="w-[90%] md:w-full mx-auto text-center pointer-events-none p-10">
 <Loader2 className="w-8 h-8 text-black dark:text-white mx-auto mb-6 animate-spin" strokeWidth={1.5} />
 <h3 className="text-black dark:text-white font-bold text-sm uppercase tracking-widest mb-2">
 CARGANDO...
 </h3>
 </div>
 ) : (
 <div className="w-[90%] md:w-full mx-auto bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-10 text-center pointer-events-auto shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
 <Search className="w-8 h-8 text-black dark:text-white mx-auto mb-6" strokeWidth={1.5} />
 <h3 className="text-black dark:text-white font-bold text-sm uppercase tracking-widest mb-2">
 BÚSQUEDA SIN COINCIDENCIAS
 </h3>
 <p className="text-gray-500 text-[10px] uppercase tracking-widest font-light">
 AMPLÍE LOS PARÁMETROS O ELIMINE FILTROS PARA VISUALIZAR RESULTADOS GLOBALES.
 </p>
 </div>
 )
 ) : (
 <div className={cn("w-full pointer-events-auto", viewMode === "MAP" ? "flex overflow-x-auto gap-3 pb-4 md:flex-col md:flex-1 md:overflow-x-visible md:overflow-y-auto md:gap-3 md:pb-6 custom-scrollbar px-4 md:px-0" : "pb-20 md:pb-0 flex gap-8 max-w-7xl mx-auto")}>
 
 {/* SIDEBAR FILTER PANEL SOLO PARA GRID */}
 {viewMode === "GRID" && (
 <aside className={cn("hidden md:block flex-shrink-0 transition-all duration-300", isFiltersOpen ? "w-[300px]" : "w-[60px]")}>
 <FilterPanel 
 isCollapsed={!isFiltersOpen} 
 onToggle={() => setIsFiltersOpen(!isFiltersOpen)} 
 />
 </aside>
 )}

 <div className={cn(viewMode === "GRID" ? (isFiltersOpen ? "flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start transition-all duration-300" : "flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start transition-all duration-300") : "flex gap-3 md:flex-col md:gap-3 w-full")}>
 
 <AnimatePresence>
 {searchType === 'STORE' ? enrichedProviders.map((provider) => (
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
 )) : items.map((item) => (
 <DiscoverItemCard
 key={`item-card-${item.id}`}
 item={item}
 isFavorited={favoriteIds.has(item.id)}
 canUseFavorites={canUseFavorites}
 onAuthRequired={() => {
 setAuthGateContext('favorite');
 setAuthGateOpen(true);
 }}
 />
 ))}
 </AnimatePresence>
 {/* Botón Load More para GRID VIEW (dentro del grid) */}
 {!isReachingEnd && viewMode === "GRID" && (
 <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center mt-8 mb-8 w-full">
 <Button
 onClick={handleLoadMore}
 disabled={isLoadingMore}
 className="h-12 px-8 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all rounded-none font-bold uppercase tracking-widest text-[11px]"
 >
 {isLoadingMore ? (
 <><Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2} /> CARGANDO...</>
 ) : (
 "CARGAR MÁS OPCIONES"
 )}
 </Button>
 </div>
 )}
 </div>

 {/* Botón Load More para MAP VIEW (fuera del grid) */}
 {!isReachingEnd && viewMode === "MAP" && (
 <div className="w-full shrink-0 flex justify-center mt-12 mb-8 pr-4 md:pr-0">
 <Button
 onClick={handleLoadMore}
 disabled={isLoadingMore}
 className="h-12 px-8 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all rounded-none font-bold uppercase tracking-widest text-[11px]"
 >
 {isLoadingMore ? (
 <><Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2} /> CARGANDO...</>
 ) : (
 "CARGAR MÁS OPCIONES"
 )}
 </Button>
 </div>
 )}

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

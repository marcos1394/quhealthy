"use client";

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Star, MapPin, LayoutGrid, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDiscoverContext } from './context/DiscoverContext';

const libraries: ("places" | "geometry")[] = ["places"];
const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 25.7904, lng: -108.9858 };

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

export const MarketplaceMap = () => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  
  const { 
    map, 
    setMap, 
    viewMode, 
    isMapImmersive, 
    setIsMapImmersive,
    coordinates,
    providers,
    items,
    searchType,
    selectedId,
    setSelectedId,
    hoveredId,
    setHoveredId,
    calculateDistance
  } = useDiscoverContext();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    language: 'es'
  });

  const dynamicMapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: 'greedy',
    clickableIcons: false,
    styles: resolvedTheme === 'dark' ? darkMapStyle : lightMapStyle,
  }), [resolvedTheme]);

  const mapCenter = useMemo(() => {
    if (coordinates) return { lat: coordinates.lat, lng: coordinates.lng };
    return defaultCenter;
  }, [coordinates]);

  const onMapLoad = React.useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, [setMap]);

  const handleMapClick = () => {
    setSelectedId(null);
    if (viewMode === 'MAP') {
      setIsMapImmersive(true);
    }
  };

  const enrichedProviders = useMemo(() => {
    if (!providers) return [];
    return providers.map(p => {
      let distance = undefined;
      if (coordinates && p.lat && p.lng) {
        distance = calculateDistance(coordinates.lat, coordinates.lng, p.lat, p.lng);
      }
      return { ...p, distanceKm: distance };
    });
  }, [providers, coordinates, calculateDistance]);

  if (!isLoaded) return <div className="w-full h-full bg-gray-100 dark:bg-[#111]" />;

  return (
    <div className={cn(
      "absolute inset-0 z-0", 
      viewMode === "GRID" && "hidden md:block md:opacity-0 pointer-events-none"
    )}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={coordinates ? 13 : 11}
        center={mapCenter}
        onLoad={onMapLoad}
        onClick={handleMapClick}
        options={dynamicMapOptions}
      >
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
                setSelectedId(provider.id);
                if (map) {
                  map.panTo({ lat: provider.lat, lng: provider.lng });
                  map.setZoom(14);
                }
              }}
              onMouseOver={() => setHoveredId(provider.id)}
              onMouseOut={() => setHoveredId(null)}
              icon={{
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                fillColor: provider.color || '#0d9488',
                fillOpacity: isSelected || isHovered ? 1 : 0.85,
                strokeWeight: isSelected ? 3 : 2,
                strokeColor: '#ffffff', 
                scale: isSelected ? 1.6 : 1.3,
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
                  <div className="min-w-[240px] max-w-[280px] font-sans -m-1 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
                    <div className="w-full h-24 relative bg-gray-50 flex items-center justify-center">
                      {(provider.imageUrl || provider.logoUrl) ? (
                        <img 
                          src={provider.imageUrl || provider.logoUrl} 
                          alt={provider.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      {provider.isPromoted && (
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                          Patrocinado
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="font-semibold text-[14px] text-gray-900 line-clamp-2 leading-tight">
                            {provider.name}
                          </h4>
                          <p className="text-[11px] text-teal-600 font-medium mt-0.5 truncate capitalize">
                            {(provider.category || 'Clínica / Tienda').toLowerCase()}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden shrink-0 shadow-sm bg-gray-50 flex items-center justify-center">
                          {provider.logoUrl ? (
                            <img src={provider.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 mt-2 text-[11px] text-gray-500 font-medium">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                            {provider.reviews && provider.reviews > 0 ? (
                              <>
                                <span className="font-semibold text-gray-900">{provider.rating?.toFixed(1)}</span>
                                <span className="text-gray-400">({provider.reviews})</span>
                              </>
                            ) : (
                              <span className="font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full text-[10px]">Nuevo</span>
                            )}
                          </div>
                          {provider.distanceKm !== undefined && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-teal-500" />
                              <span>{provider.distanceKm.toFixed(1)} km</span>
                            </div>
                          )}
                        </div>
                        {provider.basePrice !== undefined && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[10px] text-gray-400 font-medium">Desde</span>
                            <span className="font-bold text-gray-900 text-[14px]">${provider.basePrice}</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/store/${provider.slug}`);
                        }}
                        className="w-full mt-3 h-9 text-[11px] font-semibold rounded-xl text-white transition-opacity shadow-sm hover:shadow-md hover:-translate-y-0.5 border-0"
                        style={{ backgroundColor: provider.color || '#0d9488' }}
                      >
                        Ver Tienda
                      </Button>
                    </div>
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
                fillColor: item.providerColor || '#0d9488',
                fillOpacity: isSelected || isHovered ? 1 : 0.85,
                strokeWeight: isSelected ? 3 : 2,
                strokeColor: '#ffffff', 
                scale: isSelected ? 1.6 : 1.3,
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
                  <div className="p-3 min-w-[220px] max-w-[260px] font-sans -m-1 rounded-xl bg-white shadow-sm border border-gray-100">
                    <div className="flex gap-3 items-start">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden shadow-sm">
                        {(item.imageUrl || item.providerLogoUrl) ? (
                          <img 
                            src={item.imageUrl || item.providerLogoUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[13px] text-gray-900 line-clamp-2 leading-tight">
                          {item.name}
                        </h4>
                        <p className="text-[12px] font-bold text-gray-900 mt-1">
                          ${item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/market/item/${item.id}`);
                      }}
                      className="w-full mt-4 h-9 text-[11px] font-semibold rounded-xl text-white transition-opacity shadow-sm hover:-translate-y-0.5 hover:shadow-md border-0"
                      style={{ backgroundColor: item.providerColor || '#0d9488' }}
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
    </div>
  );
};

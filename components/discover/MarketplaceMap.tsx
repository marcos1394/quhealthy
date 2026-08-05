"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-doctor/button-has-type */

import React, { useMemo, useCallback, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Star, MapPin, LayoutGrid, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDiscoverContext } from "./context/DiscoverContext";

const libraries: ("places" | "geometry")[] = ["places"];
const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 25.7904, lng: -108.9858 };

const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#1e293b" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e2e8f0" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#e0f2fe" }],
  },
];

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#121212" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#051811" }],
  },
];

export const MarketplaceMap = () => {
  const t = useTranslations("Discover.MarketplaceMap");
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
    calculateDistance,
  } = useDiscoverContext();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
    language: "es",
  });

  const dynamicMapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
      clickableIcons: false,
      styles: resolvedTheme === "dark" ? darkMapStyle : lightMapStyle,
    }),
    [resolvedTheme]
  );

  const [activePinKey, setActivePinKey] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId) {
      setActivePinKey(`store-${selectedId}-main`);
    } else {
      setActivePinKey(null);
    }
  }, [selectedId]);

  const mapCenter = useMemo(() => {
    if (coordinates) return { lat: coordinates.lat, lng: coordinates.lng };
    return defaultCenter;
  }, [coordinates]);

  const onMapLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);
    },
    [setMap]
  );

  const handleMapClick = () => {
    setSelectedId(null);
    if (viewMode === "MAP") {
      setIsMapImmersive(true);
    }
  };

  const enrichedProviders = useMemo(() => {
    if (!providers) return [];
    return providers.map((p) => {
      let distance = undefined;
      if (coordinates && p.lat && p.lng) {
        distance = calculateDistance(
          coordinates.lat,
          coordinates.lng,
          p.lat,
          p.lng
        );
      }
      return { ...p, distanceKm: distance };
    });
  }, [providers, coordinates, calculateDistance]);

  if (!isLoaded)
    return <div className="w-full h-full bg-gray-50 dark:bg-[#050505]" />;

  return (
    <div
      className={cn(
        "absolute inset-0 z-0 font-sans transition-colors",
        viewMode === "GRID" &&
          "hidden md:block md:opacity-0 pointer-events-none"
      )}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={coordinates ? 13 : 11}
        center={mapCenter}
        onLoad={onMapLoad}
        onClick={handleMapClick}
        options={dynamicMapOptions}
      >
        {/* Marcador de Ubicación del Usuario */}
        {coordinates && (
          <MarkerF
            position={{ lat: coordinates.lat, lng: coordinates.lng }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#059669",
              fillOpacity: 1,
              strokeWeight: 4,
              strokeColor: "#ffffff",
              scale: 7,
            }}
            zIndex={100}
          />
        )}
        {/* Marcadores de Tiendas / Proveedores */}
        {searchType === "STORE"
          ? enrichedProviders.flatMap((provider) => {
              const isSelected = selectedId === provider.id;
              const isHovered = hoveredId === provider.id;

              if (!provider.lat || !provider.lng) return [];

              const locations = [
                { lat: provider.lat, lng: provider.lng, key: `store-${provider.id}-main` },
                ...(provider.additionalLocations || []).map((loc, idx) => ({
                  lat: loc.lat,
                  lng: loc.lng,
                  key: `store-${provider.id}-add-${idx}`,
                })),
              ];

              return locations.map((loc) => {
                const isPinActive = activePinKey === loc.key || (isSelected && activePinKey === null);
                
                return (
                  <MarkerF
                    key={loc.key}
                    position={{ lat: loc.lat, lng: loc.lng }}
                    onClick={(e) => {
                      if (e.domEvent) {
                        e.domEvent.stopPropagation();
                      }
                      setSelectedId(provider.id);
                      setActivePinKey(loc.key);
                      if (map) {
                        map.panTo({ lat: loc.lat, lng: loc.lng });
                        map.setZoom(14);
                      }
                    }}
                    onMouseOver={() => setHoveredId(provider.id)}
                    onMouseOut={() => setHoveredId(null)}
                    icon={{
                      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                      fillColor: provider.color || "#059669",
                      fillOpacity: isSelected || isHovered ? 1 : 0.85,
                      strokeWeight: isSelected ? 3 : 2,
                      strokeColor: "#ffffff",
                      scale: isSelected ? 1.6 : 1.3,
                      anchor: new google.maps.Point(12, 24),
                    }}
                    zIndex={isSelected ? 50 : 10}
                  >
                    {isPinActive && (
                      <InfoWindowF
                        position={{ lat: loc.lat, lng: loc.lng }}
                        onCloseClick={() => {
                          setSelectedId(null);
                          setActivePinKey(null);
                        }}
                        options={{ pixelOffset: new google.maps.Size(0, -45) }}
                      >
                        <div className="min-w-[240px] max-w-[280px] font-sans -m-1 rounded-2xl overflow-hidden bg-white dark:bg-[#0a0a0a] shadow-xl border border-gray-100 dark:border-gray-800">
                          <div className="w-full h-24 relative bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                            {provider.imageUrl || provider.logoUrl ? (
                              <img
                                src={provider.imageUrl || provider.logoUrl}
                                alt={provider.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-gray-50 dark:from-emerald-950/20 dark:to-[#050505] flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            {provider.isPromoted && (
                              <div className="absolute top-2 left-2 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                                {t("sponsored")}
                              </div>
                            )}
                          </div>
  
                          <div className="p-3.5 bg-white dark:bg-[#0a0a0a] space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2 leading-tight">
                                  {provider.name}
                                </h4>
                                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate capitalize">
                                  {(
                                    provider.category || t("clinic_default")
                                  ).toLowerCase()}
                                </p>
                              </div>
                              <div className="w-8 h-8 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shrink-0 shadow-2xs bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                                {provider.logoUrl ? (
                                  <img
                                    src={provider.logoUrl}
                                    alt={provider.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                            </div>
  
                            <div className="flex flex-col gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                  {provider.reviews && provider.reviews > 0 ? (
                                    <>
                                      <span className="font-bold font-mono text-gray-900 dark:text-white">
                                        {provider.rating?.toFixed(1)}
                                      </span>
                                      <span className="text-gray-400 text-[10px] font-mono">
                                        ({provider.reviews})
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-bold text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full text-[10px]">
                                      {t("new_badge")}
                                    </span>
                                  )}
                                </div>
  
                                {provider.distanceKm !== undefined && (
                                  <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400">
                                    <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    <span>
                                      {provider.distanceKm.toFixed(1)} km
                                    </span>
                                  </div>
                                )}
                              </div>
  
                              {provider.basePrice !== undefined && (
                                <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100 dark:border-gray-800/80">
                                  <span className="text-[10px] text-gray-400 font-medium">
                                    {t("from")}
                                  </span>
                                  <span className="font-bold font-mono text-gray-900 dark:text-white text-xs">
                                    ${provider.basePrice}
                                  </span>
                                </div>
                              )}
                            </div>
  
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/store/${provider.slug}`);
                              }}
                              className="w-full h-9 text-xs font-bold rounded-xl text-white shadow-xs transition-all flex items-center justify-center cursor-pointer border-0"
                              style={{
                                backgroundColor: provider.color || "#059669",
                              }}
                            >
                              {t("view_store")}
                            </button>
                          </div>
                        </div>
                      </InfoWindowF>
                    )}
                  </MarkerF>
                );
              });
            })
          /* Marcadores de Ítems / Productos / Servicios */
          : items.map((item) => {
              const isSelected = selectedId === item.id;
              const isHovered = hoveredId === item.id;

              if (!item.providerLat || !item.providerLng) return null;

              return (
                <MarkerF
                  key={`marker-item-${item.id}`}
                  position={{ lat: item.providerLat, lng: item.providerLng }}
                  onClick={(e) => {
                    if (e.domEvent) {
                      e.domEvent.stopPropagation();
                    }
                    setSelectedId(item.id);
                    if (map) {
                      map.panTo({
                        lat: item.providerLat!,
                        lng: item.providerLng!,
                      });
                      map.setZoom(14);
                    }
                  }}
                  onMouseOver={() => setHoveredId(item.id)}
                  onMouseOut={() => setHoveredId(null)}
                  icon={{
                    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                    fillColor: item.providerColor || "#059669",
                    fillOpacity: isSelected || isHovered ? 1 : 0.85,
                    strokeWeight: isSelected ? 3 : 2,
                    strokeColor: "#ffffff",
                    scale: isSelected ? 1.6 : 1.3,
                    anchor: new google.maps.Point(12, 24),
                  }}
                  zIndex={isSelected ? 50 : 10}
                >
                  {isSelected && (
                    <InfoWindowF
                      position={{
                        lat: item.providerLat,
                        lng: item.providerLng,
                      }}
                      onCloseClick={() => setSelectedId(null)}
                      options={{ pixelOffset: new google.maps.Size(0, -45) }}
                    >
                      <div className="p-3.5 min-w-[220px] max-w-[260px] font-sans -m-1 rounded-2xl bg-white dark:bg-[#0a0a0a] shadow-xl border border-gray-100 dark:border-gray-800 space-y-3">
                        <div className="flex gap-3 items-start">
                          <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-[#050505] flex items-center justify-center border border-gray-100 dark:border-gray-800 shrink-0 overflow-hidden shadow-2xs">
                            {item.imageUrl || item.providerLogoUrl ? (
                              <img
                                src={item.imageUrl || item.providerLogoUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <h4 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-2 leading-tight">
                              {item.name}
                            </h4>
                            <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              ${item.price.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/market/item/${item.id}`);
                          }}
                          className="w-full h-9 text-xs font-bold rounded-xl text-white shadow-xs transition-all flex items-center justify-center cursor-pointer border-0"
                          style={{
                            backgroundColor: item.providerColor || "#059669",
                          }}
                        >
                          {t("view_details")}
                        </button>
                      </div>
                    </InfoWindowF>
                  )}
                </MarkerF>
              );
            })}
      </GoogleMap>

      {/* Botón Flotante para re-activar la Interfaz */}
      <AnimatePresence>
        {isMapImmersive && viewMode === "MAP" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-30 font-sans"
          >
            <button
              type="button"
              onClick={() => setIsMapImmersive(false)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer border-0"
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={2} />
              <span>{t("show_ui")}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
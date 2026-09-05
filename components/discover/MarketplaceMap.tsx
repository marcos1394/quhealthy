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
import {
  Star,
  MapPin,
  LayoutGrid,
  User,
  Award,
  HeartHandshake,
  Video,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Building2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getMapMarkerIcon, getSpecialtyTheme, disperseCoordinates, DispersedItem } from "@/lib/mapPins";
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
    foundations,
    searchType,
    selectedId,
    setSelectedId,
    hoveredId,
    setHoveredId,
    calculateDistance,
  } = useDiscoverContext();

  const { isLoaded, loadError } = useJsApiLoader({
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

  const enrichedFoundations = useMemo(() => {
    if (!foundations) return [];
    return foundations.map((f: any) => {
      const fLat = f.lat || f.latitude;
      const fLng = f.lng || f.longitude;
      let distance = undefined;
      if (coordinates && fLat && fLng) {
        distance = calculateDistance(
          coordinates.lat,
          coordinates.lng,
          fLat,
          fLng
        );
      }
      return { ...f, distanceKm: distance, lat: fLat, lng: fLng };
    });
  }, [foundations, coordinates, calculateDistance]);

  interface RawProviderLocation {
    provider: (typeof enrichedProviders)[number];
    locKey: string;
    lat: number;
    lng: number;
  }

  // 1. Extraer todas las ubicaciones de proveedores (sede principal y adicionales)
  const rawProviderLocations = useMemo<RawProviderLocation[]>(() => {
    if (!enrichedProviders || enrichedProviders.length === 0) return [];
    return enrichedProviders.flatMap((provider) => {
      if (!provider.lat || !provider.lng) return [];

      const mainLoc: RawProviderLocation = {
        provider,
        locKey: `store-${provider.id}-main`,
        lat: Number(provider.lat),
        lng: Number(provider.lng),
      };

      const addLocs: RawProviderLocation[] = (provider.additionalLocations || []).map(
        (loc: { lat: number; lng: number }, idx: number) => ({
          provider,
          locKey: `store-${provider.id}-add-${idx}`,
          lat: Number(loc.lat),
          lng: Number(loc.lng),
        })
      );

      return [mainLoc, ...addLocs];
    });
  }, [enrichedProviders]);

  // 2. Dispersar ubicaciones compartidas (Spiderfier determinista en roseta)
  const dispersedProviderPins = useMemo(() => {
    return disperseCoordinates(rawProviderLocations);
  }, [rawProviderLocations]);

  // 3. Separar pines individuales (< 6) de hubs consolidados (>= 6 en la misma torre)
  const { individualPins, hubClusters } = useMemo(() => {
    const individual: DispersedItem<RawProviderLocation>[] = [];
    const hubsMap = new Map<
      string,
      {
        clusterKey: string;
        lat: number;
        lng: number;
        items: RawProviderLocation[];
      }
    >();

    for (const pin of dispersedProviderPins) {
      if (pin.clusterSize >= 6) {
        if (!hubsMap.has(pin.clusterKey)) {
          hubsMap.set(pin.clusterKey, {
            clusterKey: pin.clusterKey,
            lat: pin.originalLat,
            lng: pin.originalLng,
            items: [pin.item, ...pin.coworkers],
          });
        }
      } else {
        individual.push(pin);
      }
    }

    return {
      individualPins: individual,
      hubClusters: Array.from(hubsMap.values()),
    };
  }, [dispersedProviderPins]);

  useEffect(() => {
    if (selectedId && map) {
      if (searchType === "FOUNDATION") {
        const found = enrichedFoundations.find((f: any) => f.id === selectedId);
        const lat = found?.lat || found?.latitude;
        const lng = found?.lng || found?.longitude;
        if (lat && lng) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
      } else if (searchType === "STORE" || !searchType) {
        const provPin = dispersedProviderPins.find((p) => p.item.provider.id === selectedId);
        if (provPin) {
          map.panTo({ lat: provPin.lat, lng: provPin.lng });
          map.setZoom(15);
          setActivePinKey(provPin.item.locKey);
        } else {
          const prov = enrichedProviders.find((p) => p.id === selectedId);
          if (prov && prov.lat && prov.lng) {
            map.panTo({ lat: prov.lat, lng: prov.lng });
            map.setZoom(15);
          }
        }
      } else {
        const item = items.find((i) => i.id === selectedId);
        if (item && item.providerLat && item.providerLng) {
          map.panTo({ lat: item.providerLat, lng: item.providerLng });
          map.setZoom(15);
        }
      }
    }
  }, [selectedId, searchType, enrichedFoundations, enrichedProviders, dispersedProviderPins, items, map]);

  // Auto-centrar mapa en la ubicación del usuario cuando se obtienen las coordenadas
  useEffect(() => {
    if (coordinates && map && !selectedId) {
      map.panTo({ lat: coordinates.lat, lng: coordinates.lng });
      map.setZoom(13);
    }
  }, [coordinates, map, selectedId]);

  if (loadError) {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center p-6 bg-gray-50 dark:bg-[#050505] font-sans">
        <div className="max-w-md p-6 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 text-center shadow-lg space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-2xs">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            {t("map_unavailable_title")}
          </h3>
          <p className="text-xs text-gray-500">
            {t("map_unavailable_desc")}
          </p>
        </div>
      </div>
    );
  }

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
        )}        {/* ── MARCADORES DE TIENDAS / PROVEEDORES DISPERSADOS (SPIDERFIER) ── */}
        {(searchType === "STORE" || !searchType) && (
          <>
            {/* Pines Individuales y Dispersados en Roseta (< 6 por edificio) */}
            {individualPins.map((pin) => {
              const provider = pin.item.provider;
              const isSelected = selectedId === provider.id;
              const isHovered = hoveredId === provider.id;
              const isPinActive =
                activePinKey === pin.item.locKey ||
                (isSelected && (activePinKey === null || activePinKey.startsWith("store-")));

              return (
                <MarkerF
                  key={pin.item.locKey}
                  position={{ lat: pin.lat, lng: pin.lng }}
                  onClick={(e) => {
                    if (e.domEvent) {
                      e.domEvent.stopPropagation();
                    }
                    setSelectedId(provider.id);
                    setActivePinKey(pin.item.locKey);
                    if (map) {
                      map.panTo({ lat: pin.lat, lng: pin.lng });
                      map.setZoom(15);
                    }
                  }}
                  onMouseOver={() => setHoveredId(provider.id)}
                  onMouseOut={() => setHoveredId(null)}
                  icon={getMapMarkerIcon(
                    {
                      role: provider.role || (provider.isClinic ? "CLINIC" : "PROVIDER"),
                      specialty: provider.category || provider.specialty,
                      name: provider.name,
                      category: provider.category,
                      isClinic: provider.isClinic,
                      isPromoted: provider.isPromoted,
                      isSelected: isPinActive || isSelected,
                      isHovered,
                      clusterCount: pin.clusterSize > 1 ? pin.clusterSize : undefined,
                    },
                    typeof google !== "undefined" ? google.maps : undefined
                  )}
                  zIndex={isSelected || isPinActive ? 60 : isHovered ? 50 : 10}
                >
                  {isPinActive && (() => {
                    const specTheme = getSpecialtyTheme(
                      provider.category || provider.specialty,
                      provider.role,
                      provider.name,
                      provider.isClinic
                    );

                    return (
                      <InfoWindowF
                        position={{ lat: pin.lat, lng: pin.lng }}
                        onCloseClick={() => {
                          setSelectedId(null);
                          setActivePinKey(null);
                        }}
                        options={{ pixelOffset: new google.maps.Size(0, -40) }}
                      >
                        <div className="p-0 w-[285px] max-w-[285px] font-sans rounded-2xl overflow-hidden bg-white dark:bg-[#0a0a0a] shadow-2xl border border-gray-100 dark:border-gray-800">
                          {/* Banner Superior con Gradiente */}
                          <div className="relative h-28 w-full bg-gray-100 dark:bg-[#050505] overflow-hidden">
                            {provider.imageUrl ? (
                              <img
                                src={provider.imageUrl}
                                alt={provider.name}
                                className="w-full h-full object-cover object-center"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700 bg-gray-50 dark:bg-[#0f0f0f]">
                                <User className="w-9 h-9 opacity-40" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

                            {/* Badges Superiores */}
                            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
                              <div
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs backdrop-blur-md"
                                style={{ backgroundColor: `${specTheme.primaryColor}F2` }}
                              >
                                <svg
                                  className="w-3 h-3 shrink-0"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d={specTheme.iconSvgPath || "M12 4v16m-8-8h16"} />
                                </svg>
                                <span className="truncate max-w-[130px]">
                                  {provider.category && provider.category !== "Salud y Bienestar"
                                    ? provider.category
                                    : specTheme.label}
                                </span>
                              </div>

                              {provider.isPromoted ? (
                                <div className="bg-amber-500 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                  <Award className="w-2.5 h-2.5" />
                                  <span>{t("recommended")}</span>
                                </div>
                              ) : (
                                <div className="bg-black/50 backdrop-blur-md text-emerald-300 text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-400/30">
                                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                                  <span>Verificado</span>
                                </div>
                              )}
                            </div>

                            {/* Logo del Especialista + Rating Flotante */}
                            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between gap-2 pointer-events-none">
                              <div className="w-10 h-10 rounded-xl border-2 border-white dark:border-[#0a0a0a] overflow-hidden shrink-0 shadow-md bg-white dark:bg-[#0a0a0a] p-0.5 flex items-center justify-center">
                                {provider.logoUrl ? (
                                  <img
                                    src={provider.logoUrl}
                                    alt={provider.name}
                                    className="w-full h-full object-contain object-center"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-gray-400" />
                                )}
                              </div>

                              <div className="bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md rounded-full px-2.5 py-0.5 flex items-center gap-1 shadow-2xs border border-gray-100 dark:border-gray-800">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                {provider.reviews && provider.reviews > 0 ? (
                                  <>
                                    <span className="font-bold font-mono text-xs text-gray-900 dark:text-white">
                                      {provider.rating?.toFixed(1)}
                                    </span>
                                    <span className="text-gray-400 text-[10px] font-mono">
                                      ({provider.reviews})
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-bold text-gray-600 dark:text-gray-300 text-[10px]">
                                    {t("new_badge")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Contenido de la Tarjeta */}
                          <div className="p-3 bg-white dark:bg-[#0a0a0a] space-y-2.5">
                            <div>
                              <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 leading-snug">
                                {provider.name}
                              </h4>
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                {provider.distanceKm !== undefined ? (
                                  <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500 dark:text-gray-400">
                                    <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>a {provider.distanceKm.toFixed(1)} km de ti</span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-gray-400">Ubicación registrada</span>
                                )}
                                {provider.locationsCount && provider.locationsCount > 1 && (
                                  <span className="text-[9px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded-full border border-sky-100 dark:border-sky-900/40">
                                    +{provider.locationsCount - 1} suc.
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Badges de Modalidades */}
                            <div className="flex flex-wrap gap-1.5">
                              {(provider.offersTelemedicine ||
                                provider.hasTelemedicine ||
                                provider.modalities?.includes("ONLINE")) && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-[9px] font-bold border border-blue-100 dark:border-blue-900/40">
                                  <Video className="w-2.5 h-2.5" />
                                  <span>{t("telemedicine_badge")}</span>
                                </span>
                              )}
                              {provider.availableToday && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[9px] font-bold border border-emerald-100 dark:border-emerald-900/40">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>{t("available_today_badge")}</span>
                                </span>
                              )}
                            </div>

                            {/* 🏢 Selector / Chips de Especialistas en la Misma Torre */}
                            {pin.isCluster && pin.coworkers.length > 0 && (
                              <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-100/80 dark:border-teal-900/40 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                                    <span>Misma Torre · {pin.clusterSize} especialistas</span>
                                  </span>
                                  <span className="text-[9px] text-teal-600 dark:text-teal-400 font-semibold">
                                    Misma sede
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar pt-0.5">
                                  {pin.coworkers.map((cw, cwIdx) => {
                                    const cwTheme = getSpecialtyTheme(
                                      cw.provider.category || cw.provider.specialty,
                                      cw.provider.role,
                                      cw.provider.name,
                                      cw.provider.isClinic
                                    );
                                    return (
                                      <button
                                        key={`cw-${cw.provider.id}-${cwIdx}`}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedId(cw.provider.id);
                                          setActivePinKey(cw.locKey);
                                        }}
                                        className="text-[9px] font-semibold px-2 py-0.5 rounded-lg bg-white dark:bg-[#1a1a1a] border border-teal-200/60 dark:border-teal-800/40 text-gray-700 dark:text-gray-200 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors truncate max-w-[125px] cursor-pointer flex items-center gap-1 shadow-2xs"
                                        title={`${cw.provider.name} (${cwTheme.label})`}
                                      >
                                        <span
                                          className="w-1.5 h-1.5 rounded-full shrink-0"
                                          style={{ backgroundColor: cwTheme.primaryColor }}
                                        />
                                        <span className="truncate">
                                          {cw.provider.name.split(" ")[0]} ({cwTheme.label})
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Precio y Botón de Acción */}
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                                  {t("from")}
                                </span>
                                {provider.basePrice !== undefined && provider.basePrice > 0 ? (
                                  <div className="flex items-baseline gap-1">
                                    <span className="font-bold font-mono text-gray-900 dark:text-white text-sm">
                                      ${provider.basePrice.toLocaleString()}
                                    </span>
                                    <span className="text-[9px] font-bold text-gray-400">MXN</span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    Por cotizar
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/store/${provider.slug}`);
                                }}
                                className="h-8 px-3 text-xs font-bold rounded-xl text-white shadow-xs hover:shadow-md transition-all flex items-center gap-1 cursor-pointer border-0"
                                style={{
                                  backgroundColor:
                                    provider.color || specTheme.primaryColor || "#059669",
                                }}
                              >
                                <span>{t("view_store")}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </InfoWindowF>
                    );
                  })()}
                </MarkerF>
              );
            })}

            {/* ── PINES HUB: TORRES MÉDICAS CON 6+ ESPECIALISTAS ── */}
            {hubClusters.map((hub) => {
              const isSelected = hub.items.some((i) => i.provider.id === selectedId);
              const isHovered = hub.items.some((i) => i.provider.id === hoveredId);
              const isPinActive = activePinKey === hub.clusterKey || isSelected;

              return (
                <MarkerF
                  key={`hub-${hub.clusterKey}`}
                  position={{ lat: hub.lat, lng: hub.lng }}
                  onClick={(e) => {
                    if (e.domEvent) e.domEvent.stopPropagation();
                    setActivePinKey(hub.clusterKey);
                    if (map) {
                      map.panTo({ lat: hub.lat, lng: hub.lng });
                      map.setZoom(15);
                    }
                  }}
                  icon={getMapMarkerIcon(
                    {
                      isHub: true,
                      clusterCount: hub.items.length,
                      isSelected: isPinActive,
                      isHovered,
                    },
                    typeof google !== "undefined" ? google.maps : undefined
                  )}
                  zIndex={isPinActive ? 65 : isHovered ? 55 : 20}
                >
                  {isPinActive && (
                    <InfoWindowF
                      position={{ lat: hub.lat, lng: hub.lng }}
                      onCloseClick={() => {
                        setActivePinKey(null);
                      }}
                      options={{ pixelOffset: new google.maps.Size(0, -40) }}
                    >
                      <div className="p-0 w-[300px] max-w-[300px] font-sans rounded-2xl overflow-hidden bg-white dark:bg-[#0a0a0a] shadow-2xl border border-gray-100 dark:border-gray-800">
                        {/* Cabecera del Hub */}
                        <div className="p-3.5 bg-gradient-to-br from-teal-800 to-emerald-900 text-white space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              Torre Médica
                            </span>
                            <span className="text-xs font-black font-mono bg-white text-teal-800 px-2.5 py-0.5 rounded-full shadow-xs">
                              {hub.items.length} Especialistas
                            </span>
                          </div>
                          <h4 className="font-bold text-sm tracking-tight pt-1">
                            Centro Clínico Compartido
                          </h4>
                          <p className="text-[11px] text-teal-100/90 font-medium leading-snug">
                            Varios especialistas atienden en esta misma dirección
                          </p>
                        </div>

                        {/* Directorio de Especialistas en la Torre */}
                        <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 divide-y divide-gray-100 dark:divide-gray-800/80">
                          {hub.items.map((entry, idx) => {
                            const prov = entry.provider;
                            const specTheme = getSpecialtyTheme(
                              prov.category || prov.specialty,
                              prov.role,
                              prov.name,
                              prov.isClinic
                            );

                            return (
                              <div
                                key={`hub-prov-${prov.id}-${idx}`}
                                onClick={() => {
                                  setSelectedId(prov.id);
                                  router.push(`/store/${prov.slug}`);
                                }}
                                className="p-2 hover:bg-gray-50 dark:hover:bg-[#151515] rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-2.5 group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 bg-gray-100 dark:bg-[#202020] flex items-center justify-center">
                                    {prov.imageUrl || prov.logoUrl ? (
                                      <img
                                        src={prov.imageUrl || prov.logoUrl}
                                        alt={prov.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <User className="w-4 h-4 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                                      {prov.name}
                                    </p>
                                    <span
                                      className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-md truncate max-w-[145px]"
                                      style={{
                                        backgroundColor: `${specTheme.primaryColor}18`,
                                        color: specTheme.primaryColor,
                                      }}
                                    >
                                      {prov.category && prov.category !== "Salud y Bienestar"
                                        ? prov.category
                                        : specTheme.label}
                                    </span>
                                  </div>
                                </div>

                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </InfoWindowF>
                  )}
                </MarkerF>
              );
            })}
          </>
        )}

        {/* ── MARCADORES DE FUNDACIONES & ONGS ───────────────────────────── */}
        {searchType === "FOUNDATION" && (enrichedFoundations || []).map((foundation: any) => {
          const lat = foundation.lat || foundation.latitude;
          const lng = foundation.lng || foundation.longitude;

          if (!lat || !lng) return null;

          const isPinActive = activePinKey === `foundation-${foundation.id}` || (selectedId === foundation.id && (activePinKey === `foundation-${foundation.id}` || activePinKey === null));
          const isHovered = hoveredId === foundation.id;

          return (
            <MarkerF
              key={`marker-foundation-${foundation.id}`}
              position={{ lat, lng }}
              onClick={(e) => {
                if (e.domEvent) {
                  e.domEvent.stopPropagation();
                }
                setSelectedId(foundation.id);
                setActivePinKey(`foundation-${foundation.id}`);
                if (map) {
                  map.panTo({ lat, lng });
                  map.setZoom(15);
                }
              }}
              onMouseOver={() => setHoveredId(foundation.id)}
              onMouseOut={() => setHoveredId(null)}
              icon={getMapMarkerIcon({
                role: "FOUNDATION",
                name: foundation.brandName || foundation.legalName,
                category: foundation.primaryCauses?.[0] || foundation.organizationType,
                isSelected: isPinActive,
                isHovered,
              }, typeof google !== "undefined" ? google.maps : undefined)}
              zIndex={isPinActive ? 50 : 15}
            >
              {isPinActive && (
                <InfoWindowF
                  position={{ lat, lng }}
                  onCloseClick={() => {
                    setSelectedId(null);
                    setActivePinKey(null);
                  }}
                  options={{ pixelOffset: new google.maps.Size(0, -40) }}
                >
                  <div className="p-0 w-[285px] max-w-[285px] font-sans rounded-2xl overflow-hidden bg-white dark:bg-[#0a0a0a] shadow-xl border border-gray-100 dark:border-gray-800">
                    {/* Banner Superior */}
                    <div className="relative h-24 w-full bg-gray-50 dark:bg-[#050505] overflow-hidden">
                      {foundation.bannerUrl ? (
                        <img
                          src={foundation.bannerUrl}
                          alt={foundation.brandName || foundation.legalName}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-rose-50 to-pink-100/50 dark:from-[#0a0a0a] dark:to-rose-950/20 flex items-center justify-center text-rose-300 dark:text-rose-800">
                          <HeartHandshake className="w-8 h-8 opacity-60" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <HeartHandshake className="w-2.5 h-2.5" />
                        <span>{foundation.organizationType || "I.A.P."}</span>
                      </div>
                    </div>

                    {/* Cuerpo de la ventana */}
                    <div className="p-3.5 bg-white dark:bg-[#0a0a0a] space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2 leading-tight">
                            {foundation.brandName || foundation.legalName}
                          </h4>
                          <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-0.5 truncate capitalize">
                            {(
                              foundation.primaryCauses?.[0] || "Salud Asistencial"
                            ).toLowerCase()}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shrink-0 shadow-2xs bg-white dark:bg-[#0a0a0a] p-0.5 flex items-center justify-center">
                          {foundation.logoUrl ? (
                            <img
                              src={foundation.logoUrl}
                              alt={foundation.brandName || foundation.legalName}
                              className="w-full h-full object-contain object-center"
                            />
                          ) : (
                            <HeartHandshake className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full text-[10px]">
                              {foundation.programs?.length || foundation.totalActiveProgramsCount || 1} {(foundation.programs?.length || foundation.totalActiveProgramsCount || 1) === 1 ? "Programa" : "Programas"}
                            </span>
                          </div>

                          {foundation.distanceKm !== undefined && (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400">
                              <MapPin className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                              <span>
                                {foundation.distanceKm.toFixed(1)} km
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100 dark:border-gray-800/80">
                          <span className="text-[10px] text-gray-400 font-medium">
                            Beneficio:
                          </span>
                          <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                            100% Subsidio / Gratuito
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/foundation/${foundation.id}`);
                        }}
                        className="w-full h-9 text-xs font-bold rounded-xl text-white shadow-xs transition-all flex items-center justify-center cursor-pointer border-0"
                        style={{
                          backgroundColor: foundation.primaryColor || "#e11d48",
                        }}
                      >
                        Ver Programas & Solicitar
                      </button>
                    </div>
                  </div>
                </InfoWindowF>
              )}
            </MarkerF>
          );
        })}

        {/* ── MARCADORES DE ÍTEMS / PRODUCTOS / SERVICIOS ───────────────── */}
        {searchType !== "STORE" && searchType !== "FOUNDATION" && (items || []).map((item) => {
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
              icon={getMapMarkerIcon({
                role: item.providerRole || "PROVIDER",
                specialty: item.category,
                name: item.name,
                category: item.category,
                isHomeVisit: item.modality === "HOME_VISIT",
                isSelected,
                isHovered,
              }, typeof google !== "undefined" ? google.maps : undefined)}
              zIndex={isSelected ? 50 : 10}
            >
              {isSelected && (
                <InfoWindowF
                  position={{
                    lat: item.providerLat,
                    lng: item.providerLng,
                  }}
                  onCloseClick={() => setSelectedId(null)}
                  options={{ pixelOffset: new google.maps.Size(0, -40) }}
                >
                  <div className="p-3.5 w-[260px] max-w-[260px] font-sans rounded-2xl bg-white dark:bg-[#0a0a0a] shadow-xl border border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex gap-3 items-start">
                      <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#050505] p-0.5 flex items-center justify-center border border-gray-100 dark:border-gray-800 shrink-0 overflow-hidden shadow-2xs">
                        {item.imageUrl || item.providerLogoUrl ? (
                          <img
                            src={item.imageUrl || item.providerLogoUrl}
                            alt={item.name}
                            className="w-full h-full object-contain object-center"
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
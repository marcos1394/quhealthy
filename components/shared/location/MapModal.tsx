"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-event-handler */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useMemo, useReducer } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  StreetViewPanorama,
} from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Eye,
  Map as MapIcon,
  Navigation,
  AlertCircle,
  Info,
  Search,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { googleService } from "@/services/google.service";
import { LocationData, LocationPickerProps } from "@/types/location";
import { handleApiError } from "@/lib/handleApiError";
import { cn } from "@/lib/utils";


// Keep "places" in libraries to match other components and prevent useJsApiLoader conflicts
const libraries: "places"[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "420px",
};

// ☀️ ESTILO MODO CLARO (Clínico & Suave)
const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#334155" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0f172a" }],
  },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
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
    stylers: [{ color: "#e2e8f0" }],
  },
];

// 🌙 ESTILO MODO OSCURO (Minimalista Nocturno)
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#171717" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#262626" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#050505" }],
  },
];

// ============================================================================
// 1. COMPONENTE INTERNO DEL MAPA (Reactivo a i18n & Tema)
// ============================================================================
import { useGoogleAutocomplete } from "@/hooks/useGoogleAutocomplete";

const MapWithAutocomplete: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
}) => {
  const t = useTranslations("MapModal");
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  const {
    query,
    setQuery,
    suggestions,
    setSuggestions,
    isLoading: isAutocompleteLoading,
  } = useGoogleAutocomplete();

  const [
    {
      map,
      selectedLocation,
      inputValue,
      showStreetView,
      isProcessing,
    },
    dispatch,
  ] = useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case "SET_MAP":
          return {
            ...state,
            map:
              typeof action.payload === "function"
                ? action.payload(state.map)
                : action.payload,
          };
        case "SET_SELECTEDLOCATION":
          return {
            ...state,
            selectedLocation:
              typeof action.payload === "function"
                ? action.payload(state.selectedLocation)
                : action.payload,
          };
        case "SET_INPUTVALUE":
          return {
            ...state,
            inputValue:
              typeof action.payload === "function"
                ? action.payload(state.inputValue)
                : action.payload,
          };
        case "SET_SHOWSTREETVIEW":
          return {
            ...state,
            showStreetView:
              typeof action.payload === "function"
                ? action.payload(state.showStreetView)
                : action.payload,
          };
        case "SET_ISPROCESSING":
          return {
            ...state,
            isProcessing:
              typeof action.payload === "function"
                ? action.payload(state.isProcessing)
                : action.payload,
          };
        default:
          return state;
      }
    },
    {
      map: null,
      showStreetView: false,
      inputValue: "",
      isProcessing: false,
      selectedLocation: null,
    }
  );

  const setMap = (val: any) => dispatch({ type: "SET_MAP", payload: val });
  const setSelectedLocation = (val: any) =>
    dispatch({ type: "SET_SELECTEDLOCATION", payload: val });
  const setInputValue = (val: any) =>
    dispatch({ type: "SET_INPUTVALUE", payload: val });
  const setShowStreetView = (val: any) =>
    dispatch({ type: "SET_SHOWSTREETVIEW", payload: val });
  const setIsProcessing = (val: any) =>
    dispatch({ type: "SET_ISPROCESSING", payload: val });


  const dynamicMapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: true,
      clickableIcons: false,
      styles: resolvedTheme === "dark" ? darkMapStyle : lightMapStyle,
    }),
    [resolvedTheme]
  );

  useEffect(() => {
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      setSelectedLocation(initialLocation);
      setInputValue(initialLocation.address || "");
      if (map) {
        map.panTo({ lat: initialLocation.lat, lng: initialLocation.lng });
        map.setZoom(17);
      }
    }
  }, [initialLocation, map]);

  const updateLocationDetails = async (
    lat: number,
    lng: number,
    placeId?: string
  ) => {
    setIsProcessing(true);
    try {
      const response = await googleService.reverseGeocode(lat, lng);
      const data =
        typeof response === "string" ? JSON.parse(response) : response;
      const newLocation: LocationData = {
        lat,
        lng,
        address: data.formatted_address || t("location_selected_default"),
        placeId: placeId || data.place_id,
        city: selectedLocation?.city,
        state: selectedLocation?.state,
      };
      setSelectedLocation(newLocation);
      setInputValue(newLocation.address);
      setQuery(newLocation.address);
      setSuggestions([]);
      onLocationSelect(newLocation);
    } catch (err) {
      console.error(err);
      handleApiError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectSuggestion = async (placeId: string, description: string) => {
    setQuery(description);
    setInputValue(description);
    setSuggestions([]);
    setIsProcessing(true);
    try {
      const response = await googleService.getDetails(placeId);
      const data = typeof response === "string" ? JSON.parse(response) : response;
      if (data.geometry && data.geometry.location) {
        const lat = data.geometry.location.lat;
        const lng = data.geometry.location.lng;
        
        const newLocation: LocationData = {
          lat,
          lng,
          address: data.formatted_address || description,
          placeId: placeId,
          city: selectedLocation?.city,
          state: selectedLocation?.state,
        };
        setSelectedLocation(newLocation);
        onLocationSelect(newLocation);
        
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(17);
        }
      }
    } catch (err) {
      console.error(err);
      handleApiError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSearch = () => {
    if (!query.trim() || !window.google) return;
    setIsProcessing(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: query }, (results, status) => {
      setIsProcessing(false);
      if (status === "OK" && results && results[0]) {
        const place = results[0];
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const newLocation: LocationData = {
          lat,
          lng,
          address: place.formatted_address,
          placeId: place.place_id,
          city: selectedLocation?.city,
          state: selectedLocation?.state,
        };
        setSelectedLocation(newLocation);
        setInputValue(place.formatted_address);
        setQuery(place.formatted_address);
        setSuggestions([]);
        onLocationSelect(newLocation);
        
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(17);
        }
      } else {
        console.error("Geocode error: ", status);
      }
    });
  };

  return (
    <div className="space-y-4 relative w-full h-full flex flex-col font-sans select-none">
      {/* ── BARRA DE BÚSQUEDA Y AUTOCOMPLETADO ───────────────────────────── */}
      <div className="relative z-20 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl p-2 flex items-center gap-3 shadow-2xs transition-all">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
          <Search className="w-4 h-4" strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0 h-10 relative">
          <input
            type="text"
            placeholder={t("search_placeholder")}
            value={inputValue !== query && query === "" ? inputValue : query}
            onChange={(e) => {
              setInputValue(e.target.value);
              setQuery(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleManualSearch();
              }
            }}
            className="w-full h-full bg-transparent border-none outline-none text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400"
          />
          {/* Autocompletado */}
          <AnimatePresence>
            {suggestions.length > 0 && query.length > 2 && (
              <motion.ul
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 top-full mt-2 w-full z-50 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden max-h-56 overflow-y-auto rounded-xl custom-scrollbar"
              >
                {suggestions.map((sug) => {
                  const placeId = sug.placeId || sug.place_id;
                  if (!placeId) return null;
                  return (
                    <li
                      key={placeId}
                      onClick={() =>
                        handleSelectSuggestion(placeId, sug.description)
                      }
                      className="px-4 py-3 text-xs font-semibold text-gray-900 dark:text-white hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0 flex items-start gap-2.5 transition-colors"
                    >
                      <MapPin
                        className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                        strokeWidth={2}
                      />
                      <span className="leading-relaxed">{sug.description}</span>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── CONTENEDOR DEL MAPA ───────────────────────────────────────────── */}
      <div className="relative h-[420px] w-full rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xs bg-gray-50 dark:bg-[#050505] group transition-colors">
        {/* Alternar Street View / Mapa 2D */}
        <div className="absolute top-4 left-4 z-10">
          <button
            type="button"
            onClick={() => setShowStreetView(!showStreetView)}
            className={cn(
              "h-9 px-4 rounded-xl text-xs font-bold shadow-2xs backdrop-blur-md border transition-all flex items-center gap-2 cursor-pointer",
              showStreetView
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent"
                : "bg-white/90 dark:bg-[#0a0a0a]/90 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#111]"
            )}
          >
            {showStreetView ? (
              <MapIcon className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
            ) : (
              <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            )}
            <span>{showStreetView ? t("btn_2d_map") : t("btn_street_view")}</span>
          </button>
        </div>

        {/* Mapa Interactivo */}
        {!showStreetView && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={17}
            center={
              selectedLocation
                ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
                : { lat: 23.6345, lng: -102.5528 }
            }
            options={dynamicMapOptions}
            onLoad={setMap}
          >
            {selectedLocation && (
              <MarkerF
                position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                draggable={true}
                onDragEnd={(e) =>
                  e.latLng &&
                  updateLocationDetails(e.latLng.lat(), e.latLng.lng())
                }
                animation={google.maps.Animation.DROP}
                icon={{
                  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                  fillColor: "#059669",
                  fillOpacity: 1,
                  strokeWeight: 1.5,
                  strokeColor: "#ffffff",
                  scale: 1.4,
                  anchor: new window.google.maps.Point(12, 24),
                }}
              />
            )}
          </GoogleMap>
        )}

        {/* Street View Panorama */}
        {showStreetView && selectedLocation && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          >
            <StreetViewPanorama
              options={{
                position: {
                  lat: selectedLocation.lat,
                  lng: selectedLocation.lng,
                },
                visible: true,
                disableDefaultUI: true,
                enableCloseButton: false,
                zoom: 1,
              }}
            />
          </GoogleMap>
        )}

        {/* Controles de Zoom Personalizados */}
        {!showStreetView && (
          <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
            <button
              type="button"
              aria-label="Acercar mapa"
              onClick={() => map?.setZoom((map.getZoom() || 15) + 1)}
              className="w-9 h-9 rounded-xl bg-white/90 dark:bg-[#0a0a0a]/90 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-white flex items-center justify-center hover:bg-white dark:hover:bg-[#111] transition-all shadow-2xs cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" strokeWidth={2} />
            </button>

            <button
              type="button"
              aria-label="Alejar mapa"
              onClick={() => map?.setZoom((map.getZoom() || 15) - 1)}
              className="w-9 h-9 rounded-xl bg-white/90 dark:bg-[#0a0a0a]/90 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-white flex items-center justify-center hover:bg-white dark:hover:bg-[#111] transition-all shadow-2xs cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Overlay de Procesamiento */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-30"
            >
              <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {t("processing_address")}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CONFIRMACIÓN DE UBICACIÓN SELECCIONADA ───────────────────────── */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between gap-3 shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2
              className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
              strokeWidth={2.5}
            />
            <p className="text-xs font-bold text-gray-900 dark:text-white">
              {t("location_fixed")}
            </p>
          </div>

          <p className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-900/40">
            {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
          </p>
        </motion.div>
      )}
    </div>
  );
};

// ============================================================================
// 2. ENHANCED LOCATION PICKER (Carga el script de Google Maps)
// ============================================================================
const EnhancedLocationPicker: React.FC<LocationPickerProps> = (props) => {
  const t = useTranslations("MapModal");
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  if (loadError)
    return (
      <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 font-sans">
        <AlertCircle className="w-4 h-4" />
        <span>{t("error_libraries")}</span>
      </div>
    );

  if (!isLoaded) return null;

  return <MapWithAutocomplete {...props} />;
};

// ============================================================================
// 3. MAP LOADING SKELETON (Animación inicial)
// ============================================================================
const MapLoadingSkeleton = () => {
  const t = useTranslations("MapModal");
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingStages = useMemo(
    () => [
      { id: 1, label: t("loading_stage_1"), duration: 1000 },
      { id: 2, label: t("loading_stage_2"), duration: 1500 },
      { id: 3, label: t("loading_stage_3"), duration: 500 },
    ],
    [t]
  );

  useEffect(() => {
    const interval = setInterval(
      () => setProgress((prev) => (prev >= 100 ? 100 : prev + 5)),
      100
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers = loadingStages.map((_, index) => {
      const delay = loadingStages
        .slice(0, index)
        .reduce((acc, s) => acc + s.duration, 0);
      return setTimeout(() => setCurrentStage(index), delay);
    });
    return () => timers.forEach(clearTimeout);
  }, [loadingStages]);

  return (
    <div className="space-y-4 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-72 rounded-3xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 overflow-hidden relative shadow-2xs"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-xs text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
            <MapPin className="w-6 h-6" strokeWidth={2} />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 justify-center">
              <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {loadingStages[currentStage]?.label || t("loading_default")}
              </p>
            </div>
            <p className="text-[11px] font-medium text-gray-400">
              {t("loading_subtext")}
            </p>
          </div>

          <div className="w-full max-w-[200px] h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-2xs">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      <div className="h-11 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center px-4 gap-3 shadow-2xs">
        <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

// ============================================================================
// 4. WRAPPER PRINCIPAL
// ============================================================================
const MapEngine = dynamic(() => Promise.resolve(EnhancedLocationPicker), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
});

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
  className,
}: LocationPickerProps) {
  const t = useTranslations("MapModal");
  const [isMapReady, setIsMapReady] = useState(false);
  const [hasError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMapReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (hasError) {
    return (
      <div
        className={cn(
          "p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-rose-200 dark:border-rose-900/40 text-center space-y-4 shadow-2xs font-sans select-none"
        )}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto shadow-2xs">
          <AlertCircle className="w-6 h-6" strokeWidth={2} />
        </div>

        <div className="space-y-1">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            {t("error_title")}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
            {t("error_desc")}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => window.location.reload()}
          className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer"
        >
          {t("btn_retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("relative group font-sans select-none", className)}>
      <div className="relative z-0">
        <MapEngine
          onLocationSelect={onLocationSelect}
          initialLocation={initialLocation}
        />
      </div>

      <AnimatePresence>
        {isMapReady && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-3 right-3 z-10 pointer-events-none"
          >
            <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 backdrop-blur-md px-3 py-1 text-[10px] font-bold shadow-2xs rounded-full">
              <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={2.5} />
              <span>{t("synced_google")}</span>
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sugerencia de Uso */}
      <div className="mt-3 flex items-start gap-2.5 p-3.5 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 shadow-2xs">
        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl shrink-0 text-emerald-600 dark:text-emerald-400 shadow-2xs">
          <Info className="w-3.5 h-3.5" strokeWidth={2} />
        </div>

        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed pt-0.5">
          <strong className="text-gray-900 dark:text-white font-bold">
            {t("tip_title")}{" "}
          </strong>
          {t("tip_desc")}
        </p>
      </div>
    </div>
  );
}

export type { LocationPickerProps };
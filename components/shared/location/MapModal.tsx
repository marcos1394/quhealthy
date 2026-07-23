"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-event-handler */

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  StreetViewPanorama,
  Autocomplete,
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
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { googleService } from "@/services/google.service";
import { LocationData, LocationPickerProps } from "@/types/location";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { handleApiError } from "@/lib/handleApiError";

const libraries: "places"[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "420px",
};

// ☀️ ESTILO MODO CLARO (Limpio & Clínico)
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
// 1. COMPONENTE INTERNO DEL MAPA (Reactivo al Tema)
// ============================================================================
const MapWithAutocomplete: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
}) => {
  const [
    {
      map,
      selectedLocation,
      inputValue,
      showStreetView,
      isProcessing,
      autocomplete,
    },
    dispatch,
  ] = React.useReducer(
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
        case "SET_AUTOCOMPLETE":
          return {
            ...state,
            autocomplete:
              typeof action.payload === "function"
                ? action.payload(state.autocomplete)
                : action.payload,
          };
        default:
          return state;
      }
    },
    {
      map: null,
      selectedLocation: null,
      inputValue: "",
      showStreetView: false,
      isProcessing: false,
      autocomplete: null,
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
  const setAutocomplete = (val: any) =>
    dispatch({ type: "SET_AUTOCOMPLETE", payload: val });

  const { resolvedTheme } = useTheme();

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
        address: data.formatted_address || "Ubicación seleccionada",
        placeId: placeId || data.place_id,
        city: selectedLocation?.city,
        state: selectedLocation?.state,
      };
      setSelectedLocation(newLocation);
      setInputValue(newLocation.address);
      onLocationSelect(newLocation);
    } catch (err) {
      console.error(err);
      handleApiError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        updateLocationDetails(lat, lng, place.place_id);
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(17);
        }
      }
    }
  };

  return (
    <div className="space-y-4 relative w-full h-full flex flex-col font-sans">
      
      {/* ── BARRA DE BÚSQUEDA Y AUTOCOMPLETADO ───────────────────────────── */}
      <div className="relative z-20 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl p-2 flex items-center gap-3 shadow-sm transition-all">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <Search className="w-4 h-4" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0 h-10">
          <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onPlaceChanged}>
            <input
              type="text"
              placeholder="Busca calle, número, colonia o código postal..."
              defaultValue={inputValue}
              className="w-full h-full bg-transparent border-none outline-none text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </Autocomplete>
        </div>
      </div>

      {/* ── CONTENEDOR DEL MAPA ───────────────────────────────────────────── */}
      <div className="relative h-[420px] w-full rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm bg-gray-50 dark:bg-[#050505] group transition-colors">
        
        {/* Toggle Street View / Mapa */}
        <div className="absolute top-4 left-4 z-10">
          <button
            type="button"
            onClick={() => setShowStreetView(!showStreetView)}
            className={cn(
              "h-9 px-4 rounded-xl text-xs font-bold shadow-sm backdrop-blur-md border transition-all flex items-center gap-2",
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
            <span>{showStreetView ? "Ver Mapa 2D" : "Vista Street View"}</span>
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
              className="w-9 h-9 rounded-xl bg-white/90 dark:bg-[#0a0a0a]/90 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-white flex items-center justify-center hover:bg-white dark:hover:bg-[#111] transition-all shadow-sm"
            >
              <ZoomIn className="w-4 h-4" strokeWidth={2} />
            </button>

            <button
              type="button"
              aria-label="Alejar mapa"
              onClick={() => map?.setZoom((map.getZoom() || 15) - 1)}
              className="w-9 h-9 rounded-xl bg-white/90 dark:bg-[#0a0a0a]/90 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-white flex items-center justify-center hover:bg-white dark:hover:bg-[#111] transition-all shadow-sm"
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
              className="absolute inset-0 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-md flex flex-col items-center justify-center gap-2 z-30"
            >
              <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                Sincronizando dirección geográfica...
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
          className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2
              className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
              strokeWidth={2.5}
            />
            <p className="text-xs font-bold text-gray-900 dark:text-white">
              Ubicación Fijada Correctamente
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
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  if (loadError)
    return (
      <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2 font-sans">
        <AlertCircle className="w-4 h-4" />
        <span>Error al cargar las librerías de Google Maps.</span>
      </div>
    );

  if (!isLoaded) return null;

  return <MapWithAutocomplete {...props} />;
};

// ============================================================================
// 3. MAP LOADING SKELETON (Animación inicial)
// ============================================================================
const loadingStages = [
  { id: 1, label: "Inicializando mapas...", duration: 1000 },
  { id: 2, label: "Sincronizando con Google Maps...", duration: 1500 },
  { id: 3, label: "Preparando vista interactiva...", duration: 500 },
];

const MapLoadingSkeleton = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

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
  }, []);

  return (
    <div className="space-y-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-72 rounded-3xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 overflow-hidden relative shadow-sm"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-xs text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            <MapPin className="w-6 h-6" strokeWidth={2} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center">
              <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {loadingStages[currentStage]?.label || "Cargando mapa..."}
              </p>
            </div>
            <p className="text-[11px] font-medium text-gray-400">
              Estableciendo coordenadas geográficas
            </p>
          </div>

          <div className="w-full max-w-[200px] h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-emerald-600 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      <div className="h-11 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 flex items-center px-4 gap-3 shadow-sm">
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
          "p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-red-200 dark:border-red-900/40 text-center space-y-4 shadow-sm font-sans"
        )}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-500 mx-auto shadow-sm">
          <AlertCircle className="w-6 h-6" strokeWidth={2} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Error de Conexión
          </h3>
          <p className="text-xs font-medium text-gray-500">
            No fue posible establecer conexión con el servicio de mapas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
        >
          Reintentar Carga
        </button>
      </div>
    );
  }

  return (
    <div className={cn("relative group font-sans", className)}>
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
            <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 backdrop-blur-md px-3 py-1 text-[10px] font-bold shadow-sm">
              <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={2.5} />
              <span>Sincronizado con Google</span>
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sugerencia de Uso */}
      <div className="mt-3 flex items-start gap-2.5 p-3 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg shrink-0 text-emerald-600 dark:text-emerald-400">
          <Info className="w-3.5 h-3.5" strokeWidth={2} />
        </div>
        <p className="text-[11px] font-medium text-gray-500 leading-relaxed pt-0.5">
          <strong className="text-gray-900 dark:text-white font-bold">Consejo:</strong> Si tu consultorio o clínica se ubica dentro de una plaza o torre médica, arrastra el marcador rojo exactamente a la puerta de entrada principal.
        </p>
      </div>
    </div>
  );
}

export type { LocationPickerProps };
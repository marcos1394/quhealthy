"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { GoogleMap, useJsApiLoader, MarkerF, StreetViewPanorama } from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Loader2, CheckCircle2, ZoomIn, ZoomOut, 
  Eye, Map as MapIcon, Navigation, AlertCircle, Info 
} from "lucide-react";
import { toast } from "react-toastify";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { googleService } from "@/services/google.service";
import { LocationData, LocationPickerProps } from "@/types/location";

const libraries: ("places")[] = ["places"];

const mapContainerStyle = { 
  width: "100%", 
  height: "100%", 
  borderRadius: "0.75rem", 
  minHeight: "400px" 
};

// ☀️ ESTILO MODO CLARO
const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#333333" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9d5e0" }] },
];

// 🌙 ESTILO MODO OSCURO (Alineado a bg-slate-900)
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
];

// ============================================================================
// 1. COMPONENTE INTERNO DEL MAPA (Reactivo al Tema)
// ============================================================================
const MapWithAutocomplete: React.FC<LocationPickerProps> = ({ onLocationSelect, initialLocation }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showStreetView, setShowStreetView] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🚀 Obtenemos el tema actual de la aplicación
  const { resolvedTheme } = useTheme();

  // 🚀 Calculamos las opciones del mapa dinámicamente
  const dynamicMapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: true,
    clickableIcons: false,
    styles: resolvedTheme === 'dark' ? darkMapStyle : lightMapStyle,
  }), [resolvedTheme]);

  useEffect(() => {
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      setSelectedLocation(initialLocation);
      setInputValue(initialLocation.address || "");
      if (map) { 
        map.panTo({ lat: initialLocation.lat, lng: initialLocation.lng }); 
        map.setZoom(18); 
      }
    }
  }, [initialLocation, map]);

  const updateLocationDetails = async (lat: number, lng: number, placeId?: string) => {
    setIsProcessing(true);
    try {
      const response = await googleService.reverseGeocode(lat, lng);
      const data = typeof response === "string" ? JSON.parse(response) : response;
      const newLocation: LocationData = {
        lat, 
        lng, 
        address: data.formatted_address || "Selected location",
        placeId: placeId || data.place_id, 
        city: selectedLocation?.city, 
        state: selectedLocation?.state
      };
      setSelectedLocation(newLocation); 
      setInputValue(newLocation.address); 
      onLocationSelect(newLocation);
    } catch (err) { 
      console.error(err); 
      toast.error("Error updating location"); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  return (
    <div className="space-y-3 relative w-full h-full flex flex-col">
      {/* Info Bar */}
      <div className="relative z-20 bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm transition-colors">
        <div className="p-1.5 bg-medical-50 dark:bg-medical-500/10 rounded-lg">
          <MapPin className="w-4 h-4 text-medical-600 dark:text-medical-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium tracking-wider">Selected Location</p>
          <p className="text-sm text-slate-900 dark:text-white font-medium truncate">{inputValue || "Loading address..."}</p>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-900 group transition-colors">
        
        {/* Street View Toggle */}
        <div className="absolute top-3 left-3 z-10">
          <Button size="sm" onClick={() => setShowStreetView(!showStreetView)}
            className={cn("shadow-sm backdrop-blur-md border transition-all h-7 text-xs font-medium rounded-lg",
              showStreetView 
                ? "bg-slate-900 dark:bg-white border-slate-800 dark:border-slate-200 text-white dark:text-slate-900" 
                : "bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
            )}>
            {showStreetView ? <MapIcon className="w-3 h-3 mr-1.5" /> : <Eye className="w-3 h-3 mr-1.5" />}
            {showStreetView ? "MAP" : "STREET"}
          </Button>
        </div>

        {/* Google Map */}
        {!showStreetView && (
          <GoogleMap 
            mapContainerStyle={mapContainerStyle} 
            zoom={17}
            center={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : { lat: 19.4326, lng: -99.1332 }}
            options={dynamicMapOptions} // 🚀 OPCIONES DINÁMICAS INYECTADAS AQUÍ
            onLoad={setMap}
          >
            {selectedLocation && (
              <MarkerF 
                position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }} 
                draggable={true}
                onDragEnd={(e) => e.latLng && updateLocationDetails(e.latLng.lat(), e.latLng.lng())}
                animation={google.maps.Animation.DROP} 
              />
            )}
          </GoogleMap>
        )}

        {/* Street View */}
        {showStreetView && selectedLocation && (
          <GoogleMap mapContainerStyle={mapContainerStyle} center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}>
            <StreetViewPanorama options={{ position: { lat: selectedLocation.lat, lng: selectedLocation.lng }, visible: true, disableDefaultUI: true, enableCloseButton: false, zoom: 1 }} />
          </GoogleMap>
        )}

        {/* Zoom Controls */}
        {!showStreetView && (
          <div className="absolute bottom-5 right-5 flex flex-col gap-px z-10">
            <button aria-label="Zoom in" onClick={() => map?.setZoom((map.getZoom() || 15) + 1)}
              className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-t-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button aria-label="Zoom out" onClick={() => map?.setZoom((map.getZoom() || 15) - 1)}
              className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900/90 border-x border-b border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-b-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Processing Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-30">
              <Loader2 className="w-7 h-7 animate-spin text-medical-600 dark:text-medical-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation */}
      {selectedLocation && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          className="bg-medical-50 dark:bg-medical-500/5 border border-medical-200 dark:border-medical-500/20 rounded-lg p-2.5 flex justify-between items-center transition-colors">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-medical-600 dark:text-medical-400" />
            <p className="text-xs text-medical-600 dark:text-medical-400 font-medium">Location Ready</p>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
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
    libraries 
  });
  
  if (loadError) return <div className="p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl transition-colors">Error loading map</div>;
  if (!isLoaded) return null; // El skeleton cubre esta espera en el wrapper principal
  
  return <MapWithAutocomplete {...props} />;
};

// ============================================================================
// 3. MAP LOADING SKELETON (Animación inicial)
// ============================================================================
const loadingStages = [
  { id: 1, label: "Initializing Maps", duration: 1000 },
  { id: 2, label: "Syncing with Google", duration: 1500 },
  { id: 3, label: "Preparing interactive view", duration: 500 }
];

const MapLoadingSkeleton = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setProgress(prev => (prev >= 100 ? 100 : prev + 5)), 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers = loadingStages.map((stage, index) => {
      const delay = loadingStages.slice(0, index).reduce((acc, s) => acc + s.duration, 0);
      return setTimeout(() => setCurrentStage(index), delay);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="space-y-3">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="h-72 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden relative transition-colors">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 bg-white/40 dark:bg-slate-950/40">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="p-4 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-200 dark:border-medical-500/20">
            <MapPin className="w-8 h-8 text-medical-600 dark:text-medical-400" />
          </motion.div>
          <div className="text-center space-y-1">
            <div className="flex items-center gap-2 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-medical-600 dark:text-medical-400" />
              <p className="text-slate-900 dark:text-white text-sm font-medium">{loadingStages[currentStage]?.label || "Loading..."}</p>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-light uppercase tracking-wider">Setting up exact location</p>
          </div>
          <div className="w-full max-w-[180px] h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-medical-600 dark:bg-medical-400" />
          </div>
        </div>
      </motion.div>
      <div className="h-11 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center px-3 gap-2.5">
        <Navigation className="w-4 h-4 text-slate-300 dark:text-slate-600" />
        <div className="w-28 h-2 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

// ============================================================================
// 4. WRAPPER PRINCIPAL (Carga dinámica y UI envolvente)
// ============================================================================
// Usamos dynamic import apuntando al mismo archivo pero forzando que se ejecute en el cliente
const MapEngine = dynamic(() => Promise.resolve(EnhancedLocationPicker), { 
  ssr: false, 
  loading: () => <MapLoadingSkeleton /> 
});

export default function LocationPicker({ onLocationSelect, initialLocation, className }: LocationPickerProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => { 
    const timer = setTimeout(() => setIsMapReady(true), 3500); 
    return () => clearTimeout(timer); 
  }, []);

  if (hasError) {
    return (
      <div className={cn("p-7 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 text-center space-y-3 transition-colors")}>
        <div className="mx-auto w-14 h-14 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-slate-900 dark:text-white font-semibold">Connection Error</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-light">Could not establish connection with Map services.</p>
        </div>
        <button onClick={() => window.location.reload()}
          className="px-5 py-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-lg transition-all">
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className={cn("relative group", className)}>
      <div className="relative z-0">
        <MapEngine onLocationSelect={onLocationSelect} initialLocation={initialLocation} />
      </div>
      
      <AnimatePresence>
        {isMapReady && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute top-3 right-3 z-10 pointer-events-none">
            <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0 backdrop-blur-md px-2.5 py-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3 mr-1" />Synced with Google
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-3 flex items-start gap-2.5 px-1">
        <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex-shrink-0">
          <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-light italic">
          <strong className="font-medium">Pro Tip:</strong> If your office is inside a plaza or medical tower, move the red marker exactly to the local or main entrance to better guide your patients.
        </div>
      </div>
    </div>
  );
}

export type { LocationPickerProps };
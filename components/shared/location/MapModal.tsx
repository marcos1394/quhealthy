"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, StreetViewPanorama } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Loader2, CheckCircle2, X, Navigation,
  Crosshair, ZoomIn, ZoomOut, Info, AlertCircle, Sparkles, Eye, Map as MapIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { googleService } from '@/services/google.service';
import { LocationData, LocationPickerProps } from '@/types/location';

const libraries: ("places")[] = ["places"];

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '1.5rem' };

// Estilos oscuros para el mapa
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  clickableIcons: false, // Evita clics en negocios ajenos
  styles: [
    { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d2d2d" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    // Ocultamos negocios irrelevantes para limpiar el mapa
    { featureType: "poi.business", stylers: [{ visibility: "off" }] },
    { featureType: "poi.medical", stylers: [{ visibility: "on" }] }, // Solo mostramos médicos
  ],
};

const MapWithAutocomplete: React.FC<LocationPickerProps> = ({ 
  onLocationSelect,
  initialLocation 
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  // Estado principal de la ubicación
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  
  // Estado para la búsqueda
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estado para Street View
  const [showStreetView, setShowStreetView] = useState(false);

  // ✅ EFECTO CRÍTICO: Sincronizar datos del Padre (Paso 1) con el Mapa (Paso 3)
  useEffect(() => {
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      console.log("📍 Inicializando mapa con:", initialLocation);
      setSelectedLocation(initialLocation);
      setInputValue(initialLocation.address || "");
      
      // Si el mapa ya cargó, nos movemos ahí
      if (map) {
        map.panTo({ lat: initialLocation.lat, lng: initialLocation.lng });
        map.setZoom(18); // Zoom profundo para ver el edificio
      }
    }
  }, [initialLocation, map]);

  // --- LÓGICA DE ACTUALIZACIÓN ---
  const updateLocationDetails = async (lat: number, lng: number, placeId?: string) => {
    setIsProcessing(true);
    try {
      const response = await googleService.reverseGeocode(lat, lng);
      const data = typeof response === 'string' ? JSON.parse(response) : response;

      const newLocation: LocationData = {
        lat,
        lng,
        address: data.formatted_address || "Ubicación seleccionada",
        placeId: placeId || data.place_id,
      };

      setSelectedLocation(newLocation);
      setInputValue(newLocation.address);
      onLocationSelect(newLocation); // Notificamos al padre
    } catch (error) {
      toast.error("Error al actualizar ubicación");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- HANDLERS ---
  const handleSelectPrediction = async (placeId: string) => {
    setShowSuggestions(false);
    setIsProcessing(true);
    try {
      const details = await googleService.getDetails(placeId);
      const data = typeof details === 'string' ? JSON.parse(details) : details;
      
      const { lat, lng } = data.geometry.location;
      
      // Actualizamos mapa y datos
      map?.panTo({ lat, lng });
      map?.setZoom(18);
      updateLocationDetails(lat, lng, placeId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 relative h-full">
      
      {/* 1. Buscador (Solo si quiere cambiar lo del Paso 1) */}
      <div className="relative z-20">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
          <input
            value={inputValue}
            onChange={(e) => {
                setInputValue(e.target.value);
                // Aquí podrías reconectar el autocomplete si deseas búsqueda en este paso
            }}
            placeholder="Dirección confirmada..."
            className="w-full pl-12 pr-12 py-3 rounded-2xl border bg-gray-950 border-gray-700 text-gray-300 focus:text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-lg"
          />
        </div>
      </div>

      {/* 2. Contenedor Principal (Mapa + Street View) */}
      <div className="relative h-[400px] w-full rounded-3xl overflow-hidden border-2 border-gray-700 shadow-2xl bg-gray-900 group">
        
        {/* Toggle Street View */}
        <div className="absolute top-4 left-4 z-10">
            <Button 
                size="sm" 
                onClick={() => setShowStreetView(!showStreetView)}
                className={cn(
                    "shadow-lg backdrop-blur-md border transition-all",
                    showStreetView 
                        ? "bg-purple-600 border-purple-500 text-white" 
                        : "bg-gray-900/80 border-gray-600 text-gray-300 hover:bg-gray-800"
                )}
            >
                {showStreetView ? <MapIcon className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showStreetView ? "Ver Mapa" : "Ver Fachada"}
            </Button>
        </div>

        {/* Google Map */}
        {!showStreetView && (
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={17}
                center={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : { lat: 19.4326, lng: -99.1332 }}
                options={mapOptions}
                onLoad={setMap}
                onClick={(e) => e.latLng && updateLocationDetails(e.latLng.lat(), e.latLng.lng())}
            >
            {/* EL PIN VISIBLE */}
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
    disableDefaultUI: true,
    enableCloseButton: false,
    visible: true,
  }}
/>


            </GoogleMap>
        )}

        {/* Controles de Zoom (Solo en modo mapa) */}
        {!showStreetView && (
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <Button size="default" className="bg-gray-900/90 border border-gray-600 hover:bg-gray-800" onClick={() => map?.setZoom((map.getZoom() || 10) + 1)}><ZoomIn className="w-4 h-4" /></Button>
            <Button size="default" className="bg-gray-900/90 border border-gray-600 hover:bg-gray-800" onClick={() => map?.setZoom((map.getZoom() || 10) - 1)}><ZoomOut className="w-4 h-4" /></Button>
            </div>
        )}

        {/* Overlay de Carga */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-30">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
              <p className="text-white text-xs font-bold mt-4">Actualizando...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Confirmación Visual */}
      {selectedLocation && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
          <div>
            <p className="text-xs text-emerald-400 font-bold uppercase mb-1">Ubicación Confirmada</p>
            <p className="text-sm text-gray-300">{selectedLocation.address}</p>
            <p className="text-[10px] text-gray-500 mt-1 font-mono">
                Lat: {selectedLocation.lat.toFixed(5)} • Lng: {selectedLocation.lng.toFixed(5)}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Exportación Default (IMPORTANTE para Next.js Dynamic Imports)
const EnhancedLocationPicker: React.FC<LocationPickerProps> = (props) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '', // ⚠️ Asegúrate que coincida con Vercel
    libraries,
  });

  if (loadError) return <div className="text-red-400 text-sm p-4 bg-red-900/20 rounded-xl">Error cargando Google Maps</div>;
  if (!isLoaded) return null; // El esqueleto en el padre manejará la carga visual

  return <MapWithAutocomplete {...props} />;
};

export default EnhancedLocationPicker;
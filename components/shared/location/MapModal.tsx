"use client";

import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, StreetViewPanorama } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Loader2, CheckCircle2, 
  ZoomIn, ZoomOut, Eye, Map as MapIcon, 
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { googleService } from '@/services/google.service';
import { LocationData, LocationPickerProps } from '@/types/location';

const libraries: ("places")[] = ["places"];

// ✅ FIX 1: Forzamos la altura aquí también por seguridad, aunque el CSS lo maneje
const mapContainerStyle = { 
  width: '100%', 
  height: '100%', 
  borderRadius: '1rem',
  minHeight: '400px' // Asegura que nunca colapse a 0
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  clickableIcons: false,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.business", stylers: [{ visibility: "off" }] },
    { featureType: "poi.medical", stylers: [{ visibility: "on" }, { color: "#e11d48" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  ],
};

const MapWithAutocomplete: React.FC<LocationPickerProps> = ({ 
  onLocationSelect,
  initialLocation 
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showStreetView, setShowStreetView] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sincronización Inicial
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

  // Actualización de Ubicación (Drag Marker)
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
        city: selectedLocation?.city,
        state: selectedLocation?.state
      };

      setSelectedLocation(newLocation);
      setInputValue(newLocation.address);
      onLocationSelect(newLocation);
    } catch (error) {
      console.error(error);
      toast.error("Error actualizando ubicación");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    // ✅ FIX 2: Quitamos 'h-full' relativo y usamos 'min-h-[450px]' en el contenedor padre
    <div className="space-y-4 relative w-full h-full flex flex-col">
      
      {/* Barra Informativa */}
      <div className="relative z-20 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl p-3 flex items-center gap-3 shadow-lg">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <MapPin className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Ubicación Seleccionada</p>
          <p className="text-sm text-white font-medium truncate">
            {inputValue || "Cargando dirección..."}
          </p>
        </div>
      </div>

      {/* Contenedor del Mapa */}
      {/* ✅ FIX 3: IMPORTANTE - Cambiamos 'min-h' por 'h-[400px]' fijo o 'flex-1' si el padre tiene altura definida */}
      {/* Al poner h-[400px] forzamos al navegador a reservar el espacio exacto para el canvas del mapa */}
      <div className="relative h-[400px] w-full rounded-2xl overflow-hidden border-2 border-gray-700 shadow-2xl bg-gray-900 group">
        
        {/* Toggle Street View */}
        <div className="absolute top-4 left-4 z-10">
            <Button 
                size="sm" 
                onClick={() => setShowStreetView(!showStreetView)}
                className={cn(
                    "shadow-lg backdrop-blur-md border transition-all h-8 text-xs font-bold",
                    showStreetView 
                        ? "bg-purple-600 border-purple-500 text-white" 
                        : "bg-gray-900/90 border-gray-600 text-gray-300 hover:bg-gray-800"
                )}
            >
                {showStreetView ? <MapIcon className="w-3 h-3 mr-2" /> : <Eye className="w-3 h-3 mr-2" />}
                {showStreetView ? "MAPA" : "FACHADA"}
            </Button>
        </div>

        {/* --- MAPA DE GOOGLE --- */}
        {!showStreetView && (
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={17}
                // Coordenadas default (Centro CDMX) si no hay initialLocation
                center={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : { lat: 19.4326, lng: -99.1332 }}
                options={mapOptions}
                onLoad={setMap}
            >
            {/* Marcador Arrastrable */}
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

        {/* --- STREET VIEW --- */}
        {showStreetView && selectedLocation && (
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            >
              <StreetViewPanorama
                options={{
                position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
                visible:true,
                    disableDefaultUI: true,
                    enableCloseButton: false,
                    zoom: 1,
                }}
              />
            </GoogleMap>
        )}

        {/* Controles de Zoom */}
        {!showStreetView && (
            <div className="absolute bottom-6 right-6 flex flex-col gap-1 z-10">
                <button onClick={() => map?.setZoom((map.getZoom() || 15) + 1)} className="w-8 h-8 flex items-center justify-center bg-gray-900/90 border border-gray-600 text-white rounded-t-lg hover:bg-gray-800"><ZoomIn className="w-4 h-4" /></button>
                <button onClick={() => map?.setZoom((map.getZoom() || 15) - 1)} className="w-8 h-8 flex items-center justify-center bg-gray-900/90 border-x border-b border-gray-600 text-white rounded-b-lg hover:bg-gray-800"><ZoomOut className="w-4 h-4" /></button>
            </div>
        )}

        {/* Overlay de Carga */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-30">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmación Visual */}
      {selectedLocation && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-emerald-300 font-bold">Ubicación Lista</p>
          </div>
          <p className="text-[10px] text-gray-400 font-mono">
            {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
          </p>
        </motion.div>
      )}
    </div>
  );
};

const EnhancedLocationPicker: React.FC<LocationPickerProps> = (props) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  if (loadError) return <div className="p-4 text-red-400 bg-red-900/20 border border-red-900 rounded-xl">Error cargando mapa</div>;
  if (!isLoaded) return null;

  return <MapWithAutocomplete {...props} />;
};

export default EnhancedLocationPicker;
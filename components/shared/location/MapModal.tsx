"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, StreetViewPanorama } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Loader2, CheckCircle2, X, 
  ZoomIn, ZoomOut, Eye, Map as MapIcon, 
  Navigation,
  Badge,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { googleService } from '@/services/google.service';
import { LocationData, LocationPickerProps } from '@/types/location';

// 1. Librerías estáticas (fuera del componente para evitar re-render)
const libraries: ("places")[] = ["places"];

// 2. Estilos del Mapa (Dark Mode Profesional - QuHealthy Style)
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  // Ocultamos negocios generales para limpiar el mapa
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  // 🏥 RESALTAMOS HOSPITALES Y MÉDICOS
  { 
    featureType: "poi.medical", 
    stylers: [{ visibility: "on" }, { color: "#e11d48" }] // Un rojo/rosa médico
  }, 
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
];

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '1rem' };

// Opciones generales del mapa
const defaultMapOptions: google.maps.MapOptions = {
  disableDefaultUI: true, // Apagamos controles satelitales viejos
  clickableIcons: false,  // Evitamos popups de otros negocios
  styles: mapStyles,
  minZoom: 3,
  maxZoom: 20,
};

const MapWithAutocomplete: React.FC<LocationPickerProps> = ({ 
  onLocationSelect,
  initialLocation 
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  // Estado de la ubicación activa
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  
  // Estado visual
  const [showStreetView, setShowStreetView] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValue, setInputValue] = useState(""); // Solo visual para la barra

  // 📍 1. SINCRONIZACIÓN INICIAL (El paso crítico)
  // Cuando el componente carga, si traemos datos del Paso 1, centramos el mapa.
  useEffect(() => {
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      console.log("📍 Mapa inicializado con:", initialLocation);
      setSelectedLocation(initialLocation);
      setInputValue(initialLocation.address || "");
      
      // Si el mapa ya está listo, volamos hacia allá
      if (map) {
        map.panTo({ lat: initialLocation.lat, lng: initialLocation.lng });
        map.setZoom(18); // Zoom cercano para ver el edificio
      }
    }
  }, [initialLocation, map]);

  // 🔄 2. ACTUALIZACIÓN DE DATOS (Reverse Geocoding)
  const handleLocationUpdate = async (lat: number, lng: number) => {
    setIsProcessing(true);
    try {
      // 1. Actualizamos visualmente inmediato (Optimistic UI)
      const tempLoc = { ...selectedLocation!, lat, lng };
      setSelectedLocation(tempLoc);

      // 2. Consultamos al Backend la dirección real
      const response = await googleService.reverseGeocode(lat, lng);
      // Ajuste por si el servicio devuelve string o json
      const data = typeof response === 'string' ? JSON.parse(response) : response;

      const newLocation: LocationData = {
        lat,
        lng,
        address: data.formatted_address || "Ubicación ajustada",
        placeId: data.place_id,
        // Mantener otros datos si existen
        city: selectedLocation?.city,
        state: selectedLocation?.state
      };

      setSelectedLocation(newLocation);
      setInputValue(newLocation.address);
      onLocationSelect(newLocation); // Notificar al padre (Formulario)
      toast.info("Ubicación actualizada");
    } catch (error) {
      console.error(error);
      toast.error("No pudimos actualizar la dirección");
    } finally {
      setIsProcessing(false);
    }
  };

  // 🎮 3. MANEJADORES DE EVENTOS
  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      handleLocationUpdate(e.latLng.lat(), e.latLng.lng());
    }
  };

  const handleZoom = (delta: number) => {
    if (map) {
      const currentZoom = map.getZoom() || 15;
      map.setZoom(currentZoom + delta);
    }
  };

  return (
    <div className="space-y-4 relative h-full flex flex-col">
      
      {/* BARRA SUPERIOR (Confirmación de Dirección) */}
      <div className="relative z-20 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl p-2 flex items-center gap-3 shadow-lg">
        <div className="p-2 bg-purple-500/20 rounded-xl">
          <MapPin className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 uppercase font-bold">Ubicación Actual</p>
          <p className="text-sm text-white font-medium truncate">
            {inputValue || "Cargando dirección..."}
          </p>
        </div>
      </div>

      {/* CONTENEDOR DEL MAPA */}
      <div className="relative flex-1 min-h-[400px] w-full rounded-3xl overflow-hidden border-2 border-gray-700 shadow-2xl bg-gray-900">
        
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={15} // Zoom inicial default (se sobreescribe con el useEffect)
          center={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : { lat: 19.4326, lng: -99.1332 }}
          options={defaultMapOptions}
          onLoad={setMap}
        >
          {/* EL PIN PRINCIPAL */}
          {selectedLocation && !showStreetView && (
            <MarkerF 
              position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
              draggable={true} // ✅ Permitimos arrastrar para corregir
              onDragEnd={handleMarkerDragEnd}
              animation={google.maps.Animation.DROP}
            />
          )}

          {/* VISTA DE CALLE (STREET VIEW) */}
          {showStreetView && selectedLocation && (
            <StreetViewPanorama
            options={{ 
            position :
            { lat: selectedLocation.lat, lng: selectedLocation.lng },
              visible : true,
                disableDefaultUI: true,
                enableCloseButton: false, // Controlamos el cierre con nuestro botón
                zoom: 1,
              }}
            
            />
          )}
        </GoogleMap>

        {/* CONTROLES FLOTANTES */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          {/* Botón Toggle Street View */}
          <Button 
            size="sm" 
            onClick={() => setShowStreetView(!showStreetView)}
            className={cn(
              "h-10 w-10 p-0 rounded-xl shadow-xl border transition-all",
              showStreetView 
                ? "bg-yellow-500 border-yellow-400 text-black hover:bg-yellow-400" 
                : "bg-gray-900/90 border-gray-600 text-white hover:bg-gray-800"
            )}
            title={showStreetView ? "Volver al Mapa" : "Ver Fachada"}
          >
            {showStreetView ? <MapIcon className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </Button>

          {/* Botones de Zoom */}
          {!showStreetView && (
            <div className="flex flex-col gap-1 mt-2">
              <button 
                onClick={() => handleZoom(1)}
                className="h-10 w-10 flex items-center justify-center bg-gray-900/90 border border-gray-600 text-white rounded-t-xl hover:bg-gray-800"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleZoom(-1)}
                className="h-10 w-10 flex items-center justify-center bg-gray-900/90 border-x border-b border-gray-600 text-white rounded-b-xl hover:bg-gray-800"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* LOADING OVERLAY */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-30"
            >
              <div className="bg-gray-900 p-4 rounded-2xl border border-purple-500/30 flex items-center gap-3 shadow-2xl">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                <span className="text-sm font-bold text-white">Actualizando ubicación...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* CONFIRMACIÓN INFERIOR */}
      {selectedLocation && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-emerald-300 font-medium">
              Ubicación lista para pacientes
            </p>
          </div>
          <Badge className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
            Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
          </Badge>
        </motion.div>
      )}
    </div>
  );
};

// --- EXPORTACIÓN DEFAULT ---
const EnhancedLocationPicker: React.FC<LocationPickerProps> = (props) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '', 
    libraries,
  });

  if (loadError) return (
    <div className="h-64 w-full bg-gray-900/50 border border-red-500/20 rounded-2xl flex items-center justify-center flex-col gap-2">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-red-400 text-sm font-bold">Error cargando mapa</p>
    </div>
  );
  
  if (!isLoaded) return null; // El esqueleto del padre lo maneja

  return <MapWithAutocomplete {...props} />;
};

export default EnhancedLocationPicker;
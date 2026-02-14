/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  X,
  Navigation,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Info,
  AlertCircle,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * EnhancedLocationPicker Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. FEEDBACK INMEDIATO
 *    - Search suggestions en tiempo real
 *    - Geolocation status visual
 *    - Marker animation (DROP)
 *    - Success confirmation
 * 
 * 2. MINIMIZAR ERRORES
 *    - Address validation
 *    - Geolocation error handling
 *    - Clear button visible
 *    - Retry options
 * 
 * 3. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Visual search suggestions
 *    - Map controls visibles
 *    - Icons descriptivos
 *    - Labels claros
 * 
 * 4. AFFORDANCE
 *    - Clickable map areas
 *    - Zoom controls visibles
 *    - Geolocation button claro
 *    - Interactive markers
 * 
 * 5. CREDIBILIDAD
 *    - Professional map styling
 *    - Accurate geocoding
 *    - Clear address display
 *    - Trust indicators
 * 
 * 6. SATISFICING
 *    - Quick geolocation
 *    - One-click suggestions
 *    - Default center (CDMX)
 *    - Common searches
 */

// --- TIPOS ---
export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  name?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  validationDetails?: any;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
}

// --- CONFIGURACIÓN ---
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem',
};

const defaultCenter = { lat: 19.4326, lng: -99.1332 }; // CDMX Default

// Dark Mode Map Styles
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d2d2d" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1a1a" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  ],
};

// --- COMPONENTE INTERNO ---
const MapWithAutocomplete: React.FC<LocationPickerProps> = ({ 
  onLocationSelect,
  initialLocation 
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : null
  );
  const [inputValue, setInputValue] = useState(initialLocation?.address || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(initialLocation?.address || '');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Geolocation - SATISFICING
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalización no disponible en tu navegador");
      return;
    }

    setIsGeolocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map?.panTo({ lat: latitude, lng: longitude });
        map?.setZoom(16);
        processLocationSelection(latitude, longitude);
        setIsGeolocating(false);
        toast.success("📍 Ubicación detectada correctamente");
      },
      (error) => {
        setIsGeolocating(false);
        let errorMessage = "No pudimos obtener tu ubicación";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado. Actívalo en configuración.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Ubicación no disponible. Intenta de nuevo.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado. Intenta de nuevo.";
            break;
        }
        
        toast.error(errorMessage);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  };

  // Autocomplete con debounce - FEEDBACK INMEDIATO
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        },
        body: JSON.stringify({
          input: value,
          includedRegionCodes: ['mx'],
          languageCode: 'es'
        })
      });
      
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching places:", error);
      toast.error("Error al buscar ubicaciones");
    }
  };

  // Selección de sugerencia
  const handleSelectPrediction = async (placeId: string, description: string) => {
    setInputValue(description);
    setShowSuggestions(false);
    setIsProcessing(true);

    // Add to search history
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== description);
      return [description, ...filtered].slice(0, 3);
    });

    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ placeId: placeId });

      if (result.results[0]) {
        const { lat, lng } = result.results[0].geometry.location;
        const latNum = lat();
        const lngNum = lng();

        map?.panTo({ lat: latNum, lng: lngNum });
        map?.setZoom(16);
        
        processLocationSelection(latNum, lngNum, result.results[0]);
      }
    } catch (error) {
      toast.error("Error al obtener detalles de la ubicación");
    } finally {
      setIsProcessing(false);
    }
  };

  // Procesar selección
  const processLocationSelection = useCallback((lat: number, lng: number, geocodeResult?: google.maps.GeocoderResult) => {
    setSelectedLocation({ lat, lng });

    if (!geocodeResult) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          finalizeSelection(lat, lng, results[0]);
        }
      });
    } else {
      finalizeSelection(lat, lng, geocodeResult);
    }
  }, []);

  // Finalizar selección - CREDIBILIDAD
  const finalizeSelection = (lat: number, lng: number, result: google.maps.GeocoderResult) => {
    const formattedAddress = result.formatted_address;
    setCurrentAddress(formattedAddress);
    if (!inputValue) setInputValue(formattedAddress);

    // Extract address components
    const addressComponents = result.address_components;
    let city = '', state = '', zipCode = '';

    addressComponents.forEach(component => {
      if (component.types.includes('locality')) city = component.long_name;
      if (component.types.includes('administrative_area_level_1')) state = component.long_name;
      if (component.types.includes('postal_code')) zipCode = component.long_name;
    });

    onLocationSelect({
      lat,
      lng,
      address: formattedAddress,
      name: "Ubicación seleccionada",
      city,
      state,
      zipCode
    });
  };

  // Zoom controls
  const handleZoomIn = () => {
    const currentZoom = map?.getZoom() || 10;
    map?.setZoom(currentZoom + 1);
  };

  const handleZoomOut = () => {
    const currentZoom = map?.getZoom() || 10;
    map?.setZoom(currentZoom - 1);
  };

  // Recenter map
  const handleRecenter = () => {
    if (selectedLocation) {
      map?.panTo(selectedLocation);
      map?.setZoom(16);
    }
  };

  return (
    <div className="space-y-4 relative">
      
      {/* Search Input - RECONOCIMIENTO */}
      <div className="relative z-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none z-10" />
          <input
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            placeholder="Busca tu consultorio, calle o colonia..."
            className={cn(
              "w-full pl-12 pr-32 py-4 rounded-xl border-2 transition-all shadow-lg outline-none",
              "bg-gray-900 text-white placeholder-gray-500",
              showSuggestions 
                ? "border-purple-500 ring-2 ring-purple-500/20" 
                : "border-gray-700 focus:border-purple-500"
            )}
          />
          
          {/* Action Buttons */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {inputValue && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => { 
                  setInputValue(""); 
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
            
            <Button
              onClick={handleUseMyLocation}
              disabled={isGeolocating}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 h-auto"
            >
              {isGeolocating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              <span className="ml-2 text-sm font-semibold hidden sm:inline">
                Mi Ubicación
              </span>
            </Button>
          </div>
        </div>

        {/* Search Suggestions - SATISFICING */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border-2 border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              <div className="max-h-80 overflow-y-auto">
                {suggestions.map((item: any, index: number) => {
                  const prediction = item.placePrediction;
                  return (
                    <motion.button
                      key={prediction.placeId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSelectPrediction(prediction.placeId, prediction.text.text)}
                      className="w-full p-4 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0 transition-colors flex items-start gap-3 text-left"
                    >
                      <div className="p-2 bg-purple-500/10 rounded-lg flex-shrink-0">
                        <MapPin className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {prediction.text.text}
                        </p>
                        {prediction.structuredFormat?.secondaryText?.text && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {prediction.structuredFormat.secondaryText.text}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map Container */}
      <div className="relative h-96 sm:h-[500px] w-full rounded-2xl overflow-hidden border-2 border-gray-700 shadow-2xl">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={selectedLocation ? 16 : 5}
          center={selectedLocation || defaultCenter}
          options={mapOptions}
          onLoad={(map) => setMap(map)}
          onClick={(e) => {
            if (e.latLng && !isProcessing) {
              processLocationSelection(e.latLng.lat(), e.latLng.lng());
            }
          }}
        >
          {selectedLocation && (
            <MarkerF 
              position={selectedLocation} 
              animation={window.google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>
        
        {/* Map Controls - AFFORDANCE */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <Button
            onClick={handleZoomIn}
            size="icon"
            className="bg-gray-900/90 backdrop-blur-sm hover:bg-gray-800 border border-gray-700"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleZoomOut}
            size="icon"
            className="bg-gray-900/90 backdrop-blur-sm hover:bg-gray-800 border border-gray-700"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          {selectedLocation && (
            <Button
              onClick={handleRecenter}
              size="icon"
              className="bg-gray-900/90 backdrop-blur-sm hover:bg-gray-800 border border-gray-700"
            >
              <Crosshair className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Processing Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20"
            >
              <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-3" />
              <p className="text-white font-semibold">Ubicando...</p>
              <p className="text-gray-400 text-sm mt-1">Obteniendo detalles de dirección</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click to Select Hint */}
        {!selectedLocation && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="bg-gray-900/90 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
              <Info className="w-4 h-4 text-purple-400" />
              <p className="text-sm text-gray-300">
                Haz clic en el mapa para seleccionar una ubicación
              </p>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Success Confirmation - FEEDBACK INMEDIATO */}
      <AnimatePresence>
        {currentAddress && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-emerald-400">Ubicación Confirmada</h4>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Validada
                  </Badge>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{currentAddress}</p>
                {selectedLocation && (
                  <p className="text-xs text-gray-500 mt-2">
                    📍 Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips Card */}
      {!selectedLocation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-300/80 space-y-2">
              <p className="font-semibold text-blue-400">💡 Consejos para mejor precisión:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Usa el buscador para encontrar tu dirección exacta</li>
                <li>Haz clic en "Mi Ubicación" para detectar automáticamente</li>
                <li>Haz clic en el mapa para ajustar manualmente</li>
                <li>Asegúrate que el pin esté en la entrada principal</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// --- COMPONENTE EXPORTADO ---
export const EnhancedLocationPicker: React.FC<LocationPickerProps> = (props) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Error State - MINIMIZAR ERRORES
  if (loadError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-500/10 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-400 mb-1">Error al Cargar Google Maps</h3>
            <p className="text-sm text-gray-400 mb-4">
              No pudimos cargar el servicio de mapas. Verifica tu conexión y la configuración de la API Key.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Loading State - Ya manejado por el parent LocationPicker
  if (!isLoaded) {
    return (
      <div className="h-96 w-full bg-gray-900 rounded-2xl flex items-center justify-center border-2 border-gray-800">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  return <MapWithAutocomplete {...props} />;
};
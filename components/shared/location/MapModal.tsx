"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Loader2, CheckCircle2, X, Navigation,
  Crosshair, ZoomIn, ZoomOut, Info, AlertCircle, Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { googleService } from '@/services/google.service';
import { LocationData, LocationPickerProps } from '@/types/location';

const libraries: ("places")[] = ["places"];

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '1.5rem' };

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d2d2d" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  ],
};

const MapWithAutocomplete: React.FC<LocationPickerProps> = ({ 
  onLocationSelect,
  initialLocation 
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation || null);
  const [inputValue, setInputValue] = useState(initialLocation?.address || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);


  const updateLocationDetails = async (lat: number, lng: number, placeId?: string) => {
    setIsProcessing(true);
    try {
      // Llamamos a nuestro backend de Java para Geocoding Inverso
      const response = await googleService.reverseGeocode(lat, lng);
      const data = typeof response === 'string' ? JSON.parse(response) : response;

      const newLocation: LocationData = {
        lat,
        lng,
        address: data.formatted_address || "Dirección seleccionada",
        placeId: placeId || data.place_id,
      };

      setSelectedLocation(newLocation);
      setInputValue(newLocation.address);
      onLocationSelect(newLocation);
    } catch (error) {
      toast.error("No pudimos obtener los detalles de esta ubicación");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- HANDLERS ---

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.length < 3) return setSuggestions([]);

    try {
      // Usamos el backend para el autocomplete (Seguro)
      const data = await googleService.autocomplete(value);
      setSuggestions(typeof data === 'string' ? JSON.parse(data) : data);
      setShowSuggestions(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectPrediction = async (placeId: string) => {
    setShowSuggestions(false);
    setIsProcessing(true);
    try {
      const details = await googleService.getDetails(placeId);
      const data = typeof details === 'string' ? JSON.parse(details) : details;
      
      const { lat, lng } = data.geometry.location;
      map?.panTo({ lat, lng });
      map?.setZoom(17);
      
      updateLocationDetails(lat, lng, placeId);
    } catch (error) {
      toast.error("Error al cargar detalles del lugar");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      updateLocationDetails(e.latLng.lat(), e.latLng.lng());
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Buscador Superior */}
      <div className="relative z-20">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
          <input
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Escribe tu calle, colonia o busca tu consultorio..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 bg-gray-900 text-white border-gray-700 focus:border-purple-500 outline-none transition-all shadow-2xl"
          />
          {inputValue && (
            <button onClick={() => setInputValue("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sugerencias */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border-2 border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
              {suggestions.map((item: any) => (
                <button key={item.placeId} onClick={() => handleSelectPrediction(item.placeId)}
                  className="w-full p-4 hover:bg-gray-800 border-b border-gray-800 last:border-0 text-left flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">{item.structuredFormatting?.mainText}</p>
                    <p className="text-[10px] text-gray-500">{item.structuredFormatting?.secondaryText}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contenedor del Mapa */}
      <div className="relative h-[450px] w-full rounded-3xl overflow-hidden border-2 border-gray-800 shadow-2xl bg-gray-900">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={selectedLocation ? 17 : 5}
          center={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : { lat: 19.4326, lng: -99.1332 }}
          options={mapOptions}
          onLoad={setMap}
          onClick={(e) => e.latLng && updateLocationDetails(e.latLng.lat(), e.latLng.lng())}
        >
          {selectedLocation && (
            <MarkerF 
              position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }} 
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
              animation={google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>

        {/* Controles Flotantes */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2">
          <Button size="default" className="bg-gray-900/90 border border-gray-700" onClick={() => map?.setZoom((map.getZoom() || 10) + 1)}><ZoomIn className="w-4 h-4" /></Button>
          <Button size="default" className="bg-gray-900/90 border border-gray-700" onClick={() => map?.setZoom((map.getZoom() || 10) - 1)}><ZoomOut className="w-4 h-4" /></Button>
        </div>

        {/* Overlay de Carga */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-30">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
              <p className="text-white text-xs font-bold mt-4 tracking-widest uppercase">Actualizando Dirección...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dirección Confirmada */}
      {selectedLocation && !isProcessing && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-2 bg-emerald-500/20 rounded-xl"><CheckCircle2 className="w-6 h-6 text-emerald-400" /></div>
          <div>
            <p className="text-[10px] text-emerald-500 uppercase font-black tracking-tighter">Ubicación para pacientes</p>
            <p className="text-sm text-gray-200 font-medium leading-tight">{selectedLocation.address}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export const EnhancedLocationPicker: React.FC<LocationPickerProps> = (props) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  if (!isLoaded) return null;
  return <MapWithAutocomplete {...props} />;
};
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Search, MapPin, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'react-toastify';

// --- TIPOS ---
export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  name?: string;
  validationDetails?: any;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
}

// --- CONFIGURACIÓN ---
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem',
};

const defaultCenter = { lat: 19.4326, lng: -99.1332 }; // CDMX Default

// Estilo Oscuro (Dark Mode)
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
  ],
};

// --- COMPONENTE INTERNO (Lógica del Mapa) ---
const MapWithAutocomplete: React.FC<LocationPickerProps> = ({ onLocationSelect }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');

  // 1. Autocomplete (Nueva API Places)
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      // Nota: Asegúrate de tener NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tu .env
      const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        },
        body: JSON.stringify({
          input: value,
          includedRegionCodes: ['mx'], // México
        })
      });
      
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  // 2. Procesar Selección
  const handleSelectPrediction = async (placeId: string, description: string) => {
    setInputValue(description);
    setShowSuggestions(false);
    setIsProcessing(true);

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
      toast.error("Error al obtener detalles.");
    } finally {
      setIsProcessing(false);
    }
  };

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
  }, [onLocationSelect]);

  const finalizeSelection = (lat: number, lng: number, result: google.maps.GeocoderResult) => {
    const formattedAddress = result.formatted_address;
    setCurrentAddress(formattedAddress);
    if (!inputValue) setInputValue(formattedAddress);

    onLocationSelect({
      lat,
      lng,
      address: formattedAddress,
      name: "Ubicación seleccionada",
    });
  };

  return (
    <div className="space-y-4 relative">
      <div className="relative z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
          <input
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Busca tu consultorio, calle o colonia..."
            className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-900 border-2 border-gray-700 focus:border-purple-500 text-white placeholder-gray-500 transition-all shadow-lg outline-none"
          />
           {inputValue && (
            <button 
                onClick={() => { setInputValue(""); setSuggestions([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
            >
                <X className="w-4 h-4"/>
            </button>
          )}
        </div>

        {/* Sugerencias */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
            {suggestions.map((item: any) => {
               const prediction = item.placePrediction;
               return (
                <li
                  key={prediction.placeId}
                  onClick={() => handleSelectPrediction(prediction.placeId, prediction.text.text)}
                  className="p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0 transition-colors flex items-start gap-3"
                >
                  <MapPin className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{prediction.text.text}</p>
                      <p className="text-xs text-gray-400 truncate">{prediction.structuredFormat?.secondaryText?.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="h-80 w-full rounded-xl overflow-hidden border-2 border-gray-700 shadow-inner relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={5}
          center={defaultCenter}
          options={mapOptions}
          onLoad={(map) => setMap(map)}
          onClick={(e) => e.latLng && processLocationSelection(e.latLng.lat(), e.latLng.lng())}
        >
          {selectedLocation && (
            <MarkerF position={selectedLocation} animation={window.google.maps.Animation.DROP} />
          )}
        </GoogleMap>
        
        {isProcessing && (
             <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2"/>
                <span className="text-sm font-medium">Ubicando...</span>
             </div>
        )}
      </div>
      
      {currentAddress && !isProcessing && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
           <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-0.5 flex-shrink-0" />
           <div>
               <h4 className="text-sm font-semibold text-emerald-400">Ubicación Confirmada</h4>
               <p className="text-sm text-gray-300 mt-1">{currentAddress}</p>
           </div>
        </div>
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

  if (loadError) return <div className="p-4 text-red-400 bg-red-900/20 rounded-lg">Error al cargar mapas.</div>;
  
  if (!isLoaded) return (
    <div className="h-80 w-full bg-gray-900 animate-pulse rounded-xl flex flex-col items-center justify-center border-2 border-gray-800">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500"/>
    </div>
  );

  return <MapWithAutocomplete {...props} />;
};
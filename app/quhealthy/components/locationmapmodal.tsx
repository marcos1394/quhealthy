/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Search, MapPin, Navigation, Loader2, CheckCircle2, X, Building } from 'lucide-react';
import { LocationData } from '@/app/quhealthy/types/location'; // Verifica esta ruta de importación
import { toast } from 'react-toastify';

// --- CONFIGURACIÓN CONSTANTE ---

// Librerías requeridas. Importante: Se define fuera para evitar recargas innecesarias.
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem',
};

// Centro por defecto (México)
const defaultCenter = {
  lat: 23.6345,
  lng: -102.5528
};

// Estilo oscuro personalizado
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true, // Interfaz limpia
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
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
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],
};

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
}

// --- COMPONENTE INTERNO (Lógica del Mapa y Autocomplete) ---
// Este componente solo se monta cuando la API de Google está lista.

// --- COMPONENTE INTERNO (Lógica del Mapa y Autocomplete Nueva API) ---
const MapWithAutocomplete: React.FC<LocationPickerProps> = ({ onLocationSelect }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Estados para el Autocomplete manual
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');

  // --- 1. NUEVA LÓGICA DE BÚSQUEDA (Places API New) ---
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length < 3) {
      setSuggestions([]);
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
          includedRegionCodes: ['mx'], // Restringir a México
          // locationBias: ... (Opcional: sesgar por ubicación del mapa)
        })
      });
      
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  // --- 2. PROCESAR SELECCIÓN ---
  const handleSelectPrediction = async (placeId: string, description: string) => {
    setInputValue(description);
    setShowSuggestions(false);
    setIsProcessing(true);

    try {
      // Obtenemos coordenadas usando Geocoder (más barato y fácil que Places Details para esto)
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ placeId: placeId });

      if (result.results[0]) {
        const { lat, lng } = result.results[0].geometry.location;
        const latNum = lat();
        const lngNum = lng();

        map?.panTo({ lat: latNum, lng: lngNum });
        map?.setZoom(16);
        
        // Llamamos a la lógica de procesamiento central
        processLocationSelection(latNum, lngNum, result.results[0]);
      }
    } catch (error) {
      toast.error("Error al obtener detalles del lugar.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Lógica central para procesar cualquier ubicación (Click o Buscador)
  const processLocationSelection = useCallback((lat: number, lng: number, geocodeResult?: google.maps.GeocoderResult) => {
    setSelectedLocation({ lat, lng }); // Actualizamos el PIN

    // Si no tenemos el resultado del geocoder (vino de un click), lo buscamos
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
    const components = extractAddressComponents(result); // Usa tu función existente
    
    setCurrentAddress(formattedAddress);
    if (!inputValue) setInputValue(formattedAddress); // Solo actualiza input si estaba vacío o fue click

    onLocationSelect({
      lat,
      lng,
      address: formattedAddress,
      name: components.neighborhood || "Ubicación seleccionada",
      validationDetails: {
        isValid: true,
        message: "Verificado por Google",
        formattedAddress,
        addressComponents: components,
        confidence: 1,
        isServiceArea: true
      }
    });
  };

  // Tu función auxiliar existente
  const extractAddressComponents = (result: google.maps.GeocoderResult) => {
    const components = result.address_components;
    const getComponent = (type: string) => components.find(c => c.types.includes(type))?.long_name || '';
    return {
      street: getComponent('route'),
      houseNumber: getComponent('street_number'),
      neighborhood: getComponent('sublocality') || getComponent('neighborhood'),
      city: getComponent('locality') || getComponent('administrative_area_level_2'),
      state: getComponent('administrative_area_level_1'),
      postalCode: getComponent('postal_code'),
      country: getComponent('country'),
    };
  };

  // --- RENDERIZADO (Ajustado para la nueva estructura de datos) ---
  return (
    <div className="space-y-4 relative">
      <div className="relative z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
          <input
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Busca tu negocio, calle o colonia..."
            className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-800 border-2 border-gray-600 focus:border-purple-500 text-white placeholder-gray-500 transition-all shadow-lg outline-none"
          />
           {inputValue && (
            <button 
                onClick={() => { setInputValue(""); setSuggestions([]); }}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
            >
                <X className="w-4 h-4"/>
            </button>
          )}
        </div>

        {/* Lista de Resultados (Estructura de la Nueva API) */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
            {suggestions.map((item: any) => {
               // La API nueva devuelve una estructura diferente: item.placePrediction
               const prediction = item.placePrediction;
               const mainText = prediction.text.text;
               const secondaryText = prediction.structuredFormat?.secondaryText?.text || "";

               return (
                <li
                  key={prediction.placeId}
                  onClick={() => handleSelectPrediction(prediction.placeId, mainText)}
                  className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0 transition-colors flex items-start gap-3"
                >
                  <MapPin className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{mainText}</p>
                      <p className="text-xs text-gray-400 truncate">{secondaryText}</p>
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
          options={Option} // Usa tus opciones de estilo oscuro
          onLoad={(map) => setMap(map)}
          onClick={(e) => e.latLng && processLocationSelection(e.latLng.lat(), e.latLng.lng())}
        >
          {/* CORRECCIÓN DEL PIN: Usamos MarkerF explícitamente y validamos selectedLocation */}
          {selectedLocation && (
            <MarkerF 
                position={selectedLocation}
                animation={window.google.maps.Animation.DROP} 
            />
          )}
        </GoogleMap>
        
        {isProcessing && (
             <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2"/>
                <span className="text-sm font-medium">Procesando...</span>
             </div>
        )}
      </div>
      
      {/* Tarjeta de Confirmación */}
      {currentAddress && !isProcessing && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3 animate-in fade-in">
           <CheckCircle2 className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
           <div>
               <h4 className="text-sm font-semibold text-green-400">Ubicación Seleccionada</h4>
               <p className="text-sm text-gray-300 mt-1">{currentAddress}</p>
           </div>
        </div>
      )}
    </div>
  );
};


// --- COMPONENTE WRAPPER (Carga el Script) ---
export const EnhancedLocationPicker: React.FC<LocationPickerProps> = (props) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries, // Esto usa la constante definida arriba
  });

  if (loadError) {
    return (
        <div className="p-4 text-red-400 bg-red-900/20 rounded-lg border border-red-500/50 flex items-center gap-2">
            <X className="w-5 h-5" />
            <span>Error al cargar Google Maps. Verifica tu conexión o API Key.</span>
        </div>
    );
  }
  
  if (!isLoaded) {
    return (
        <div className="h-80 w-full bg-gray-800 animate-pulse rounded-xl flex flex-col items-center justify-center text-gray-500 gap-2 border-2 border-gray-700">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500"/>
            <span className="text-sm font-medium">Iniciando mapas...</span>
        </div>
    );
  }

  // Renderizamos el componente interno SOLO cuando el script está listo
  return <MapWithAutocomplete {...props} />;
};
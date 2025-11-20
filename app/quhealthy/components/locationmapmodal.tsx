"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Search, MapPin, Navigation, Loader2, CheckCircle2, X } from 'lucide-react';
import { LocationData } from '@/app/quhealthy/types/location'; // Asegúrate que esta ruta sea correcta
import { toast } from 'react-toastify';

// --- CONFIGURACIÓN DEL MAPA ---
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

const options = {
  disableDefaultUI: true, // UI limpia
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [ // Estilo oscuro personalizado para que coincida con tu app
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

export const EnhancedLocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- HOOK DE AUTOCOMPLETADO ---
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "mx" }, // Restringir búsqueda a México (opcional)
    },
    debounce: 300,
  });

  // --- FUNCIONES AUXILIARES ---

  // Extrae componentes de dirección del resultado de Google
  const extractAddressComponents = (results: google.maps.GeocoderResult) => {
    const components = results.address_components;
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

  // Procesa la selección (sea por click o por búsqueda)
  const processLocationSelection = useCallback(async (lat: number, lng: number) => {
    setIsProcessing(true);
    setSelectedLocation({ lat, lng });

    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });

      if (response.results[0]) {
        const result = response.results[0];
        const formattedAddress = result.formatted_address;
        const addressComponents = extractAddressComponents(result);

        setCurrentAddress(formattedAddress);
        setValue(formattedAddress, false); // Actualiza el input sin disparar búsqueda

        // Construimos el objeto LocationData para tu aplicación
        const locationData: LocationData = {
          lat,
          lng,
          address: formattedAddress,
          name: addressComponents.neighborhood || addressComponents.street || "Ubicación seleccionada",
          validationDetails: {
            isValid: true,
            message: "Ubicación verificada por Google",
            formattedAddress: formattedAddress,
            addressComponents: addressComponents,
            isServiceArea: true, // (Logica futura)
            confidence: 1
          }
        };

        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error("Error geocoding:", error);
      toast.error("No se pudo obtener la dirección de este punto.");
    } finally {
      setIsProcessing(false);
    }
  }, [onLocationSelect, setValue]);


  // --- MANEJADORES DE EVENTOS ---

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      processLocationSelection(lat, lng);
    }
  }, [processLocationSelection]);

  const handleSelectPrediction = async (address: string) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      
      map?.panTo({ lat, lng });
      map?.setZoom(16);
      processLocationSelection(lat, lng);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error al obtener las coordenadas del lugar.");
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsProcessing(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map?.panTo({ lat: latitude, lng: longitude });
          map?.setZoom(16);
          processLocationSelection(latitude, longitude);
        },
        () => {
          toast.error("No se pudo obtener tu ubicación.");
          setIsProcessing(false);
        }
      );
    }
  };

  // --- RENDERIZADO ---

  if (loadError) return <div className="p-4 text-red-400 bg-red-900/20 rounded-lg border border-red-500/50">Error al cargar Google Maps. Verifica tu API Key.</div>;
  if (!isLoaded) return <div className="h-80 w-full bg-gray-800 animate-pulse rounded-xl flex items-center justify-center text-gray-500">Cargando mapas...</div>;

  return (
    <div className="space-y-4 relative">
      
      {/* Barra de Búsqueda Flotante */}
      <div className="relative z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={!ready}
            placeholder="Busca tu dirección, negocio o ciudad..."
            className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-800 border-2 border-gray-600 focus:border-purple-500 text-white placeholder-gray-500 transition-all shadow-lg"
          />
          {/* Botón de limpiar */}
          {value && (
            <button 
                onClick={() => setValue("")}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
            >
                <X className="w-4 h-4"/>
            </button>
          )}
          {/* Botón de ubicación actual */}
          <button
            onClick={handleCurrentLocation}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-purple-500/20 text-purple-400 transition-colors"
            title="Usar mi ubicación actual"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Sugerencias */}
        {status === "OK" && (
          <ul className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
            {data.map(({ place_id, description, structured_formatting }) => (
              <li
                key={place_id}
                onClick={() => handleSelectPrediction(description)}
                className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0 transition-colors flex items-start gap-3"
              >
                <MapPin className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-sm font-medium text-white">{structured_formatting.main_text}</p>
                    <p className="text-xs text-gray-400">{structured_formatting.secondary_text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mapa */}
      <div className="h-80 w-full rounded-xl overflow-hidden border-2 border-gray-700 shadow-inner relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={5}
          center={defaultCenter}
          options={options}
          onLoad={onMapLoad}
          onClick={onMapClick}
        >
          {selectedLocation && (
            <MarkerF 
                position={selectedLocation} 
                animation={google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>

        {/* Overlay de "Cargando" sobre el mapa */}
        {isProcessing && (
             <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2"/>
                <span className="text-sm font-medium">Verificando ubicación...</span>
             </div>
        )}
      </div>

      {/* Confirmación de Dirección */}
      {currentAddress && !isProcessing && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
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
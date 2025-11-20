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
const MapWithAutocomplete: React.FC<LocationPickerProps> = ({ onLocationSelect }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Inicializamos el hook de autocomplete
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "mx" }, // Restringir a México (opcional)
    },
    debounce: 300,
    initOnMount: true, // IMPORTANTE: Inicializar inmediatamente porque ya sabemos que la API está cargada
  });

  // Función auxiliar para extraer componentes de dirección
  const extractAddressComponents = (components: google.maps.GeocoderAddressComponent[]) => {
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

  /**
   * Procesa la selección final, ya sea por clic o por autocompletado.
   * Obtiene detalles ricos (nombre del negocio, dirección formateada).
   */
  const processLocation = useCallback(async (lat: number, lng: number, placeId?: string) => {
    setIsProcessing(true);
    setSelectedLocation({ lat, lng });

    try {
      let formattedAddress = '';
      let name = '';
      let addressComponents: any = {};

      // Opción A: Si tenemos un PlaceID (del autocomplete o clic en POI), usamos PlacesService
      if (placeId && map) {
        const service = new google.maps.places.PlacesService(map);
        
        await new Promise<void>((resolve) => {
          service.getDetails({
            placeId: placeId,
            fields: ['name', 'formatted_address', 'address_components', 'geometry']
          }, (result, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && result) {
              name = result.name || '';
              formattedAddress = result.formatted_address || '';
              if (result.address_components) {
                addressComponents = extractAddressComponents(result.address_components);
              }
            }
            resolve();
          });
        });
      }

      // Opción B: Si no tenemos datos aún (ej. clic en mapa sin POI), usamos Geocoder
      if (!formattedAddress) {
        const geocoder = new google.maps.Geocoder();
        const response = await geocoder.geocode({ location: { lat, lng } });
        
        if (response.results[0]) {
          const result = response.results[0];
          formattedAddress = result.formatted_address;
          addressComponents = extractAddressComponents(result.address_components);
          // Si no teníamos nombre, intentamos usar el barrio o la calle
          if (!name) {
            name = addressComponents.neighborhood || addressComponents.street || "Ubicación seleccionada";
          }
        }
      }

      // Actualizamos estado local
      setCurrentAddress(formattedAddress);
      setPlaceName(name);
      setValue(formattedAddress, false); // Actualiza el input sin buscar

      // Enviamos al padre
      const locationData: LocationData = {
        lat,
        lng,
        address: formattedAddress,
        name: name,
        validationDetails: {
          isValid: true,
          message: "Ubicación verificada por Google",
          formattedAddress: formattedAddress,
          addressComponents: addressComponents,
          isServiceArea: true,
          confidence: 1
        }
      };
      onLocationSelect(locationData);

    } catch (error) {
      console.error("Error processing location:", error);
      toast.error("No se pudo obtener la información de la ubicación.");
    } finally {
      setIsProcessing(false);
    }
  }, [map, onLocationSelect, setValue]);


  // --- EVENTOS DEL MAPA ---

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      // Si el usuario hizo clic en un "Lugar de interés" (POI), usamos su placeId
      const placeId = 'placeId' in e ? (e as any).placeId : undefined;
      
      // Detenemos la propagación si es un POI para evitar clics dobles
      if(placeId) {
          e.stop(); 
      }

      processLocation(e.latLng.lat(), e.latLng.lng(), placeId);
    }
  }, [processLocation]);

  // --- EVENTOS DEL AUTOCOMPLETE ---

  const handleSelectPrediction = async (address: string, placeId: string) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      
      map?.panTo({ lat, lng });
      map?.setZoom(17);
      processLocation(lat, lng, placeId);
    } catch (error) {
      toast.error("Error al obtener las coordenadas.");
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsProcessing(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map?.panTo({ lat: latitude, lng: longitude });
          map?.setZoom(17);
          processLocation(latitude, longitude);
        },
        () => {
          toast.error("No se pudo obtener tu ubicación.");
          setIsProcessing(false);
        }
      );
    } else {
        toast.error("Tu navegador no soporta geolocalización.");
    }
  };

  return (
    <div className="space-y-4 relative">
      
      {/* --- BARRA DE BÚSQUEDA --- */}
      <div className="relative z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={!ready}
            placeholder="Busca tu negocio, calle o colonia..."
            className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-800 border-2 border-gray-600 focus:border-purple-500 text-white placeholder-gray-500 transition-all shadow-lg outline-none"
          />
          
          {/* Botón Limpiar */}
          {value && (
            <button 
                onClick={() => setValue("")}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
            >
                <X className="w-4 h-4"/>
            </button>
          )}

          {/* Botón GPS */}
          <button
            onClick={handleCurrentLocation}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-purple-500/20 text-purple-400 transition-colors"
            title="Usar mi ubicación actual"
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>

        {/* LISTA DE SUGERENCIAS */}
        {status === "OK" && (
          <ul className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
            {data.map(({ place_id, description, structured_formatting }) => (
              <li
                key={place_id}
                onClick={() => handleSelectPrediction(description, place_id)}
                className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0 transition-colors flex items-start gap-3"
              >
                <MapPin className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{structured_formatting.main_text}</p>
                    <p className="text-xs text-gray-400 truncate">{structured_formatting.secondary_text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- MAPA --- */}
      <div className="h-80 w-full rounded-xl overflow-hidden border-2 border-gray-700 shadow-inner relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={5}
          center={defaultCenter}
          options={mapOptions}
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

        {/* Overlay de Cargando */}
        {isProcessing && (
             <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2"/>
                <span className="text-sm font-medium">Obteniendo detalles del lugar...</span>
             </div>
        )}
      </div>

      {/* --- TARJETA DE RESULTADO --- */}
      {currentAddress && !isProcessing && (
        <div className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
           <div className="p-2 bg-purple-500/10 rounded-lg">
             <Building className="w-6 h-6 text-purple-400" />
           </div>
           <div className="flex-1">
               <h4 className="text-sm font-bold text-white">{placeName}</h4>
               <p className="text-xs text-gray-300 mt-1">{currentAddress}</p>
               <div className="flex items-center gap-1 mt-2 text-green-400 text-xs font-medium">
                 <CheckCircle2 className="w-3 h-3" />
                 <span>Ubicación válida</span>
               </div>
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
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { Search, MapPin, Navigation, CheckCircle2, AlertCircle, Loader2, Building, 
  
} from 'lucide-react';
import { LocationData, NominatimResult } from '@/app/quhealthy/types/location';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = divIcon({
  html: `<div class="w-8 h-8 bg-teal-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
    </svg>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to update map center
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export const EnhancedLocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6353, -106.0889]); // Chihuahua, México
  const [selectedPlace, setSelectedPlace] = useState<NominatimResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);


  // Get user's current location
  const getCurrentLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          let errorMessage = 'No se pudo obtener tu ubicación';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso de ubicación denegado. Habilita la ubicación en tu navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Ubicación no disponible. Intenta buscar manualmente.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado. Intenta nuevamente.';
              break;
          }
          setLocationError(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setLocationError('Tu navegador no soporta geolocalización');
    }
  };

  // Search places using Nominatim (OpenStreetMap)
  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setLocationError(null);
    
    try {
      // Bias search towards Mexico
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&countrycodes=mx&addressdetails=1&extratags=1&dedupe=1`
      );
      
      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }
      
      const data: NominatimResult[] = await response.json();
      setSearchResults(data);
      setShowSuggestions(true);
      
      if (data.length === 0) {
        setLocationError('No se encontraron resultados para tu búsqueda');
      }
    } catch (error) {
      console.error('Error searching places:', error);
      setSearchResults([]);
      setLocationError('Error al buscar lugares. Verifica tu conexión a internet.');
    } finally {
      setIsSearching(false);
    }
  };

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    setLocationError(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Error en geocodificación reversa');
      }
      
      const data = await response.json();
      if (data.display_name) {
        setCurrentAddress(data.display_name);
        validateLocation(lat, lng, data.display_name, data);
      } else {
        setLocationError('No se pudo obtener la dirección para esta ubicación');
      }
    } catch (error) {
      console.error('Error with reverse geocoding:', error);
      setLocationError('Error al obtener la dirección');
    }
  };

  // Simulate location validation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateLocation = async (lat: number, lng: number, address: string, addressData?: any) => {
    setIsValidating(true);
    setLocationError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const locationData: LocationData = {
        lat,
        lng,
        address,
        name: selectedPlace?.display_name || addressData?.name || '',
        validationDetails: {
          isValid: true,
          isServiceArea: true,
          confidence: 0.95,
          message: 'Ubicación validada correctamente',
          formattedAddress: address,
          addressComponents: {
            street: selectedPlace?.address?.road || addressData?.address?.road || '',
            city: selectedPlace?.address?.city || selectedPlace?.address?.suburb || addressData?.address?.city || addressData?.address?.suburb || '',
            state: selectedPlace?.address?.state || addressData?.address?.state || 'Chihuahua',
            postalCode: selectedPlace?.address?.postcode || addressData?.address?.postcode || '',
            country: selectedPlace?.address?.country || addressData?.address?.country || 'México',
            neighborhood: selectedPlace?.address?.neighbourhood || addressData?.address?.neighbourhood || '',
            suburb: selectedPlace?.address?.suburb || addressData?.address?.suburb || '',
            houseNumber: selectedPlace?.address?.house_number || addressData?.address?.house_number || ''
          }
        }
      };

      onLocationSelect(locationData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setLocationError('Error al validar la ubicación');
    } finally {
      setIsValidating(false);
    }
  };

  // Handle search input changes with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setLocationError(null);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 500);
  };

  // Handle place selection from search results
  const handlePlaceSelect = (place: NominatimResult) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    
    setSelectedPlace(place);
    setMapCenter([lat, lng]);
    setSearchQuery(place.display_name);
    setShowSuggestions(false);
    setCurrentAddress(place.display_name);
    setLocationError(null);
    
    validateLocation(lat, lng, place.display_name);
  };

  // Handle map clicks
  const handleMapClick = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setSelectedPlace(null);
    setSearchQuery('');
    reverseGeocode(lat, lng);
  };

 // Borra tu useEffect actual y reemplázalo con este:

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    // Si el ref existe y el clic NO fue dentro del contenedor...
    if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
      // ...entonces sí cerramos las sugerencias.
      setShowSuggestions(false);
    }
  };

  // Añadimos el listener al montar el componente
  document.addEventListener('mousedown', handleClickOutside);

  // Lo limpiamos al desmontar
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []); // El array vacío asegura que esto se configure solo una vez

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative"  ref={searchContainerRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
          <input
            type="text"
            placeholder="Buscar dirección o negocio..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
            onClick={(e) => e.stopPropagation()}
            className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 border-gray-600 focus:border-teal-400 text-white placeholder-gray-500 transition-all duration-300"
          />
          <button
            onClick={getCurrentLocation}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-teal-500/20 text-teal-400 transition-colors"
            title="Usar mi ubicación actual"
          >
            <Navigation className="w-5 h-5" />
          </button>
          
          {isSearching && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSuggestions && searchResults.length > 0 && (
          <div 
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {searchResults.map((place, index) => (
              <div
                key={place.place_id || index}
                onClick={() => handlePlaceSelect(place)}
                className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {place.display_name.split(',')[0]}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {place.display_name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {locationError && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-400 mb-1">Error de ubicación</h4>
              <p className="text-sm text-red-200">{locationError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Place Info */}
      {selectedPlace && (
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building className="w-6 h-6 text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate">
                {selectedPlace.display_name.split(',')[0]}
              </h3>
              <p className="text-gray-400 text-sm truncate">
                {selectedPlace.display_name}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="flex items-center text-xs text-green-400">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Ubicación verificada
                </span>
                {selectedPlace.type && (
                  <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-1 rounded-full">
                    {selectedPlace.type}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="h-64 sm:h-80 rounded-xl overflow-hidden border border-gray-700/50 bg-gray-800 relative">
        <MapContainer
          center={mapCenter}
          zoom={15}
          className="w-full h-full"
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={mapCenter} icon={customIcon} />
          <MapClickHandler onMapClick={handleMapClick} />
          <MapController center={mapCenter} />
        </MapContainer>
        
        {/* Map Loading Overlay */}
        {isValidating && (
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-gray-800 rounded-lg p-4 flex items-center space-x-3">
              <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
              <span className="text-white text-sm">Validando ubicación...</span>
            </div>
          </div>
        )}
      </div>

      {/* Current Address */}
      {currentAddress && (
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-300 mb-1">Dirección seleccionada:</h4>
              <p className="text-white text-sm leading-relaxed">{currentAddress}</p>
            </div>
            {isValidating ? (
              <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-teal-900/20 to-cyan-900/20 rounded-xl p-4 border border-teal-500/20">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <MapPin className="w-5 h-5 text-teal-400 mt-0.5" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-teal-400 mb-2">¿Cómo seleccionar tu ubicación?</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Busca tu dirección o negocio en el campo de búsqueda</li>
              <li>• Haz clic en el mapa para colocar el marcador manualmente</li>
              <li>• Usa el botón de navegación (📍) para obtener tu ubicación actual</li>
              <li>• Puedes hacer zoom y mover el mapa para mayor precisión</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
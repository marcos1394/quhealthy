"use client";
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleMap, Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Loader2, Search, X, AlertCircle, CheckCircle2, Star, Clock, Globe, Phone, Camera, Navigation, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

// Bibliotecas necesarias para Google Maps
const libraries: ('places' | 'marker')[] = ['places', 'marker'];

// Interfaces
interface LocationPickerProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: string;
    placeDetails?: google.maps.places.PlaceResult;
    validationDetails?: ValidationDetails;
  }) => void;
  initialPosition?: {
    lat: number;
    lng: number;
  };
}

interface ValidationDetails {
  isValid: boolean;
  message: string;
  details: {
    formattedAddress: string;
    addressComponents: any[];
    precision: string;
  };
}

// Componente principal
const EnhancedLocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialPosition = { lat: 19.4326, lng: -99.1332 }, // CDMX por defecto
}) => {
  const [selectedPosition, setSelectedPosition] = useState(initialPosition);
  const [searchValue, setSearchValue] = useState('');
  const [validationStatus, setValidationStatus] = useState<ValidationDetails | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<google.maps.places.PlaceResult | null>(null);
  const [noBusinessFound, setNoBusinessFound] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  // Cargar la API de Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, // Configura tu API Key
    libraries,
  });

  // Obtener la posición actual del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentPosition(pos);
        },
        () => {
          toast.error('No se pudo obtener la posición actual. Asegúrate de permitir el acceso a la ubicación.');
        }
      );
    }
  }, []);

  // Gestionar el marcador avanzado
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        position: selectedPosition,
        map: mapRef.current,
        gmpDraggable: true,
      });

      markerRef.current.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        handleMarkerDragEnd(event);
      });

      return () => {
        if (markerRef.current) markerRef.current.map = null;
      };
    }
  }, [isLoaded, selectedPosition]);

  // Calcular la distancia
  const calculateDistance = (pos1: google.maps.LatLngLiteral, pos2: google.maps.LatLngLiteral) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (pos2.lat - pos1.lat) * (Math.PI / 180);
    const dLng = (pos2.lng - pos1.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pos1.lat * (Math.PI / 180)) * Math.cos(pos2.lat * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2) + ' km';
  };

  // Manejar selección desde el autocompletado
  const handlePlaceSelect = useCallback(async () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      const formattedAddress = place.formatted_address || '';
      const newPos = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      setPlaceDetails(place);
      setIsValidating(true);
      setNoBusinessFound(false);

      try {
        const response = await fetch(`http://localhost:3001/api/validate-address`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: formattedAddress }),
        });

        if (!response.ok) throw new Error('Error en la validación');

        const validationResult: ValidationDetails = await response.json();
        setValidationStatus(validationResult);

        setSelectedPosition(newPos);
        mapRef.current?.panTo(newPos);
        mapRef.current?.setZoom(17);
        if (markerRef.current) markerRef.current.position = newPos;

        onLocationSelect({
          ...newPos,
          address: validationResult.details.formattedAddress || formattedAddress,
          placeDetails: place,
          validationDetails: validationResult,
        });

        setSearchValue(place.name || formattedAddress);

        // Calcular distancia si hay posición actual
        if (currentPosition) {
          const dist = calculateDistance(currentPosition, newPos);
          setDistance(dist);
        }
      } catch (error) {
        console.error('Error en la validación:', error);
        setValidationStatus({
          isValid: false,
          message: 'Error al validar la dirección. Intenta de nuevo.',
          details: { formattedAddress, addressComponents: [], precision: 'ERROR' },
        });
      } finally {
        setIsValidating(false);
      }
    }
  }, [onLocationSelect, currentPosition]);

  // Manejar arrastre del marcador
  const handleMarkerDragEnd = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPos = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      setSelectedPosition(newPos);
      setIsValidating(true);
      setNoBusinessFound(false);

      try {
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newPos.lat},${newPos.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.status !== 'OK') throw new Error('Error en geocodificación');

        const address = geocodeData.results[0].formatted_address;
        const placesService = new google.maps.places.PlacesService(mapRef.current!);
        placesService.nearbySearch(
          {
            location: newPos,
            radius: 50,
            type: 'establishment',
          },
          (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results?.length) {
              const nearestBusiness = results[0];
              setPlaceDetails(nearestBusiness);
              setSearchValue(nearestBusiness.name || address);

              fetch(`http://localhost:3001/api/validate-address`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: nearestBusiness.formatted_address || address }),
              })
                .then((res) => res.json())
                .then((validationResult: ValidationDetails) => {
                  setValidationStatus(validationResult);
                  onLocationSelect({
                    ...newPos,
                    address: validationResult.details.formattedAddress || nearestBusiness.formatted_address || address,
                    placeDetails: nearestBusiness,
                    validationDetails: validationResult,
                  });

                  // Calcular distancia
                  if (currentPosition) {
                    const dist = calculateDistance(currentPosition, newPos);
                    setDistance(dist);
                  }
                });
            } else {
              setPlaceDetails(null);
              setSearchValue(address);
              setNoBusinessFound(true);
              fetch(`http://localhost:3001/api/validate-address`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address }),
              })
                .then((res) => res.json())
                .then((validationResult: ValidationDetails) => {
                  setValidationStatus(validationResult);
                  onLocationSelect({
                    ...newPos,
                    address: validationResult.details.formattedAddress || address,
                    validationDetails: validationResult,
                  });
                });
            }
          }
        );
      } catch (error) {
        console.error('Error en geocodificación:', error);
        setValidationStatus({
          isValid: false,
          message: 'Error al procesar la ubicación. Intenta de nuevo.',
          details: { formattedAddress: '', addressComponents: [], precision: 'ERROR' },
        });
      } finally {
        setIsValidating(false);
      }
    }
  }, [onLocationSelect, currentPosition]);

  // Manejar clics en el mapa
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setSelectedPosition(newPos);
      if (markerRef.current) markerRef.current.position = newPos;
      handleMarkerDragEnd(e);
    }
  }, [handleMarkerDragEnd]);

  // Confirmar negocio
  const handleConfirmBusiness = () => {
    if (placeDetails) {
      toast.success('Negocio confirmado exitosamente');
      // Aquí podrías agregar lógica adicional, como guardar el negocio confirmado
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campo de búsqueda */}
      <div className="relative">
        <Autocomplete
          onLoad={(autocomplete) => {
            autocompleteRef.current = autocomplete;
            autocomplete.setTypes(['establishment']);
          }}
          onPlaceChanged={handlePlaceSelect}
        >
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Buscar negocio (ej. 'Clínica San Juan')..."
              className="w-full pl-10 pr-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 text-white placeholder-gray-400"
              aria-label="Buscar negocio"
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue('');
                  setValidationStatus(null);
                  setPlaceDetails(null);
                  setNoBusinessFound(false);
                  setDistance(null);
                  setSelectedPosition(initialPosition);
                  mapRef.current?.panTo(initialPosition);
                  if (markerRef.current) markerRef.current.position = initialPosition;
                }}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </Autocomplete>
      </div>

      {/* Detalles del negocio con animación */}
      {placeDetails && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-2">{placeDetails.name}</h3>
          <p className="text-sm text-gray-300 mb-2">{placeDetails.formatted_address}</p>

          {/* Calificación */}
          {placeDetails.rating && (
            <div className="flex items-center mb-2">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-sm text-gray-300">
                {placeDetails.rating} ({placeDetails.user_ratings_total || 0} reseñas)
              </span>
            </div>
          )}

          {/* Horario */}
          {placeDetails.opening_hours && (
            <div className="flex items-center mb-2">
              <Clock className="w-4 h-4 text-teal-400 mr-2" />
              <span className="text-sm text-gray-300">
                {placeDetails.opening_hours.isOpen() ? 'Abierto ahora' : 'Cerrado'}
              </span>
            </div>
          )}

          {/* Sitio web */}
          {placeDetails.website && (
            <div className="flex items-center mb-2">
              <Globe className="w-4 h-4 text-teal-400 mr-2" />
              <a
                href={placeDetails.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-teal-400 hover:underline"
              >
                Visitar sitio web
              </a>
            </div>
          )}

          {/* Teléfono */}
          {placeDetails.formatted_phone_number && (
            <div className="flex items-center mb-2">
              <Phone className="w-4 h-4 text-teal-400 mr-2" />
              <span className="text-sm text-gray-300">{placeDetails.formatted_phone_number}</span>
            </div>
          )}

          {/* Distancia */}
          {distance && (
            <div className="flex items-center mb-2">
              <Navigation className="w-4 h-4 text-teal-400 mr-2" />
              <span className="text-sm text-gray-300">Distancia: {distance}</span>
            </div>
          )}

          {/* Carrusel de fotos */}
          {placeDetails.photos && placeDetails.photos.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center mb-2">
                <Camera className="w-4 h-4 text-teal-400 mr-2" />
                <span className="text-sm text-gray-300">Fotos del negocio</span>
              </div>
              <div className="relative">
                <img
                  src={placeDetails.photos[currentImageIndex].getUrl({ maxWidth: 300 })}
                  alt={`Foto ${currentImageIndex + 1} de ${placeDetails.name}`}
                  className="rounded-md w-full h-48 object-cover"
                />
                {placeDetails.photos.length > 1 && (
                  <div className="absolute bottom-2 right-2 flex space-x-2">
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : placeDetails.photos!.length - 1))}
                      className="bg-gray-800/70 text-white p-1 rounded-full"
                    >
                      {'<'}
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev < placeDetails.photos!.length - 1 ? prev + 1 : 0))}
                      className="bg-gray-800/70 text-white p-1 rounded-full"
                    >
                      {'>'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botón de confirmación */}
          <div className="mt-4">
            <button
              onClick={handleConfirmBusiness}
              className="flex items-center justify-center w-full py-2 px-4 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all"
            >
              <Check className="w-5 h-5 mr-2" />
              Confirmar este negocio
            </button>
          </div>
        </motion.div>
      )}

      {/* Mensaje si no hay negocios cercanos */}
      {noBusinessFound && (
        <div className="p-3 bg-yellow-500/80 text-white rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>No se encontraron negocios cercanos. La dirección se ha actualizado.</p>
        </div>
      )}

      {/* Mapa */}
      <div className="relative h-96 rounded-lg overflow-hidden border border-gray-600 shadow-md">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={selectedPosition}
          zoom={14}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          onClick={handleMapClick}
          options={{
            mapId: '354387be9fd1ab08', // Reemplaza con tu Map ID
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            clickableIcons: false,
            zoomControl: true,
          }}
        />
      </div>

      {/* Indicador de validación */}
      {isValidating && (
        <div className="p-3 bg-blue-500/80 text-white rounded-lg flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>Validando dirección...</p>
        </div>
      )}

      {/* Resultado de validación */}
      {validationStatus && !isValidating && (
        <div
          className={`p-3 ${
            validationStatus.isValid ? 'bg-green-500/80' : 'bg-red-500/80'
          } text-white rounded-lg flex items-center gap-2`}
        >
          {validationStatus.isValid ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p>{validationStatus.message}</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedLocationPicker;
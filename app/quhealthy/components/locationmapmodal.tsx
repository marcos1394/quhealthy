import React, { useState, useRef, useCallback } from 'react';
import { GoogleMap, Autocomplete, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Loader2, Search, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const libraries: ("places")[] = ['places'];

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

const EnhancedLocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialPosition = { lat: 19.4326, lng: -99.1332 }
}) => {
  const [selectedPosition, setSelectedPosition] = useState(initialPosition);
  const [address, setAddress] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [validationStatus, setValidationStatus] = useState<ValidationDetails | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const handlePlaceSelect = useCallback(async () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      let formattedAddress = place.formatted_address || '';

      // ✅ Eliminamos "Estados Unidos" si la dirección es de México
      if (formattedAddress.includes('Estados Unidos') && formattedAddress.includes('Mexico')) {
        formattedAddress = formattedAddress.replace(', Estados Unidos', '');
      }

      // ✅ Evitamos códigos postales repetidos
      const addressParts = formattedAddress.split(',');
      if (addressParts.length >= 3) {
        const lastPart = addressParts[addressParts.length - 1].trim();
        if (lastPart.match(/\d{5}$/)) {
          addressParts.pop(); // Eliminar código postal duplicado
        }
        formattedAddress = addressParts.join(',');
      }

      console.log("Dirección enviada al backend:", formattedAddress);

      setIsValidating(true);
      try {
        const response = await fetch(`http://localhost:3001/api/validate-address`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: formattedAddress })
        });

        if (!response.ok) throw new Error('Error en la validación de dirección');

        const validationResult: ValidationDetails = await response.json();
        setValidationStatus(validationResult);

        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };

        setSelectedPosition(newPos);
        mapRef.current?.panTo(newPos);
        mapRef.current?.setZoom(17);

        if (markerRef.current) {
          markerRef.current.setPosition(newPos);
        }

        onLocationSelect({
          ...newPos,
          address: validationResult.details.formattedAddress || place.formatted_address || '',
          placeDetails: place,
          validationDetails: validationResult
        });

        setSearchValue(validationResult.details.formattedAddress || place.formatted_address || '');

      } catch (error) {
        console.error('Error en la validación:', error);
        setValidationStatus({
          isValid: false,
          message: 'Error al validar la dirección. Inténtelo nuevamente.',
          details: {
            formattedAddress: place.formatted_address || '',
            addressComponents: [],
            precision: 'ERROR'
          }
        });
      } finally {
        setIsValidating(false);
      }
    }
  }, [onLocationSelect]);

  const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setSelectedPosition(newPos);
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Autocomplete
          onLoad={autocomplete => { autocompleteRef.current = autocomplete; }}
          onPlaceChanged={handlePlaceSelect}
        >
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Buscar dirección..."
              className="w-full pl-10 pr-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 text-white placeholder-gray-400"
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue('');
                  setValidationStatus(null);
                }}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </Autocomplete>
      </div>

      <div className="relative h-96 rounded-lg overflow-hidden border border-gray-600 shadow-md">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={selectedPosition}
          zoom={14}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            clickableIcons: false,
            zoomControl: true,
          }}
        >
          <Marker position={selectedPosition} draggable={true} onDragEnd={handleMarkerDragEnd} />
        </GoogleMap>
      </div>

      {isValidating && (
        <div className="p-3 bg-blue-500/80 text-white rounded-lg flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>Validando dirección...</p>
        </div>
      )}

      {validationStatus && !isValidating && (
        <div className={`p-3 ${validationStatus.isValid ? 'bg-green-500/80' : 'bg-red-500/80'} text-white rounded-lg flex items-center gap-2`}>
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

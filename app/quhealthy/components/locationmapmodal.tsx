"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { LocationData, ValidationDetails } from '@/app/quhealthy/types/location';

// Importa los sub-componentes
import { LocationSearchBar } from './location/LocationSearchBar';
import { PlaceDetailsCard } from './location/PlaceDetailsCard';
import { ValidationStatus } from './location/ValidationStatus';
import { LocationMap } from './location/LocationMap';

const libraries: ('places' | 'marker')[] = ['places', 'marker'];

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialPosition?: { lat: number; lng: number };
}

export const EnhancedLocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialPosition = { lat: 19.4326, lng: -99.1332 }, // CDMX por defecto
}) => {
  const [selectedPosition, setSelectedPosition] = useState(initialPosition);
  const [searchValue, setSearchValue] = useState('');
  const [validationStatus, setValidationStatus] = useState<ValidationDetails | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<google.maps.places.PlaceResult | null>(null);
  
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_Maps_API_KEY!,
    libraries,
    mapIds: [process.env.NEXT_PUBLIC_GOOGLE_MAP_ID!],
  });
  
  // Función central para validar y notificar la selección
  const validateAndReportSelection = useCallback(async (location: Omit<LocationData, 'validationDetails'>) => {
    setIsValidating(true);
    setValidationStatus(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/validate-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: location.address }),
      });
      if (!response.ok) throw new Error('Error en la validación del backend');
      const validationResult: ValidationDetails = await response.json();
      
      setValidationStatus(validationResult);
      // Notifica al componente padre (el formulario de registro) con todos los datos
      onLocationSelect({ ...location, validationDetails: validationResult });

    } catch (error) {
      toast.error("No se pudo validar la dirección seleccionada.");
    } finally {
      setIsValidating(false);
    }
  }, [onLocationSelect]);

  // Manejador para la selección desde el autocompletado
  const handlePlaceSelect = useCallback(async (place: google.maps.places.PlaceResult) => {
    if (!place?.geometry?.location) return;

    const newPos = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
    const address = place.formatted_address || '';
    
    setPlaceDetails(place);
    setSearchValue(place.name || address);
    setSelectedPosition(newPos);
    mapRef.current?.panTo(newPos);
    mapRef.current?.setZoom(17);

    await validateAndReportSelection({ lat: newPos.lat, lng: newPos.lng, address, name: place.name, placeDetails: place });
  }, [validateAndReportSelection]);

  // Manejador para el arrastre del pin o clic en el mapa
  const handlePinMove = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const newPos = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    setSelectedPosition(newPos);
    setPlaceDetails(null); // Borramos detalles de negocio previo, ya que es una ubicación manual

    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: newPos });
      if (response.results[0]) {
        const address = response.results[0].formatted_address;
        setSearchValue(address); // Actualizamos la barra de búsqueda con la dirección encontrada
        await validateAndReportSelection({ lat: newPos.lat, lng: newPos.lng, address });
      } else {
        toast.error("No se pudo encontrar una dirección para esta ubicación.");
      }
    } catch (error: any) {
      toast.error("Error al obtener la dirección.");
    }
  }, [validateAndReportSelection]);

  // Efecto para crear y actualizar el marcador
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      if (!markerRef.current) {
        markerRef.current = new google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          gmpDraggable: true,
        });
        markerRef.current.addListener('dragend', handlePinMove);
      }
      markerRef.current.position = selectedPosition;
    }
  }, [isLoaded, selectedPosition, handlePinMove]);
  
  const handleClearSearch = () => {
    setSearchValue('');
    setValidationStatus(null);
    setPlaceDetails(null);
  };
  
  const handleConfirmBusiness = () => {
    if (!placeDetails) return;
    const locationData = {
        lat: selectedPosition.lat,
        lng: selectedPosition.lng,
        address: placeDetails.formatted_address || searchValue,
        name: placeDetails.name,
        placeDetails: placeDetails,
        validationDetails: validationStatus || undefined
    };
    onLocationSelect(locationData);
    toast.success("Negocio confirmado y datos pre-cargados.");
  }

  if (loadError) return <div className="text-red-500 p-4 bg-red-900/50 rounded-lg">Error al cargar el mapa. Verifica tu API Key y la configuración en Google Cloud.</div>;
  if (!isLoaded) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;

  return (
    <div className="space-y-4">
      <LocationSearchBar 
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onPlaceSelect={handlePlaceSelect}
        onClear={handleClearSearch}
      />
      {placeDetails && (
        <PlaceDetailsCard 
          place={placeDetails} 
          onConfirm={handleConfirmBusiness} 
          onClear={handleClearSearch} 
        />
      )}
      <LocationMap 
        center={selectedPosition}
        onMapLoad={(map) => { mapRef.current = map; }}
        onMapClick={handlePinMove}
      />
      <ValidationStatus 
        isValidating={isValidating} 
        validationStatus={validationStatus} 
      />
    </div>
  );
};
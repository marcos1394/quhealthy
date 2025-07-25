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
  initialPosition = { lat: 19.4326, lng: -99.1332 }, // CDMX
}) => {
  const [selectedPosition, setSelectedPosition] = useState(initialPosition);
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

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    
    if (!markerRef.current) {
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({ map: mapRef.current, gmpDraggable: true });
      markerRef.current.addListener('dragend', handleMarkerDragEnd);
    }
    
    markerRef.current.position = selectedPosition;
  }, [isLoaded, selectedPosition]);

  const validateAndSelectLocation = useCallback(async (lat: number, lng: number, address: string, place?: google.maps.places.PlaceResult) => {
    setIsValidating(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/validate-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      if (!response.ok) throw new Error('Error en la validación del backend');
      const validationResult: ValidationDetails = await response.json();
      
      setValidationStatus(validationResult);
      onLocationSelect({ 
        lat, 
        lng, 
        address: validationResult.details.formattedAddress || address, 
        placeDetails: place, 
        validationDetails: validationResult 
      });
    } catch (error) {
      toast.error("Error al validar la dirección.");
      setValidationStatus(null);
    } finally {
      setIsValidating(false);
    }
  }, [onLocationSelect]);
  
  const handlePlaceSelect = useCallback(async (place: google.maps.places.PlaceResult | null) => {
    if (!place?.geometry?.location) {
        setPlaceDetails(null);
        return;
    };

    const newPos = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
    const address = place.formatted_address || '';
    
    setPlaceDetails(place);
    setSelectedPosition(newPos);
    mapRef.current?.panTo(newPos);
    mapRef.current?.setZoom(17);

    await validateAndSelectLocation(newPos.lat, newPos.lng, address, place);
  }, [validateAndSelectLocation]);

  const geocodePosition = async (lat: number, lng: number): Promise<string> => {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results[0]) {
          return response.results[0].formatted_address;
      }
      throw new Error("No se pudo encontrar una dirección para esta ubicación.");
  };

  const handleMarkerDragEnd = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    const newPos = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    setSelectedPosition(newPos);
    setPlaceDetails(null);
    try {
      const address = await geocodePosition(newPos.lat, newPos.lng);
      await validateAndSelectLocation(newPos.lat, newPos.lng, address);
    } catch (error: any) {
        toast.error(error.message);
    }
  }, [validateAndSelectLocation]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) handleMarkerDragEnd(e);
  }, [handleMarkerDragEnd]);
  
  if (loadError) return <div className="text-red-500">Error al cargar el mapa. Verifica tu API Key.</div>;
  if (!isLoaded) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <LocationSearchBar onPlaceSelect={handlePlaceSelect} />
      {placeDetails && (
        <PlaceDetailsCard 
          placeDetails={placeDetails} 
          onConfirm={() => toast.success("Negocio confirmado y datos pre-cargados.")} 
        />
      )}
      <LocationMap 
        center={selectedPosition}
        onMapLoad={(map) => mapRef.current = map}
        onMapClick={handleMapClick}
      />
      <ValidationStatus 
        isValidating={isValidating} 
        validationStatus={validationStatus} 
      />
    </div>
  );
};
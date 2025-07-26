"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { LocationData, ValidationDetails } from '@/app/quhealthy/types/location';

// Importa los sub-componentes
import { LocationSearchBar } from './location/LocationSearchBar';
import { PlaceDetailsCard } from './location/PlaceDetailsCard';
import { ValidationStatus } from './location/ValidationStatus';
import { LocationMap } from './location/LocationMap';

const libraries: ('places' | 'marker')[] = ['places', 'marker'];

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
}

export const EnhancedLocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
}) => {
  const [mapCenter, setMapCenter] = useState({ lat: 19.4326, lng: -99.1332 }); // CDMX por defecto
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

  // Función central para validar la dirección y notificar al formulario principal
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
      onLocationSelect({ ...location, validationDetails: validationResult });
    } catch (error) {
      toast.error("No se pudo validar la dirección seleccionada.");
    } finally {
      setIsValidating(false);
    }
  }, [onLocationSelect]);
  
  // Caso de uso 1: El usuario selecciona un negocio del autocompletado
  const handlePlaceSelect = useCallback(async (placeId: string | null) => {
    if (!placeId) {
      setPlaceDetails(null);
      return;
    }
    
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/places/details/${placeId}`;
      const response = await axios.get(apiUrl);
      const fullPlaceDetails = response.data;

      if (!fullPlaceDetails?.location) return;

      const newPos = { lat: fullPlaceDetails.location.lat, lng: fullPlaceDetails.location.lng };
      
      setPlaceDetails(fullPlaceDetails);
      setMapCenter(newPos);
      if (mapRef.current) {
        mapRef.current.panTo(newPos);
        mapRef.current.setZoom(17);
      }

      await validateAndReportSelection({ 
        lat: newPos.lat, 
        lng: newPos.lng, 
        address: fullPlaceDetails.address, 
        name: fullPlaceDetails.name, 
        placeDetails: fullPlaceDetails 
      });

    } catch (error) {
      toast.error("No se pudieron obtener los detalles del negocio.");
      setPlaceDetails(null);
    }
  }, [validateAndReportSelection]);

  // Caso de uso 2: El usuario mueve el pin o hace clic en el mapa
  const handlePinMove = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const newPos = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    setMapCenter(newPos);
    setPlaceDetails(null); // Borramos detalles de negocio previo

    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: newPos });
      if (response.results[0]) {
        const address = response.results[0].formatted_address;
        await validateAndReportSelection({ lat: newPos.lat, lng: newPos.lng, address });
      } else {
        toast.error("No se pudo encontrar una dirección para esta ubicación.");
      }
    } catch (error) {
      toast.error("Error al obtener la dirección.");
    }
  }, [validateAndReportSelection]);

  // Efecto para crear y actualizar la posición del marcador
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      if (!markerRef.current) {
        markerRef.current = new google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          gmpDraggable: true,
        });
        markerRef.current.addListener('dragend', handlePinMove);
      }
      markerRef.current.position = mapCenter;
    }
  }, [isLoaded, mapCenter, handlePinMove]);
  
  if (loadError) return <div className="text-red-500 p-4 bg-red-900/50 rounded-lg">Error al cargar el mapa. Verifica tu API Key.</div>;
  if (!isLoaded) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;

  return (
    <div className="space-y-4">
      <LocationSearchBar onPlaceSelect={handlePlaceSelect} />
      
      {placeDetails && (
        <PlaceDetailsCard 
          place={placeDetails} 
          onConfirm={() => toast.success("Negocio confirmado.")} 
          onClear={() => setPlaceDetails(null)}
        />
      )}
      
      <LocationMap 
        center={mapCenter}
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
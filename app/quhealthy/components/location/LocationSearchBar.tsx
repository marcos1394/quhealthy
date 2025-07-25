"use client";
import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

// Carga el cargador de la API de Google una sola vez
import { useApiIsLoaded, useMapsLibrary } from '@vis.gl/react-google-maps';

interface LocationSearchBarProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  // Ya no necesitamos pasar searchValue y otros manejadores desde el padre
}

export const LocationSearchBar: React.FC<LocationSearchBarProps> = ({ onPlaceSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
      types: ['establishment'],
      fields: ['place_id', 'geometry', 'name', 'formatted_address'],
    });

    autocomplete.addListener('place_changed', () => {
      onPlaceSelect(autocomplete.getPlace());
    });
  }, [places, onPlaceSelect]);
  
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Buscar negocio (ej. 'Clínica San Juan')..."
        className="w-full pl-10 pr-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-teal-400"
        aria-label="Buscar negocio"
      />
    </div>
  );
};
"use client";

import React, { useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Search, X } from 'lucide-react';

interface LocationSearchBarProps {
  value: string; 
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  onClear: () => void;
}

export const LocationSearchBar: React.FC<LocationSearchBarProps> = ({ 
  value, 
  onChange, 
  onPlaceSelect,
  onClear
}) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
    autocomplete.setComponentRestrictions({ country: "mx" });
    // Aquí pedimos a Google todos los datos que necesitamos para la tarjeta de detalles
    autocomplete.setFields([
      'place_id', 
      'geometry', 
      'name', 
      'formatted_address',
      'opening_hours',
      'rating',
      'user_ratings_total',
      'website',
      'photos',
      'formatted_phone_number'
    ]);
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place?.geometry) { // Nos aseguramos que el lugar seleccionado sea válido
        onPlaceSelect(place);
      }
    }
  };

  return (
    <div className="relative">
      <Autocomplete
        onLoad={handleLoad}
        onPlaceChanged={handlePlaceChanged}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder="Buscar tu negocio por nombre..."
            className="w-full pl-10 pr-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400"
            aria-label="Buscar negocio"
          />
          {value && (
            <button 
              type="button"
              onClick={onClear} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </Autocomplete>
    </div>
  );
};
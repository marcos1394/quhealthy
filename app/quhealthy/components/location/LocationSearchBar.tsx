"use client";

import React from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Search, X } from 'lucide-react';

// 1. Añadimos 'autocompleteRef' a la lista de props que el componente espera.
interface LocationSearchBarProps {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onPlaceSelect: () => void;
  onClear: () => void;
  autocompleteRef: React.RefObject<google.maps.places.Autocomplete | null>;
}

export const LocationSearchBar: React.FC<LocationSearchBarProps> = ({ 
  searchValue, 
  onSearchValueChange, 
  onPlaceSelect, 
  onClear, 
  autocompleteRef 
}) => {
  return (
    <div className="relative">
      <Autocomplete
        // 2. Conectamos la referencia al onLoad del componente Autocomplete.
        onLoad={(autocomplete) => {
          if (autocompleteRef) {
            (autocompleteRef.current as any) = autocomplete;
          }
          autocomplete.setTypes(['establishment']);
          autocomplete.setFields(['place_id', 'geometry', 'name', 'formatted_address', 'opening_hours', 'rating', 'user_ratings_total', 'website', 'photos', 'formatted_phone_number']);
        }}
        onPlaceChanged={onPlaceSelect}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchValueChange(e.target.value)}
            placeholder="Buscar negocio (ej. 'Clínica San Juan')..."
            className="w-full pl-10 pr-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-teal-400"
            aria-label="Buscar negocio"
          />
          {searchValue && (
            <button onClick={onClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </Autocomplete>
    </div>
  );
};
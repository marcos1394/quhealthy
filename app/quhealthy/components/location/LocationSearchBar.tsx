"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';
import debounce from 'lodash.debounce';

interface Suggestion {
  description: string;
  placeId: string;
}

interface LocationSearchBarProps {
  onPlaceSelect: (placeId: string) => void; // Ahora solo pasa el placeId
  initialValue?: string;
}

export const LocationSearchBar: React.FC<LocationSearchBarProps> = ({ onPlaceSelect, initialValue = '' }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const fetchSuggestions = async (value: string) => {
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/places/autocomplete`, { input: value });
      setSuggestions(response.data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchSuggestions, 300), []);

  useEffect(() => {
    debouncedFetch(inputValue);
  }, [inputValue, debouncedFetch]);
  
  const handleSelect = (suggestion: Suggestion) => {
    setInputValue(suggestion.description);
    setSuggestions([]);
    onPlaceSelect(suggestion.placeId);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Buscar tu negocio por nombre..."
        className="w-full pl-10 pr-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.placeId}
              onClick={() => handleSelect(suggestion)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-700"
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
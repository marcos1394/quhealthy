import { useState, useEffect } from 'react';
import { googleService } from '@/services/google.service';

export interface AutocompletePrediction {
  description: string;
  place_id: string;
}

export function useGoogleAutocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await googleService.autocomplete(query);
        // Depending on backend, it might return an array directly or an object with predictions
        if (Array.isArray(response)) {
          setSuggestions(response);
        } else if (response && Array.isArray(response.predictions)) {
          setSuggestions(response.predictions);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 400); // 400ms debounce

    return () => clearTimeout(debounceTimer);
  }, [query]);

  return {
    query,
    setQuery,
    suggestions,
    setSuggestions,
    isLoading,
  };
}

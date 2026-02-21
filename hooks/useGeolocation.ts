// hooks/useGeolocation.ts
import { useState, useEffect, useCallback } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

export const useGeolocation = () => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Pedimos la ubicación al montar el hook
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('La geolocalización no es soportada por tu navegador.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        setError(getErrorMessage(err));
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Función auxiliar para traducir los errores de GPS a lenguaje humano
  const getErrorMessage = (error: GeolocationPositionError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Permiso denegado. Por favor, habilita la ubicación para ver especialistas cercanos.';
      case error.POSITION_UNAVAILABLE:
        return 'Información de ubicación no disponible.';
      case error.TIMEOUT:
        return 'Se agotó el tiempo para obtener tu ubicación.';
      default:
        return 'Ocurrió un error desconocido al buscar tu ubicación.';
    }
  };

  /**
   * Fórmula de Haversine: 
   * Calcula la distancia en línea recta (kilómetros) entre dos coordenadas.
   */
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  }, []);

  return { coordinates, error, isLoading, calculateDistance };
};
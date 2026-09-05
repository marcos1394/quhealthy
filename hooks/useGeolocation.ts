/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-initialize-state */
import { useState, useEffect, useCallback } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

export const useGeolocation = () => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Restaurar coordenadas en caché de sesión tras montar en cliente para evitar mismatch de hidratación
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('quhealthy_user_coords');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
            setCoordinates(parsed);
          }
        }
      } catch {}
    }
  }, []);

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

  const requestLocation = useCallback(
    (onSuccess?: (coords: Coordinates) => void, onError?: (errMsg: string) => void) => {
      if (typeof window === 'undefined') return;

      if (!navigator.geolocation) {
        const msg = 'La geolocalización no es soportada por tu navegador.';
        setError(msg);
        onError?.(msg);
        return;
      }

      setIsLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoordinates(coords);
          setIsLoading(false);
          try {
            sessionStorage.setItem('quhealthy_user_coords', JSON.stringify(coords));
          } catch {}
          onSuccess?.(coords);
        },
        (err) => {
          const msg = getErrorMessage(err);
          setError(msg);
          setIsLoading(false);
          onError?.(msg);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    },
    []
  );

  // Efecto inteligente con Permissions API: solo solicita coordenadas si el permiso ya fue concedido
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
      return;
    }

    let isMounted = true;

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((permissionStatus) => {
        if (!isMounted) return;

        if (permissionStatus.state === 'granted') {
          // El usuario ya concedió permisos previamente: obtenemos coordenadas en silencio
          requestLocation();
        }

        permissionStatus.onchange = () => {
          if (permissionStatus.state === 'granted') {
            requestLocation();
          }
        };
      })
      .catch(() => {
        // En navegadores que no soportan la query 'geolocation' o lanzan error, no forzar llamada en carga
      });

    return () => {
      isMounted = false;
    };
  }, [requestLocation]);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  return { coordinates, error, isLoading, calculateDistance, requestLocation };
};
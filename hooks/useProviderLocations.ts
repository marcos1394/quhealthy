// Ubicación: src/hooks/useProviderLocations.ts
import { useState, useCallback } from 'react';
import { locationService } from '@/services/location.service';
import { ProviderLocation, CreateLocationRequest } from '@/types/providerLocation';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

export const useProviderLocations = () => {
  const [locations, setLocations] = useState<ProviderLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  // Consulta al servicio la lista de sedes
  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await locationService.getMyLocations();
      setLocations(data);
    } catch (error: any) {
      console.error("Error al obtener las sedes:", error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crea una nueva sede y actualiza el estado local
  const createLocation = async (payload: CreateLocationRequest) => {
    setIsMutating(true);
    try {
      const newLocation = await locationService.createLocation(payload);
      setLocations((prev) => [...prev, newLocation]);
      toast.success("Sede agregada correctamente.");
      return true; // Retornamos boolean para que el componente sepa si cerrar el modal
    } catch (error: any) {
      console.error("Error al crear la sede:", error);
      handleApiError(error);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // Actualiza una sede y refleja el cambio en la lista
  const updateLocation = async (id: number, payload: CreateLocationRequest) => {
    setIsMutating(true);
    try {
      const updatedLocation = await locationService.updateLocation(id, payload);
      setLocations((prev) => 
        prev.map((loc) => (loc.id === id ? updatedLocation : loc))
      );
      toast.success("Sede actualizada correctamente.");
      return true;
    } catch (error: any) {
      console.error(`Error al actualizar la sede ${id}:`, error);
      handleApiError(error);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // Alterna el estado (Activo/Inactivo)
  const toggleLocation = async (id: number) => {
    setIsMutating(true);
    try {
      const response = await locationService.toggleLocation(id);
      
      // Actualizamos solo el estado isActive de la sede modificada
      setLocations((prev) => 
        prev.map((loc) => 
          loc.id === id ? { ...loc, isActive: response.isActiveNow } : loc
        )
      );

      // Si el backend advierte sobre citas huérfanas, mostramos warning, si no, success
      if (response.futureAppointmentsCount > 0) {
        toast.warning(response.message);
      } else {
        toast.success(response.message);
      }
      return true;
    } catch (error: any) {
      console.error(`Error al alternar el estado de la sede ${id}:`, error);
      handleApiError(error);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    locations,
    isLoading,
    isMutating,
    fetchLocations,
    createLocation,
    updateLocation,
    toggleLocation
  };
};
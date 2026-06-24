// Ubicación: src/services/location.service.ts
import axiosInstance from '@/lib/axios';
import { 
  ProviderLocation, 
  CreateLocationRequest, 
  ToggleLocationResponse 
} from '@/types/providerLocation';

export const locationService = {
  
  /**
   * Obtiene todas las sedes del proveedor autenticado
   */
  getMyLocations: async (): Promise<ProviderLocation[]> => {
    const response = await axiosInstance.get<ProviderLocation[]>('/api/onboarding/locations');
    return response.data;
  },

  /**
   * Obtiene el detalle de una sede específica
   */
  getLocationById: async (id: number): Promise<ProviderLocation> => {
    const response = await axiosInstance.get<ProviderLocation>(`/api/onboarding/locations/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva sede
   */
  createLocation: async (payload: CreateLocationRequest): Promise<ProviderLocation> => {
    const response = await axiosInstance.post<ProviderLocation>('/api/onboarding/locations', payload);
    return response.data;
  },

  /**
   * Actualiza la información de una sede existente
   */
  updateLocation: async (id: number, payload: CreateLocationRequest): Promise<ProviderLocation> => {
    const response = await axiosInstance.put<ProviderLocation>(`/api/onboarding/locations/${id}`, payload);
    return response.data;
  },

  /**
   * Activa o desactiva una sede (Toggle)
   */
  toggleLocation: async (id: number): Promise<ToggleLocationResponse> => {
    const response = await axiosInstance.patch<ToggleLocationResponse>(`/api/onboarding/locations/${id}/toggle`);
    return response.data;
  }
};
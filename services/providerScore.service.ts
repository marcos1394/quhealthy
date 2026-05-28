// src/services/providerScore.service.ts
import axiosInstance from '@/lib/axios';
import { ProviderScoreResponse, QuScoreMethodologyResponse } from '@/types/providerScore';

const BASE_URL = '/api/catalog/v1/providers/scores';

export const providerScoreService = {
  
  /**
   * Obtiene el score detallado de un solo proveedor (Para la página del Perfil Público)
   */
  getProviderScore: async (providerId: number): Promise<ProviderScoreResponse> => {
    const response = await axiosInstance.get<ProviderScoreResponse>(`${BASE_URL}/${providerId}`);
    return response.data;
  },

  /**
   * Obtiene los scores de múltiples proveedores de golpe (Para la vista de Búsqueda)
   */
  getScoresBatch: async (providerIds: number[]): Promise<ProviderScoreResponse[]> => {
    if (!providerIds || providerIds.length === 0) return [];
    
    // Convertimos el arreglo [1, 2, 3] en la query string "1,2,3"
    const idsParam = providerIds.join(',');
    
    const response = await axiosInstance.get<ProviderScoreResponse[]>(`${BASE_URL}/batch`, {
      params: { ids: idsParam }
    });
    
    return response.data;
  },

  /**
   * Obtiene la metodología pública del QuScore
   */
  getScoreMethodology: async (): Promise<QuScoreMethodologyResponse> => {
    const response = await axiosInstance.get<QuScoreMethodologyResponse>(`${BASE_URL}/methodology`);
    return response.data;
  }
};
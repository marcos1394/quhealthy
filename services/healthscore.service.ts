// src/services/healthscore.service.ts
import axiosInstance from '@/lib/axios';
import { HealthProfilePayload, HealthScoreResponse } from '@/types/healthscore';

// 🚀 La ruta exacta que definimos en el controlador y API Gateway
const BASE_URL = '/api/onboarding/v1/health-profiles';

export const healthScoreService = {
  
  /**
   * Obtiene el score actual del paciente autenticado
   */
  getMyScore: async (): Promise<HealthScoreResponse> => {
    const response = await axiosInstance.get<HealthScoreResponse>(`${BASE_URL}/me`);
    return response.data;
  },

  /**
   * Envía o actualiza el perfil de salud (Onboarding o Recálculo)
   */
  submitProfile: async (payload: HealthProfilePayload): Promise<HealthScoreResponse> => {
    const response = await axiosInstance.post<HealthScoreResponse>(BASE_URL, payload);
    return response.data;
  },
};
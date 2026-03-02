
// src/services/consumerProfile.service.ts
import axiosInstance from '@/lib/axios';
import { ConsumerProfile } from '@/types/consumerProfile';

const BASE_URL = '/api/onboarding/consumer/profile';

export const consumerProfileService = {
  
  /**
   * Obtiene el perfil enriquecido del paciente.
   * Si no existe en la BD, el backend devuelve un objeto vacío.
   */
  getProfile: async (): Promise<ConsumerProfile> => {
    const response = await axiosInstance.get<ConsumerProfile>(BASE_URL);
    return response.data;
  },

  /**
   * Actualiza o crea el perfil enriquecido del paciente.
   */
  updateProfile: async (payload: ConsumerProfile): Promise<ConsumerProfile> => {
    const response = await axiosInstance.put<ConsumerProfile>(BASE_URL, payload);
    return response.data;
  }
};

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
  },

  /**
   * Actualiza el paso de onboarding actual.
   */
  updateOnboardingStep: async (step: number): Promise<void> => {
    await axiosInstance.patch(`${BASE_URL}/step?step=${step}`);
  },

  /**
   * Guarda los datos demográficos (Paso 1).
   */
  updateDemographics: async (payload: any): Promise<void> => {
    await axiosInstance.put(`/api/onboarding/consumer/step-demographics`, payload);
  },

  /**
   * Guarda los datos biométricos y de estilo de vida (Paso 2 y 3).
   */
  updateBiometricsLifestyle: async (data: any) => {
    const response = await axiosInstance.put("/api/onboarding/consumer/step-biometrics-lifestyle", data);
    return response.data;
  },
  updateClinicalHistory: async (data: any) => {
    const response = await axiosInstance.put("/api/onboarding/consumer/step-clinical-history", data);
    return response.data;
  },
  updateGoals: async (data: any) => {
    const response = await axiosInstance.put("/api/onboarding/consumer/step-goals", data);
    return response.data;
  },
  searchIcd10: async (query: string) => {
    const response = await axiosInstance.get(`/api/catalogs/icd10?query=${encodeURIComponent(query)}&size=20`);
    return response.data;
  }
};
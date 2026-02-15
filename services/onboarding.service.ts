import axiosInstance from '@/lib/axios';
import { OnboardingStatusResponse } from '@/types/onboarding';

const BASE_URL = '/api/onboarding';

export const onboardingService = {

  /**
   * Obtiene el estado actual de todos los pasos del onboarding.
   */
  getStatus: async (): Promise<OnboardingStatusResponse> => {
    // La instancia de axios ya inyecta el 'Authorization: Bearer token'
    const response = await axiosInstance.get<OnboardingStatusResponse>(
      `${BASE_URL}/status`
    );
    return response.data;
  },

  // Aquí agregarás métodos futuros para guardar cada paso
  // saveProfile: (data) => axiosInstance.post(...),
  // uploadKyc: (file) => axiosInstance.post(...),
};
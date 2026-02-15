import axiosInstance from '@/lib/axios';
import { OnboardingStatusResponse } from '@/types/onboarding';

const BASE_URL = '/api/onboarding';

export const onboardingService = {
  /**
   * Obtiene el estado actual.
   * NO enviamos X-User-Id. El backend lo saca del Token JWT (Authorization header).
   */
  getStatus: async (): Promise<OnboardingStatusResponse> => {
    // axiosInstance ya envía 'Authorization: Bearer ...' automáticamente
    const response = await axiosInstance.get<OnboardingStatusResponse>(
      `${BASE_URL}/status`
    );
    return response.data;
  },
};
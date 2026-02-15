import axiosInstance from '@/lib/axios';
import { OnboardingStatusResponse, ProfileResponse, UpdateProfileRequest } from '@/types/onboarding';

const BASE_URL = '/api/onboarding';
const BASE_PROFILE = '/api/onboarding/profile'; // ✅ Nueva Base URL

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

  // =================================================================
  // 👤 PERFIL PROFESIONAL (Paso 1)
  // =================================================================

  /**
   * Obtiene la información actual del perfil del doctor logueado.
   */
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await axiosInstance.get<ProfileResponse>(
      `${BASE_PROFILE}`
    );
    return response.data;
  },

  /**
   * Actualiza o Crea el perfil.
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<void> => {
    await axiosInstance.put(
      `${BASE_PROFILE}`,
      data
    );
  },

  /**
   * Obtiene un perfil público (Para vista previa o compartir).
   */
  getPublicProfile: async (providerId: number): Promise<ProfileResponse> => {
    const response = await axiosInstance.get<ProfileResponse>(
      `${BASE_PROFILE}/${providerId}`
    );
    return response.data;
  }
};

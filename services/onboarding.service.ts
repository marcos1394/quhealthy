import axiosInstance from '@/lib/axios';
import { CategoryResponse, OnboardingStatusResponse, ProfileResponse, SubCategoryResponse, TagResponse, UpdateProfileRequest } from '@/types/onboarding';

const BASE_URL = '/api/onboarding';
const BASE_PROFILE = '/api/onboarding/profile'; // ✅ Nueva Base URL
const BASE_CATALOGS = '/api/onboarding/catalogs';

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
  },

  // =================================================================
  // 📚 CATÁLOGOS (Públicos)
  // =================================================================

  getCategories: async (): Promise<CategoryResponse[]> => {
    const response = await axiosInstance.get<CategoryResponse[]>(`${BASE_CATALOGS}/categories`);
    return response.data;
  },

  getSubCategories: async (categoryId: number): Promise<SubCategoryResponse[]> => {
    const response = await axiosInstance.get<SubCategoryResponse[]>(
      `${BASE_CATALOGS}/categories/${categoryId}/subcategories`
    );
    return response.data;
  },

  getTags: async (): Promise<TagResponse[]> => {
    const response = await axiosInstance.get<TagResponse[]>(`${BASE_CATALOGS}/tags`);
    return response.data;
  }
};

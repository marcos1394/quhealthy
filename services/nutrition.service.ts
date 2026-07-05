import axiosInstance from '@/lib/axios';
import { NutritionAnalysis, NutritionProfile, NutritionProfileRequest } from '@/types/nutrition';

const BASE_URL = '/api/onboarding/consumer/nutrition';

export const nutritionService = {
  /**
   * Envia una imagen para ser analizada por la IA
   */
  analyzeFood: async (file: File): Promise<NutritionAnalysis> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post<NutritionAnalysis>(`${BASE_URL}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Obtiene el historial de análisis nutricional
   */
  getHistory: async (): Promise<NutritionAnalysis[]> => {
    const response = await axiosInstance.get<NutritionAnalysis[]>(`${BASE_URL}/history`);
    return response.data;
  },

  /**
   * Obtiene la URL completa de la imagen. Usa la url prefirmada si existe.
   */
  getImageUrl: (item: Partial<NutritionAnalysis>): string => {
    if (item.presignedImageUrl) return item.presignedImageUrl;
    if (!item.imageUrl) return '';
    if (item.imageUrl.startsWith('http')) return item.imageUrl;
    
    // Fallback por si en algún momento se expone públicamente
    const baseUrl = axiosInstance.defaults.baseURL || process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org';
    return `${baseUrl}/${item.imageUrl.replace(/^\//, '')}`;
  },

  /**
   * Obtiene el perfil nutricional y metas
   */
  getProfile: async (): Promise<NutritionProfile> => {
    const response = await axiosInstance.get<NutritionProfile>(`${BASE_URL}/profile`);
    return response.data;
  },

  /**
   * Actualiza el perfil biométrico y recalcula metas
   */
  updateProfile: async (data: NutritionProfileRequest): Promise<NutritionProfile> => {
    const response = await axiosInstance.post<NutritionProfile>(`${BASE_URL}/profile`, data);
    return response.data;
  }
};

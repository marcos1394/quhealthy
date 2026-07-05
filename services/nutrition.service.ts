import axiosInstance from '@/lib/axios';
import { NutritionAnalysis } from '@/types/nutrition';

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
  }
};

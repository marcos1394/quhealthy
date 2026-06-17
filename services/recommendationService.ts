import axiosInstance from '@/lib/axios';

export interface RecommendationConfigDto {
  id?: number;
  campaignCode: string;
  applyToAll: boolean;
  applicableItemIds: number[];
  discountAmount: number;
  isDiscountPercentage: boolean;
  commissionAmount: number;
  isCommissionPercentage: boolean;
  isActive: boolean;
}

export const recommendationService = {
  /**
   * ⚙️ Obtiene todas las campañas de recomendación del doctor
   * Retorna un arreglo de campañas.
   */
  getConfig: async (): Promise<RecommendationConfigDto[]> => {
    const response = await axiosInstance.get<RecommendationConfigDto[]>('/api/referrals/recommendations/config');
    return response.data;
  },

  /**
   * 💾 Guarda o actualiza una campaña específica
   */
  saveConfig: async (payload: RecommendationConfigDto): Promise<RecommendationConfigDto> => {
    const response = await axiosInstance.post<RecommendationConfigDto>('/api/referrals/recommendations/config', payload);
    return response.data;
  }
};
// services/analytics.service.ts
import axiosInstance from '@/lib/axios';

const BASE_URL = '/api/intelligence/store';

export interface VisitRequestDto {
  providerId: number;
  consumerId?: number;
  searchQuery?: string;
  referrer?: string;
  deviceType?: string;
}

export const analyticsService = {
  logStoreVisit: async (data: VisitRequestDto): Promise<void> => {
    await axiosInstance.post(`${BASE_URL}/visit`, data);
  },

  getStoreSalesMetrics: async (providerId: number, days: number = 30) => {
    const response = await axiosInstance.get(`${BASE_URL}/${providerId}/metrics/sales?days=${days}`);
    return response.data;
  },

  getStoreVisitsMetrics: async (providerId: number, days: number = 30) => {
    const response = await axiosInstance.get(`${BASE_URL}/${providerId}/metrics/visits?days=${days}`);
    return response.data;
  }
};

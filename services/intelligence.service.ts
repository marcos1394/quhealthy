import axiosInstance from '@/lib/axios';
import { DistributionDTO, ExecutiveSummaryDTO, HealthcareMapDTO } from '@/types/intelligence';

const BASE_URL = '/api/intelligence';

import { BIFilters } from '@/store/intelligence.store';

export const intelligenceService = {
  getSummary: async (filters?: BIFilters): Promise<ExecutiveSummaryDTO> => {
    const response = await axiosInstance.get(`${BASE_URL}/summary`, { params: filters });
    return response.data;
  },

  getAggregate: async (groupBy: string, filters?: BIFilters): Promise<DistributionDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/aggregate`, { 
      params: { groupBy, ...filters } 
    });
    return response.data;
  },

  getMap: async (filters?: BIFilters): Promise<HealthcareMapDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/map`, { params: filters });
    return response.data;
  }
};

import axiosInstance from '@/lib/axios';
import { DistributionDTO, ExecutiveSummaryDTO, HealthcareMapDTO } from '@/types/intelligence';

const BASE_URL = '/api/intelligence';

export const intelligenceService = {
  getSummary: async (): Promise<ExecutiveSummaryDTO> => {
    const response = await axiosInstance.get(`${BASE_URL}/summary`);
    return response.data;
  },

  getStates: async (): Promise<DistributionDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/states`);
    return response.data;
  },

  getInstitutions: async (): Promise<DistributionDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/institutions`);
    return response.data;
  },

  getTypes: async (): Promise<DistributionDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/types`);
    return response.data;
  },

  getMap: async (params?: { estado?: string; municipio?: string; institucion?: string; nivel?: string; tipo?: string }): Promise<HealthcareMapDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/map`, { params });
    return response.data;
  }
};

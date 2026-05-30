import axiosInstance from '@/lib/axios';
import { DistributionDTO, ExecutiveSummaryDTO, HealthcareMapDTO } from '@/types/intelligence';

// En caso de que se use un microservicio dedicado y no pase por el gateway,
// se puede inyectar la URL de analytics, de lo contrario se usa el path relativo
// que resolverá contra el NEXT_PUBLIC_API_URL configurado en axiosInstance.
const BASE_URL = process.env.NEXT_PUBLIC_ANALYTICS_API_URL || 'http://localhost:8087';

export const intelligenceService = {
  getSummary: async (): Promise<ExecutiveSummaryDTO> => {
    const response = await axiosInstance.get(`${BASE_URL}/api/intelligence/summary`);
    return response.data;
  },

  getStates: async (): Promise<DistributionDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/api/intelligence/states`);
    return response.data;
  },

  getInstitutions: async (): Promise<DistributionDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/api/intelligence/institutions`);
    return response.data;
  },

  getTypes: async (): Promise<DistributionDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/api/intelligence/types`);
    return response.data;
  },

  getMap: async (params?: { estado?: string; municipio?: string; institucion?: string; nivel?: string; tipo?: string }): Promise<HealthcareMapDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/api/intelligence/map`, { params });
    return response.data;
  }
};

import axiosInstance from '@/lib/axios';
import { GrowthMeasurementRequest, GrowthMeasurementResponse, WhoGrowthStandard } from '@/types/growth';

export const growthService = {
  
  // PROVIDER
  getPatientHistoryProvider: async (dependentId: number): Promise<GrowthMeasurementResponse[]> => {
    const response = await axiosInstance.get(`/api/onboarding/provider/growth/dependent/${dependentId}`);
    return response.data;
  },

  recordMeasurementProvider: async (data: GrowthMeasurementRequest): Promise<GrowthMeasurementResponse> => {
    const response = await axiosInstance.post('/api/onboarding/provider/growth/measurements', data);
    return response.data;
  },

  // CONSUMER
  getConsumerHistory: async (dependentId: number): Promise<GrowthMeasurementResponse[]> => {
    const response = await axiosInstance.get(`/api/onboarding/consumer/growth/dependent/${dependentId}/history`);
    return response.data;
  },

  recordMeasurementConsumer: async (dependentId: number, data: GrowthMeasurementRequest): Promise<GrowthMeasurementResponse> => {
    const response = await axiosInstance.post(`/api/onboarding/consumer/growth/dependent/${dependentId}/measurements`, data);
    return response.data;
  },

  // COMMON
  getStandards: async (): Promise<WhoGrowthStandard[]> => {
    const response = await axiosInstance.get('/api/onboarding/growth/standards');
    return response.data;
  }
};

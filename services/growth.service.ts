import { axiosInstance } from './axiosInstance';
import { GrowthMeasurementRequest, GrowthMeasurementResponse, WhoGrowthStandard } from '@/types/growth';

export const growthService = {
  
  // PROVIDER
  recordProviderMeasurement: async (data: GrowthMeasurementRequest): Promise<GrowthMeasurementResponse> => {
    const response = await axiosInstance.post('/api/onboarding/provider/growth/measurements', data);
    return response.data;
  },
  
  getPatientHistoryProvider: async (patientId: number): Promise<GrowthMeasurementResponse[]> => {
    const response = await axiosInstance.get(`/api/onboarding/provider/growth/patient/${patientId}`);
    return response.data;
  },

  // CONSUMER
  recordConsumerMeasurement: async (data: GrowthMeasurementRequest): Promise<GrowthMeasurementResponse> => {
    const response = await axiosInstance.post('/api/onboarding/consumer/growth/measurements', data);
    return response.data;
  },
  
  getConsumerHistory: async (): Promise<GrowthMeasurementResponse[]> => {
    const response = await axiosInstance.get('/api/onboarding/consumer/growth/history');
    return response.data;
  },

  // COMMON
  getStandards: async (): Promise<WhoGrowthStandard[]> => {
    const response = await axiosInstance.get('/api/onboarding/growth/standards');
    return response.data;
  }
};

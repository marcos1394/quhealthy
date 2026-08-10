import axiosInstance from '@/lib/axios';

export interface OncologyProfileDto {
  id?: number;
  cie10Code: string;
  cie10Description: string;
  diagnosisDate: string;
  stagingT: string;
  stagingN: string;
  stagingM: string;
  overallStage: string;
  treatmentLine: number;
  status: string;
}

export const oncologyService = {
  getProfile: async (consumerId: number): Promise<OncologyProfileDto> => {
    const response = await axiosInstance.get<OncologyProfileDto>(`/api/onboarding/consumer/${consumerId}/oncology/profile`);
    return response.data;
  },

  updateProfile: async (consumerId: number, data: Partial<OncologyProfileDto>): Promise<OncologyProfileDto> => {
    const response = await axiosInstance.post<OncologyProfileDto>(`/api/onboarding/consumer/${consumerId}/oncology/profile`, data);
    return response.data;
  }
};

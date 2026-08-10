import axiosInstance from '@/lib/axios';

export interface TreatmentDto {
  id?: number;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  category: string;
  startDate: string;
  endDate?: string;
  reason?: string;
  prescriber?: string;
  status?: string;
  nextDoseTime?: string;
}

export const treatmentService = {
  getMyTreatments: async (): Promise<TreatmentDto[]> => {
    const response = await axiosInstance.get<TreatmentDto[]>('/api/appointments/treatments/me');
    return response.data;
  },

  addManualTreatment: async (data: Partial<TreatmentDto>): Promise<TreatmentDto> => {
    const response = await axiosInstance.post<TreatmentDto>('/api/appointments/treatments/manual', data);
    return response.data;
  }
};

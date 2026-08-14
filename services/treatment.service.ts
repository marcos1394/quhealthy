import axiosInstance from '@/lib/axios';

export interface TreatmentDto {
  id?: number;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  category: "ONCOLOGY" | "GENERAL" | "CARDIOLOGY" | "OTHER" | string;
  startDate: string;
  endDate?: string;
  reason?: string;
  prescriber?: string;
  status?: "ACTIVE" | "COMPLETED" | "DISCONTINUED" | string;
  nextDoseTime?: string;
  patientActiveProblemId?: number;
  diagnosisName?: string;
  cie10Code?: string;
  totalDoses?: number;
  dosesTaken?: number;
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

import axiosInstance from '@/lib/axios';

export interface PatientDiagnosisDto {
  id: number;
  healthProfileId: number;
  diagnosis: string;
  cie10Code?: string;
  status?: string;
  startDate?: string;
  resolutionDate?: string;
  professional?: string;
  priority?: string;
  observations?: string;
}

export const diagnosisService = {
  getMyDiagnoses: async (): Promise<PatientDiagnosisDto[]> => {
    const response = await axiosInstance.get<PatientDiagnosisDto[]>('/api/appointments/diagnoses/me');
    return response.data;
  },

  addManualDiagnosis: async (data: { cie10Code: string; diagnosis: string }): Promise<PatientDiagnosisDto> => {
    const response = await axiosInstance.post<PatientDiagnosisDto>('/api/appointments/diagnoses/manual', data);
    return response.data;
  },

  deleteDiagnosis: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/appointments/diagnoses/${id}`);
  },

  updateDiagnosisStatus: async (id: number, status: string): Promise<void> => {
    await axiosInstance.patch(`/api/appointments/diagnoses/${id}/status`, { status });
  }
};

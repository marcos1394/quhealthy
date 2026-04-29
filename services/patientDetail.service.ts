
import axiosInstance from '@/lib/axios';
import { MedicalHistoryResponse, PatientDirectoryProfile } from '@/types/medicalHistory';
import { PatientHealthProfile } from '@/types/healthProfile';

export const patientDetailService = {
  /**
   * 👤 Obtiene la información básica del paciente desde el directorio local
   */
  getPatientProfile: async (patientDirectoryId: number): Promise<PatientDirectoryProfile> => {
    // Nota: Asegúrate de tener este endpoint GET básico en tu PatientDirectoryController
    const response = await axiosInstance.get<PatientDirectoryProfile>(`/api/appointments/provider/directory/${patientDirectoryId}`);
    return response.data;
  },

  /**
   * 🩺 Obtiene el expediente médico completo (con validación de candado de seguridad)
   */
  getMedicalHistory: async (patientDirectoryId: number): Promise<MedicalHistoryResponse> => {
    const response = await axiosInstance.get<MedicalHistoryResponse>(`/api/appointments/provider/directory/${patientDirectoryId}/medical-history`);
    return response.data;
  },

  /**
   * 📋 Obtiene los antecedentes clínicos base
   */
  getHealthProfile: async (patientDirectoryId: number): Promise<PatientHealthProfile> => {
    const response = await axiosInstance.get<PatientHealthProfile>(`/api/appointments/provider/directory/${patientDirectoryId}/health-profile`);
    return response.data;
  },

  /**
   * ✏️ Actualiza los antecedentes (solo pacientes offline)
   */
  updateHealthProfile: async (
    patientDirectoryId: number,
    payload: Partial<PatientHealthProfile>
  ): Promise<PatientHealthProfile> => {
    const response = await axiosInstance.put<PatientHealthProfile>(`/api/appointments/provider/directory/${patientDirectoryId}/health-profile`, payload);
    return response.data;
  }
};
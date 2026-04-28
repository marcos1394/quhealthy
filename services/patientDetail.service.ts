
import axiosInstance from '@/lib/axios';
import { MedicalHistoryResponse, PatientDirectoryProfile } from '@/types/medicalHistory';

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
  }
};
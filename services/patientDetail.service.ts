
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
  },

  // ==========================================
  // Problemas Activos
  // ==========================================
  addActiveProblem: async (patientDirectoryId: number, problem: any) => {
    const response = await axiosInstance.post(`/api/appointments/provider/directory/${patientDirectoryId}/health-profile/problems`, problem);
    return response.data;
  },

  deleteActiveProblem: async (patientDirectoryId: number, problemId: number) => {
    await axiosInstance.delete(`/api/appointments/provider/directory/${patientDirectoryId}/health-profile/problems/${problemId}`);
  },

  // ==========================================
  // Alergias
  // ==========================================
  addAllergy: async (patientDirectoryId: number, allergy: any) => {
    const response = await axiosInstance.post(`/api/appointments/provider/directory/${patientDirectoryId}/health-profile/allergies`, allergy);
    return response.data;
  },

  deleteAllergy: async (patientDirectoryId: number, allergyId: number) => {
    await axiosInstance.delete(`/api/appointments/provider/directory/${patientDirectoryId}/health-profile/allergies/${allergyId}`);
  },

  // ==========================================
  // Medicamentos
  // ==========================================
  addMedication: async (patientDirectoryId: number, medication: any) => {
    const response = await axiosInstance.post(`/api/appointments/provider/directory/${patientDirectoryId}/health-profile/medications`, medication);
    return response.data;
  },

  deleteMedication: async (patientDirectoryId: number, medicationId: number) => {
    await axiosInstance.delete(`/api/appointments/provider/directory/${patientDirectoryId}/health-profile/medications/${medicationId}`);
  }
};
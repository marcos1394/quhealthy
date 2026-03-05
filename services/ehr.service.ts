// src/services/ehr.service.ts
import axiosInstance from '@/lib/axios';
import { 
  PatientClinicalProfile, 
  VaultDocument, 
  CompleteConsultationPayload 
} from '@/types/ehr';

export const ehrService = {
  
  /**
   * 🗂️ Obtiene el Perfil Clínico y el QuScore del paciente (Vía Onboarding Service)
   */
  getPatientProfile: async (consumerId: number): Promise<PatientClinicalProfile> => {
    const response = await axiosInstance.get<PatientClinicalProfile>(`/api/onboarding/consumers/${consumerId}/profile`);
    return response.data;
  },

  /**
   * 🛡️ Obtiene los documentos de la Bóveda de Salud del paciente
   */
  getPatientVault: async (consumerId: number): Promise<VaultDocument[]> => {
    const response = await axiosInstance.get<VaultDocument[]>(`/api/onboarding/consumers/${consumerId}/vault`);
    return response.data;
  },

  /**
   * ✅ Finaliza la consulta médica. Guarda las notas SOAP y genera la Receta Digital.
   * (Apunta a tu AppointmentService existente, asumiendo que el backend se actualizará para procesar el payload de receta).
   */
  completeConsultation: async (appointmentId: number, payload: CompleteConsultationPayload): Promise<void> => {
    // Usamos el endpoint que ya tienes listado en tu documentación
    await axiosInstance.patch(`/api/appointments/${appointmentId}/complete`, payload);
  }
};
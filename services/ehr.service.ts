// Ubicación: src/services/ehr.service.ts
import axiosInstance from '@/lib/axios';
import { 
  PatientClinicalProfile, 
  VaultDocument, 
  CompleteConsultationPayload 
} from '@/types/ehr';

export const ehrService = {
  
  /**
   * 🗂️ Obtiene el Perfil Clínico y el QuScore del paciente
   * 🚀 FIX FF-005: Ruta alineada al nuevo endpoint exclusivo para el Doctor (Provider)
   */
  getPatientProfile: async (consumerId: number): Promise<PatientClinicalProfile> => {
    const response = await axiosInstance.get<PatientClinicalProfile>(`/api/onboarding/consumer/profile/${consumerId}`);
    return response.data;
  },

  /**
   * 🛡️ Obtiene los documentos de la Bóveda de Salud del paciente
   * 🚀 FIX FF-005: Ruta alineada al nuevo endpoint exclusivo para el Doctor (Provider)
   */
  getPatientVault: async (consumerId: number): Promise<VaultDocument[]> => {
    const response = await axiosInstance.get<VaultDocument[]>(`/api/onboarding/consumer/vault/${consumerId}`);
    return response.data;
  },

  /**
   * ✅ Finaliza la consulta médica. Guarda las notas SOAP y genera la Receta Digital.
   * Utiliza el tipado estricto que definimos en la FF-004.
   */
  completeConsultation: async (appointmentId: number, payload: CompleteConsultationPayload): Promise<void> => {
    await axiosInstance.patch(`/api/appointments/${appointmentId}/complete`, payload);
  }
};
// Ubicación: src/services/ehr.service.ts
import axiosInstance from '@/lib/axios';
import { 
  PatientClinicalProfile, 
  VaultDocument, 
  CompleteConsultationPayload,
  ClinicalNotesDto
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
   * 📖 Obtiene las notas clínicas (borrador o finalizadas) de una cita
   * GET /api/appointments/{id}/clinical-notes
   */
  getClinicalNotes: async (appointmentId: number): Promise<ClinicalNotesDto> => {
    const response = await axiosInstance.get<ClinicalNotesDto>(`/api/appointments/${appointmentId}/clinical-notes`);
    return response.data;
  },

  /**
   * 📝 Guarda un borrador de notas clínicas SOAP sin finalizar la consulta
   * PATCH /api/appointments/{id}/clinical-notes
   */
  saveClinicalNotesDraft: async (appointmentId: number, notes: ClinicalNotesDto): Promise<void> => {
    await axiosInstance.patch(`/api/appointments/${appointmentId}/clinical-notes`, notes);
  },

  /**
   * ✅ Finaliza la consulta médica. Guarda las notas SOAP y genera la Receta Digital.
   * 🚀 FIX RUTA CRÍTICA: Antes llamaba a /{id}/complete (AppointmentController).
   * El endpoint correcto del ConsultationController es /{id}/consultation.
   */
  completeConsultation: async (appointmentId: number, payload: CompleteConsultationPayload): Promise<void> => {
    await axiosInstance.patch(`/api/appointments/${appointmentId}/consultation`, payload);
  }
};
import axiosInstance from '@/lib/axios';
import { PatientClient, PatientRegistrationPayload } from '@/types/patient';

export const patientDirectoryService = {
  /**
   * 👥 Obtiene la lista completa de pacientes activos/inactivos del doctor
   * GET /api/appointments/provider/clients
   */
  getProviderClients: async (): Promise<PatientClient[]> => {
    const response = await axiosInstance.get<PatientClient[]>('/api/appointments/provider/clients');
    return response.data;
  },

  /**
   * ➕ Crea un paciente "Offline" manual en el directorio del doctor
   * POST /api/appointments/provider/directory
   */
  createOfflinePatient: async (payload: PatientRegistrationPayload): Promise<void> => {
    await axiosInstance.post('/api/appointments/provider/directory', payload);
  },

  /**
   * 🗑️ Elimina un paciente manual del directorio
   * DELETE /api/appointments/provider/directory/{id}
   */
  deletePatient: async (patientDirectoryId: number): Promise<void> => {
    await axiosInstance.delete(`/api/appointments/provider/directory/${patientDirectoryId}`);
  },

  /**
   * 🔐 Solicita acceso al expediente de un paciente de la plataforma
   * POST /api/appointments/consents/request/{consumerId}
   */
  requestConsent: async (consumerId: number): Promise<void> => {
    await axiosInstance.post(`/api/appointments/consents/request/${consumerId}`);
  }
};
import axiosInstance from '@/lib/axios';
import { PatientClient, PatientRegistrationPayload, PatientUpdatePayload } from '@/types/patient';

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
   * ✏️ Actualiza los datos de contacto de un paciente offline
   * PUT /api/appointments/provider/directory/{id}
   */
  updateOfflinePatient: async (patientDirectoryId: number, payload: PatientUpdatePayload): Promise<void> => {
    await axiosInstance.put(`/api/appointments/provider/directory/${patientDirectoryId}`, payload);
  },

  /**
   * 🔎 Busca pacientes dentro del directorio del proveedor
   * GET /api/appointments/provider/directory/search?q=
   */
  searchPatients: async (query: string): Promise<PatientClient[]> => {
    const response = await axiosInstance.get<PatientClient[]>('/api/appointments/provider/directory/search', {
      params: { q: query }
    });
    return response.data;
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

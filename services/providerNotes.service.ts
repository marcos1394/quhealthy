// services/providerNotes.service.ts
import axiosInstance from '@/lib/axios';

export interface ProviderPatientNoteDto {
  id: number;
  patientDirectoryId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderPatientNoteRequest {
  content: string;
}

export const providerNotesService = {
  /**
   * Obtiene las notas privadas de un médico sobre un paciente
   */
  getNotes: async (patientDirectoryId: number): Promise<ProviderPatientNoteDto[]> => {
    const response = await axiosInstance.get<ProviderPatientNoteDto[]>(`/api/appointments/provider/notes/${patientDirectoryId}`);
    return response.data;
  },

  /**
   * Crea una nueva nota privada
   */
  createNote: async (patientDirectoryId: number, payload: CreateProviderPatientNoteRequest): Promise<ProviderPatientNoteDto> => {
    const response = await axiosInstance.post<ProviderPatientNoteDto>(`/api/appointments/provider/notes/${patientDirectoryId}`, payload);
    return response.data;
  },

  /**
   * Elimina una nota privada
   */
  deleteNote: async (patientDirectoryId: number, noteId: number): Promise<void> => {
    // Correcting endpoint path since noteId uniquely identifies it
    await axiosInstance.delete(`/api/appointments/provider/notes/${noteId}`);
  }
};

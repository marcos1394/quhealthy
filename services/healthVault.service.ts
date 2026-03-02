// src/services/healthVault.service.ts
import axiosInstance from '@/lib/axios';
import { ConsumerDocument } from '@/types/healthVault';

const BASE_URL = '/api/onboarding/consumer/vault';

export const healthVaultService = {
  
  /**
   * Obtiene la lista de documentos en la bóveda del paciente
   */
  getDocuments: async (): Promise<ConsumerDocument[]> => {
    const response = await axiosInstance.get<ConsumerDocument[]>(BASE_URL);
    return response.data;
  },

  /**
   * Sube un nuevo documento clínico (Laboratorio, Receta, etc.)
   */
  uploadDocument: async (file: File, documentType: string = 'GENERAL'): Promise<ConsumerDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    // Axios configura el 'boundary' automáticamente, pero es buena práctica indicarle el Content-Type
    const response = await axiosInstance.post<ConsumerDocument>(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Genera una URL temporal segura de GCP para ver/descargar el documento
   */
  getDocumentUrl: async (documentId: string): Promise<string> => {
    const response = await axiosInstance.get<{ url: string }>(`${BASE_URL}/${documentId}/url`);
    return response.data.url;
  }
};
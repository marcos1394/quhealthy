import axiosInstance from '@/lib/axios';

interface UploadUrlResponse {
  signedUrl: string;
  fileKey: string;
}

export const storageService = {
  /**
   * Pide permiso al backend para subir una receta médica.
   * Devuelve la URL temporal de Google Cloud y la ruta donde se guardará (fileKey).
   */
  getPrescriptionUploadUrl: async (fileType: string): Promise<UploadUrlResponse> => {
    const response = await axiosInstance.get<UploadUrlResponse>(
      '/api/appointments/storage/consumer/prescription-upload-url',
      { params: { fileType } }
    );
    return response.data;
  },

  /**
   * Pide permiso al backend para subir una evidencia de empaque (Para médicos).
   * Devuelve la URL temporal de Google Cloud y la ruta donde se guardará (fileKey).
   */
  getEvidenceUploadUrl: async (orderId: number, fileType: string): Promise<{signedUrl: string, fileUrl: string}> => {
    const response = await axiosInstance.get<{signedUrl: string, fileUrl: string}>(
      `/api/appointments/provider/orders/${orderId}/upload-evidence-url`,
      { params: { fileType } }
    );
    return response.data;
  },

  /**
   * Realiza el PUT HTTP directo a Google Cloud Storage.
   * No usa axiosInstance para evitar inyectar headers JWT de la plataforma en los servidores de Google.
   */
  uploadDirectToCloud: async (file: File, signedUrl: string): Promise<void> => {
    const response = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error('Fallo al subir el archivo de manera segura a Google Cloud.');
    }
  }
};

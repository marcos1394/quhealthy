import axiosInstance from '@/lib/axios';

const BASE_URL = '/api/onboarding/kyc';

export const documentService = {
  /**
   * Obtiene la lista de documentos del proveedor
   * @param userId (Opcional) El ID de usuario se toma del token en el backend
   */
  getUserDocuments: async (userId?: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/documents`);
    
    // Mapeamos el KycDocumentResponse al formato esperado por el frontend
    return response.data.map((doc: any) => ({
      id: doc.id,
      name: doc.documentType || 'Documento',
      status: doc.verificationStatus?.toLowerCase() || 'pending',
      url: doc.fileUrl || '#',
      ...doc
    }));
  },

  /**
   * Sube un nuevo documento
   * @param formData Debe incluir "file" y preferiblemente "type" (DocumentType) para el backend
   * @param onUploadProgress Callback para el progreso de subida
   */
  uploadDocument: async (formData: FormData, onUploadProgress?: (progress: number) => void) => {
    // El formData debe contener 'file' y 'type'

    const response = await axiosInstance.post(`${BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(progress);
        }
      },
    });
    return response.data;
  },

  /**
   * Elimina un documento
   * @param id ID del documento a eliminar
   */
  deleteDocument: async (id: string) => {
    // NOTA: Actualmente el backend (KycController) NO tiene endpoint DELETE.
    // Se asume la ruta para cuando se cree en el backend.
    const response = await axiosInstance.delete(`${BASE_URL}/documents/${id}`);
    return response.data;
  },

  /**
   * Descarga un documento
   * @param id ID del documento
   * @param name Nombre sugerido para el archivo
   */
  downloadDocument: async (id: string, name?: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/documents/${id}/url`);
    if (response.data?.url) {
      window.open(response.data.url, '_blank');
    }
    return response.data;
  },
};

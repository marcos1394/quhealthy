// src/services/healthVault.service.ts
import axiosInstance from '@/lib/axios';
import { ConsumerDocument, VaultFolder, PanoramaResponseDto } from '@/types/healthVault';

const BASE_URL = '/api/onboarding/consumer/vault';

export const healthVaultService = {
  
  /**
   * 🗂️ Obtiene las carpetas
   */
  getFolders: async (dependentId?: number): Promise<VaultFolder[]> => {
    const response = await axiosInstance.get<VaultFolder[]>(`${BASE_URL}/folders`, {
      params: { dependentId }
    });
    return response.data;
  },

  createFolder: async (name: string, parentFolderId?: string, dependentId?: number): Promise<VaultFolder> => {
    const response = await axiosInstance.post<VaultFolder>(`${BASE_URL}/folders`, {
      name, parentFolderId, dependentId
    });
    return response.data;
  },

  renameFolder: async (folderId: string, name: string): Promise<VaultFolder> => {
    const response = await axiosInstance.put<VaultFolder>(`${BASE_URL}/folders/${folderId}`, { name });
    return response.data;
  },

  deleteFolder: async (folderId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/folders/${folderId}`);
  },

  reorderFolders: async (items: { id: string; displayOrder: number }[]): Promise<void> => {
    await axiosInstance.put(`${BASE_URL}/folders/reorder`, { items });
  },

  /**
   * Obtiene la lista de documentos en la bóveda del paciente
   */
  getDocuments: async (): Promise<ConsumerDocument[]> => {
    const response = await axiosInstance.get<ConsumerDocument[]>(BASE_URL);
    return response.data;
  },

  /**
   * 🚀 Paso 1: Generar URL firmada de GCP para subida segura.
   * El frontend sube directamente a GCP usando esta URL.
   */
  generateUploadUrl: async (
    fileName: string,
    contentType: string,
    sizeInBytes: number,
    documentType: string = 'GENERAL',
    dependentId?: number
  ): Promise<{ uploadUrl: string; fileKey: string }> => {
    const response = await axiosInstance.post<{ uploadUrl: string; fileKey: string }>(
      `${BASE_URL}/upload-url`,
      { fileName, contentType, sizeInBytes, documentType, dependentId }
    );
    return response.data;
  },

  /**
   * 🚀 Paso 2: Confirmar que el archivo fue subido a GCP.
   * El backend lo registra en BD y lanza procesamiento con IA.
   */
  confirmUpload: async (
    fileKey: string,
    originalFileName: string,
    title: string | undefined,
    contentType: string,
    fileSizeBytes: number,
    documentType: string = 'GENERAL',
    dependentId?: number,
    folderId?: string
  ): Promise<ConsumerDocument> => {
    const response = await axiosInstance.post<ConsumerDocument>(
      `${BASE_URL}/confirm`,
      { fileKey, originalFileName, title, contentType, fileSizeBytes, documentType, dependentId, folderId }
    );
    return response.data;
  },

  /**
   * Flujo completo de subida en 2 pasos:
   * 1. Obtener URL firmada del backend
   * 2. Subir archivo directamente a GCP
   * 3. Confirmar subida al backend
   */
  uploadDocument: async (file: File, title?: string, documentType: string = 'GENERAL', dependentId?: number, folderId?: string): Promise<ConsumerDocument> => {
    // Paso 1: Generar URL firmada
    const { uploadUrl, fileKey } = await healthVaultService.generateUploadUrl(
      file.name,
      file.type,
      file.size,
      documentType,
      dependentId
    );

    // Paso 2: Subir directamente a GCP usando la URL firmada
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    // Paso 3: Confirmar al backend que la subida fue exitosa
    const savedDoc = await healthVaultService.confirmUpload(
      fileKey,
      file.name,
      title,
      file.type,
      file.size,
      documentType,
      dependentId,
      folderId
    );

    return savedDoc;
  },

  /**
   * Crea una nota de texto en el expediente
   */
  createNote: async (title: string, noteContent: string, dependentId?: number, folderId?: string): Promise<ConsumerDocument> => {
    const response = await axiosInstance.post<ConsumerDocument>(
      `${BASE_URL}/notes`,
      { title, noteContent, dependentId, folderId }
    );
    return response.data;
  },

  /**
   * Genera una URL temporal segura de GCP para ver/descargar el documento
   */
  getDocumentUrl: async (documentId: string): Promise<string> => {
    const response = await axiosInstance.get<{ url: string }>(`${BASE_URL}/${documentId}/url`);
    return response.data.url;
  },

  /**
   * Actualiza el título y/o el JSON de IA de un documento (con log de auditoría en BD)
   */
  updateDocument: async (
    documentId: string, 
    data: { title?: string; noteContent?: string; documentType?: string; aiExtractedData?: any; folderId?: string | null; clearFolder?: boolean }
  ): Promise<ConsumerDocument> => {
    const response = await axiosInstance.put<ConsumerDocument>(
      `${BASE_URL}/${documentId}`,
      data
    );
    return response.data;
  },

  /**
   * Genera el panorama clínico usando IA, basándose en todo el contexto disponible
   */
  generatePanorama: async (dependentId?: number): Promise<PanoramaResponseDto> => {
    const url = dependentId ? `${BASE_URL}/${dependentId}/panorama/generate` : `${BASE_URL}/panorama/generate`;
    const response = await axiosInstance.post(url);
    return response.data;
  },

  getLatestPanorama: async (dependentId?: number): Promise<PanoramaResponseDto | null> => {
    const url = dependentId ? `${BASE_URL}/${dependentId}/panorama/latest` : `${BASE_URL}/panorama/latest`;
    try {
      const response = await axiosInstance.get(url);
      // Backend might return 204 No Content if there is no history yet.
      return response.status === 204 ? null : response.data;
    } catch (e) {
      return null;
    }
  },

  getPanoramaHistory: async (dependentId?: number): Promise<PanoramaResponseDto[]> => {
    const url = dependentId ? `${BASE_URL}/${dependentId}/panorama/history` : `${BASE_URL}/panorama/history`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  /**
   * Elimina un documento o nota de la bóveda
   */
  deleteDocument: async (documentId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${documentId}`);
  },

  reorderDocuments: async (items: { id: string; displayOrder: number }[]): Promise<void> => {
    await axiosInstance.put(`${BASE_URL}/reorder`, { items });
  }
};
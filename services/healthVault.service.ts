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
   * 🚀 Paso 1: Generar URL firmada de GCP para subida segura.
   * El frontend sube directamente a GCP usando esta URL.
   */
  generateUploadUrl: async (
    fileName: string,
    contentType: string,
    sizeInBytes: number,
    documentType: string = 'GENERAL'
  ): Promise<{ uploadUrl: string; fileKey: string }> => {
    const response = await axiosInstance.post<{ uploadUrl: string; fileKey: string }>(
      `${BASE_URL}/upload-url`,
      { fileName, contentType, sizeInBytes, documentType }
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
    contentType: string,
    fileSizeBytes: number,
    documentType: string = 'GENERAL'
  ): Promise<ConsumerDocument> => {
    const response = await axiosInstance.post<ConsumerDocument>(
      `${BASE_URL}/confirm`,
      { fileKey, originalFileName, contentType, fileSizeBytes, documentType }
    );
    return response.data;
  },

  /**
   * Flujo completo de subida en 2 pasos:
   * 1. Obtener URL firmada del backend
   * 2. Subir archivo directamente a GCP
   * 3. Confirmar subida al backend
   */
  uploadDocument: async (file: File, documentType: string = 'GENERAL'): Promise<ConsumerDocument> => {
    // Paso 1: Generar URL firmada
    const { uploadUrl, fileKey } = await healthVaultService.generateUploadUrl(
      file.name,
      file.type,
      file.size,
      documentType
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
      file.type,
      file.size,
      documentType
    );

    return savedDoc;
  },

  /**
   * Genera una URL temporal segura de GCP para ver/descargar el documento
   */
  getDocumentUrl: async (documentId: string): Promise<string> => {
    const response = await axiosInstance.get<{ url: string }>(`${BASE_URL}/${documentId}/url`);
    return response.data.url;
  }
};
// services/store.service.ts
import axios from 'axios';
import axiosInstance from '@/lib/axios';
import { StoreProfile, StoreMediaType, UploadMediaResponse } from '@/types/store';

const BASE_URL_PROFILE = '/api/catalog/store/profile';
const BASE_URL_MEDIA = '/api/catalog/store/media';

export const storeService = {
  /**
   * Obtiene el perfil actual de la tienda del profesional autenticado.
   * Si es su primera vez, el backend (Java) lo creará copiando los datos del Onboarding.
   */
  getMyStore: async (): Promise<StoreProfile> => {
    const response = await axiosInstance.get<StoreProfile>(`${BASE_URL_PROFILE}/me`);
    return response.data;
  },

  /**
   * Actualiza la identidad visual, configuración comercial y UBICACIÓN.
   */
  updateMyStore: async (data: Partial<StoreProfile>): Promise<StoreProfile> => {
    const response = await axiosInstance.put<StoreProfile>(`${BASE_URL_PROFILE}/me`, data);
    return response.data;
  },

  /**
   * Sube un archivo multimedia (Logo, Banner, Video, etc) directo al bucket de GCP 
   * usando la Arquitectura Enterprise (Firmas temporales).
   */
  uploadMedia: async (file: File, type: StoreMediaType): Promise<UploadMediaResponse> => {
    // 1. Solicitar URL firmada al backend
    const signResponse = await axiosInstance.post<{
      message: string;
      uploadUrl: string;
      publicUrl: string;
    }>(`${BASE_URL_MEDIA}/upload-url`, {
      fileName: file.name,
      contentType: file.type,
      mediaType: type,
      sizeInBytes: file.size,
    });

    const { uploadUrl, publicUrl } = signResponse.data;

    // 2. Subir directamente a GCP Storage usando la URL firmada
    // Usamos axios puro sin interceptores para no enviar el Authorization header a Google
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      // Timeout largo para videos o archivos pesados
      timeout: 60000, 
    });

    // 3. Devolver la URL pública asumiendo éxito
    return {
      message: 'Archivo subido exitosamente',
      url: publicUrl,
    };
  }
};
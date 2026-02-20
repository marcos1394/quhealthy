// services/store.service.ts
import axiosInstance from '@/lib/axios';
import { StoreProfile, StoreMediaType, UploadMediaResponse } from '@/types/store';



const BASE_URL_PROFILE = '/api/catalog/store/profile';
const BASE_URL_MEDIA = '/api/catalog/store/media';

export const storeService = {
  /**
   * Obtiene el perfil actual de la tienda del profesional autenticado.
   */
  getMyStore: async (): Promise<StoreProfile> => {
    const response = await axiosInstance.get<StoreProfile>(`${BASE_URL_PROFILE}/me`);
    return response.data;
  },

  /**
   * Actualiza la identidad visual y configuración comercial.
   */
  updateMyStore: async (data: Partial<StoreProfile>): Promise<StoreProfile> => {
    const response = await axiosInstance.put<StoreProfile>(`${BASE_URL_PROFILE}/me`, data);
    return response.data;
  },

  /**
   * Sube un archivo multimedia (Logo, Banner, Video) directo al bucket público de GCP.
   */
  uploadMedia: async (file: File, type: StoreMediaType): Promise<UploadMediaResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<UploadMediaResponse>(
      `${BASE_URL_MEDIA}/upload?type=${type}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Aumentamos el timeout porque los videos de 15MB pueden tardar en subir
        timeout: 60000 
      }
    );
    return response.data;
  }
};
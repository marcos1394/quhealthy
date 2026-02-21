// services/storefront.service.ts
import axiosInstance from '@/lib/axios';
import { StorefrontData } from '@/types/storefront';

const BASE_URL_STOREFRONT = '/api/catalog/storefront';

export const storefrontService = {
  /**
   * Obtiene toda la información pública (Perfil, Servicios, Paquetes) 
   * de una tienda a partir de su slug (URL única).
   */
  getStoreBySlug: async (slug: string): Promise<StorefrontData> => {
    const response = await axiosInstance.get<StorefrontData>(`${BASE_URL_STOREFRONT}/${slug}`);
    return response.data;
  }
};
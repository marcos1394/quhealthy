// services/discover.service.ts
import axiosInstance from '@/lib/axios';
import { DiscoverProvider } from '@/types/discover';

const BASE_URL_STOREFRONT = '/api/catalog/storefront';

export const discoverService = {
  /**
   * Obtiene la lista de todos los proveedores públicos (marketplaceVisible = true)
   */
  getAllProviders: async (): Promise<DiscoverProvider[]> => {
    const response = await axiosInstance.get<DiscoverProvider[]>(BASE_URL_STOREFRONT);
    return response.data;
  }
};
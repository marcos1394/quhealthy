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
  },

  /**
   * Búsqueda global de providers con filtros avanzados (PostGIS + Disponibilidad)
   */
  searchProviders: async (params: import('@/types/discover').CatalogSearchRequestParams): Promise<import('@/types/discover').ProviderSearchResponseDto[]> => {
    const response = await axiosInstance.get<import('@/types/discover').ProviderSearchResponseDto[]>('/api/catalog/search', { params });
    return response.data;
  }
};
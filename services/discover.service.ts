// services/discover.service.ts
import axiosInstance from '@/lib/axios';
import { DiscoverProviderWrapperResponse, ProviderSearchWrapperResponse, CatalogSearchRequestParams } from '@/types/discover';

const BASE_URL_STOREFRONT = '/api/catalog/storefront';

export const discoverService = {
  /**
   * Obtiene la lista de todos los proveedores públicos (marketplaceVisible = true)
   */
  getAllProviders: async (): Promise<DiscoverProviderWrapperResponse> => {
    const response = await axiosInstance.get<DiscoverProviderWrapperResponse>(BASE_URL_STOREFRONT);
    return response.data;
  },

  /**
   * Búsqueda global de providers con filtros avanzados (PostGIS + Disponibilidad)
   */
  searchProviders: async (params: CatalogSearchRequestParams): Promise<ProviderSearchWrapperResponse> => {
    const response = await axiosInstance.get<ProviderSearchWrapperResponse>('/api/catalog/search', { params });
    return response.data;
  }
};
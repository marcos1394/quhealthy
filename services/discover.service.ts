// services/discover.service.ts
import axiosInstance from '@/lib/axios';
import { DiscoverProviderWrapperResponse, ProviderSearchWrapperResponse, CatalogSearchRequestParams, DiscoverItemWrapperResponse } from '@/types/discover';
import { CatalogItemDTO } from '@/types/catalog';

const BASE_URL_STOREFRONT = '/api/catalog/storefront';

export const discoverService = {
  /**
   * Obtiene la lista de todos los proveedores públicos, con opción de búsqueda NLP
   */
  getAllProviders: async (q?: string, type?: string): Promise<DiscoverProviderWrapperResponse> => {
    const response = await axiosInstance.get<DiscoverProviderWrapperResponse>(BASE_URL_STOREFRONT, {
      params: { q, type }
    });
    return response.data;
  },

  /**
   * Búsqueda global de providers con filtros avanzados (PostGIS + Disponibilidad)
   */
  searchProviders: async (params: CatalogSearchRequestParams): Promise<ProviderSearchWrapperResponse> => {
    const response = await axiosInstance.get<ProviderSearchWrapperResponse>('/api/catalog/search', { params });
    return response.data;
  },

  /**
   * Obtiene recomendaciones de ítems (Cursos, Productos) para Cross-Selling
   */
  getCrossSellingRecommendations: async (itemType: string, limit: number = 5): Promise<CatalogItemDTO[]> => {
    const response = await axiosInstance.get<CatalogItemDTO[]>('/api/catalog/recommendations/cross-selling', {
      params: { itemType, limit }
    });
    return response.data;
  },

  /**
   * Búsqueda global de ítems (servicios, paquetes, productos, cursos) con datos de proveedor embebidos
   */
  searchItems: async (params: any): Promise<DiscoverItemWrapperResponse> => {
    const response = await axiosInstance.get<DiscoverItemWrapperResponse>('/api/catalog/search/items', { params });
    return response.data;
  }
};
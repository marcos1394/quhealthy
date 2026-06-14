// services/catalog.service.ts
import axiosInstance from '@/lib/axios';
import { CatalogItemDTO } from '@/types/catalog';

const BASE_URL = '/api/catalog';

export const catalogService = {
  
  /**
   * Obtiene el catálogo completo (Servicios y Paquetes)
   * Nota: Spring Boot devuelve una estructura Page { content: [...] }
   */
  getMyCatalog: async (): Promise<CatalogItemDTO[]> => {
    // Solicitamos size=100 para traer todo de golpe sin perder datos para los paquetes
    const response = await axiosInstance.get(`${BASE_URL}/me/items?size=100`);
    return response.data.content; 
  },

  /**
   * Crea un nuevo Ítem (Servicio o Paquete)
   */
  createItem: async (item: CatalogItemDTO): Promise<CatalogItemDTO> => {
    const response = await axiosInstance.post(`${BASE_URL}/items`, item);
    return response.data;
  },

  /**
   * Actualiza un Ítem existente
   */
  updateItem: async (id: number, item: CatalogItemDTO): Promise<CatalogItemDTO> => {
    const response = await axiosInstance.put(`${BASE_URL}/items/${id}`, item);
    return response.data;
  },

  /**
   * Elimina un Ítem del catálogo
   */
  deleteItem: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/items/${id}`);
  },

  /**
   * Ajusta el inventario de un producto o insumo
   */
  adjustStock: async (id: number, adjustment: number): Promise<CatalogItemDTO> => {
    const response = await axiosInstance.patch(`${BASE_URL}/items/${id}/stock?adjustment=${adjustment}`);
    return response.data;
  },

  /**
   * Obtiene múltiples ítems a partir de una lista de IDs
   */
  getItemsBatch: async (itemIds: number[]): Promise<CatalogItemDTO[]> => {
    if (!itemIds || itemIds.length === 0) return [];
    const response = await axiosInstance.post(`${BASE_URL}/items/batch`, { itemIds });
    return response.data;
  }
};
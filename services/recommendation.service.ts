// services/recommendation.service.ts
import axiosInstance from '@/lib/axios';
import { PackageRecommendation } from '@/types/recommendations';

const BASE_URL = '/api/catalog/recommendations';

/**
 * Servicio del motor de recomendaciones de QuHealthy.
 * Conecta con el RecommendationController del catalog_service.
 */
export const recommendationService = {

  /**
   * 🎯 Obtiene paquetes de salud recomendados para el consumidor autenticado.
   * El backend aplica búsqueda semántica vectorial (pgvector) o fallback a destacados.
   * Excluye automáticamente los paquetes que el consumidor ya compró.
   */
  getPackageRecommendations: async (limit = 4): Promise<PackageRecommendation[]> => {
    const response = await axiosInstance.get<PackageRecommendation[]>(
      `${BASE_URL}/packages`,
      { params: { limit } }
    );
    return response.data;
  },
};

import axiosInstance from "@/lib/axios";

export interface CourseAccessDto {
  catalogItemId: number;
  orderId: number;
  purchasedAt: string;
}

export interface CatalogItemResponse {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  contentUrl: string;
  price: number;
}

export interface PurchasedCourseDetails {
  access: CourseAccessDto;
  details: CatalogItemResponse;
}

export const ConsumerCourseService = {
  // 1. Obtener la lista de IDs de cursos comprados desde appointment-service
  getPurchasedCourseAccess: async (): Promise<CourseAccessDto[]> => {
    const response = await axiosInstance.get('/api/appointments/consumer/orders/courses');
    return response.data || [];
  },

  // 2. Obtener los detalles del catálogo en batch desde catalog-service
  getCourseDetailsBatch: async (itemIds: number[]): Promise<CatalogItemResponse[]> => {
    if (itemIds.length === 0) return [];
    const response = await axiosInstance.post('/api/catalog/items/batch', { itemIds });
    return response.data || [];
  },

  // 3. Orquestador: Trae los IDs y luego los detalles armando un objeto completo
  getMyCourses: async (): Promise<PurchasedCourseDetails[]> => {
    const accessList = await ConsumerCourseService.getPurchasedCourseAccess();
    if (accessList.length === 0) return [];

    const itemIds = accessList.map(a => a.catalogItemId);
    // Para evitar mandar duplicados si el usuario compró el mismo curso 2 veces
    const uniqueIds = Array.from(new Set(itemIds));

    const detailsList = await ConsumerCourseService.getCourseDetailsBatch(uniqueIds);

    // Cruzar datos
    return accessList.map(access => {
      const details = detailsList.find(d => d.id === access.catalogItemId);
      return {
        access,
        details: details as CatalogItemResponse,
      };
    }).filter(c => c.details !== undefined); // Filtrar por seguridad si no existe en el catálogo
  }
};

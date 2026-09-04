// services/laboratory-operations.service.ts
import axiosInstance from "@/lib/axios";
import {
  LaboratoryDashboardMetrics,
  LaboratoryOrder,
  LaboratoryStoreMetrics,
  LaboratoryStudyCatalogItem,
  CreateLaboratoryOrderPayload,
  CaptureLaboratoryResultPayload,
  UpdateStudyMarketplacePayload,
  LaboratoryRpbiLog,
  CreateRpbiLogPayload,
  PaginatedLaboratoryOrders,
  LaboratoryOrderItem,
  LaboratoryOrderStatus,
  LaboratoryOrderOrigin,
} from "@/types/laboratory";

const BASE_OPERATIONS_URL = "/api/onboarding/laboratory/operations";
const BASE_STORE_URL = "/api/onboarding/laboratory/store";

export const laboratoryOperationsService = {
  /**
   * Obtiene la telemetría operativa del día y KPIs para el centro de mando
   */
  async getDashboardMetrics(): Promise<LaboratoryDashboardMetrics> {
    const response = await axiosInstance.get<LaboratoryDashboardMetrics>(
      `${BASE_OPERATIONS_URL}/metrics`
    );
    return response.data;
  },

  /**
   * Consulta órdenes de laboratorio con soporte para paginación y filtros
   */
  async getOrders(params?: {
    status?: LaboratoryOrderStatus;
    origin?: LaboratoryOrderOrigin;
    page?: number;
    size?: number;
  }): Promise<PaginatedLaboratoryOrders> {
    const response = await axiosInstance.get<PaginatedLaboratoryOrders>(
      `${BASE_OPERATIONS_URL}/orders`,
      { params }
    );
    return response.data;
  },

  /**
   * Obtiene el detalle completo de una orden con sus ítems y resultados analíticos
   */
  async getOrderDetails(orderId: number): Promise<LaboratoryOrder> {
    const response = await axiosInstance.get<LaboratoryOrder>(
      `${BASE_OPERATIONS_URL}/orders/${orderId}`
    );
    return response.data;
  },

  /**
   * Registra una nueva orden de laboratorio en mostrador / recepción
   */
  async createOrder(payload: CreateLaboratoryOrderPayload): Promise<LaboratoryOrder> {
    const response = await axiosInstance.post<LaboratoryOrder>(
      `${BASE_OPERATIONS_URL}/orders`,
      payload
    );
    return response.data;
  },

  /**
   * Actualiza el estatus o fase operativa de la orden
   */
  async updateOrderStatus(
    orderId: number,
    status: LaboratoryOrderStatus
  ): Promise<LaboratoryOrder> {
    const response = await axiosInstance.patch<LaboratoryOrder>(
      `${BASE_OPERATIONS_URL}/orders/${orderId}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  /**
   * Captura resultados analíticos paramétricos (NOM-007)
   */
  async captureResults(
    orderItemId: number,
    payload: CaptureLaboratoryResultPayload
  ): Promise<LaboratoryOrderItem> {
    const response = await axiosInstance.post<LaboratoryOrderItem>(
      `${BASE_OPERATIONS_URL}/order-items/${orderItemId}/results`,
      payload
    );
    return response.data;
  },

  /**
   * Valida oficialmente una orden con firma y cédula profesional QFB
   */
  async validateOrder(
    orderId: number,
    qfbLicense?: string
  ): Promise<LaboratoryOrder> {
    const response = await axiosInstance.post<LaboratoryOrder>(
      `${BASE_OPERATIONS_URL}/orders/${orderId}/validate`,
      null,
      { params: { qfbLicense } }
    );
    return response.data;
  },

  /**
   * Bitácora RPBI (NOM-087)
   */
  async getRpbiLogs(branchId?: number): Promise<LaboratoryRpbiLog[]> {
    const response = await axiosInstance.get<LaboratoryRpbiLog[]>(
      `${BASE_OPERATIONS_URL}/rpbi`,
      { params: { branchId } }
    );
    return response.data;
  },

  /**
   * Registrar recolección de RPBI
   */
  async createRpbiLog(payload: CreateRpbiLogPayload): Promise<LaboratoryRpbiLog> {
    const response = await axiosInstance.post<LaboratoryRpbiLog>(
      `${BASE_OPERATIONS_URL}/rpbi`,
      payload
    );
    return response.data;
  },
};

export const laboratoryStoreService = {
  /**
   * Métricas y KPIs de la tienda en línea y ventas en QuMarket
   */
  async getStoreMetrics(): Promise<LaboratoryStoreMetrics> {
    const response = await axiosInstance.get<LaboratoryStoreMetrics>(
      `${BASE_STORE_URL}/metrics`
    );
    return response.data;
  },

  /**
   * Catálogo de estudios con estado de publicación en marketplace
   */
  async getCatalog(): Promise<LaboratoryStudyCatalogItem[]> {
    const response = await axiosInstance.get<LaboratoryStudyCatalogItem[]>(
      `${BASE_STORE_URL}/catalog`
    );
    return response.data;
  },

  /**
   * Actualizar visibilidad, precio promocional y home sampling de un estudio
   */
  async updateStudyMarketplace(
    studyId: number,
    payload: UpdateStudyMarketplacePayload
  ): Promise<LaboratoryStudyCatalogItem> {
    const response = await axiosInstance.patch<LaboratoryStudyCatalogItem>(
      `${BASE_STORE_URL}/catalog/${studyId}`,
      payload
    );
    return response.data;
  },

  /**
   * Activar o pausar la tienda pública en QuMarket
   */
  async toggleStoreStatus(active: boolean): Promise<boolean> {
    const response = await axiosInstance.post<boolean>(
      `${BASE_STORE_URL}/toggle-status`,
      null,
      { params: { active } }
    );
    return response.data;
  },
};

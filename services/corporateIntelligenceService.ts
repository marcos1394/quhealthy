import axiosInstance from '@/lib/axios';
import {
  KpiDefinitionV1,
  KpiSnapshotV1,
  OperationalEventV1,
  SourceHealthV1,
  OwnerArea,
  PeriodType,
  EventSeverity,
  EventStatus,
  EventSource,
  PILOT_KPI_DEPLOYMENT_FREQUENCY,
} from '@/types/contracts/intelligence';

export interface PagedContractResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

/**
 * 🛡️ INTEL-API-01: Servicio cliente de sólo lectura para el CEO Operating Command Center.
 * Consume la API corporativa privada v1 (/api/v1/intelligence) usando el interceptor de sesión y JWT.
 */
class CorporateIntelligenceService {
  private readonly baseUrl = '/api/v1/intelligence';

  /**
   * Obtiene el catálogo canónico paginado de definiciones de KPIs.
   */
  async getKpiDefinitions(params?: {
    area?: OwnerArea;
    page?: number;
    size?: number;
  }): Promise<PagedContractResponse<KpiDefinitionV1>> {
    const response = await axiosInstance.get<PagedContractResponse<KpiDefinitionV1>>(
      `${this.baseUrl}/kpi-definitions`,
      { params }
    );
    return response.data;
  }

  /**
   * Obtiene la definición canónica de un KPI por su ID.
   */
  async getKpiDefinition(kpiId: string): Promise<KpiDefinitionV1> {
    const response = await axiosInstance.get<KpiDefinitionV1>(
      `${this.baseUrl}/kpi-definitions/${encodeURIComponent(kpiId)}`
    );
    return response.data;
  }

  /**
   * Consulta cortes históricos/paginados de un KPI.
   */
  async getKpiSnapshots(params?: {
    kpiId?: string;
    periodType?: PeriodType;
    page?: number;
    size?: number;
  }): Promise<PagedContractResponse<KpiSnapshotV1>> {
    const response = await axiosInstance.get<PagedContractResponse<KpiSnapshotV1>>(
      `${this.baseUrl}/kpi-snapshots`,
      {
        params: {
          kpiId: params?.kpiId || PILOT_KPI_DEPLOYMENT_FREQUENCY,
          ...params,
        },
      }
    );
    return response.data;
  }

  /**
   * Obtiene el último corte observado (snapshot) del KPI especificado.
   * Regla fail-closed: Si la fuente falla, devuelve estado ERROR o UNAVAILABLE con value=null.
   */
  async getLatestKpiSnapshot(kpiId: string = PILOT_KPI_DEPLOYMENT_FREQUENCY): Promise<KpiSnapshotV1> {
    const response = await axiosInstance.get<KpiSnapshotV1>(
      `${this.baseUrl}/kpi-snapshots/latest`,
      { params: { kpiId } }
    );
    return response.data;
  }

  /**
   * Obtiene los eventos operativos recientes con filtros cerrados.
   */
  async getOperationalEvents(params?: {
    ownerArea?: OwnerArea;
    severity?: EventSeverity;
    status?: EventStatus;
    page?: number;
    size?: number;
  }): Promise<PagedContractResponse<OperationalEventV1>> {
    const response = await axiosInstance.get<PagedContractResponse<OperationalEventV1>>(
      `${this.baseUrl}/operational-events`,
      { params }
    );
    return response.data;
  }

  /**
   * Obtiene el estado de salud y frescura de los conectores externos.
   */
  async getSourceHealth(params?: {
    source?: EventSource;
    page?: number;
    size?: number;
  }): Promise<PagedContractResponse<SourceHealthV1>> {
    const response = await axiosInstance.get<PagedContractResponse<SourceHealthV1>>(
      `${this.baseUrl}/source-health`,
      { params }
    );
    return response.data;
  }
}

export const corporateIntelligenceService = new CorporateIntelligenceService();

/**
 * 🛡️ INTEL-CONTRACT-01: Contratos canónicos versionados (v1) para el
 * CEO Operating Command Center y plataforma de señales/eventos de QuHealthy.
 *
 * Principios Semánticos Invariables:
 * 1. Cero numérico (0.0): Medición real observada.
 * 2. Ausencia (UNAVAILABLE): value = null. Nunca sustituir por 0.0.
 * 3. Falla de extracción/cómputo (ERROR): value = null.
 * 4. Ventana inmadura (PROVISIONAL): value != null, isReconciled = false.
 * 5. Certificado (CERTIFIED): value != null, isReconciled = true, evidenceRef obligatorio.
 *    Ningún cliente ni agente puede autodeclarar CERTIFIED; solo el backend tras reconciliar.
 * 6. Origen temporal auténtico: asOf y occurredAt provienen del sistema de verdad,
 *    nunca fabricados en el momento de consulta o render.
 */

// ============================================================================
// Enums y Dominios de Valores
// ============================================================================

export type OwnerArea =
  | 'ENGINEERING'
  | 'PRODUCT'
  | 'PLATFORM_SECURITY'
  | 'COMERCIAL'
  | 'GROWTH'
  | 'FINANCE'
  | 'CHIEF_OF_STAFF';

export type SystemOfTruth =
  | 'GITHUB'
  | 'GCP_MONITORING'
  | 'VERCEL'
  | 'GMAIL'
  | 'STRIPE'
  | 'GA4'
  | 'SEARCH_CONSOLE'
  | 'INTERNAL_DATABASE';

export type EventSource =
  | 'GITHUB'
  | 'GCP_MONITORING'
  | 'VERCEL'
  | 'GMAIL'
  | 'STRIPE'
  | 'CLOUDFLARE'
  | 'INTERNAL';

export type UnitType =
  | 'COUNT'
  | 'COUNT_PER_DAY'
  | 'RATIO'
  | 'PERCENTAGE'
  | 'SECONDS'
  | 'MILLISECONDS'
  | 'CURRENCY'
  | 'BOOLEAN'
  | 'SCORE';

export type PeriodType =
  | 'REALTIME'
  | 'HOURLY'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'ANNUAL';

export type KpiQualityStatus =
  | 'CERTIFIED'
  | 'PROVISIONAL'
  | 'UNAVAILABLE'
  | 'ERROR';

export type EventSeverity =
  | 'INFO'
  | 'ACTION'
  | 'WARNING'
  | 'CRITICAL';

export type EventStatus =
  | 'NEW'
  | 'TRIAGED'
  | 'ASSIGNED'
  | 'ACKNOWLEDGED'
  | 'RESOLVED'
  | 'IGNORED';

export type PayloadClass =
  | 'A0' // Anónimo / Público
  | 'A1' // Operativo interno sin PII ni secretos
  | 'A2' // Confidencial de negocio / métricas agregadas
  | 'A3'; // Restringido / Crudo (requiere segregación estricta)

export type ConnectorStatus =
  | 'ONLINE'
  | 'DEGRADED'
  | 'OFFLINE'
  | 'SUSPENDED'
  | 'SIMULATED';

export type DataQualityStatus =
  | 'HEALTHY'
  | 'PARTIAL'
  | 'STALE'
  | 'FAILING';

export type DecisionStatus =
  | 'PENDING_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'EXECUTED';

export type DecisionUrgency =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

// ============================================================================
// 1. KpiDefinitionV1
// ============================================================================

export interface KpiDefinitionV1 {
  kpiId: string;
  version: string;
  name: string;
  description: string;
  ownerArea: OwnerArea;
  humanOwnerRef: string;
  systemOfTruth: SystemOfTruth;
  formula: string;
  unit: UnitType;
  periodType: PeriodType;
  allowedDimensions?: string[];
  currency?: string | null;
  timezone?: string;
  certificationCriteria?: string;
  isDeprecated?: boolean;
  supersededByKpiId?: string | null;
  [key: string]: unknown; // Forward compatibility (evolución aditiva)
}

// ============================================================================
// 2. KpiSnapshotV1
// ============================================================================

export interface KpiPeriodV1 {
  start: string; // ISO-8601
  end: string; // ISO-8601
  periodType: PeriodType;
  [key: string]: unknown;
}

export interface KpiQualityV1 {
  coverageRatio: number; // 0.0 a 1.0
  completenessRatio: number; // 0.0 a 1.0
  freshnessSeconds: number;
  isReconciled: boolean;
  limitations?: string[];
  [key: string]: unknown;
}

export interface KpiSnapshotV1 {
  snapshotId: string; // UUID
  kpiId: string;
  definitionVersion: string;
  period: KpiPeriodV1;
  asOf: string; // ISO-8601 (origen de la fuente de verdad)
  ingestedAt: string; // ISO-8601 (ingesta en backend)
  /**
   * Valor medido. DEBE ser null cuando status es 'UNAVAILABLE' o 'ERROR'.
   * Solo es numérico si se observó medición (incluyendo 0.0 real) o cálculo provisional.
   */
  value: number | null;
  status: KpiQualityStatus;
  quality: KpiQualityV1;
  dimensions?: Record<string, string>;
  evidenceRef?: string | null;
  [key: string]: unknown; // Forward compatibility
}

// ============================================================================
// 3. OperationalEventV1 (Alineado con DATA-01)
// ============================================================================

export interface OperationalEventV1 {
  eventId: string; // UUID
  source: EventSource;
  sourceAccountRef: string;
  sourceEventId?: string | null;
  deduplicationKey: string;
  correlationId?: string | null;
  eventType: string; // ej. delivery.deployment_completed
  occurredAt: string; // ISO-8601 (del proveedor)
  receivedAt: string; // ISO-8601 (ingesta)
  severity: EventSeverity;
  status: EventStatus;
  ownerArea: OwnerArea;
  humanOwnerRef: string;
  summary: string;
  actionRequired: boolean;
  evidenceUrl?: string | null;
  payloadClass: PayloadClass;
  rawPayloadRef?: string | null;
  schemaVersion: string;
  [key: string]: unknown; // Forward compatibility
}

// ============================================================================
// 4. SourceHealthV1
// ============================================================================

export interface SourceHealthV1 {
  source: EventSource;
  sourceAccountRef: string;
  connectorStatus: ConnectorStatus;
  lastSyncAt: string; // ISO-8601
  lastSuccessAt?: string | null; // ISO-8601
  freshnessSeconds: number;
  errorCount24h: number;
  lastError?: string | null;
  cursorRef?: string | null;
  dlqCount?: number;
  dataQualityStatus: DataQualityStatus;
  schemaVersion: string;
  [key: string]: unknown; // Forward compatibility
}

// ============================================================================
// 5. DecisionItemV1
// ============================================================================

export interface DecisionItemV1 {
  decisionId: string; // UUID
  area: OwnerArea;
  title: string;
  summary: string;
  proposedBy: string;
  proposedAt: string; // ISO-8601
  status: DecisionStatus;
  urgency: DecisionUrgency;
  requiresCommand: boolean;
  associatedEventId?: string | null; // UUID
  evidenceRefs?: string[];
  schemaVersion: string;
  [key: string]: unknown; // Forward compatibility
}

// ============================================================================
// Constantes de Casos Piloto Aprobados
// ============================================================================

export const PILOT_KPI_DEPLOYMENT_FREQUENCY = 'kpi.engineering.deployment_frequency' as const;
export const PILOT_EVENT_DEPLOYMENT_COMPLETED = 'delivery.deployment_completed' as const;
export const CANONICAL_SCHEMA_VERSION_V1 = '1.0.0' as const;

// ============================================================================
// Type Guards & Validadores Semánticos
// ============================================================================

export function isCertifiedSnapshot(snapshot: KpiSnapshotV1): boolean {
  return (
    snapshot.status === 'CERTIFIED' &&
    snapshot.value !== null &&
    snapshot.quality.isReconciled === true &&
    typeof snapshot.evidenceRef === 'string' &&
    snapshot.evidenceRef.trim().length > 0
  );
}

export function isUnavailableSnapshot(snapshot: KpiSnapshotV1): boolean {
  return snapshot.status === 'UNAVAILABLE' && snapshot.value === null;
}

export function isErrorSnapshot(snapshot: KpiSnapshotV1): boolean {
  return snapshot.status === 'ERROR' && snapshot.value === null;
}

export function isProvisionalSnapshot(snapshot: KpiSnapshotV1): boolean {
  return snapshot.status === 'PROVISIONAL' && snapshot.value !== null;
}

export function validateSnapshotSemanticIntegrity(snapshot: KpiSnapshotV1): { valid: boolean; error?: string } {
  if (!snapshot.asOf) {
    return { valid: false, error: "El corte temporal 'asOf' de la fuente es obligatorio." };
  }
  if (snapshot.status === 'UNAVAILABLE' && snapshot.value !== null) {
    return {
      valid: false,
      error: "Violación de semántica: Un snapshot con estado UNAVAILABLE debe tener value = null (no sustituir ausencia por 0.0)."
    };
  }
  if (snapshot.status === 'ERROR' && snapshot.value !== null) {
    return { valid: false, error: "Violación semántica: Un snapshot con estado ERROR debe tener value = null." };
  }
  if (snapshot.status === 'CERTIFIED') {
    if (snapshot.value === null) {
      return { valid: false, error: "Un snapshot CERTIFIED debe contener un valor numérico observado válido." };
    }
    if (!snapshot.quality?.isReconciled) {
      return { valid: false, error: "Un snapshot CERTIFIED requiere que isReconciled sea true." };
    }
    if (!snapshot.evidenceRef || snapshot.evidenceRef.trim().length === 0) {
      return { valid: false, error: "Un snapshot CERTIFIED debe contener una referencia auditable de evidencia (evidenceRef)." };
    }
  }
  return { valid: true };
}

/**
 * Escala canónica de veracidad y confianza de señales administrativas (ADMIN-TRUST-01).
 * Elimina la ambigüedad sobre si un número es real, provisional, no disponible o error.
 */
export type SignalQuality =
  | "CERTIFIED"   // Fuente real aprobada, auditada y conciliada
  | "PROVISIONAL" // Dato real con brecha de cobertura, conciliación o modelo estimado
  | "UNAVAILABLE" // Fuente no respondió o no disponible (sin datos)
  | "ERROR"       // Consulta falló (nunca enmascarar como cero)
  | "SIMULATED";  // Entornos de prueba/fixture; prohibido en producción

export interface AdminSignal<T> {
  value: T | null;
  quality: SignalQuality;
  source: string;
  owner: string;
  asOf: string;
  period?: string;
  isFilterable?: boolean;
  explanation?: string;
}

export function createCertifiedSignal<T>(
  value: T,
  source: string,
  owner: string,
  period?: string,
  isFilterable: boolean = true,
  explanation?: string
): AdminSignal<T> {
  return {
    value,
    quality: "CERTIFIED",
    source,
    owner,
    asOf: new Date().toISOString(),
    period,
    isFilterable,
    explanation,
  };
}

export function createProvisionalSignal<T>(
  value: T,
  source: string,
  owner: string,
  period?: string,
  explanation?: string
): AdminSignal<T> {
  return {
    value,
    quality: "PROVISIONAL",
    source,
    owner,
    asOf: new Date().toISOString(),
    period,
    isFilterable: true,
    explanation,
  };
}

export function createUnavailableSignal<T>(
  source: string,
  owner: string,
  explanation: string,
  period?: string
): AdminSignal<T> {
  return {
    value: null,
    quality: "UNAVAILABLE",
    source,
    owner,
    asOf: new Date().toISOString(),
    period,
    isFilterable: false,
    explanation,
  };
}

export function createErrorSignal<T>(
  source: string,
  owner: string,
  errorMessage: string,
  period?: string
): AdminSignal<T> {
  return {
    value: null,
    quality: "ERROR",
    source,
    owner,
    asOf: new Date().toISOString(),
    period,
    isFilterable: false,
    explanation: errorMessage,
  };
}

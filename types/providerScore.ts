// src/types/providerScore.ts

export type ProviderScoreBand = 'ELITE' | 'PREMIUM' | 'ADVANCED' | 'IN_PROGRESS' | 'LOW_QUALITY' | 'NUEVO';
export type PillarStatus = 'OPTIMAL' | 'IMPROVABLE' | 'LOW';

export interface PillarDetail {
  name: string;
  percentage: number;
  status: PillarStatus;
  tooltip: string; // El texto explicativo de la US-003
}

export interface ProviderScoreResponse {
  providerId: number;
  score: number;
  band: ProviderScoreBand;
  isNewProvider: boolean;
  breakdown: Record<string, PillarDetail>; // Ej: { "P1": {...}, "P2": {...} }
  percentile?: number; // Para el "Top 8% de nutricionistas"
  lastCalculatedAt: string;
}
import axiosInstance from '@/lib/axios';

// Tipos de datos
export interface MenstrualCycleLog {
  id?: number;
  consumerId: number;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  durationDays?: number;
  intensity?: "LIGHT" | "MEDIUM" | "HEAVY" | "SPOTTING";
  flowType?: string;
  notes?: string;
}

export interface MenstrualSymptomLog {
  id?: number;
  consumerId: number;
  logDate: string; // YYYY-MM-DD
  painLevel: number; // 0-10
  mood?: "HAPPY" | "SAD" | "IRRITABLE" | "ANXIOUS" | "CALM" | "OTHER";
  symptoms?: string[]; // Ej: ["HEADACHE", "CRAMPS", "BLOATING"]
  notes?: string;
}

export interface CyclePredictionDto {
  estimatedNextPeriodStart: string;
  estimatedNextPeriodEnd: string;
  estimatedOvulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

export interface CycleAiInsightDto {
  summary: string;
  detectedPatterns: string[];
  recommendations: string[];
  requiresMedicalAttention: boolean;
}

export interface FertilityLog {
  logDate: string;
  basalTemperature?: number;
  ovulationTestResult?: 'POSITIVE' | 'NEGATIVE' | 'HIGH' | 'PEAK' | 'LOW';
  cervicalMucus?: 'DRY' | 'STICKY' | 'CREAMY' | 'WATERY' | 'EGG_WHITE';
  intercourse?: boolean;
  notes?: string;
}

export interface FertilityAiInsightDto {
  aiSummary: string;
  ovulationConfirmed: boolean;
  recommendGynecologist: boolean;
  recommendationReason: string;
  identifiedPatterns: string[];
}

class WomensHealthService {
  // Configuración / Consentimiento
  async checkConsent(consumerId: number): Promise<boolean> {
    try {
      const response = await axiosInstance.get(`/api/onboarding/consumer/profile`);
      return response.data?.reproductiveHealthConsentAccepted || false;
    } catch (error) {
      console.error("Error al obtener consentimiento de salud reproductiva", error);
      return false;
    }
  }

  async recordConsent(consumerId: number): Promise<void> {
    await axiosInstance.post(`/api/onboarding/consumer/${consumerId}/womens-health/consent`);
  }

  // Ciclos
  async logCycle(consumerId: number, data: MenstrualCycleLog): Promise<MenstrualCycleLog> {
    const response = await axiosInstance.post(`/api/onboarding/consumer/${consumerId}/womens-health/cycle`, data);
    return response.data;
  }

  async getCycleLogs(consumerId: number): Promise<MenstrualCycleLog[]> {
    const response = await axiosInstance.get(`/api/onboarding/consumer/${consumerId}/womens-health/cycle`);
    return response.data;
  }

  // Síntomas
  async logSymptom(consumerId: number, data: MenstrualSymptomLog): Promise<MenstrualSymptomLog> {
    const response = await axiosInstance.post(`/api/onboarding/consumer/${consumerId}/womens-health/symptom`, data);
    return response.data;
  }

  async getSymptomLogs(consumerId: number, from: string, to: string): Promise<MenstrualSymptomLog[]> {
    const response = await axiosInstance.get(`/api/onboarding/consumer/${consumerId}/womens-health/symptom`, {
      params: { from, to }
    });
    return response.data;
  }

  // IA y Predicciones
  async getPrediction(consumerId: number): Promise<CyclePredictionDto> {
    const response = await axiosInstance.get(`/api/onboarding/consumer/${consumerId}/womens-health/prediction`);
    return response.data;
  }

  // Insights de IA
  async getAiInsights(consumerId: number): Promise<CycleAiInsightDto> {
    const response = await axiosInstance.get(`/api/onboarding/consumer/${consumerId}/womens-health/insights`);
    return response.data;
  }

  // ==========================================
  // FERTILIDAD
  // ==========================================
  async logFertility(consumerId: number, data: FertilityLog): Promise<FertilityLog> {
    const response = await axiosInstance.post(`/api/onboarding/consumer/${consumerId}/fertility/log`, data);
    return response.data;
  }

  async getFertilityLogs(consumerId: number, from?: string, to?: string): Promise<FertilityLog[]> {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const response = await axiosInstance.get(`/api/onboarding/consumer/${consumerId}/fertility/log`, { params });
    return response.data;
  }

  async getFertilityInsights(consumerId: number): Promise<FertilityAiInsightDto> {
    const response = await axiosInstance.get(`/api/onboarding/consumer/${consumerId}/fertility/insights`);
    return response.data;
  }
}

export const womensHealthService = new WomensHealthService();

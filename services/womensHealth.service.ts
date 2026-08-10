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
  nextPeriodStart: string;
  nextPeriodEnd: string;
  ovulationDate: string;
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

export interface WomensHealthPreferencesDto {
  tryingToConceive: boolean;
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

// ==========================================
// PREGNANCY
// ==========================================
export interface PregnancyProfileDto {
  id: number;
  consumerId: number;
  lastMenstrualPeriod: string;
  estimatedDueDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'LOSS' | 'DELIVERED';
  currentGestationalWeek: number;
  currentGestationalDay: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePregnancyProfileDto {
  lastMenstrualPeriod?: string;
  estimatedDueDate?: string;
}

export interface PregnancyLogDto {
  id?: number;
  pregnancyProfileId?: number;
  logDate: string;
  weightKg?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  glucoseLevel?: number;
  fetalMovementsCount?: number;
  contractionsCount?: number;
  contractionsFrequencyMins?: number;
  notes?: string;
}

export interface PregnancyAiChatResponseDto {
  assistantMessage: string;
  isUrgent: boolean;
  urgencyReason?: string;
}

// ==========================================
// POSTPARTUM
// ==========================================
export interface StartPostpartumRequest {
  deliveryDate: string;
  deliveryType: string;
  babyName?: string;
  babyBiologicalSex?: string;
}

export interface PostpartumLogDto {
  id?: number;
  postpartumProfileId?: number;
  logDate: string;
  painLevel?: number;
  bleedingLevel?: string;
  breastfeedingFrequency?: number;
  breastfeedingDurationMins?: number;
  emotionalStateScore?: number;
}

export interface PostpartumDashboardResponse {
  profile: any;
  logs: PostpartumLogDto[];
  babyProfile: any;
  latestBabyWeight: any;
  nextVaccine?: {
    vaccineCatalogId: number;
    vaccineName: string;
    recommendedAgeMonths: number;
  };
  upcomingAppointments: any[];
}

class WomensHealthService {
  // Configuración / Consentimiento
  async checkConsent(consumerId: number): Promise<boolean> {
    try {
      const response = await axiosInstance.get(`/api/onboarding/consumer/${consumerId}/womens-health/consent`);
      return response.data?.hasConsent || false;
    } catch (error) {
      console.error("Error al obtener consentimiento de salud reproductiva", error);
      return false;
    }
  }

  async recordConsent(consumerId: number): Promise<void> {
    await axiosInstance.post(`/api/onboarding/consumer/${consumerId}/womens-health/consent`);
  }

  // Preferencias
  async getPreferences(consumerId: number): Promise<WomensHealthPreferencesDto> {
    const response = await axiosInstance.get(`/api/onboarding/consumer/${consumerId}/womens-health/preferences`);
    return response.data;
  }

  async updatePreferences(consumerId: number, data: WomensHealthPreferencesDto): Promise<WomensHealthPreferencesDto> {
    const response = await axiosInstance.post(`/api/onboarding/consumer/${consumerId}/womens-health/preferences`, data);
    return response.data;
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

  // ==========================================
  // PREGNANCY
  // ==========================================
  async getActivePregnancy(consumerId: number): Promise<PregnancyProfileDto | null> {
    try {
      const response = await axiosInstance.get(`/api/onboarding/consumer/${consumerId}/womens-health/pregnancy/active`);
      if (response.status === 204) return null;
      return response.data;
    } catch (e) {
      return null; // Return null if not found
    }
  }

  async createOrUpdatePregnancy(consumerId: number, data: CreatePregnancyProfileDto): Promise<PregnancyProfileDto> {
    const response = await axiosInstance.post(`/api/onboarding/consumer/${consumerId}/womens-health/pregnancy`, data);
    return response.data;
  }

  async completePregnancy(consumerId: number, status: 'COMPLETED' | 'LOSS'): Promise<void> {
    await axiosInstance.post(`/api/onboarding/consumer/${consumerId}/womens-health/pregnancy/complete?status=${status}`);
  }

  async getPregnancyLogs(consumerId: number): Promise<PregnancyLogDto[]> {
    const response = await axiosInstance.get(`/api/onboarding/consumer/${consumerId}/womens-health/pregnancy/logs`);
    return response.data;
  }

  async logPregnancyVitals(consumerId: number, data: PregnancyLogDto): Promise<PregnancyLogDto> {
    const response = await axiosInstance.post(`/api/onboarding/consumer/${consumerId}/womens-health/pregnancy/logs`, data);
    return response.data;
  }

  async pregnancyAiChat(consumerId: number, userMessage: string): Promise<PregnancyAiChatResponseDto> {
    const response = await axiosInstance.post(`/api/onboarding/consumer/${consumerId}/womens-health/pregnancy/ai/chat`, { userMessage });
    return response.data;
  }

  // ==========================================
  // POSTPARTUM
  // ==========================================
  async startPostpartum(consumerId: number, data: StartPostpartumRequest): Promise<void> {
    await axiosInstance.post(`/api/onboarding/consumer/${consumerId}/womens-health/postpartum/start`, data);
  }

  async logPostpartum(consumerId: number, data: PostpartumLogDto): Promise<PostpartumLogDto> {
    const response = await axiosInstance.post(`/api/onboarding/consumer/${consumerId}/womens-health/postpartum/log`, data);
    return response.data;
  }

  async getPostpartumDashboard(consumerId: number): Promise<PostpartumDashboardResponse> {
    const response = await axiosInstance.get(`/api/onboarding/consumer/${consumerId}/womens-health/postpartum/dashboard`);
    return response.data;
  }
}

export const womensHealthService = new WomensHealthService();

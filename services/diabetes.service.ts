import apiService from "@/lib/utils/api-utils";

export enum DiabetesType {
  TYPE_1 = "TYPE_1",
  TYPE_2 = "TYPE_2",
  GESTATIONAL = "GESTATIONAL",
  PREDIABETES = "PREDIABETES",
  MODY = "MODY",
}

export enum DiabetesStatus {
  ACTIVE = "ACTIVE",
  CONTROLLED = "CONTROLLED",
  IN_REMISSION = "IN_REMISSION",
}

export enum MeasurementTime {
  FASTING = "FASTING",
  PRE_MEAL = "PRE_MEAL",
  POST_MEAL = "POST_MEAL",
  BEDTIME = "BEDTIME",
  RANDOM = "RANDOM",
}

export interface DiabetesProfileDto {
  id?: number;
  consumerId?: number;
  diabetesType: DiabetesType;
  diagnosisDate?: string;
  initialHba1c?: number;
  targetHba1c?: number;
  targetFastingGlucose?: number;
  targetPostprandialGlucose?: number;
  insulinDependent?: boolean;
  cie10Code?: string;
  status?: DiabetesStatus;
  
  averageGlucoseLast7Days?: number;
  averageGlucoseLast30Days?: number;
  percentageInRange?: number;
  lastHba1c?: number;
}

export interface DiabetesLogDto {
  id?: number;
  logDate: string; // YYYY-MM-DD
  measurementTime: MeasurementTime;
  glucoseLevel?: number;
  hba1c?: number;
  insulinDose?: number;
  insulinType?: string;
  carbohydratesGrams?: number;
  physicalActivityMinutes?: number;
  notes?: string;
  
  glucoseStatus?: "IN_RANGE" | "HYPOGLYCEMIA" | "HYPERGLYCEMIA" | "CRITICAL_HIGH";
}

class DiabetesService {
  async getProfile(consumerId: number): Promise<DiabetesProfileDto> {
    return await apiService.get(`/api/onboarding/consumer/${consumerId}/diabetes/profile`);
  }

  async upsertProfile(consumerId: number, data: Partial<DiabetesProfileDto>): Promise<DiabetesProfileDto> {
    return await apiService.put(`/api/onboarding/consumer/${consumerId}/diabetes/profile`, data);
  }

  async getLogs(consumerId: number): Promise<DiabetesLogDto[]> {
    return await apiService.get(`/api/onboarding/consumer/${consumerId}/diabetes/logs`);
  }

  async addLog(consumerId: number, data: Partial<DiabetesLogDto>): Promise<DiabetesLogDto> {
    return await apiService.post(`/api/onboarding/consumer/${consumerId}/diabetes/logs`, data);
  }
}

export const diabetesService = new DiabetesService();

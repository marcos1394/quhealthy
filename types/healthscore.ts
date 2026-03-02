// src/types/healthscore.ts

export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'HIGH' | 'ATHLETE';
export type ScoreBand = 'ELITE' | 'PREMIUM' | 'ADVANCED' | 'IN_PROGRESS' | 'INITIAL' | 'UNSCORED';

// Lo que enviamos al Backend (HealthProfileRequest en Java)
export interface HealthProfilePayload {
  // D1 Biometría
  weightKg: number;
  heightCm: number;
  
  // D2 Actividad
  activityLevel: ActivityLevel;
  weeklyExerciseMinutes?: number;
  
  // D3 Hábitos
  isSmoker: boolean;
  alcoholUnitsWeek?: number;
  waterIntakeLiters?: number;
  dietQualityScore?: number;
  
  // D4 Mental
  stressLevel: number; // 1-10
  sleepHoursAvg?: number;
  phq2Score?: number;
  gad2Score?: number;
  
  // Meta
  wearableConnected?: boolean;
}

// Lo que nos responde el Backend
export interface HealthScoreResponse {
  consumer_id?: string;
  quscore: number;
  band: ScoreBand;
  calculated_at: string;
  delta?: number; // Cuánto subió o bajó respecto al cálculo anterior
  message?: string;
}
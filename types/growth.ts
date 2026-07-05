export interface GrowthMeasurementRequest {
  measurementDate: string;
  weightKg?: number;
  heightCm?: number;
  headCircumferenceCm?: number;
}

export interface GrowthMeasurementResponse {
  id: number;
  patientId: number;
  measurementDate: string;
  ageInMonths: number;
  weightKg?: number;
  heightCm?: number;
  headCircumferenceCm?: number;
  
  weightZScore?: number;
  heightZScore?: number;
  headCircumferenceZScore?: number;
  
  weightPercentile?: number;
  heightPercentile?: number;
  
  clinicalStatus: 'NORMAL' | 'VIGILANCIA' | 'ALERTA';
  clinicalMessage: string;
  parentMessage: string;
}

export interface WhoGrowthStandard {
  id: number;
  indicator: 'WEIGHT_FOR_AGE' | 'LENGTH_FOR_AGE' | 'HEAD_CIRCUMFERENCE_FOR_AGE';
  sex: 'MALE' | 'FEMALE';
  dataVersion: string;
  lmsData: any[];
}

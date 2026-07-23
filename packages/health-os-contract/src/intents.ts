export type IntentType =
  | 'SearchDoctorIntent'
  | 'ScheduleAppointmentIntent'
  | 'FindAppointmentIntent'
  | 'QueryVaultIntent'
  | 'UploadDocumentIntent'
  | 'GetBiometricsIntent'
  | 'GetQuScoreIntent'
  | 'RegisterMeasurementIntent'
  | 'FindMedicationIntent'
  | 'UnknownIntent';

export interface BaseIntent {
  type: IntentType;
  confidence: number;
  extractedEntities: Record<string, any>;
}

export interface SearchDoctorIntent extends BaseIntent {
  type: 'SearchDoctorIntent';
  extractedEntities: {
    specialty?: string;
    location?: string;
    availabilityDate?: string;
  };
}

export interface ScheduleAppointmentIntent extends BaseIntent {
  type: 'ScheduleAppointmentIntent';
  extractedEntities: {
    doctorId?: string;
    doctorName?: string;
    preferredTime?: string;
  };
}

export type HealthOSIntent = 
  | SearchDoctorIntent 
  | ScheduleAppointmentIntent 
  | BaseIntent;

export type BloodType =
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE'
  | 'UNKNOWN';

export interface PatientActiveProblem {
  id: number;
  diagnosis: string;
  status: string;
  startDate: string | null;
  resolutionDate: string | null;
  professional: string | null;
  priority: string | null;
  observations: string | null;
  updatedAt: string | null;
}

export interface PatientAllergy {
  id: number;
  substance: string;
  type: string | null;
  severity: string | null;
  reaction: string | null;
  detectionDate: string | null;
  status: string | null;
  updatedAt: string | null;
}

export interface PatientMedication {
  id: number;
  name: string;
  dosage: string | null;
  frequency: string | null;
  route: string | null;
  startDate: string | null;
  endDate: string | null;
  reason: string | null;
  prescriber: string | null;
  updatedAt: string | null;
}

export interface PatientHealthProfile {
  bloodType: BloodType | null;
  heightCm: number | null;
  weightKg: number | null;
  
  personalBackground: Record<string, any> | null;
  familyBackground: Record<string, any> | null;
  socialBackground: Record<string, any> | null;
  
  activeProblems: PatientActiveProblem[];
  allergies: PatientAllergy[];
  medications: PatientMedication[];
  
  updatedAt: string | null;
}

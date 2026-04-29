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

export interface PatientHealthProfile {
  bloodType: BloodType | null;
  heightCm: number | null;
  weightKg: number | null;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  surgicalHistory: string | null;
  familyHistory: string | null;
  updatedAt: string | null;
}

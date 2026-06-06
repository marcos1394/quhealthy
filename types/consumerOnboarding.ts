export interface ConsumerOnboardingData {
  algorithmicConsentAccepted: boolean;
  biologicalSex: string;
  bloodType: string;
  dietaryPreference: string;
  weightKg: number | "";
  heightCm: number | "";
  restingHeartRate: number | "";
  averageBloodPressureSystolic: number | "";
  averageBloodPressureDiastolic: number | "";
  isSmoker: boolean;
  alcoholUnitsWeek: number | "";
  weeklyExerciseMinutes: number | "";
  medicalConditions: any[];
  allergies: any[];
  currentMedications: string[];
  healthGoals: string[];
}

export const INITIAL_CONSUMER_ONBOARDING_DATA: ConsumerOnboardingData = {
  algorithmicConsentAccepted: false,
  biologicalSex: "",
  bloodType: "",
  dietaryPreference: "",
  weightKg: "",
  heightCm: "",
  restingHeartRate: "",
  averageBloodPressureSystolic: "",
  averageBloodPressureDiastolic: "",
  isSmoker: false,
  alcoholUnitsWeek: "",
  weeklyExerciseMinutes: "",
  medicalConditions: [],
  allergies: [],
  currentMedications: [],
  healthGoals: [],
};

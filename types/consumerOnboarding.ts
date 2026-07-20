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
  exerciseDaysPerWeek: number | "";
  exerciseMinutesPerDay: number | "";
  stressLevel: number | "";
  sleepHoursAvg: number | "";
  medicalConditions: any[];
  allergies: any[];
  currentMedications: string[];
  healthGoals: string[];
  // --- NOM-024 ---
  curp: string;
  ethnicGroup: string;
  healthInsurance: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  address: string;
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
  exerciseDaysPerWeek: "",
  exerciseMinutesPerDay: "",
  stressLevel: 5,
  sleepHoursAvg: "",
  medicalConditions: [],
  allergies: [],
  currentMedications: [],
  healthGoals: [],
  // --- NOM-024 ---
  curp: "",
  ethnicGroup: "",
  healthInsurance: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  address: "",
};

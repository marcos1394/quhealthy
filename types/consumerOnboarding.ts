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
  // --- Compliance & Tracking ---
  consentAcceptedAt?: string;
  termsVersion?: string;
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
  termsVersion: "2026.1",
};

// Algoritmo oficial de validación de CURP mexicana (formato y estructura)
export function isValidCurp(curp: string): boolean {
  if (!curp || curp.trim().length !== 18) return false;
  const regex = /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[HM]{1}(AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/i;
  return regex.test(curp.trim().toUpperCase());
}

export interface BmiAnalysis {
  bmi: number;
  category: "underweight" | "normal" | "overweight" | "obesity";
  labelEs: string;
  labelEn: string;
  color: string;
  bgLight: string;
  bgDark: string;
}

export function calculateBmi(weightKg: number | "", heightCm: number | ""): BmiAnalysis | null {
  if (!weightKg || !heightCm || Number(weightKg) <= 0 || Number(heightCm) <= 0) return null;
  const heightM = Number(heightCm) / 100;
  const bmi = Number((Number(weightKg) / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) {
    return {
      bmi,
      category: "underweight",
      labelEs: "Bajo peso",
      labelEn: "Underweight",
      color: "text-sky-600 dark:text-sky-400",
      bgLight: "bg-sky-50 text-sky-700 border-sky-200",
      bgDark: "dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/40",
    };
  } else if (bmi <= 24.9) {
    return {
      bmi,
      category: "normal",
      labelEs: "Peso saludable (Óptimo)",
      labelEn: "Healthy weight",
      color: "text-emerald-600 dark:text-emerald-400",
      bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
      bgDark: "dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40",
    };
  } else if (bmi <= 29.9) {
    return {
      bmi,
      category: "overweight",
      labelEs: "Sobrepeso",
      labelEn: "Overweight",
      color: "text-amber-600 dark:text-amber-400",
      bgLight: "bg-amber-50 text-amber-700 border-amber-200",
      bgDark: "dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40",
    };
  } else {
    return {
      bmi,
      category: "obesity",
      labelEs: "Obesidad (Riesgo cardiovascular)",
      labelEn: "Obesity",
      color: "text-rose-600 dark:text-rose-400",
      bgLight: "bg-rose-50 text-rose-700 border-rose-200",
      bgDark: "dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40",
    };
  }
}

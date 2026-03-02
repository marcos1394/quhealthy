// src/types/consumerProfile.ts

export interface ConsumerProfile {
  fullName: string;
  birthDate: string; // Formato YYYY-MM-DD
  gender: string;
  phoneNumber: string;
  address: string;
  
  // Datos Médicos
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
  
  // Preferencias
  healthGoals: string[];
  servicePreferences: string[];
  preferredSchedule: string;
  interestInActivities: Record<string, number>;
}

// Objeto por defecto para inicializar el formulario de forma segura
// y evitar que React se queje de inputs "uncontrolled" si el backend manda nulls
export const defaultConsumerProfile: ConsumerProfile = {
  fullName: "",
  birthDate: "",
  gender: "",
  phoneNumber: "",
  address: "",
  medicalHistory: "",
  allergies: "",
  currentMedications: "",
  healthGoals: [],
  servicePreferences: [],
  preferredSchedule: "",
  interestInActivities: { ejercicio: 5, dieta: 5, skincare: 5 },
};

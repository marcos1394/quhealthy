// src/types/consumerProfile.ts
// Alineado 1:1 con ConsumerProfileDto del backend (onboarding-service)

export interface ConsumerProfile {
  fullName: string;
  birthDate: string;           // Formato YYYY-MM-DD → LocalDate en backend
  gender: string;              // "male" | "female" | "other" | "none"
  phoneNumber: string;
  location: string;            // Solo ciudad o código postal (antes 'address')

  // Expediente Clínico – Arrays para Tags/Pills y futura extracción con IA
  medicalConditions: string[]; // Antes 'medicalHistory: string'
  allergies: string[];         // Antes 'allergies: string'
  currentMedications: string[];// Antes 'currentMedications: string'

  // Discovery & Preferencias
  healthGoals: string[];
  preferredModality: string;   // "IN_PERSON" | "VIDEO_CALL" | "HOME_VISIT" | "ANY"
}

// Objeto por defecto para inicializar el formulario de forma segura
// y evitar que React se queje de inputs "uncontrolled" si el backend manda nulls
export const defaultConsumerProfile: ConsumerProfile = {
  fullName: "",
  birthDate: "",
  gender: "",
  phoneNumber: "",
  location: "",
  medicalConditions: [],
  allergies: [],
  currentMedications: [],
  healthGoals: [],
  preferredModality: "",
};

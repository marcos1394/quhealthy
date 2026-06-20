// src/types/consumerProfile.ts
// Alineado 1:1 con ConsumerProfileDto del backend (onboarding-service)

export interface ConsumerProfile {
  fullName: string;
  birthDate: string;           // Formato YYYY-MM-DD → LocalDate en backend
  gender: string;              // "male" | "female" | "other" | "none"
  phoneNumber: string;
  location: string;            // Solo ciudad o código postal (antes 'address')

  // Expediente Clínico – Arrays para Tags/Pills y futura extracción con IA
  medicalConditions: any[]; // Antes 'medicalHistory: string'
  allergies: any[];         // Antes 'allergies: string'
  currentMedications: string[];// Antes 'currentMedications: string'

  // Discovery & Preferencias
  healthGoals: string[];
  preferredModality: string;   // "IN_PERSON" | "VIDEO_CALL" | "HOME_VISIT" | "ANY"

  // Extra fields that come from the backend's getProfile response
  bloodType?: string;
  biologicalSex?: string;
  dietaryPreference?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  profilePictureUrl?: string;
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
  bloodType: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  profilePictureUrl: "",
};

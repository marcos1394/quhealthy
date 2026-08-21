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
  curp?: string;
  rfc?: string;
  ethnicGroup?: string;
  healthInsurance?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  profilePictureUrl?: string;

  // Seguro Médico & Póliza
  insuranceType?: string; // "PUBLIC" | "PRIVATE" | "NONE"
  insuranceProvider?: string; // "IMSS", "ISSSTE", "GNP", "AXA", etc.
  insurancePolicyNumber?: string; // NSS o No. Póliza
  insurancePlanName?: string; // Plan / Cobertura
  
  // Datos Personales & Identidad
  maritalStatus?: string;
  occupation?: string;
  nationality?: string;
  organDonor?: string; // "YES" | "NO" | "FAMILY_DECIDES"
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;

  // Contacto de Emergencia Extendido
  emergencyContactRelationship?: string;
  emergencyContactPhoneAlt?: string;

  // Expediente & Antecedentes Clínicos
  chronicDiseases?: string;
  surgeries?: string;
  implantsDevices?: string;
  vaccinations?: string;
  primaryPhysician?: string;

  // Antecedentes (Nuevo formato centralizado de health vault)
  familyBackground?: Record<string, string>;
  personalBackground?: Record<string, string>;
  socialBackground?: Record<string, string>;
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
  biologicalSex: "",
  dietaryPreference: "",
  curp: "",
  rfc: "",
  ethnicGroup: "",
  healthInsurance: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",
  emergencyContactPhoneAlt: "",
  insuranceType: "NONE",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  insurancePlanName: "",
  maritalStatus: "",
  occupation: "",
  nationality: "Mexicana",
  organDonor: "FAMILY_DECIDES",
  addressStreet: "",
  addressCity: "",
  addressState: "",
  addressPostalCode: "",
  chronicDiseases: "",
  surgeries: "",
  implantsDevices: "",
  vaccinations: "",
  primaryPhysician: "",
  profilePictureUrl: "",
  familyBackground: {},
  personalBackground: {},
  socialBackground: {},
};

// src/types/ehr.ts

// 1. Estructura profesional de Notas Clínicas (Formato SOAP)
export interface SoapNotes {
  subjective: string; // Motivo de consulta, síntomas según el paciente
  objective: string;  // Exploración física, signos vitales
  assessment: string; // Diagnóstico
  plan: string;       // Tratamiento a seguir
}

// 2. Ítem de Receta Digital (Preparado para el e-commerce híbrido)
export interface PrescriptionItem {
  id: string; // UUID local para el frontend
  medicationName: string; // Nombre del medicamento o producto
  dosage: string; // Dosis (Ej. 500mg)
  frequency: string; // Frecuencia (Ej. Cada 8 horas)
  duration: string; // Duración (Ej. Por 5 días)
  instructions?: string; // Instrucciones adicionales
  catalogItemId?: number; // 🚀 VITAL: Si es un producto de su tienda, lo vinculamos aquí
}

// 3. Payload para finalizar la consulta y generar receta
export interface CompleteConsultationPayload {
  notes: string; // Mandaremos el JSON stringificado del objeto SoapNotes para el backend actual
  prescriptionItems: Omit<PrescriptionItem, 'id'>[];
  sendPrescriptionToVault: boolean; // Si true, el backend genera el PDF y lo guarda en el Health Vault
}

// 4. Tipos auxiliares para la Bóveda y Perfil (Reflejando el Onboarding Service)
export interface PatientClinicalProfile {
  consumerId: number;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  quScore?: number;
  quScoreBand?: string; // Ej: "Óptimo", "En Riesgo"
}

export interface VaultDocument {
  id: string;
  fileName: string;
  documentType: 'LAB_RESULT' | 'PRESCRIPTION' | 'IMAGING' | 'OTHER';
  uploadDate: string;
  secureUrl?: string;
}

// Ubicación: src/types/ehr.ts

// ==========================================================
// 1. ESTRUCTURAS DE NOTAS CLÍNICAS (FORMATO SOAP)
// ==========================================================

/**
 * Representa la estructura interna del formulario en el frontend.
 */
export interface SoapNotes {
  subjective: string; // Motivo de consulta y síntomas
  objective: string;  // Exploración física y signos vitales
  assessment: string; // Juicio clínico / Diagnóstico
  plan: string;       // Plan terapéutico
}

/**
 * 🚀 DTO para el envío al Backend (NF-001 / FF-004)
 * Refleja la clase ClinicalNotesDto de Spring Boot.
 */
export interface ClinicalNotesDto {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

// ==========================================================
// 2. RECETA DIGITAL (E-COMMERCE HÍBRIDO)
// ==========================================================

/**
 * Estructura de un ítem de receta para manejo en la UI (con ID temporal).
 */
export interface PrescriptionItem {
  id: string;             // UUID local para llaves en React
  medicationName: string; // Nombre del fármaco o producto
  dosage: string;         // Dosis (ej. 500mg)
  frequency: string;      // Frecuencia (ej. Cada 12h)
  duration: string;       // Duración (ej. 7 días)
  instructions?: string;  // Indicaciones adicionales
  catalogItemId?: number; // Enlace al producto en el Marketplace de QuHealthy
}

/**
 * 🚀 DTO para el envío al Backend
 * Refleja la clase PrescriptionItemDto de Spring Boot.
 */
export interface PrescriptionItemDto {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  catalogItemId?: number;
}

// ==========================================================
// 3. PAYLOAD GLOBAL DE FINALIZACIÓN (CONTRACT)
// ==========================================================

/**
 * 🚀 FIX FF-004: Estructura definitiva para finalizar la consulta.
 * Ya no enviamos un string plano, sino objetos fuertemente tipados.
 */
export interface CompleteConsultationPayload {
  clinicalNotes: ClinicalNotesDto;
  prescriptionItems: PrescriptionItemDto[];
  sendPrescriptionToVault: boolean;
}

// ==========================================================
// 4. PERFIL CLÍNICO Y BÓVEDA (ONBOARDING & HEALTH VAULT)
// ==========================================================

/**
 * Información del paciente proveniente del Onboarding Service.
 */
export interface PatientClinicalProfile {
  consumerId: number;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  quScore?: number;     // Puntuación de salud algorítmica
  quScoreBand?: string; // Clasificación: "Óptimo", "En Riesgo", etc.
}

/**
 * Documentos almacenados en el Health Vault del paciente.
 */
export interface VaultDocument {
  id: string;
  fileName: string;
  documentType: 'LAB_RESULT' | 'PRESCRIPTION' | 'IMAGING' | 'OTHER';
  uploadDate: string; // ISO 8601
  secureUrl?: string; // URL temporal de S3/Azure Blob Storage
}
// Enum de estados posibles (debe coincidir con Java)
export type OnboardingStepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

// ✅ La respuesta cruda que viene del Backend (OnboardingStatusResponse.java)
export interface OnboardingStatusResponse {
  providerId: number;
  
  // Estados de cada módulo
  profileStatus: OnboardingStepStatus;
  kycStatus: OnboardingStepStatus;
  licenseStatus: OnboardingStepStatus;
  fiscalStatus: OnboardingStepStatus;
  marketplaceStatus: OnboardingStepStatus;
  
  // Mapa de rechazos (clave: módulo, valor: motivo)
  rejectionReasons?: Record<string, string>;
  
  // Porcentaje general (0-100)
  completionPercentage: number;
}

// ✅ La estructura visual para tu Checklist en el Frontend
export interface OnboardingStepUI {
  id: 'profile' | 'kyc' | 'license' | 'plan'; 
  title: string;
  description: string;
  status: OnboardingStepStatus; // Estado real
  statusText: string;           // Texto amigable ("Completado", "Pendiente")
  isComplete: boolean;          // Helper para UI
  isLocked: boolean;            // Si está bloqueado (secuencial)
  actionPath: string;           // Ruta de navegación (/onboarding/profile)
  rejectionReason?: string;     // Mensaje de error si fue rechazado
}
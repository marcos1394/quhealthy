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

export interface UpdateProfileRequest {
  businessName: string;
  bio: string;
  
  // Opcional en Java ahora, opcional aquí también
  profileImageUrl?: string | null; 

  // Ubicación
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string | null;

  // Contacto
  websiteUrl?: string | null;
  contactPhone?: string; // Java lo permite nulo, pero mejor enviarlo si lo tenemos
  contactEmail: string;

  // Categoría
  categoryId: number;
  subCategoryId: number;
  
  // ✅ Agregamos Tags para que coincida con Java
  tagIds: number[]; 
}

// ✅ RESPONSE: Lo que recibimos al consultar (ProfileResponse.java)
export interface ProfileResponse {
  providerId: number;
  businessName: string;
  bio: string;
  profileImageUrl: string;
  slug: string;
  
  address: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  
  websiteUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  
  categoryId: number;
  subCategoryId: number;
  
  profileStatus: string; // 'PENDING', 'COMPLETED', etc.
}


export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
  description?: string;
}

export interface SubCategoryResponse {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
}

export interface TagResponse {
  id: number;
  name: string;
  slug: string;
  color?: string;
}
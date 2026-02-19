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
  // Identidad e Industria
  businessName: string;
  parentCategoryId: number | null; // 🆕 NUEVO: 1 para Salud, 2 para Belleza
  bio: string;
  
  // Imagen (Opcional)
  profileImageUrl?: string | null; 

  // Ubicación (Google Places)
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string | null;

  // Contacto
  contactEmail: string;
  contactPhone?: string; 
  websiteUrl?: string | null;

  // Especialización (Componente CategorySelector)
  categoryId: number;    // Especialidad (Ej: Dentista)
  subCategoryId: number; // Sub-especialidad (Ej: Ortodoncista)
  tagIds: number[];      // Tags (Ej: Bilingüe, Urgencias)
}

// ✅ RESPONSE: Lo que recibimos al consultar (ProfileResponse.java)
export interface ProfileResponse {
  tagIds: never[];
  providerId: number;
  parentCategoryId: number; // 🆕 NUEVO: 1 para Salud, 2 para Belleza
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

export type DocumentType = 
  | 'INE_FRONT' 
  | 'INE_BACK' 
  | 'PASSPORT' 
  | 'SELFIE' 
  | 'PROFESSIONAL_LICENSE' 
  | 'TAX_CERTIFICATE' 
  | 'PROOF_OF_ADDRESS';

// Estado de Verificación (Igual a tu Java)
export type VerificationStatus = 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW_NEEDED';

// Respuesta del Backend (KycDocumentResponse)
export interface KycDocumentResponse {
  documentType: DocumentType;
  verificationStatus: VerificationStatus;
  rejectionReason?: string; // Mensaje de Gemini ("Foto borrosa")
  fileUrl: string; // URL firmada para previsualizar
  extractedData?: Record<string, any>; // Datos OCR (Nombre, CURP)
  lastUpdated: string;
}

export interface LicenseResponse {
  licenseNumber: string;
  careerName: string;
  institutionName: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'NOT_UPLOADED';
  rejectionReason?: string;
  documentUrl?: string; // URL firmada para previsualizar
}
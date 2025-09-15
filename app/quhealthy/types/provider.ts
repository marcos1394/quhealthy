export type KycStatusValue = 'pending' | 'in_review' | 'approved' | 'rejected' | 'not_started' | 'verified';
export type LicenseStatusValue = 'pending' | 'verified' | 'rejected';
export type PlanLimit = number | "Ilimitados";

export interface KycStatusInfo { 
  status: KycStatusValue; 
  isComplete: boolean; 
}

export interface LicenseStatusInfo { 
  isRequired: boolean; 
  status: LicenseStatusValue; 
  isComplete: boolean; 
}

// --- INICIO DE LA CORRECCIÓN ---
// Expandimos esta interfaz para que incluya todos los datos del marketplace
export interface MarketplaceStatusInfo {
  isConfigured: boolean;
  storeName?: string | null;
  storeSlug?: string | null;
  storeLogo?: string | null;
  storeBanner?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  customDescription?: string | null;
  welcomeVideo?: string | null;
}
// --- FIN DE LA CORRECCIÓN ---

export interface BlocksStatusInfo { 
  isConfigured: boolean; 
}

export interface OnboardingStatusDetail { 
  kyc: KycStatusInfo; 
  license: LicenseStatusInfo; 
  marketplace: MarketplaceStatusInfo; // Ahora usará la nueva versión
  blocks: BlocksStatusInfo; 
}

export interface PlanPermissionsInfo { 
  quMarketAccess: boolean; 
  quBlocksAccess: boolean; 
  marketingLevel: number; 
  supportLevel: number; 
  advancedReports: boolean; 
  userManagement: number; 
  allowAdvancePayments: boolean; 
  maxAppointments: PlanLimit; 
  maxProducts: PlanLimit; 
  maxCourses: PlanLimit; 
}

export interface PlanDetailsInfo { 
  planId: number | null; 
  planName: string; 
  hasActivePlan: boolean; 
  endDate: string | null;
  planStatus?: string; // Añadido para consistencia
  trialExpiresAt?: string | null; // Añadido para consistencia
  permissions: PlanPermissionsInfo; 
  
}

export interface ProviderDetailsInfo { 
  parentCategoryId: number | null; 
  email: string; 
  name: string;
  archetype?: string | null; // Añadido para consistencia
  stripeAccountId?: string | null; // <-- AÑADE ESTA LÍNEA

}

export interface OnboardingStatusResponse {
  onboardingStatus: OnboardingStatusDetail;
  planDetails: PlanDetailsInfo;
  providerDetails: ProviderDetailsInfo;
}
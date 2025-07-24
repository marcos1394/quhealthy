export type KycStatusValue = 'pending' | 'in_review' | 'approved' | 'rejected' | 'not_started' | 'verified';
export type LicenseStatusValue = 'pending' | 'verified' | 'rejected';
export type PlanLimit = number | "Ilimitados";

export interface KycStatusInfo { status: KycStatusValue; isComplete: boolean; }
export interface LicenseStatusInfo { isRequired: boolean; status: LicenseStatusValue; isComplete: boolean; }
export interface MarketplaceStatusInfo { isConfigured: boolean; }
export interface BlocksStatusInfo { isConfigured: boolean; }
export interface OnboardingStatusDetail { kyc: KycStatusInfo; license: LicenseStatusInfo; marketplace: MarketplaceStatusInfo; blocks: BlocksStatusInfo; }
export interface PlanPermissionsInfo { quMarketAccess: boolean; quBlocksAccess: boolean; marketingLevel: number; supportLevel: number; advancedReports: boolean; userManagement: number; allowAdvancePayments: boolean; maxAppointments: PlanLimit; maxProducts: PlanLimit; maxCourses: PlanLimit; }
export interface PlanDetailsInfo { planId: number | null; planName: string; hasActivePlan: boolean; endDate: string | null; permissions: PlanPermissionsInfo; }
export interface ProviderDetailsInfo { parentCategoryId: number | null; email: string; name: string; }

export interface OnboardingStatusResponse {
  onboardingStatus: OnboardingStatusDetail;
  planDetails: PlanDetailsInfo;
  providerDetails: ProviderDetailsInfo;
}
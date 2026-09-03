// Ubicación: types/laboratory.ts

export type LaboratoryType =
  | 'CLINICAL_ROUTINE'
  | 'IMAGING_DIAGNOSTICS'
  | 'SAMPLING_POINT'
  | 'PATHOLOGY_CITOLOGY';

export type SanitaryProfession =
  | 'QFB'
  | 'CLINICAL_CHEMIST'
  | 'PATHOLOGIST_MD'
  | 'BIOLOGIST'
  | 'OTHER';

export type LaboratoryStudyCategory =
  | 'HEMATOLOGY'
  | 'CLINICAL_CHEMISTRY'
  | 'IMMUNOLOGY'
  | 'HORMONES'
  | 'URINALYSIS'
  | 'MICROBIOLOGY'
  | 'IMAGING'
  | 'MOLECULAR_GENETICS';

export type LaboratoryDocumentType =
  | 'COFEPRIS_NOTICE'
  | 'TAX_ID_PROOF'
  | 'RPBI_CONTRACT'
  | 'QUALITY_CONTROL_CERT'
  | 'RESPONSIBLE_ID_PROOF';

export type ReadinessTier = 'TIER_BRONZE' | 'TIER_SILVER' | 'TIER_GOLD';

export type StepAuditStatus = 'COMPLETED' | 'SKIPPED' | 'IN_PROGRESS' | 'PENDING';

export type CommercialFollowupStatus =
  | 'NEW_LEAD'
  | 'REQUIRES_COFEPRIS_ASSISTANCE'
  | 'REQUIRES_CATALOG_ASSISTANCE'
  | 'READY_FOR_COMMERCIAL_PARTNERSHIP'
  | 'PARTNERSHIP_ACTIVE';

export interface StepAuditDetail {
  stepNumber: number;
  stepName: string;
  status: StepAuditStatus;
  isComplete: boolean;
  missingFields?: string[];
}

export interface LaboratoryOnboardingStatusResponse {
  laboratoryId?: number;
  isRegistered: boolean;
  legalName?: string;
  brandName?: string;
  status?: string;

  currentStep: number;
  completionPercentage: number;
  readinessTier: ReadinessTier;
  commercialStatus: CommercialFollowupStatus;

  canExploreDashboard: boolean;
  canSellInMarketplace: boolean;

  identityCompleted?: boolean;
  sanitaryCompleted?: boolean;
  branchesConfigured?: boolean;
  catalogConfigured?: boolean;
  documentsUploaded?: boolean;

  stepAudit?: Record<string, StepAuditDetail>;
  missingRequirements: string[];
  skippedFields?: string[];
  commercialSuggestedAction?: string;
}

export interface SaveLaboratoryIdentityPayload {
  legalName: string;
  brandName?: string;
  rfc?: string;
  laboratoryType: LaboratoryType;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  logoUrl?: string;
  allowsHomeSampling?: boolean;
  homeSamplingRadiusKm?: number;
  homeSamplingFee?: number;
  allowsCorporateCheckups?: boolean;
  allowsUrgentAnalysis?: boolean;
}

export interface SaveLaboratorySanitaryPayload {
  responsibleFullName?: string;
  professionalLicense?: string;
  profession?: SanitaryProfession;
  specialtyLicense?: string;
  cofeprisNoticeNumber?: string;
  scianCode?: string;
  sanitaryLicenseNumber?: string;
}

export interface SaveLaboratoryBranchPayload {
  branchName?: string;
  street?: string;
  exteriorNumber?: string;
  interiorNumber?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  openingHoursJson?: string;
  fastingHoursInfo?: string;
  isMainBranch?: boolean;
}

export interface LaboratoryStudyItem {
  studyCode: string;
  studyName: string;
  category: LaboratoryStudyCategory;
  patientPreparation?: string;
  basePrice: number;
  turnaroundHours?: number;
  sampleType?: string;
  isActive?: boolean;
}

export interface SaveLaboratoryCatalogPayload {
  studies: LaboratoryStudyItem[];
  rpbiCompany?: string;
  rpbiContractNumber?: string;
}

export interface SkipLaboratoryStepPayload {
  stepNumber: number;
  reason?: string;
  skippedFields?: string[];
}

export interface LaboratoryOrganizationDto {
  id: number;
  ownerUserId: number;
  legalName: string;
  brandName?: string;
  rfc?: string;
  laboratoryType: LaboratoryType;
  status: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  logoUrl?: string;
  allowsHomeSampling?: boolean;
  homeSamplingRadiusKm?: number;
  homeSamplingFee?: number;
  allowsCorporateCheckups?: boolean;
  allowsUrgentAnalysis?: boolean;
  readinessScore: number;
  readinessTier: ReadinessTier;
  commercialStatus: CommercialFollowupStatus;
}

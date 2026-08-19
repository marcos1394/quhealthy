// types/foundation.ts

export type OrganizationType =
  | "IAP"
  | "AC"
  | "IBP"
  | "ABP"
  | "FOUNDATION"
  | "OTHER";

export type FoundationRole =
  | "FOUNDATION_ADMIN"
  | "SOCIAL_WORKER"
  | "PROGRAM_COORDINATOR"
  | "MEDICAL_DIRECTOR"
  | "AUDITOR"
  | "VOLUNTEER";

export interface FoundationProfile {
  id?: number;
  userId?: number;
  legalName: string;
  brandName?: string;
  organizationType: OrganizationType;
  mission?: string;
  vision?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Sede
  addressStreet?: string;
  addressNumber?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;

  // Áreas de salud / causas
  primaryCauses?: string[];

  // Fiscal / Legal
  rfc?: string;
  isAuthorizedDonatary?: boolean;
  cluniNumber?: string;
  legalRepName?: string;
  legalRepCurp?: string;

  verificationStatus: "PENDING" | "PROCESSING" | "APPROVED" | "REJECTED" | "MANUAL_REVIEW_NEEDED";
  currentStep: number;
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FoundationDocument {
  id: number;
  foundationId: number;
  documentType:
    | "CONSTITUTIVE_ACT"
    | "POWER_OF_ATTORNEY"
    | "TAX_STATUS_CERTIFICATE"
    | "CLUNI_DOCUMENT"
    | "PROOF_OF_ADDRESS"
    | "LEGAL_REP_ID"
    | "DONATARY_AUTHORIZATION"
    | string;
  fileName: string;
  fileKey: string;
  contentType?: string;
  fileSizeBytes?: number;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  uploadedAt?: string;
}

export interface FoundationStaffMember {
  id?: number;
  foundationId?: number;
  name: string;
  email: string;
  phone?: string;
  role: FoundationRole;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

export interface FoundationProgram {
  id?: number;
  foundationId?: number;
  name: string;
  description?: string;
  cause: string;
  supportTypes: string[];
  requiredDocuments: string[];
  targetBeneficiariesCount?: number;
  allocatedBudget?: number;
  status?: string;
}

export interface FoundationIdentityPayload {
  legalName: string;
  brandName?: string;
  organizationType: OrganizationType;
  mission?: string;
  vision?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  primaryCauses?: string[];
}

export interface FoundationLegalTaxPayload {
  rfc: string;
  isAuthorizedDonatary?: boolean;
  cluniNumber?: string;
  legalRepName?: string;
  legalRepCurp?: string;
}

export interface FoundationTeamInvitePayload {
  members: {
    name: string;
    email: string;
    phone?: string;
    role: FoundationRole;
  }[];
}

export interface FoundationProgramPayload {
  name: string;
  description?: string;
  cause: string;
  supportTypes: string[];
  requiredDocuments: string[];
  targetBeneficiariesCount?: number;
  allocatedBudget?: number;
}

export interface FoundationOnboardingStatusResponse {
  profile?: FoundationProfile;
  documents: FoundationDocument[];
  teamMembers: FoundationStaffMember[];
  programs: FoundationProgram[];
  currentStep: number;
  isCompleted: boolean;
  verificationStatus: string;
}

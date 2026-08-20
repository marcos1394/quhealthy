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

export type FoundationCause =
  | "ONCOLOGY"
  | "RENAL"
  | "VISUAL"
  | "DIABETES"
  | "PEDIATRIC"
  | "CARDIOVASCULAR"
  | "DISABILITY"
  | "MENTAL_HEALTH"
  | "MATERNAL_INFANT"
  | "RESPIRATORY"
  | "RARE_DISEASES"
  | "GENERAL_HEALTH"
  | "OTHER";

export type SupportType =
  | "CONSULTATION"
  | "MEDICATION"
  | "LABS"
  | "SURGERY"
  | "NUTRITION"
  | "PSYCHOLOGY"
  | "REHABILITATION"
  | "FINANCIAL"
  | "SHELTER"
  | "TRANSPORT";

export type VulnerabilityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SocioEconomicLevel = "A_B" | "C_PLUS" | "C" | "D_PLUS" | "D" | "E";

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
  id: number;
  foundationId: number;
  name: string;
  description?: string;
  cause: string;
  supportTypes: string[];
  requiredDocuments: string[];
  targetBeneficiariesCount?: number;
  activeBeneficiariesCount?: number;
  allocatedBudget?: number;
  disbursedBudget?: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  createdAt?: string;
  updatedAt?: string;
}

export interface FoundationBeneficiary {
  id: number;
  foundationId: number;
  linkedPatientId?: number;
  curp: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  birthDate?: string;
  email?: string;
  phone?: string;
  vulnerabilityLevel: VulnerabilityLevel;
  socioEconomicLevel?: SocioEconomicLevel;
  city?: string;
  state?: string;
  diagnosisSummary?: string;
  status: "ACTIVE" | "PENDING_REVIEW" | "SUSPENDED" | "GRADUATED";
  origin: "FOUNDATION_MANUAL" | "PATIENT_SELF";
  notes?: string;
  enrolledProgramIds?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FoundationProgramEnrollment {
  id: number;
  foundationId: number;
  programId: number;
  beneficiaryId: number;
  enrollmentStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  approvedSubsidyCap?: number;
  disbursedAmount?: number;
  rejectionReason?: string;
  enrolledAt?: string;
  approvedAt?: string;
  approvedByStaffId?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FoundationVoucher {
  id: number;
  voucherCode: string;
  foundationId: number;
  programId: number;
  programName?: string;
  beneficiaryId: number;
  beneficiaryName?: string;
  beneficiaryCurp?: string;
  supportType: string;
  authorizedAmount: number;
  redeemedAmount: number;
  remainingAmount: number;
  subsidyPercentage: number;
  status: "ACTIVE" | "REDEEMED" | "EXPIRED" | "CANCELLED";
  providerId?: number;
  appointmentId?: number;
  prescriptionFolio?: string;
  evidenceUrl?: string;
  notes?: string;
  issuedAt?: string;
  redeemedAt?: string;
  expiresAt?: string;
  createdAt?: string;
}

export interface VoucherStats {
  totalVouchers: number;
  activeVouchers: number;
  redeemedVouchers: number;
  totalAuthorizedAmount: number;
  totalRedeemedAmount: number;
  activeRemainingAmount: number;
}

export interface BeneficiaryDocument {
  id: number;
  foundationId: number;
  beneficiaryId: number;
  beneficiaryName?: string;
  beneficiaryCurp?: string;
  programId?: number;
  documentType: string;
  title: string;
  fileName?: string;
  fileUrl?: string;
  contentType?: string;
  fileSizeBytes?: number;
  verificationStatus: "PENDING" | "APPROVED" | "OBSERVED" | "REJECTED";
  rejectionReason?: string;
  reviewNotes?: string;
  reviewedByStaffId?: number;
  uploadedAt?: string;
  reviewedAt?: string;
  createdAt?: string;
}

export interface FoundationStatsSummary {
  totalPrograms: number;
  activePrograms: number;
  totalBeneficiaries: number;
  activeBeneficiaries: number;
  pendingReviewBeneficiaries: number;
  totalAllocatedBudget: number;
  totalDisbursedBudget: number;
  availableBudget: number;
}

export interface CreateBeneficiaryPayload {
  curp: string;
  firstName: string;
  lastName: string;
  gender?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  vulnerabilityLevel?: string;
  socioEconomicLevel?: string;
  city?: string;
  state?: string;
  diagnosisSummary?: string;
  notes?: string;
  programIdsToEnroll?: number[];
}

export interface CreateProgramPayload {
  name: string;
  description?: string;
  cause: string;
  supportTypes: string[];
  requiredDocuments?: string[];
  targetBeneficiariesCount?: number;
  allocatedBudget: number;
  status?: string;
}

export interface CreateVoucherPayload {
  beneficiaryId: number;
  programId: number;
  supportType: string;
  authorizedAmount: number;
  subsidyPercentage?: number;
  providerId?: number;
  expiresAt?: string;
  notes?: string;
}

export interface RedeemVoucherPayload {
  amountToRedeem: number;
  providerId?: number;
  appointmentId?: number;
  prescriptionFolio?: string;
  evidenceUrl?: string;
  notes?: string;
}

export interface RequestDocumentPayload {
  beneficiaryId: number;
  programId?: number;
  documentType: string;
  title: string;
}

export interface ReviewDocumentPayload {
  verificationStatus: "APPROVED" | "OBSERVED" | "REJECTED";
  rejectionReason?: string;
  reviewNotes?: string;
}

// Payloads específicos para el Onboarding Wizard
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

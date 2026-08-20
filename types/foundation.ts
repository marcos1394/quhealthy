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
  rejectionReason?: string;
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

export interface HealthDataSharing {
  id: number;
  foundationId: number;
  beneficiaryId: number;
  beneficiaryName?: string;
  beneficiaryCurp?: string;
  patientUserId?: number;
  programId?: number;
  programName?: string;
  authorizedScopes: string[];
  purpose?: string;
  validFrom: string;
  validTo: string;
  isRevoked: boolean;
  revokedAt?: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  createdAt?: string;
}

export interface CaregiverLink {
  id: number;
  beneficiaryId: number;
  patientUserId?: number;
  caregiverUserId?: number;
  caregiverName: string;
  caregiverPhone?: string;
  caregiverEmail?: string;
  relationship: string;
  caregiverRole: "INFORMATIONAL_CONTACT" | "AUTHORIZED_CAREGIVER" | "LEGAL_GUARDIAN";
  permissions: string[];
  isVerified: boolean;
  createdAt?: string;
}

export interface FoundationCampaign {
  id: number;
  foundationId: number;
  programId?: number;
  programName?: string;
  name: string;
  cause: string;
  description?: string;
  targetAttendees: number;
  screenedAttendees: number;
  startDate: string;
  endDate: string;
  locationCity?: string;
  locationAddress?: string;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignScreeningRecord {
  id: number;
  campaignId: number;
  campaignName?: string;
  foundationId: number;
  beneficiaryId?: number;
  attendeeName: string;
  attendeeCurp?: string;
  attendeePhone?: string;
  screeningType: string;
  measurements?: Record<string, any>;
  riskLevel: "NORMAL" | "MODERATE_RISK" | "HIGH_RISK";
  observations?: string;
  aiSummary?: string;
  referredToProgramId?: number;
  screenedByStaffName?: string;
  screenedAt?: string;
  createdAt?: string;
}

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalScreenedAttendees: number;
  totalTargetAttendees: number;
}

export interface SocialBiMetrics {
  totalLivesImpacted: number;
  totalSubsidiesDisbursed: number;
  avgSubsidyPerBeneficiary: number;
  redemptionRatePercentage: number;
  avgDocumentTurnaroundHours: number;
  socialRoiIndex: number;
  vulnerabilityDistribution: Record<string, number>;
  socioEconomicDistribution: Record<string, number>;
  causeDistribution: Record<string, number>;
  supportTypeBudgetDistribution: Record<string, number>;
  cityDistribution: Record<string, number>;
  monthlyTrendLivesImpacted: Record<string, number>;
}

export interface TransparencyReport {
  foundationId: number;
  legalName: string;
  brandName?: string;
  rfc?: string;
  cluniNumber?: string;
  isAuthorizedDonatary?: boolean;
  period: string;
  generatedAt: string;
  totalAuthorizedFunds: number;
  totalDisbursedFunds: number;
  totalVouchersReconciled: number;
  totalBeneficiariesServed: number;
  reconciledVouchers: FoundationVoucher[];
  fiscalDisclaimer: string;
}

export interface FoundationAdminSummary {
  id: number;
  userId?: number;
  legalName: string;
  brandName?: string;
  organizationType: string;
  rfc?: string;
  cluniNumber?: string;
  isAuthorizedDonatary?: boolean;
  contactEmail?: string;
  contactPhone?: string;
  verificationStatus: "PENDING" | "PROCESSING" | "APPROVED" | "REJECTED" | "MANUAL_REVIEW_NEEDED";
  rejectionReason?: string;
  activeProgramsCount: number;
  totalBeneficiariesCount: number;
  totalDisbursedBudget: number;
  isCompleted: boolean;
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

// Request Payloads
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

export interface CreateDataSharingPayload {
  beneficiaryId: number;
  programId?: number;
  authorizedScopes: string[];
  purpose?: string;
  durationDays: number;
}

export interface CreateCaregiverLinkPayload {
  beneficiaryId: number;
  caregiverName: string;
  caregiverPhone?: string;
  caregiverEmail?: string;
  relationship: string;
  caregiverRole: string;
  permissions?: string[];
}

export interface CreateCampaignPayload {
  programId?: number;
  name: string;
  cause: string;
  description?: string;
  targetAttendees: number;
  startDate: string;
  endDate: string;
  locationCity?: string;
  locationAddress?: string;
  status?: string;
}

export interface CreateScreeningRecordPayload {
  campaignId: number;
  beneficiaryId?: number;
  attendeeName: string;
  attendeeCurp?: string;
  attendeePhone?: string;
  screeningType: string;
  measurements?: Record<string, any>;
  riskLevel: string;
  observations?: string;
  referredToProgramId?: number;
  screenedByStaffName?: string;
}

export interface UpdateFoundationVerificationPayload {
  verificationStatus: string;
  rejectionReason?: string;
  adminNotes?: string;
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

// 🌐 TIENDA INSTITUCIONAL PÚBLICA PARA PACIENTES (DISCOVER & PERFIL PÚBLICO)
export interface FoundationPublicStorefront {
  id: number;
  legalName: string;
  brandName?: string;
  organizationType: string;
  mission?: string;
  vision?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  addressCity?: string;
  addressState?: string;
  primaryCauses: string[];
  isAuthorizedDonatary?: boolean;
  cluniNumber?: string;
  verificationStatus: string;
  programs: FoundationProgram[];
  campaigns: FoundationCampaign[];
  totalBeneficiariesCount: number;
  totalActiveProgramsCount: number;
}

export interface PublicProgramApplicationPayload {
  programId: number;
  curp: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  birthDate?: string;
  gender?: string;
  city?: string;
  state?: string;
  vulnerabilityLevel?: string;
  socioEconomicLevel?: string;
  caseSummary: string;
  notes?: string;
}

export interface PublicCampaignPreregisterPayload {
  campaignId: number;
  attendeeName: string;
  attendeeCurp?: string;
  attendeePhone: string;
  screeningTypeInterest?: string;
  notes?: string;
}

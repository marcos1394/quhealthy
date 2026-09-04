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

// ==========================================
// OPERACIONES LIS (NOM-007) & QU-MARKET STORE
// ==========================================

export type LaboratoryOrderStatus =
  | 'RECEIVED'
  | 'PRE_ANALYTICAL'
  | 'PROCESSING'
  | 'VALIDATION_PENDING'
  | 'COMPLETED'
  | 'DELIVERED'
  | 'CANCELLED';

export type LaboratoryOrderOrigin =
  | 'DESK_WALKIN'
  | 'MARKETPLACE_ORDER'
  | 'HOME_PHLEBOTOMY'
  | 'PHYSICIAN_REFERRAL';

export type LaboratoryServiceType =
  | 'BRANCH_SAMPLE'
  | 'HOME_PHLEBOTOMY'
  | 'EXTERNAL_DELIVERY';

export type LaboratoryPaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'INVOICED'
  | 'REFUNDED';

export type LaboratoryRpbiWasteType =
  | 'PUNZOCORTANTES'
  | 'NO_ANATOMICOS'
  | 'PATOLOGICOS'
  | 'SANGRE_LIQUIDA'
  | 'CULTIVOS_CEPAS';

export interface LaboratoryResultEntry {
  id: number;
  orderItemId: number;
  parameterCode?: string;
  parameterName: string;
  measuredValue: string;
  unit?: string;
  referenceMin?: number;
  referenceMax?: number;
  referenceRangeText?: string;
  isOutOfRange?: boolean;
  isCriticalAlert?: boolean;
  methodology?: string;
  notes?: string;
  validatedByLicense?: string;
  createdAt: string;
}

export interface LaboratoryOrderItem {
  id: number;
  orderId: number;
  studyCatalogId?: number;
  studyCode: string;
  studyName: string;
  category: LaboratoryStudyCategory;
  priceMxn: number;
  status: string;
  resultsCaptured: boolean;
  resultEntries?: LaboratoryResultEntry[];
  createdAt: string;
}

export interface LaboratoryOrder {
  id: number;
  laboratoryId: number;
  orderFolio: string;
  patientUserId?: number;
  patientFullName: string;
  patientEmail?: string;
  patientPhone?: string;
  patientAge?: number;
  patientGender?: string;
  referringPhysicianId?: number;
  referringPhysicianName?: string;
  branchId?: number;
  serviceType: LaboratoryServiceType;
  deliveryAddress?: string;
  scheduledAt?: string;
  fastingHoursDeclared: number;
  fastingVerified: boolean;
  sampleNotes?: string;
  status: LaboratoryOrderStatus;
  origin: LaboratoryOrderOrigin;
  totalAmountMxn: number;
  paymentStatus: LaboratoryPaymentStatus;
  hasCriticalAlert: boolean;
  validatedByUserId?: number;
  validatedAt?: string;
  items: LaboratoryOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface LaboratoryDashboardMetrics {
  todaySamplesReceived: number;
  pendingAnalysis: number;
  pendingValidation: number;
  criticalAlertsCount: number;
  completedToday: number;
  marketplaceOrdersCount: number;
  marketplaceRevenueMxn: number;
  homeSamplingActive: number;
}

export interface LaboratoryStoreMetrics {
  totalPublishedStudies: number;
  totalMarketplaceOrders: number;
  totalMarketplaceRevenue: number;
  homeSamplingEnabled: boolean;
  storeActive: boolean;
}

export interface LaboratoryStudyCatalogItem {
  id: number;
  laboratoryId: number;
  studyCode: string;
  studyName: string;
  category: LaboratoryStudyCategory;
  patientPreparation?: string;
  basePrice?: number;
  turnaroundHours?: number;
  sampleType?: string;
  isActive: boolean;
  isPublishedInMarketplace: boolean;
  marketplacePromoPrice?: number;
  homeSamplingAvailable: boolean;
  popularBadge?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateLaboratoryOrderItemPayload {
  studyCatalogId?: number;
  studyCode: string;
  studyName: string;
  category: LaboratoryStudyCategory;
  priceMxn?: number;
}

export interface CreateLaboratoryOrderPayload {
  patientFullName: string;
  patientUserId?: number;
  patientEmail?: string;
  patientPhone?: string;
  patientAge?: number;
  patientGender?: string;
  referringPhysicianId?: number;
  referringPhysicianName?: string;
  branchId?: number;
  serviceType?: LaboratoryServiceType;
  deliveryAddress?: string;
  scheduledAt?: string;
  fastingHoursDeclared?: number;
  fastingVerified?: boolean;
  sampleNotes?: string;
  origin?: LaboratoryOrderOrigin;
  items: CreateLaboratoryOrderItemPayload[];
}

export interface ResultParameterEntryPayload {
  parameterCode?: string;
  parameterName: string;
  measuredValue: string;
  unit?: string;
  referenceMin?: number;
  referenceMax?: number;
  referenceRangeText?: string;
  isOutOfRange?: boolean;
  isCriticalAlert?: boolean;
  methodology?: string;
  notes?: string;
}

export interface CaptureLaboratoryResultPayload {
  results: ResultParameterEntryPayload[];
  methodology?: string;
  notes?: string;
  validatedByLicense?: string;
  markValidated?: boolean;
}

export interface UpdateStudyMarketplacePayload {
  isPublishedInMarketplace?: boolean;
  marketplacePromoPrice?: number;
  homeSamplingAvailable?: boolean;
  popularBadge?: string;
  basePrice?: number;
  turnaroundHours?: number;
  patientPreparation?: string;
}

export interface LaboratoryRpbiLog {
  id: number;
  laboratoryId: number;
  branchId?: number;
  wasteType: LaboratoryRpbiWasteType;
  weightKg: number;
  manifestFolio: string;
  authorizedDisposalCompany: string;
  pickupDate: string;
  responsibleName?: string;
  createdAt: string;
}

export interface CreateRpbiLogPayload {
  branchId?: number;
  wasteType: LaboratoryRpbiWasteType;
  weightKg: number;
  manifestFolio: string;
  authorizedDisposalCompany: string;
  pickupDate: string;
  responsibleName?: string;
}

export interface PaginatedLaboratoryOrders {
  content: LaboratoryOrder[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

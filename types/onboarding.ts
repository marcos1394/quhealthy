export type StepStatus =
  | 'PENDING'               // No iniciado
  | 'IN_PROGRESS'           // Guardado parcialmente
  | 'APPROVED'              // Aprobado
  | 'REJECTED'              // Rechazado, requiere corrección
  | 'UNDER_REVIEW'          // En revisión manual por equipo
  | 'NOT_APPLICABLE';       // Paso que no aplica según el sector

export type ProviderSector = 'HEALTH' | 'BEAUTY';

export type PersonType = 'FISICA' | 'MORAL';

export type ConsultationType = 'IN_PERSON' | 'VIRTUAL' | 'HOME_VISIT';

export interface OnboardingStatusResponse {
  providerId: number;
  email: string;
  firstName: string;
  sector: ProviderSector;
  personType: PersonType;

  profileStatus: StepStatus;
  kycStatus: StepStatus;
  licenseStatus: StepStatus;
  fiscalStatus: StepStatus;
  globalStatus: StepStatus;

  completionPercentage: number;

  businessName: string | null;
  slug: string | null;
  profileImageUrl: string | null;
  parentCategoryId: number | null;
  categoryId: number | null;
  subCategoryId: number | null;

  rejectionReasons: {
    profile?: string;
    kyc?: string;
    license?: string;
    fiscal?: string;
  } | null;
}

export interface ProfileResponse {
  providerId: number;
  sector: ProviderSector;
  personType: PersonType;
  businessName: string;
  bio: string;
  timeZone: string;
  profileImageUrl: string | null;
  slug: string;
  address: string;
  latitude: number;
  longitude: number;
  googlePlaceId: string | null;
  websiteUrl: string | null;
  contactPhone: string | null;
  contactEmail: string;
  categoryId: number;
  subCategoryId: number;
  tagIds: number[];
  profileStatus: StepStatus;
}

export interface UpdateProfileRequest {
  businessName: string;
  bio: string;
  sector: ProviderSector;
  personType: PersonType;
  parentCategoryId: number;
  categoryId: number;
  subCategoryId: number;
  timeZone: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  websiteUrl?: string | null;
  profileImageUrl?: string | null;
  tagIds?: number[];
}

export type KycDocumentType =
  | 'INE_FRONT'
  | 'INE_BACK'
  | 'PASSPORT'
  | 'SELFIE'
  | 'PROFESSIONAL_LICENSE'
  | 'TAX_CERTIFICATE'
  | 'PROOF_OF_ADDRESS'
  | 'ACTA_CONSTITUTIVA';

export type KycVerificationStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'APPROVED'
  | 'REJECTED'
  | 'MANUAL_REVIEW_NEEDED';

export interface KycDocumentResponse {
  documentType: KycDocumentType;
  verificationStatus: KycVerificationStatus;
  rejectionReason: string | null;
  fileUrl: string;
  extractedData: Record<string, any> | null;
  lastUpdated: string;
}

export interface ProfessionalLicenseResponse {
  licenseNumber: string;
  careerName: string;
  institutionName: string;
  graduationYear: number | null;
  renamedccValidated: boolean;
  documentUrl: string | null;
  status: StepStatus;
  rejectionReason: string | null;
}

export interface BusinessLicenseResponse {
  licenseNumber: string;
  issuingAuthority: string;
  expirationDate: string;
  documentUrl: string | null;
  status: StepStatus;
  rejectionReason: string | null;
}

export type LicenseResponse = ProfessionalLicenseResponse | BusinessLicenseResponse;

export interface FiscalDataFisicaRequest {
  personType: 'FISICA';
  rfc: string;
  fiscalRegime: string;
  legalName: string;
  taxCertificateUrl?: string | null;
}

export interface FiscalDataMoralRequest {
  personType: 'MORAL';
  rfc: string;
  fiscalRegime: string;
  legalName: string;
  taxCertificateUrl?: string | null;
  actaConstitutivaUrl?: string | null;
}

export type FiscalDataRequest = FiscalDataFisicaRequest | FiscalDataMoralRequest;

export interface FiscalDataResponse {
  personType: PersonType;
  rfc: string;
  fiscalRegime: string;
  legalName: string;
  taxCertificateUrl: string | null;
  actaConstitutivaUrl: string | null;  // null si persona física
  status: StepStatus;
  rejectionReason: string | null;
}

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  iconUrl: string | null;
  description: string | null;
  parentCategoryId: number;
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
  color: string | null;
}

export interface FiscalRegimeOption {
  key: string;
  label: string;
  satCode: string;
  applicableTo: PersonType[];
}

export interface MessageResponse {
  message: string;
}

export interface OnboardingStepUI {
  id: string; // 'profile' | 'kyc' | 'license' | 'fiscal'
  title: string;
  description: string;
  status: StepStatus;
  statusText: string;
  isRequired: boolean;
  isComplete: boolean;
  isLocked: boolean;
  actionPath: string;
  rejectionReason?: string;
}
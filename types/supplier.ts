export type SupplierType =
  | "MANUFACTURER"
  | "DISTRIBUTOR"
  | "PHARMACEUTICAL_WHOLESALER"
  | "BIOMEDICAL_EQUIPMENT"
  | "ORTHOPEDICS_IMPLANTS"
  | "GENERAL_HEALTH_SUPPLIES";

export type SupplierRole =
  | "SUPPLIER_ADMIN"
  | "SUPPLIER_SALES"
  | "SUPPLIER_INVENTORY"
  | "SUPPLIER_FINANCE"
  | "SUPPLIER_LOGISTICS"
  | "SUPPLIER_SUPPORT";

export type OrganizationVerificationStatus =
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "DOCUMENT_EXPIRED"
  | "REJECTED"
  | "SUSPENDED";

export type SupplierDocumentType =
  | "COFEPRIS_NOTICE"
  | "SANITARY_LICENSE"
  | "TAX_ID_PROOF"
  | "POWER_OF_ATTORNEY"
  | "ARTICLES_OF_INCORPORATION"
  | "GOOD_STORAGE_PRACTICES_CERT"
  | "OTHER";

export interface SupplierWarehouse {
  id: number;
  organizationId: number;
  code?: string;
  name: string;
  streetAddress?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isMain: boolean;
  allowsColdStorage: boolean;
  minTempSupported?: number;
  maxTempSupported?: number;
  managerName?: string;
  managerPhone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SupplierMember {
  id: number;
  organizationId: number;
  userId: number;
  role: SupplierRole;
  fullName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SupplierDocument {
  id: number;
  organizationId: number;
  documentType: SupplierDocumentType;
  documentNumber?: string;
  fileUrl: string;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  expiresAt?: string;
  status: OrganizationVerificationStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface SupplierOrganization {
  id: number;
  ownerUserId: number;
  legalName: string;
  brandName?: string;
  rfc?: string;
  supplierType: SupplierType;
  status: OrganizationVerificationStatus;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  logoUrl?: string;
  allowsB2b: boolean;
  allowsB2c: boolean;
  allowsRental: boolean;
  hasColdChainCapacity: boolean;
  verifiedAt?: string;
  createdAt: string;
  warehouses: SupplierWarehouse[];
  members: SupplierMember[];
  documents: SupplierDocument[];
}

export interface SupplierOnboardingStatus {
  isRegistered: boolean;
  organizationId?: number;
  legalName?: string;
  brandName?: string;
  status?: OrganizationVerificationStatus;
  identityCompleted: boolean;
  legalTaxCompleted: boolean;
  documentsUploaded: boolean;
  warehousesConfigured: boolean;
  teamConfigured: boolean;
  currentStep: number;
  missingRequirements: string[];
}

export interface SaveSupplierIdentityPayload {
  legalName: string;
  brandName?: string;
  supplierType: SupplierType;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  logoUrl?: string;
  allowsB2b?: boolean;
  allowsB2c?: boolean;
  allowsRental?: boolean;
  hasColdChainCapacity?: boolean;
}

export interface SaveSupplierLegalTaxPayload {
  rfc: string;
  cofeprisNoticeNumber?: string;
  sanitaryLicenseNumber?: string;
  taxRegime?: string;
  zipCodeFiscal?: string;
}

export interface SaveSupplierWarehousePayload {
  code?: string;
  name: string;
  streetAddress?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isMain?: boolean;
  allowsColdStorage?: boolean;
  minTempSupported?: number;
  maxTempSupported?: number;
  managerName?: string;
  managerPhone?: string;
}

export interface InviteSupplierMemberPayload {
  fullName: string;
  email: string;
  phone?: string;
  role: SupplierRole;
}

export interface AdditiveMigrationPayload {
  legalName: string;
  brandName?: string;
  rfc?: string;
  supplierType: SupplierType;
  defaultWarehouseName?: string;
  defaultWarehouseCity?: string;
  defaultWarehouseState?: string;
}

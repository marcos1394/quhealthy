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

export type RiskClass =
  | "CLASS_I"
  | "CLASS_II"
  | "CLASS_III"
  | "NON_REGULATED";

export type ProductComplianceStatus =
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED"
  | "SUSPENDED";

export type BatchStatus =
  | "ACTIVE"
  | "QUARANTINE"
  | "EXPIRED"
  | "EXHAUSTED";

export type MovementType =
  | "PURCHASE"
  | "RECEIPT"
  | "SALE"
  | "RESERVATION"
  | "RELEASE"
  | "TRANSFER"
  | "ADJUSTMENT"
  | "RETURN"
  | "EXPIRATION"
  | "QUARANTINE";

export type TransferStatus =
  | "REQUESTED"
  | "APPROVED"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "CANCELLED";

export interface StorageRequirement {
  id?: number;
  productId?: number;
  requiresColdChain: boolean;
  minTemperature?: number;
  maxTemperature?: number;
  lightSensitive: boolean;
  humidityControlled: boolean;
  minHumidityPercentage?: number;
  maxHumidityPercentage?: number;
  specialHandlingInstructions?: string;
  unNumber?: string;
}

export interface ProductBatch {
  id: number;
  organizationId: number;
  productId: number;
  productName?: string;
  warehouseId: number;
  warehouseName?: string;
  lotNumber: string;
  expirationDate?: string;
  manufactureDate?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  status: BatchStatus;
  unitCost?: number;
  receivedAt?: string;
  createdAt: string;
}

export interface MedicalProduct {
  id: number;
  organizationId: number;
  sku?: string;
  barcodeEan?: string;
  satProdServKey?: string;
  name: string;
  genericName?: string;
  brand?: string;
  manufacturer?: string;
  category?: string;
  description?: string;
  riskClass: RiskClass;
  cofeprisRegisterNumber?: string;
  cofeprisRegisterExpiry?: string;
  technicalSheetUrl?: string;
  imageUrl?: string;
  complianceStatus: ProductComplianceStatus;
  basePriceB2c?: number;
  currency: string;
  isB2cEnabled: boolean;
  isB2bEnabled: boolean;
  isRentalEnabled: boolean;
  rentalDailyRate?: number;
  rentalMonthlyRate?: number;
  isActive: boolean;
  totalStock?: number;
  storageRequirement?: StorageRequirement;
  batches?: ProductBatch[];
  createdAt: string;
}

export interface InventoryMovement {
  id: number;
  organizationId: number;
  productId: number;
  productName?: string;
  batchId?: number;
  lotNumber?: string;
  warehouseId: number;
  warehouseName?: string;
  quantity: number;
  movementType: MovementType;
  referenceType?: string;
  referenceId?: number;
  balanceAfter: number;
  notes?: string;
  createdBy?: number;
  createdAt: string;
}

export interface InventoryTransfer {
  id: number;
  organizationId: number;
  transferNumber: string;
  sourceWarehouseId: number;
  sourceWarehouseName?: string;
  targetWarehouseId: number;
  targetWarehouseName?: string;
  productId: number;
  productName?: string;
  batchId?: number;
  lotNumber?: string;
  quantity: number;
  status: TransferStatus;
  notes?: string;
  requestedBy?: number;
  approvedBy?: number;
  shippedAt?: string;
  receivedAt?: string;
  createdAt: string;
}

export interface SaveMedicalProductPayload {
  sku?: string;
  barcodeEan?: string;
  satProdServKey?: string;
  name: string;
  genericName?: string;
  brand?: string;
  manufacturer?: string;
  category?: string;
  description?: string;
  riskClass?: RiskClass;
  cofeprisRegisterNumber?: string;
  cofeprisRegisterExpiry?: string;
  technicalSheetUrl?: string;
  imageUrl?: string;
  basePriceB2c?: number;
  currency?: string;
  isB2cEnabled?: boolean;
  isB2bEnabled?: boolean;
  isRentalEnabled?: boolean;
  rentalDailyRate?: number;
  rentalMonthlyRate?: number;
  requiresColdChain?: boolean;
  minTemperature?: number;
  maxTemperature?: number;
  lightSensitive?: boolean;
  humidityControlled?: boolean;
  specialHandlingInstructions?: string;
}

export interface SaveProductBatchPayload {
  productId: number;
  warehouseId: number;
  lotNumber: string;
  expirationDate?: string;
  manufactureDate?: string;
  quantity: number;
  status?: BatchStatus;
  unitCost?: number;
}

export interface InventoryAdjustmentPayload {
  batchId: number;
  quantity: number;
  movementType: MovementType;
  notes?: string;
}

export interface CreateInventoryTransferPayload {
  sourceWarehouseId: number;
  targetWarehouseId: number;
  productId: number;
  batchId: number;
  quantity: number;
  notes?: string;
}

export interface BulkImportResult {
  totalRowsProcessed: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
  importedProducts: MedicalProduct[];
}

export type QuoteStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CONVERTED_TO_PO";

export type PurchaseOrderStatus =
  | "ISSUED"
  | "CONFIRMED"
  | "IN_PREPARATION"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentTerm =
  | "IMMEDIATE"
  | "NET_15"
  | "NET_30"
  | "NET_60"
  | "FIFTY_FIFTY"
  | "ON_DELIVERY";

export interface ProductPriceTier {
  id: number;
  organizationId: number;
  productId: number;
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  discountPercentage?: number;
  currency: string;
}

export interface SupplierQuoteItem {
  id: number;
  quoteId: number;
  productId: number;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  taxRate: number;
  totalPrice: number;
  notes?: string;
}

export interface SupplierQuote {
  id: number;
  organizationId: number;
  organizationName?: string;
  organizationRfc?: string;
  quoteNumber: string;
  buyerUserId?: number;
  buyerOrganizationName?: string;
  buyerContactEmail?: string;
  buyerContactPhone?: string;
  buyerRfc?: string;
  status: QuoteStatus;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  validUntil?: string;
  paymentTerms: PaymentTerm;
  deliveryLeadTimeDays?: number;
  notes?: string;
  items: SupplierQuoteItem[];
  createdBy?: number;
  createdAt: string;
}

export interface SupplierPurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
  productId: number;
  batchId?: number;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SupplierPurchaseOrder {
  id: number;
  organizationId: number;
  quoteId?: number;
  poNumber: string;
  buyerUserId?: number;
  buyerOrganizationName?: string;
  buyerRfc?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  status: PurchaseOrderStatus;
  paymentTerms?: PaymentTerm;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  trackingNumber?: string;
  carrierName?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
  items: SupplierPurchaseOrderItem[];
  createdAt: string;
}

export interface SavePriceTierPayload {
  productId: number;
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  discountPercentage?: number;
  currency?: string;
}

export interface SaveSupplierQuoteItemPayload {
  productId: number;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  taxRate?: number;
  notes?: string;
}

export interface SaveSupplierQuotePayload {
  buyerUserId?: number;
  buyerOrganizationName?: string;
  buyerContactEmail?: string;
  buyerContactPhone?: string;
  buyerRfc?: string;
  validUntil?: string;
  paymentTerms?: PaymentTerm;
  deliveryLeadTimeDays?: number;
  shippingAmount?: number;
  currency?: string;
  notes?: string;
  items: SaveSupplierQuoteItemPayload[];
}

export interface UpdatePurchaseOrderStatusPayload {
  status: PurchaseOrderStatus;
  trackingNumber?: string;
  carrierName?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
}

export type AssetCondition =
  | "EXCELLENT"
  | "GOOD"
  | "REQUIRES_MAINTENANCE"
  | "OUT_OF_SERVICE";

export type AssetStatus =
  | "AVAILABLE"
  | "RENTED"
  | "IN_MAINTENANCE"
  | "RETIRED";

export type RentalContractStatus =
  | "DRAFT"
  | "ACTIVE"
  | "EXTENDED"
  | "RETURN_IN_PROGRESS"
  | "COMPLETED"
  | "DEFAULTED"
  | "CANCELLED";

export type MaintenanceType =
  | "PREVENTIVE"
  | "CORRECTIVE"
  | "CALIBRATION"
  | "CERTIFICATION";

export interface BiomedicalAsset {
  id: number;
  organizationId: number;
  productId: number;
  productName?: string;
  warehouseId: number;
  warehouseName?: string;
  serialNumber: string;
  assetTag?: string;
  brand?: string;
  model?: string;
  manufactureYear?: number;
  installationDate?: string;
  lastCalibrationDate?: string;
  nextCalibrationDate?: string;
  conditionStatus: AssetCondition;
  status: AssetStatus;
  dailyRentalRate?: number;
  monthlyRentalRate?: number;
  depositRequired?: number;
  qrCodeUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface EquipmentRentalContract {
  id: number;
  organizationId: number;
  assetId: number;
  assetSerialNumber?: string;
  assetBrand?: string;
  assetModel?: string;
  productName?: string;
  contractNumber: string;
  renterUserId?: number;
  renterOrganizationName: string;
  renterRfc?: string;
  renterContactEmail?: string;
  renterContactPhone?: string;
  deliveryAddress?: string;
  startDate: string;
  endDate: string;
  monthlyRate: number;
  depositAmount: number;
  isDepositReturned: boolean;
  depositReturnDate?: string;
  depositDeductionAmount?: number;
  depositDeductionReason?: string;
  status: RentalContractStatus;
  contractPdfUrl?: string;
  deliveryActaUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface BiomedicalMaintenance {
  id: number;
  organizationId: number;
  assetId: number;
  assetSerialNumber?: string;
  maintenanceType: MaintenanceType;
  maintenanceDate: string;
  performedBy?: string;
  technicianName?: string;
  cost?: number;
  certificateUrl?: string;
  findings?: string;
  actionsTaken?: string;
  nextScheduledDate?: string;
  createdAt: string;
}

export interface SaveBiomedicalAssetPayload {
  productId: number;
  warehouseId: number;
  serialNumber: string;
  assetTag?: string;
  brand?: string;
  model?: string;
  manufactureYear?: number;
  installationDate?: string;
  lastCalibrationDate?: string;
  nextCalibrationDate?: string;
  conditionStatus?: AssetCondition;
  status?: AssetStatus;
  dailyRentalRate?: number;
  monthlyRentalRate?: number;
  depositRequired?: number;
  notes?: string;
}

export interface SaveRentalContractPayload {
  assetId: number;
  renterUserId?: number;
  renterOrganizationName: string;
  renterRfc?: string;
  renterContactEmail?: string;
  renterContactPhone?: string;
  deliveryAddress?: string;
  startDate: string;
  endDate: string;
  monthlyRate: number;
  depositAmount: number;
  notes?: string;
}

export interface ReturnRentalDepositPayload {
  returnDate?: string;
  deductionAmount?: number;
  deductionReason?: string;
}

export interface SaveBiomedicalMaintenancePayload {
  assetId: number;
  maintenanceType: MaintenanceType;
  maintenanceDate: string;
  performedBy?: string;
  technicianName?: string;
  cost?: number;
  certificateUrl?: string;
  findings?: string;
  actionsTaken?: string;
  nextScheduledDate?: string;
}

export type ThermalPackagingType =
  | "GEL_PACK_INSULATED"
  | "DRY_ICE"
  | "ACTIVE_REFRIGERATION_VEHICLE"
  | "PHASE_CHANGE_MATERIAL";

export type ThermalShipmentStatus =
  | "PREPARING"
  | "IN_TRANSIT"
  | "DELIVERED_COMPLIANT"
  | "DELIVERED_EXCURSION"
  | "REJECTED_THERMAL_EXCURSION";

export type ExcursionSeverity =
  | "MILD"
  | "MODERATE"
  | "CRITICAL";

export type ExcursionResolution =
  | "PENDING_REVIEW"
  | "APPROVED_BY_QA"
  | "QUARANTINED"
  | "DISCARDED_DESTROYED";

export interface ThermalShipment {
  id: number;
  organizationId: number;
  orderId?: number;
  sourceWarehouseId: number;
  sourceWarehouseName?: string;
  shipmentNumber: string;
  packagingType: ThermalPackagingType;
  targetMinTemp: number;
  targetMaxTemp: number;
  dataLoggerId?: string;
  carrierName?: string;
  trackingNumber?: string;
  status: ThermalShipmentStatus;
  currentTemperature?: number;
  isCurrentlyExcursion: boolean;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
}

export interface TemperatureLog {
  id: number;
  shipmentId?: number;
  warehouseId?: number;
  dataLoggerId?: string;
  recordedAt: string;
  temperatureCelsius: number;
  humidityPercentage?: number;
  batteryLevel?: number;
  isExcursion: boolean;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface ThermalExcursionEvent {
  id: number;
  organizationId: number;
  shipmentId?: number;
  warehouseId?: number;
  severity: ExcursionSeverity;
  startAt: string;
  endAt?: string;
  durationMinutes?: number;
  peakTemperature: number;
  resolution: ExcursionResolution;
  qaInspectorName?: string;
  qaNotes?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface SaveThermalShipmentPayload {
  orderId?: number;
  sourceWarehouseId: number;
  packagingType: ThermalPackagingType;
  targetMinTemp: number;
  targetMaxTemp: number;
  dataLoggerId?: string;
  carrierName?: string;
  trackingNumber?: string;
  notes?: string;
}

export interface RecordTemperatureTelemetryPayload {
  shipmentId?: number;
  warehouseId?: number;
  dataLoggerId?: string;
  recordedAt?: string;
  temperatureCelsius: number;
  humidityPercentage?: number;
  batteryLevel?: number;
  latitude?: number;
  longitude?: number;
}

export interface ResolveExcursionPayload {
  resolution: ExcursionResolution;
  qaInspectorName?: string;
  qaNotes?: string;
}





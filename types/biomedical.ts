export type EquipmentStatus = 'AVAILABLE' | 'ACTIVE' | 'OUT_OF_SERVICE' | 'IN_MAINTENANCE' | 'DECOMMISSIONED';
export type EquipmentRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type MaintenancePeriodicity = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY' | 'CUSTOM';

export interface BiomedicalEquipmentDTO {
    id: string;
    internalCode: string;
    name: string;
    categoryId: string;
    categoryName: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    status: EquipmentStatus;
    riskLevel: EquipmentRiskLevel;
    acquisitionDate: string;
    operationDate?: string;
    usefulLifeYears: number;
    purchasePrice: number;
    providerId: number;
    supplierId?: number;
    currentAreaId?: string;
    currentAreaName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface EquipmentCategoryDTO {
    id: string;
    name: string;
    description?: string;
    providerId: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type WorkOrderType = 'PREVENTIVE' | 'CORRECTIVE' | 'CALIBRATION';
export type WorkOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface WorkOrderRequest {
    type: WorkOrderType;
    priority: WorkOrderPriority;
    diagnostic?: string;
    scheduledDate?: string;
    assignedTo?: number;
}

export interface WorkOrderResponse {
    id: string;
    equipmentId: string;
    type: WorkOrderType;
    status: WorkOrderStatus;
    priority: WorkOrderPriority;
    diagnostic?: string;
    scheduledDate?: string;
    completedAt?: string;
    assignedTo?: number;
    createdAt: string;
    updatedAt: string;
}

export interface EquipmentDocumentDTO {
    id: string;
    equipmentId: string;
    documentType: string;
    fileUrl: string;
    fileName: string;
    uploadedAt?: string;
}

export interface MaintenanceScheduleDTO {
    id: string;
    equipmentId: string;
    frequencyDays: number;
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    isActive: boolean;
}

export interface WarrantyRequest {
    providerName: string;
    startDate: string;
    expirationDate: string;
    coverageDetails: string;
    contactInfo: string;
}

export interface WarrantyResponse {
    id: string;
    providerName: string;
    startDate: string;
    expirationDate: string;
    coverageDetails: string;
    contactInfo: string;
    isActive: boolean;
}

export interface MaintenanceScheduleRequest {
    periodicity: MaintenancePeriodicity;
    customDays?: number;
    nextMaintenanceDate: string;
}

export interface MaintenanceScheduleResponse {
    id: string;
    periodicity: MaintenancePeriodicity;
    customDays?: number;
    lastMaintenanceDate?: string;
    nextMaintenanceDate: string;
    isActive: boolean;
}

// RAG Types
export interface ChatRequest {
    question: string;
}

export interface ChatResponse {
    answer: string;
}

export interface DocumentProcessingStatus {
    status: 'STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    processedChunks: number;
    totalChunks: number;
    errorMessage?: string;
}

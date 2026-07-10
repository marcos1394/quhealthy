// types/biomedical.ts

export type EquipmentStatus = 'ACTIVE' | 'OUT_OF_SERVICE' | 'IN_MAINTENANCE' | 'DECOMMISSIONED';
export type EquipmentRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface BiomedicalEquipmentDTO {
    id: string;
    name: string;
    categoryName: string;
    categoryId?: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    internalCode?: string;
    acquisitionDate?: string;
    operationDate?: string; 
    status: EquipmentStatus;
    usefulLifeYears?: number;
    riskLevel?: EquipmentRiskLevel;
    purchasePrice?: number;
    supplierId?: number;
    currentAreaId?: number;
    currentAreaName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type WorkOrderType = 'PREVENTIVE' | 'CORRECTIVE' | 'CALIBRATION';
export type WorkOrderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface WorkOrderDTO {
    id: string;
    equipmentId: string;
    type: WorkOrderType;
    status: WorkOrderStatus;
    priority: WorkOrderPriority;
    description: string;
    scheduledDate?: string;
    completedDate?: string;
    assignedTo?: string;
    cost?: number;
    downtimeMinutes?: number;
    resolutionNotes?: string;
    createdAt?: string;
    updatedAt?: string;
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

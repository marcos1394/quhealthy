// types/biomedical.ts

export type EquipmentStatus = 'ACTIVE' | 'OUT_OF_SERVICE' | 'IN_MAINTENANCE' | 'DECOMMISSIONED';
export type EquipmentRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface BiomedicalEquipmentDTO {
    id: number;
    name: string;
    category: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    internalCode?: string;
    acquisitionDate?: string; // ISO Date
    operationalDate?: string; // ISO Date
    status: EquipmentStatus;
    riskLevel: EquipmentRiskLevel;
    lifespanYears?: number;
    supplierId?: number;
    createdAt?: string;
    updatedAt?: string;
}

export type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type WorkOrderType = 'PREVENTIVE' | 'CORRECTIVE' | 'CALIBRATION';
export type WorkOrderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface WorkOrderDTO {
    id: number;
    equipmentId: number;
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
    id: number;
    equipmentId: number;
    documentType: string;
    fileUrl: string;
    fileName: string;
    uploadedAt?: string;
}

export interface MaintenanceScheduleDTO {
    id: number;
    equipmentId: number;
    frequencyDays: number;
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    isActive: boolean;
}

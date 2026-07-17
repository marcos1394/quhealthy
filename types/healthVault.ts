// src/types/healthVault.ts

export type DocumentType = 'LAB_RESULT' | 'PRESCRIPTION' | 'IMAGING' | 'GENERAL' | 'NOTE';
export type AIStatus = 'PENDING' | 'PROCESSED' | 'FAILED' | 'UNSUPPORTED';

export interface AIExtractedData {
    summary?: string;
    medicalConditions?: string[];
    allergies?: string[];
    medications?: string[];
    keyMetrics?: Record<string, string>;
}

export interface VaultFolder {
    id: string;
    name: string;
    dependentId?: number;
    parentFolderId?: string;
    createdAt: string;
    updatedAt: string;
    displayOrder?: number;
}

export interface ConsumerDocument {
    id: string;
    dependentId?: number;
    folderId?: string;
    title?: string;
    noteContent?: string;
    fileName?: string;
    contentType?: string;
    fileSizeBytes?: number;
    documentType: DocumentType;
    uploadedAt: string;
    displayOrder?: number;
    aiStatus: AIStatus;
    aiExtractedData?: AIExtractedData; // El JSON mágico que viene de Gemini
}

export interface PanoramaResponseDto {
    id?: string;
    clinicalSummary: string;
    careRecommendations: string[];
    createdAt?: string;
}
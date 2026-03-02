// src/types/healthVault.ts

export type DocumentType = 'LAB_RESULT' | 'PRESCRIPTION' | 'IMAGING' | 'GENERAL';
export type AIStatus = 'PENDING' | 'PROCESSED' | 'FAILED' | 'UNSUPPORTED';

export interface AIExtractedData {
    summary?: string;
    medicalConditions?: string[];
    allergies?: string[];
    medications?: string[];
    keyMetrics?: Record<string, string>;
}

export interface ConsumerDocument {
    id: string;
    fileName: string;
    contentType: string;
    fileSizeBytes: number;
    documentType: DocumentType;
    uploadedAt: string;
    aiStatus: AIStatus;
    aiExtractedData?: AIExtractedData; // El JSON mágico que viene de Gemini
}
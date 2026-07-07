export enum EvaluationResult {
    APT = 'APT',
    APT_WITH_RESTRICTIONS = 'APT_WITH_RESTRICTIONS',
    TEMPORARILY_UNFIT = 'TEMPORARILY_UNFIT',
    UNFIT = 'UNFIT'
}

export enum InjuryType {
    SPRAIN = 'SPRAIN',
    STRAIN = 'STRAIN',
    FRACTURE = 'FRACTURE',
    DISLOCATION = 'DISLOCATION',
    TENDINITIS = 'TENDINITIS',
    MUSCLE_INJURY = 'MUSCLE_INJURY',
    LIGAMENT_INJURY = 'LIGAMENT_INJURY',
    OTHER = 'OTHER',
    NOT_APPLICABLE = 'NOT_APPLICABLE'
}

export enum AnatomicalZone {
    HEAD = 'HEAD',
    NECK = 'NECK',
    SHOULDER = 'SHOULDER',
    ARM = 'ARM',
    ELBOW = 'ELBOW',
    FOREARM = 'FOREARM',
    WRIST = 'WRIST',
    HAND = 'HAND',
    CHEST = 'CHEST',
    BACK = 'BACK',
    HIP = 'HIP',
    THIGH = 'THIGH',
    KNEE = 'KNEE',
    LEG = 'LEG',
    ANKLE = 'ANKLE',
    FOOT = 'FOOT',
    OTHER = 'OTHER',
    NOT_APPLICABLE = 'NOT_APPLICABLE'
}

export enum Laterality {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
    BILATERAL = 'BILATERAL',
    NOT_APPLICABLE = 'NOT_APPLICABLE'
}

export interface SportsMedicalEvaluationRequest {
    consumerId: number;
    appointmentId?: number;
    
    evaluationResult?: EvaluationResult;
    
    icd10Code?: string;
    icd10Description?: string;
    diagnosisObservations?: string;
    
    injuryType?: InjuryType;
    anatomicalZone?: AnatomicalZone;
    laterality?: Laterality;
    clinicalDescription?: string;
    
    generalRecommendations?: string;
    activityRestrictions?: string;
    treatmentPlan?: string;
    rehabNeeded?: boolean;
    additionalObservations?: string;
    
    estimatedReturnDate?: string; // YYYY-MM-DD
    
    status?: 'DRAFT' | 'FINAL';
}

export interface SportsMedicalEvaluationResponse {
    id: number;
    consumerId: number;
    providerId: number;
    appointmentId?: number;
    
    evaluationResult?: EvaluationResult;
    
    icd10Code?: string;
    icd10Description?: string;
    diagnosisObservations?: string;
    
    injuryType?: InjuryType;
    anatomicalZone?: AnatomicalZone;
    laterality?: Laterality;
    clinicalDescription?: string;
    
    generalRecommendations?: string;
    activityRestrictions?: string;
    treatmentPlan?: string;
    rehabNeeded?: boolean;
    additionalObservations?: string;
    
    estimatedReturnDate?: string; // YYYY-MM-DD
    
    status: 'DRAFT' | 'FINAL';
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
}

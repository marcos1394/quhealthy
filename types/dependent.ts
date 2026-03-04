// src/types/dependent.ts
export interface Dependent {
    id: number;
    consumerId: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // YYYY-MM-DD
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    relationship: 'CHILD' | 'PARENT' | 'SPOUSE' | 'SIBLING' | 'OTHER';
    medicalNotes?: string;
    createdAt: string;
}

export interface DependentRequest {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER' | string;
    relationship: 'CHILD' | 'PARENT' | 'SPOUSE' | 'SIBLING' | 'OTHER' | string;
    medicalNotes?: string;
}
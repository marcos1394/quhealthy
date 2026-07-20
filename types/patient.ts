export interface ConsumerInfo {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profileImageUrl: string | null;
  // --- NOM-024 ---
  nom024CompliancePercentage?: number;
  curp?: string;
  ethnicGroup?: string;
  healthInsurance?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
}

export interface PatientClient {
  id: number; // consumerId o patientDirectoryId
  totalAppointments: number;
  lastAppointmentDate: string;
  status: 'active' | 'inactive';
  consumer: ConsumerInfo;
}

export interface PatientRegistrationPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate: string; // YYYY-MM-DD
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  preferredNotificationMethod?: string;
  // --- NOM-024 ---
  curp?: string;
  ethnicGroup?: string;
  healthInsurance?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
}

export interface PatientUpdatePayload {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  email?: string;
  phone?: string;
  // --- NOM-024 ---
  curp?: string;
  ethnicGroup?: string;
  healthInsurance?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
}

export interface PatientDirectorySearchResult {
  id: number;
  providerId: number;
  consumerId: number | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  createdAt: string;
  platformUser: boolean;
  // --- NOM-024 ---
  curp?: string;
  ethnicGroup?: string;
  healthInsurance?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
}

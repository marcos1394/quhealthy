export interface ConsumerInfo {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profileImageUrl: string | null;
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
  birthDate?: string; // YYYY-MM-DD
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface PatientUpdatePayload {
  email?: string;
  phone?: string;
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
}

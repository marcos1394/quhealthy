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
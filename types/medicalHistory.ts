
export interface DocumentLiteDto {
  documentId: number;
  fileName: string;
  fileKey: string;
  documentType: string;
  uploadedAt: string;
}

export interface ConsultationTimelineDto {
  appointmentId: number;
  date: string;
  doctorName: string;
  serviceName: string;
  publicNotes?: string;
  prescriptions: DocumentLiteDto[];
}

export interface MedicalHistoryResponse {
  consumerId: number | null;
  totalConsultations: number;
  timeline: ConsultationTimelineDto[];
}

// Perfil básico del directorio local
export interface PatientDirectoryProfile {
  id: number;
  consumerId: number | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  gender: string | null;
  isPlatformUser: boolean;
  createdAt: string;
}
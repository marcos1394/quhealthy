export type PatientBudgetStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CONVERTED_TO_ORDER";

export type PatientBudgetItemType =
  | "SURGEON_FEE"
  | "ANESTHESIOLOGIST_FEE"
  | "ASSISTANT_FEE"
  | "OR_ROOM"
  | "HOSPITAL_STAY"
  | "SUPPLY"
  | "MEDICATION"
  | "LAB"
  | "STUDY"
  | "OTHER";

export interface PatientBudgetItemDTO {
  id?: number;
  itemType: PatientBudgetItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  notes?: string;
}

export interface PatientClinicalBudgetDTO {
  id: number;
  providerId: number;
  patientId?: number;
  folio: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  diagnosisCie10?: string;
  procedureName: string;
  clinicalNotes?: string;
  doctorName?: string;
  doctorLicense?: string;
  doctorSpecialty?: string;
  doctorPhone?: string;
  doctorEmail?: string;
  termsAndConditions?: string;
  validUntil: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: PatientBudgetStatus;
  patientSignatureUrl?: string;
  acceptedAt?: string;
  rejectedReason?: string;
  items: PatientBudgetItemDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientBudgetDTO {
  patientId?: number;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  diagnosisCie10?: string;
  procedureName: string;
  clinicalNotes?: string;
  doctorName?: string;
  doctorLicense?: string;
  doctorSpecialty?: string;
  doctorPhone?: string;
  doctorEmail?: string;
  termsAndConditions?: string;
  validUntil: string;
  discountAmount?: number;
  taxAmount?: number;
  items: PatientBudgetItemDTO[];
}

export interface AcceptPatientBudgetDTO {
  signatureBase64OrUrl: string;
  notes?: string;
}

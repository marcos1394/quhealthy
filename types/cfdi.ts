// types/cfdi.ts
import { PosItem } from './pos';

export interface FiscalProfile {
  providerId: number;
  rfc?: string;
  legalName?: string;
  fiscalRegime?: string;
  zipCode?: string;
  invoiceSeries?: string;
  csdCertificateNumber?: string;
  csdExpirationDate?: string;
  isCsdConfigured: boolean;
  fiscalStatus: 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'APPROVED' | 'REJECTED';
}

export interface UploadCsdPayload {
  rfc: string;
  legalName: string;
  fiscalRegime: string;
  zipCode: string;
  invoiceSeries?: string;
  certificateBase64: string;
  privateKeyBase64: string;
  privateKeyPassword: string;
}

export interface SelfServiceInvoicePayload {
  ticketFolio: string;
  invoiceToken: string;
  patientRfc: string;
  patientName: string;
  patientRegime: string;
  patientZipCode: string;
  cfdiUsage: string;
  patientEmail?: string;
}

export interface DirectInvoicePayload {
  patientRfc: string;
  patientName: string;
  patientRegime: string;
  patientZipCode: string;
  cfdiUsage: string;
  paymentMethod: 'PUE' | 'PPD';
  paymentForm: string; // 01, 03, 04, 99
  items: PosItem[];
  totalAmount: number;
  patientEmail?: string;
  notes?: string;
}

export interface CancelCfdiPayload {
  cancellationReason: '01' | '02' | '03' | '04';
  replacementUuid?: string;
}

export interface CfdiRecordResponse {
  id: number;
  providerId: number;
  appointmentId?: number;
  posReceiptId?: number;
  uuidSat: string;
  cfdiType: string;
  paymentMethod: string;
  paymentForm: string;
  patientRfc: string;
  patientName: string;
  patientRegime: string;
  patientZipCode: string;
  cfdiUsage: string;
  totalAmount: number;
  status: 'PENDING' | 'GENERATED' | 'CANCELED' | 'ERROR';
  xmlUrl?: string;
  pdfUrl?: string;
  cancellationReason?: string;
  replacementUuid?: string;
  isGlobalInvoice?: boolean;
  errorMessage?: string;
  createdAt: string;
}

export const SAT_REGIMES = [
  { code: '605', name: '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { code: '606', name: '606 - Arrendamiento' },
  { code: '612', name: '612 - Personas Físicas con Actividades Empresariales y Profesionales' },
  { code: '616', name: '616 - Sin obligaciones fiscales' },
  { code: '621', name: '621 - Incorporación Fiscal' },
  { code: '625', name: '625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas' },
  { code: '626', name: '626 - Régimen Simplificado de Confianza (RESICO)' },
  { code: '601', name: '601 - General de Ley Personas Morales' },
  { code: '603', name: '603 - Personas Morales con Fines no Lucrativos' },
];

export const SAT_CFDI_USES = [
  { code: 'D01', name: 'D01 - Honorarios médicos, dentales y gastos hospitalarios (Deducción Personal)', recommended: true },
  { code: 'D02', name: 'D02 - Gastos médicos por incapacidad o discapacidad (Deducción Personal)', recommended: true },
  { code: 'G03', name: 'G03 - Gastos en general' },
  { code: 'G01', name: 'G01 - Adquisición de mercancías' },
  { code: 'S01', name: 'S01 - Sin efectos fiscales' },
  { code: 'CP01', name: 'CP01 - Pagos' },
];

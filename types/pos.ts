// types/pos.ts

export type PaymentMethodType =
  | 'CASH'
  | 'CARD_TERMINAL'
  | 'STRIPE'
  | 'SPEI_TRANSFER'
  | 'MERCADO_PAGO'
  | 'CODI'
  | 'VOUCHER';

export type PosReceiptStatus =
  | 'PENDING_INVOICE'
  | 'INVOICED'
  | 'PUBLIC_GLOBAL'
  | 'CANCELLED';

export interface PaymentSplit {
  method: PaymentMethodType;
  amount: number;
  reference?: string;
  denominations?: Record<string, number>;
}

export interface PosItem {
  catalogItemId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  itemType?: 'SERVICE' | 'PROCEDURE' | 'MEDICATION' | 'SUPPLY' | 'PACKAGE';
  isTaxExempt?: boolean;
  notes?: string;
}

export interface PosCheckoutRequest {
  appointmentId?: number;
  orderId?: number;
  patientClinicalBudgetId?: number;
  locationId?: number | null;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  patientRfc?: string;
  items: PosItem[];
  payments: PaymentSplit[];
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  amountReceived?: number;
  changeAmount?: number;
  changeDenominations?: Record<string, number>;
  notes?: string;
}

export interface PosReceipt {
  id: number;
  providerId: number;
  doctorName?: string;
  doctorLicense?: string;
  doctorSpecialty?: string;
  doctorAddress?: string;
  doctorPhone?: string;
  doctorEmail?: string;
  doctorLogoUrl?: string;
  staffUserId?: number;
  staffName?: string;
  locationId?: number | null;
  cashRegisterId?: number | null;
  folio: string;
  invoiceToken: string;
  invoiceQrUrl: string;
  receiptStatus: PosReceiptStatus;
  appointmentId?: number;
  orderId?: number;
  patientClinicalBudgetId?: number;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  patientRfc?: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountReceived?: number;
  changeAmount?: number;
  items: PosItem[];
  payments: PaymentSplit[];
  journalEntryId?: number;
  cfdiUuid?: string;
  notes?: string;
  createdAt: string;
}

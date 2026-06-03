// types/cash-register.ts

export type CashRegisterStatus = 'OPEN' | 'CLOSED';
export type CashTransactionType = 'INCOME' | 'EXPENSE';
export type CashReferenceType = 'APPOINTMENT' | 'PRODUCT_SALE' | 'MANUAL_INCOME' | 'MANUAL_EXPENSE' | 'INITIAL_BALANCE';

export interface CashRegister {
  id: number;
  providerId: number;
  locationId: number | null;
  status: CashRegisterStatus;
  openedAt: string;
  closedAt: string | null;
  initialBalance: number;
  expectedClosingBalance: number | null;
  actualClosingBalance: number | null;
  balanceDifference: number | null;
  closingNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CashTransaction {
  id: number;
  transactionType: CashTransactionType;
  referenceType: CashReferenceType;
  referenceId: number | null;
  amount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashRegisterReportDto {
  register: CashRegister;
  transactions: CashTransaction[];
}

export interface OpenRegisterRequest {
  locationId: number | null;
  initialBalance: number;
}

export interface CloseRegisterRequest {
  actualClosingBalance: number;
  closingNotes?: string;
}

import { ReactNode } from 'react';

export type BillingCycle = "monthly" | "yearly";

export interface PlanFeature {
  title: string;
  description: string;
  icon: ReactNode;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: "mes" | "año";
  maxAppointments?: number | "Ilimitados";
  maxServices?: number | "Ilimitados";
  marketingLevel: number;
  supportLevel: number;
  qumarketAccess: boolean;
  qublocksAccess: boolean;
  userManagement: number;
  advancedReports: boolean;
  transactionFee: number;
  maxProducts?: number | "Ilimitados";
  maxCourses?: number | "Ilimitados";
  annualDiscount?: number;
  allowAdvancePayments: boolean;
  defaultAdvancePaymentPercentage?: number;
  popular: boolean;
  features: PlanFeature[];
}
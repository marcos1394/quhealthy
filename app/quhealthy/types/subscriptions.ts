import { ReactNode } from 'react';

export type UserRole = "paciente" | "proveedor";
export type BillingCycle = "monthly" | "yearly";

export interface PlanFeature {
  title: string;
  description: string;
  icon: ReactNode;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: "mes" | "año";
  features: PlanFeature[];
  target: "consumers" | "providers";
  category?: "basic" | "premium" | "enterprise" | "market";
  popular?: boolean;
  savings?: number;
  maxClients?: number | "Ilimitados";
  maxAppointments?: number | "Ilimitados";
  maxProducts?: number | "Ilimitados";
}
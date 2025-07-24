import { ReactNode } from 'react';

export type PaymentMethodId = "stripe" | "mercadopago";

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  description: string;
  logo: ReactNode;
  icon: ReactNode;
  features: string[];
  badge?: string;
}
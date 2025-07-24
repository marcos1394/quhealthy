// src/types/landing.ts
import { ReactNode } from 'react';

export type UserType = 'consumer' | 'provider';
export type BillingCycle = 'monthly' | 'yearly';

export interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  isPopular?: boolean;
  features: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}
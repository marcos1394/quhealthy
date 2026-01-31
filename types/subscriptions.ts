import React from 'react';

// Roles de usuario
export type UserRole = "PROVIDER" | "CONSUMER";

// Ciclos de facturación
export type BillingCycle = 'monthly' | 'yearly';

// Estructura de una característica del plan
export interface PlanFeature {
    title: string;
    description?: string;
    icon?: React.ReactNode; 
}

// Estructura del Plan
export interface Plan {
    id: string | number;
    name: string;
    description: string;
    price: number;
    currency?: string; // Opcional, por defecto suele ser MXN/USD
    duration: string;  // 'monthly' o 'yearly'
    interval?: 'month' | 'year'; // Para compatibilidad con algunos APIs de Stripe
    features: PlanFeature[];
    savings?: number;  // Monto ahorrado (para planes anuales)
    isPopular?: boolean; // Para destacar una tarjeta
}
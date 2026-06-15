import React from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';

export interface BackendPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  billingInterval: "MONTHLY" | "YEARLY";
  currency: string;
  stripePriceId: string;
}

export const buildFeaturesForPlan = (planName: string, isYearly: boolean) => {
  const nameLower = planName.toLowerCase();
  
  if (nameLower.includes("gratis") || nameLower.includes("gratuito")) {
    return [
      { title: "$0 Mensualidad fija" },
      { title: "Gestión básica de Citas y Pacientes" },
      { title: "15% de comisión por cobros en app" }
    ];
  }
  if (nameLower.includes("básico") || nameLower.includes("basic")) {
    return [
      { title: "Hasta 50 Citas al mes" },
      { title: "Catálogo: 5 Servicios / 10 Productos" },
      { title: "15% Comisión + $10 MXN por reserva" }
    ];
  }
  if (nameLower.includes("estándar") || nameLower.includes("standard")) {
    return [
      { title: "Hasta 150 Citas al mes", highlighted: true },
      { title: "Catálogo: 15 Servicios / 30 Productos" },
      { title: "12% Comisión + $8 MXN por reserva" },
      { title: "Acceso a ventas en QUMarket" }
    ];
  }
  if (nameLower.includes("premium")) {
    return [
      { title: "Hasta 500 Citas al mes", icon: <Zap className="w-4 h-4 text-amber-500" />, highlighted: true },
      { title: "Catálogo: 50 Servicios / 100 Productos" },
      { title: "10% Comisión + $5 MXN por reserva" },
      { title: "Reportes Avanzados e IA (QUBlocks)" }
    ];
  }
  if (nameLower.includes("empresarial") || nameLower.includes("enterprise")) {
    return [
      { title: "Citas y Catálogo Ilimitados", icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, highlighted: true },
      { title: "Gestión Multi-usuario (Clínicas)" },
      { title: "Comisión VIP: 5% + $0 MXN por reserva" },
      { title: "Marketing y Soporte Nivel 4 (VIP)" }
    ];
  }
  
  // Por defecto fallback a profesional/estándar
  return [
    { title: "Gestión de agenda médica" },
    { title: "Catálogo de servicios" },
    { title: "Soporte técnico" }
  ];
};

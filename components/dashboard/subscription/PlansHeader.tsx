"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Tipos (puedes moverlos a un archivo types.ts si prefieres)
export type UserRole = "paciente" | "proveedor";
export type BillingCycle = "monthly" | "yearly";

interface PlansHeaderProps {
  role: UserRole;
  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;
}

export const PlansHeader: React.FC<PlansHeaderProps> = ({ role, billingCycle, setBillingCycle }) => (
  <div className="text-center mb-12 space-y-4">
    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
      {role === "paciente" 
        ? "Tu bienestar, al siguiente nivel" 
        : "Escala tu práctica médica"}
    </h1>
    <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
      {role === "paciente"
        ? "Accede a descuentos exclusivos y funcionalidades premium para cuidar tu salud."
        : "Herramientas profesionales diseñadas para gestionar más pacientes y aumentar tus ingresos."}
    </p>
    
    <div className="inline-flex items-center p-1 bg-gray-900 border border-gray-800 rounded-xl mt-8 shadow-sm">
      <Button
        variant="ghost"
        onClick={() => setBillingCycle("monthly")}
        className={`rounded-lg px-6 transition-all ${
            billingCycle === "monthly" 
            ? "bg-gray-800 text-white shadow-md border border-gray-700" 
            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
        }`}
      >
        Mensual
      </Button>
      <Button
        variant="ghost"
        onClick={() => setBillingCycle("yearly")}
        className={`rounded-lg px-6 transition-all ${
            billingCycle === "yearly" 
            ? "bg-gray-800 text-white shadow-md border border-gray-700" 
            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
        }`}
      >
        Anual
        <Badge className="ml-2 bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px] px-1.5 py-0.5">-20%</Badge>
      </Button>
    </div>
  </div>
);
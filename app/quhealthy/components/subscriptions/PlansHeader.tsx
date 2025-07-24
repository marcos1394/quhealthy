"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BillingCycle, UserRole } from '@/app/quhealthy/types/subscriptions';

interface PlansHeaderProps {
  role: UserRole;
  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;
}

export const PlansHeader: React.FC<PlansHeaderProps> = ({ role, billingCycle, setBillingCycle }) => (
  <div className="text-center mb-12">
    <h1 className="text-4xl font-bold text-white mb-4">
      {role === "paciente" 
        ? "Planes diseñados para tu bienestar" 
        : "Haz crecer tu negocio con QuHealthy"}
    </h1>
    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
      {role === "paciente"
        ? "Selecciona el plan perfecto para tu journey de salud y belleza"
        : "Impulsa tu negocio con nuestras herramientas profesionales"}
    </p>
    
    <div className="flex justify-center mt-8">
      <div className="bg-gray-800 p-1 rounded-lg">
        <Button
          variant={billingCycle === "monthly" ? "default" : "ghost"}
          onClick={() => setBillingCycle("monthly")}
          className="mr-2"
        >
          Mensual
        </Button>
        <Button
          variant={billingCycle === "yearly" ? "default" : "ghost"}
          onClick={() => setBillingCycle("yearly")}
        >
          Anual
          <Badge className="ml-2 bg-teal-500/20 text-teal-400">-20%</Badge>
        </Button>
      </div>
    </div>
  </div>
);
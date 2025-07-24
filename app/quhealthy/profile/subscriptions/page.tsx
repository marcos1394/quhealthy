"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Star, Crown, Calendar, Video, Users, Sparkles, Shield, Gift, Zap, HeartPulse, ShoppingCart, Briefcase, Layout, Share2 } from "lucide-react";

// Importa los tipos y los nuevos componentes
import { Plan, UserRole, BillingCycle } from '@/app/quhealthy/types/subscriptions';
import { PlansHeader } from '@/app/quhealthy/components/subscriptions/PlansHeader';
import { PricingCard } from '@/app/quhealthy/components/subscriptions/PricingCard';
import { ConfirmationModal } from '@/app/quhealthy/components/subscriptions/ConfirmationModal';

// Los datos de los planes pueden vivir aquí o venir de una API
const getPlansData = (billingCycle: BillingCycle): Plan[] => [
    // ... (Tu array de planes completo aquí, como lo tenías antes)
];

export default function SubscriptionsPage() {
  const [role, setRole] = useState<UserRole>("proveedor"); // Simulado
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const plansData = useMemo(() => getPlansData(billingCycle), [billingCycle]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPlans(plansData);
      setLoading(false);
    }, 500);
  }, [plansData]);

  const filteredPlans = useMemo(() => {
    const target = role === "paciente" ? "consumers" : "providers";
    return plans.filter(plan => plan.target === target);
  }, [plans, role]);
  
  const handlePayment = () => {
      console.log('Procesando pago para el plan:', selectedPlan?.name);
      // Aquí iría la lógica para redirigir a la página de pago de Stripe/MercadoPago
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Progress value={50} /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <PlansHeader role={role} billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <AnimatePresence>
            {filteredPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                onSelect={setSelectedPlan}
                isPopular={plan.popular || false}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmationModal 
        plan={selectedPlan}
        onConfirm={handlePayment}
        onCancel={() => setSelectedPlan(null)}
      />
    </div>
  );
}
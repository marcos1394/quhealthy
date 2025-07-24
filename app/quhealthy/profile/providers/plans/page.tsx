"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar, Video, Users, Sparkles, Shield, CreditCard, Coins, Layout, ShoppingCart, Briefcase, PieChart, Loader2 } from "lucide-react";

// Importa los tipos y los nuevos componentes
import { Plan, BillingCycle } from '@/app/quhealthy/types/plans';
import { PlansHeader } from '@/app/quhealthy/components/plans/PlansHeader';
import { PricingCard } from '@/app/quhealthy/components/plans/PricingCard';

const getPlansData = (billingCycle: BillingCycle): Plan[] => [
    // ... (Tu array de planes completo aquí, como lo tenías antes)
    // Ejemplo de un plan para claridad:
    {
      id: 1, name: "Básico", description: "Ideal para profesionales independientes iniciando.",
      price: billingCycle === "monthly" ? 450 : Math.round(450 * 12 * 0.8),
      duration: billingCycle === "monthly" ? "mes" : "año",
      maxAppointments: 100, maxServices: 5, marketingLevel: 1, supportLevel: 1,
      qumarketAccess: false, qublocksAccess: false, userManagement: 0, advancedReports: false,
      transactionFee: 8.0, popular: false, maxProducts: 10, maxCourses: 5,
      annualDiscount: 20, allowAdvancePayments: false, defaultAdvancePaymentPercentage: undefined,
      features: [
          { title: "Citas", description: "", icon: <Calendar className="w-4 h-4" /> },
          { title: "Servicios", description: "", icon: <ShoppingCart className="w-4 h-4" /> },
          { title: "Productos", description: "", icon: <Briefcase className="w-4 h-4" /> },
          { title: "Cursos", description: "", icon: <Video className="w-4 h-4" /> },
          { title: "Marketing", description: "", icon: <Sparkles className="w-4 h-4" /> },
          { title: "Soporte", description: "", icon: <Shield className="w-4 h-4" /> },
          { title: "Comisión", description: "", icon: <Coins className="w-4 h-4" /> },
      ],
    },
    // ... (Los otros 3 planes aquí)
];

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const providerPlansData = useMemo(() => getPlansData(billingCycle), [billingCycle]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      try {
        setPlans(providerPlansData);
      } catch (err) {
        setError("Hubo un error al cargar los planes.");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [providerPlansData]);

  if (loading) return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><Loader2 className="w-16 h-16 text-purple-500 animate-spin" /></div>;
  if (error) return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><Alert variant="destructive"><AlertCircle /><AlertDescription>{error}</AlertDescription></Alert></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-900 text-white p-4 md:p-8">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 opacity-[0.12] blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 opacity-[0.12] blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <PlansHeader billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id + billingCycle}
              plan={plan}
              isPopular={plan.popular}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
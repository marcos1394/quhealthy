"use client";

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import { ShieldCheck, CreditCard, CheckCircle2, Zap } from 'lucide-react';
import axios from 'axios';

// Componentes Modulares (Asegúrate de importar desde donde los guardaste)
import { PlansHeader } from '@/components/dashboard/subscription/PlansHeader';
import { PricingCard } from '@/components/dashboard/subscription/PricingCard';
import { ConfirmationModal } from '@/components/dashboard/subscription/ConfirmationModal';

// Tipos
import { Plan, BillingCycle, UserRole } from '@/types/subscriptions';

// Configuración de Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// --- MOCK DATA (Estructura adaptada para el toggle) ---
// En producción, esto vendría de tu API /api/plans
const PLANS_DATA: Record<UserRole, Record<BillingCycle, Plan[]>> = {
  proveedor: {
    monthly: [
      {
        id: "price_basic_mo", // ID real de Stripe
        name: "Básico",
        description: "Lo esencial para empezar.",
        price: 299,
        duration: "monthly",
        features: [
            { title: "Agenda de Citas" },
            { title: "Hasta 50 Pacientes" },
            { title: "Soporte Básico" }
        ]
      },
      {
        id: "price_pro_mo",
        name: "Profesional",
        description: "Para escalar tu consultorio.",
        price: 599,
        duration: "monthly",
        features: [
            { title: "Pacientes Ilimitados", icon: <Zap className="w-3 h-3 text-yellow-400"/> },
            { title: "Recordatorios WhatsApp" },
            { title: "Facturación Electrónica" }
        ],
        isPopular: true
      },
      {
        id: "price_biz_mo",
        name: "Empresarial",
        description: "Poder total para clínicas.",
        price: 1299,
        duration: "monthly",
        features: [
            { title: "Múltiples Doctores (5)" },
            { title: "Analíticas Avanzadas" },
            { title: "Gerente de Cuenta" }
        ]
      }
    ],
    yearly: [
        {
            id: "price_basic_yr",
            name: "Básico Anual",
            description: "Lo esencial para empezar.",
            price: 2990,
            duration: "yearly",
            savings: 598, // Ahorro calculado
            features: [{ title: "Agenda" }, { title: "50 Pacientes" }, { title: "Soporte" }]
        },
        {
            id: "price_pro_yr",
            name: "Profesional Anual",
            description: "Para escalar tu consultorio.",
            price: 5990,
            duration: "yearly",
            savings: 1198,
            features: [{ title: "Ilimitado" }, { title: "WhatsApp" }, { title: "Facturación" }],
            isPopular: true
        },
        {
            id: "price_biz_yr",
            name: "Empresarial Anual",
            description: "Poder total para clínicas.",
            price: 12990,
            duration: "yearly",
            savings: 2598,
            features: [{ title: "5 Doctores" }, { title: "Analíticas" }, { title: "Gerente VIP" }]
        }
    ]
  },
  // Configuración vacía para paciente por ahora, o similar si cobras membresía
  paciente: { monthly: [], yearly: [] }
};

export default function BillingPage() {
  // Estado
  const role: UserRole = "proveedor"; // Esto debería venir de tu useSessionStore
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Efecto para cargar planes (simulado o desde API)
  useEffect(() => {
    setIsLoading(true);
    // Aquí podrías usar useSWR si prefieres, pero para el toggle es fácil así:
    setTimeout(() => {
        setPlans(PLANS_DATA[role][billingCycle] || []);
        setIsLoading(false);
    }, 500);
  }, [billingCycle, role]);

  // Manejo del pago (Lógica original de tu BillingPage integrada aquí)
  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);

    try {
      // 1. Llamada a tu backend
      const { data } = await axios.post('/api/payments/stripe/create-checkout-session', 
        { planId: selectedPlan.id }, 
        { withCredentials: true }
      );
      
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe no cargó correctamente.");

      // 2. Redirección
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) toast.error(error.message);

    } catch (err) {
      console.error(err);
      // Fallback para demo si no hay backend
      toast.success(`(Demo) Redirigiendo a pago de ${selectedPlan.name}...`);
      setTimeout(() => setSelectedPlan(null), 2000); 
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. Header con Toggle (Componente Nuevo) */}
        <PlansHeader 
            role={role} 
            billingCycle={billingCycle} 
            setBillingCycle={setBillingCycle} 
        />

        {/* 2. Grid de Planes (Usando PricingCard) */}
        {isLoading ? (
            <div className="flex justify-center py-20 text-purple-500">Cargando planes...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan) => (
                    <PricingCard 
                        key={plan.id}
                        plan={plan}
                        onSelect={setSelectedPlan}
                        isPopular={plan.isPopular}
                    />
                ))}
            </div>
        )}

        {/* 3. Badges de Confianza (Estética) */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Pagos Seguros SSL</span>
            </div>
            <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <span>Aceptamos Tarjetas</span>
            </div>
            <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-500" />
                <span>Cancela cuando quieras</span>
            </div>
        </div>

        {/* 4. Modal de Confirmación (Componente Nuevo) */}
        <ConfirmationModal 
            plan={selectedPlan}
            isOpen={!!selectedPlan}
            onConfirm={handleCheckout}
            onCancel={() => setSelectedPlan(null)}
            isLoading={isProcessing}
        />

      </div>
    </div>
  );
}
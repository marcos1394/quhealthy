"use client";

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import { ShieldCheck, CreditCard, CheckCircle2, Zap } from 'lucide-react';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

// Componentes Modulares
import { PlansHeader } from '@/components/dashboard/subscription/PlansHeader';
import { PricingCard, Plan } from '@/components/dashboard/subscription/PricingCard';
import { ConfirmationModal } from '@/components/dashboard/subscription/ConfirmationModal';

// Tipos adicionales locales para la data
export type UserRole = "paciente" | "proveedor";
export type BillingCycle = "monthly" | "yearly";

// Configuración de Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// --- MOCK DATA ---
// En producción, esto vendría de tu API /api/plans
const PLANS_DATA: Record<UserRole, Record<BillingCycle, Plan[]>> = {
  proveedor: {
    monthly: [
      {
        id: "price_basic_mo",
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
          { title: "Pacientes Ilimitados", icon: <Zap className="w-4 h-4 text-amber-500" />, highlighted: true },
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
        savings: 598,
        features: [{ title: "Agenda" }, { title: "50 Pacientes" }, { title: "Soporte" }]
      },
      {
        id: "price_pro_yr",
        name: "Profesional Anual",
        description: "Para escalar tu consultorio.",
        price: 5990,
        duration: "yearly",
        savings: 1198,
        features: [
          { title: "Pacientes Ilimitados", icon: <Zap className="w-4 h-4 text-amber-500" />, highlighted: true },
          { title: "WhatsApp" },
          { title: "Facturación" }
        ],
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
  paciente: { monthly: [], yearly: [] }
};

export default function BillingPage() {
  const t = useTranslations('SettingsSubscription');
  const role: UserRole = "proveedor"; // Esto debería venir de tu useSessionStore o similar
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Efecto para cargar planes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setPlans(PLANS_DATA[role][billingCycle] || []);
      setIsLoading(false);
    }, 400); // Simulando carga

    return () => clearTimeout(timer);
  }, [billingCycle, role]);

  // Manejo del pago
  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    toast.info(t('toast_processing'));

    try {
      const { data } = await axios.post('/api/payments/stripe/create-checkout-session',
        { planId: selectedPlan.id },
        { withCredentials: true }
      );

      const stripe = await stripePromise;
      if (!stripe) throw new Error(t('error_stripe'));

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) toast.error(error.message);

    } catch (err: any) {
      console.error(err);
      toast.success(t('toast_demo', { planName: selectedPlan.name }));
      setTimeout(() => setSelectedPlan(null), 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-12 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto space-y-12">

        {/* Header con Toggle */}
        <PlansHeader
          role={role}
          billingCycle={billingCycle}
          setBillingCycle={(cycle) => setBillingCycle(cycle as BillingCycle)}
        />

        {/* Grid de Planes */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">{t('loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {plans.map((plan, index) => (
              <div key={plan.id} className="h-full">
                <PricingCard
                  plan={plan}
                  onSelect={setSelectedPlan}
                  isPopular={plan.isPopular}
                  index={index}
                />
              </div>
            ))}
          </div>
        )}

        {/* Badges de Confianza */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-16 pb-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide"
        >
          <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>{t('secure_payments')}</span>
          </div>
          <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <span>{t('accept_cards')}</span>
          </div>
          <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-medical-500" />
            <span>{t('cancel_anytime')}</span>
          </div>
        </motion.div>

        {/* Modal de Confirmación */}
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
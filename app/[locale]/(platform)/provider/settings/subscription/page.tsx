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
import { handleApiError } from '@/lib/handleApiError';

// Tipos adicionales locales para la data
export type UserRole = "paciente" | "proveedor";
export type BillingCycle = "monthly" | "yearly";

// Tipado del Plan desde Backend (Java)
interface BackendPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  interval: "MONTH" | "YEAR";
  currency: string;
  stripePriceId: string;
}

// Configuración de Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function BillingPage() {
  const t = useTranslations('SettingsSubscription');
  const role: UserRole = "proveedor"; 
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawPlans, setRawPlans] = useState<BackendPlan[]>([]);
  const [displayPlans, setDisplayPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mapear features visuales según el nombre del plan para mantener i18n
  const buildFeaturesForPlan = (planName: string, isYearly: boolean) => {
    const nameLower = planName.toLowerCase();
    
    if (nameLower.includes("gratis") || nameLower.includes("gratuito")) {
      return [
        { title: "Perfil Médico Base" },
        { title: "Sin Comisiones Mensuales" },
        { title: "15% Cargo Extra por Transacción" }
      ];
    }
    if (nameLower.includes("básico") || nameLower.includes("basic")) {
      return [
        { title: "50 Citas Mensuales" },
        { title: "Catálogo Básico (5 Servicios / 10 Productos)" },
        { title: "Soporte Estándar" }
      ];
    }
    if (nameLower.includes("estándar") || nameLower.includes("standard")) {
      return [
        { title: "150 Citas Mensuales", highlighted: true },
        { title: "Acceso a QUMarket" },
        { title: "Catálogo Extendido (15 Servicios / 30 Productos)" }
      ];
    }
    if (nameLower.includes("premium")) {
      return [
        { title: "500 Citas Mensuales", icon: <Zap className="w-4 h-4 text-amber-500" />, highlighted: true },
        { title: "Reportes Avanzados e IA (QUBlocks)" },
        { title: "Comisión Reducida (10%)" }
      ];
    }
    if (nameLower.includes("empresarial") || nameLower.includes("enterprise")) {
      return [
        { title: "Citas y Servicios Ilimitados", icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, highlighted: true },
        { title: "Soporte y Marketing Nivel 4 (VIP)" },
        { title: "Sin Comisiones por Transacción Fija (0%)" }
      ];
    }
    
    // Por defecto fallback a profesional/estándar
    return [
      { title: "Agenda Completa" },
      { title: "Perfil Especializado" },
      { title: "Gestión de Catálogo" }
    ];
  };

  // Cargar planes del backend
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get<BackendPlan[]>('/api/payments/plans', { withCredentials: true });
        setRawPlans(data);
      } catch (err) {
        console.error("Error cargando planes:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Filtrar y convertir Backend -> Frontend UI
  useEffect(() => {
    if (rawPlans.length === 0) return;

    const currentInterval = billingCycle === "monthly" ? "MONTH" : "YEAR";
    const filtered = rawPlans.filter(p => p.interval === currentInterval);

    const uiPlans: Plan[] = filtered.map(bp => {
      // Cálculo de ahorros hipotético si es anual y existe un precio base
      const matchingMonthly = rawPlans.find(m => m.name.replace(" Anual", "") === bp.name.replace(" Anual", "") && m.interval === "MONTH");
      const baseMonthlyPrice = matchingMonthly ? matchingMonthly.price : bp.price / 12;
      const savings = (currentInterval === "YEAR" && baseMonthlyPrice > 0) 
          ? (baseMonthlyPrice * 12) - bp.price 
          : undefined;

      const isPopular = bp.name.toLowerCase().includes("prof");

      return {
        id: bp.stripePriceId || `plan_${bp.id}`,
        name: bp.name,
        description: bp.description || "Potencia tu consultorio.",
        price: bp.price,
        duration: billingCycle,
        savings: savings && savings > 0 ? savings : undefined,
        isPopular: isPopular,
        features: buildFeaturesForPlan(bp.name, currentInterval === "YEAR")
      };
    });

    setDisplayPlans(uiPlans);
  }, [billingCycle, rawPlans]);

  // Manejo del pago
  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    toast.info(t('toast_processing'));

    try {
      const { data } = await axios.post('/api/payments/subscriptions/checkout',
        // Ojo: subscription API espera priceId de Stripe como planId
        { priceId: selectedPlan.id },
        { withCredentials: true }
      );

      // Si el backend te da sessionId, usa redirectToCheckout de Stripe
      // Si te da URL directo (Stripe Hosted Checkout), un simple window.location funciona
      if (data.url) {
         window.location.href = data.url;
         return;
      }

      if (data.sessionId) {
        const stripe = await stripePromise;
        if (!stripe) throw new Error(t('error_stripe'));
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) throw error;
      }

    } catch (err: any) {
      console.error(err);
      handleApiError(err);
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
            {displayPlans.map((plan, index) => (
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
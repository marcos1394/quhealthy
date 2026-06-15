"use client";

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import { ShieldCheck, CreditCard, CheckCircle2, Zap } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

// Componentes Modulares
import { PlansHeader } from '@/components/dashboard/subscription/PlansHeader';
import { PricingCard, Plan } from '@/components/dashboard/subscription/PricingCard';
import { ConfirmationModal } from '@/components/dashboard/subscription/ConfirmationModal';
import { handleApiError } from '@/lib/handleApiError';
import { useParams, useSearchParams } from 'next/navigation';

// Tipos adicionales locales para la data
export type UserRole = "paciente" | "proveedor";
export type BillingCycle = "monthly" | "yearly";

import { BackendPlan, buildFeaturesForPlan } from '@/lib/subscriptionUtils';

// Configuración de Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function BillingPage() {
  const t = useTranslations('SettingsSubscription');
  const params = useParams();
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get('planId');
  const locale = params.locale; // Obtiene 'es', 'en', etc.
  const role: UserRole = "proveedor"; 
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawPlans, setRawPlans] = useState<BackendPlan[]>([]);
  const [displayPlans, setDisplayPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar planes del backend
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get<BackendPlan[]>('/api/payments/plans');
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

    const currentInterval = billingCycle === "monthly" ? "MONTHLY" : "YEARLY";
    const filtered = rawPlans.filter(p => p.billingInterval === currentInterval);

    const uiPlans: Plan[] = filtered.map(bp => {
      // Cálculo de ahorros hipotético si es anual y existe un precio base
      const matchingMonthly = rawPlans.find(m => m.name.replace(" Anual", "") === bp.name.replace(" Anual", "") && m.billingInterval === "MONTHLY");
      const baseMonthlyPrice = matchingMonthly ? matchingMonthly.price : bp.price / 12;
      const savings = (currentInterval === "YEARLY" && baseMonthlyPrice > 0) 
          ? (baseMonthlyPrice * 12) - bp.price 
          : undefined;

      const isPopular = bp.name.toLowerCase().includes("prof") || bp.name.toLowerCase().includes("estándar");

      return {
        id: bp.stripePriceId || `plan_${bp.id}`,
        name: bp.name,
        description: bp.description || "Potencia tu consultorio.",
        price: bp.price,
        duration: billingCycle,
        savings: savings && savings > 0 ? savings : undefined,
        isPopular: isPopular,
        features: buildFeaturesForPlan(bp.name, currentInterval === "YEARLY")
      };
    });

    setDisplayPlans(uiPlans);

    // Auto-open modal if planIdParam is present
    if (planIdParam && !selectedPlan) {
      const planToAutoOpen = uiPlans.find(p => p.id === planIdParam || p.id === `plan_${planIdParam}`);
      if (planToAutoOpen) {
        setSelectedPlan(planToAutoOpen);
      }
    }
  }, [billingCycle, rawPlans, planIdParam]);

  // Manejo del pago
  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    toast.info(t('toast_processing') || "Procesando petición...");

    // 1. Encontrar el Plan numérico original usando el stripePriceId
    const matchingBackendPlan = rawPlans.find(bp => 
      (bp.stripePriceId || `plan_${bp.id}`) === selectedPlan.id
    );

    if (!matchingBackendPlan) {
      toast.error("Error identificando el plan en la base de datos.");
      setIsProcessing(false);
      return;
    }

    // 2. Preparar las URLs de redirección dinámicamente

    const baseUrl = window.location.origin;
    // ✨ FIX: Incluimos el locale y el segmento /provider
    const successUrl = `${baseUrl}/${locale}/provider/dashboard/settings/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/${locale}/provider/dashboard/settings/billing?status=cancelled`;


    try {
      // 3. 🚀 Enviar la estructura exacta que pide el DTO en Java
      const payload = {
        planId: matchingBackendPlan.id, // Número entero (ej: 1, 2, 3...)
        successUrl: successUrl,
        cancelUrl: cancelUrl,
        gateway: "STRIPE" 
      };

      const { data } = await axiosInstance.post('/api/payments/subscriptions/checkout', payload);

      // Si el backend devuelve la URL directo de Stripe (Stripe Hosted Checkout)
      if (data.url) {
         window.location.href = data.url;
         return;
      }

      // Si el backend devuelve el sessionId, redirigimos usando la librería de Stripe de React
      if (data.sessionId) {
        const stripe = await stripePromise;
        if (!stripe) throw new Error(t('error_stripe') || "Error cargando pasarela de pago.");
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) throw error;
      }

    } catch (err: any) {
      console.error(err);
      handleApiError(err);
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
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">{t('loading') || "Cargando planes..."}</p>
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
            <span>{t('secure_payments') || "Pagos Seguros"}</span>
          </div>
          <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <span>{t('accept_cards') || "Aceptamos todas las tarjetas"}</span>
          </div>
          <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-slate-500" />
            <span>{t('cancel_anytime') || "Cancela cuando quieras"}</span>
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
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

export function ProviderSubscriptionSettings() {
  const t = useTranslations('SettingsSubscription');
  const tPricing = useTranslations('Pricing');
  const params = useParams();
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get('planId');
  const locale = params.locale; // Obtiene 'es', 'en', etc.
  const role: UserRole = "proveedor"; 
    const [{ billingCycle, selectedPlan, isProcessing, rawPlans, displayPlans, isLoading }, dispatch] = React.useReducer(
      (state: any, action: any) => {
        switch (action.type) {
      case 'SET_BILLINGCYCLE': return { ...state, billingCycle: typeof action.payload === 'function' ? action.payload(state.billingCycle) : action.payload };
      case 'SET_SELECTEDPLAN': return { ...state, selectedPlan: typeof action.payload === 'function' ? action.payload(state.selectedPlan) : action.payload };
      case 'SET_ISPROCESSING': return { ...state, isProcessing: typeof action.payload === 'function' ? action.payload(state.isProcessing) : action.payload };
      case 'SET_RAWPLANS': return { ...state, rawPlans: typeof action.payload === 'function' ? action.payload(state.rawPlans) : action.payload };
      case 'SET_DISPLAYPLANS': return { ...state, displayPlans: typeof action.payload === 'function' ? action.payload(state.displayPlans) : action.payload };
      case 'SET_ISLOADING': return { ...state, isLoading: typeof action.payload === 'function' ? action.payload(state.isLoading) : action.payload };
          default: return state;
        }
      },
      {
        billingCycle: "monthly", selectedPlan: null, isProcessing: false, rawPlans: [], displayPlans: [], isLoading: true
      }
    );

    const setBillingCycle = (val: any) => dispatch({ type: 'SET_BILLINGCYCLE', payload: val });
    const setSelectedPlan = (val: any) => dispatch({ type: 'SET_SELECTEDPLAN', payload: val });
    const setIsProcessing = (val: any) => dispatch({ type: 'SET_ISPROCESSING', payload: val });
    const setRawPlans = (val: any) => dispatch({ type: 'SET_RAWPLANS', payload: val });
    const setDisplayPlans = (val: any) => dispatch({ type: 'SET_DISPLAYPLANS', payload: val });
    const setIsLoading = (val: any) => dispatch({ type: 'SET_ISLOADING', payload: val });







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
    const filtered = rawPlans.filter((p: any) => p.billingInterval === currentInterval);

    const uiPlans: Plan[] = filtered.map((bp: any) => {
      const EXCHANGE_RATE = 20;
      const nameLower = bp.name.toLowerCase();
      let planKey = "basic";
      if (nameLower.includes("gratis") || nameLower.includes("free")) planKey = "free";
      else if (nameLower.includes("estándar") || nameLower.includes("standard")) planKey = "standard";
      else if (nameLower.includes("premium")) planKey = "premium";
      else if (nameLower.includes("empresarial") || nameLower.includes("enterprise")) planKey = "enterprise";

      const displayPrice = locale === 'en' ? Math.round(bp.price / EXCHANGE_RATE) : bp.price;

      // Cálculo de ahorros hipotético si es anual y existe un precio base
      const matchingMonthly = rawPlans.find((m: any) => m.name.replace(" Anual", "") === bp.name.replace(" Anual", "") && m.billingInterval === "MONTHLY");
      const baseMonthlyPrice = matchingMonthly ? (locale === 'en' ? Math.round(matchingMonthly.price / EXCHANGE_RATE) : matchingMonthly.price) : displayPrice / 12;
      const savings = (currentInterval === "YEARLY" && baseMonthlyPrice > 0) 
          ? (baseMonthlyPrice * 12) - displayPrice 
          : undefined;

      const isPopular = nameLower.includes("prof") || nameLower.includes("estándar");

      return {
        id: bp.stripePriceId || `plan_${bp.id}`,
        name: tPricing(`plans.${planKey}.title`),
        description: tPricing(`plans.${planKey}.description`),
        price: displayPrice,
        duration: billingCycle,
        savings: savings && savings > 0 ? savings : undefined,
        isPopular: isPopular,
        features: buildFeaturesForPlan(bp, currentInterval === "YEARLY", tPricing),
        planKey
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
    const matchingBackendPlan = rawPlans.find((bp: any) => 
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
    <div className="min-h-screen bg-transparent px-4 py-12 md:p-8 flex flex-col items-center font-sans">
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
            <div className="w-10 h-10 border-4 border-black/20 border-t-black rounded-none animate-spin dark:border-white/20 dark:border-t-white"></div>
            <p className="text-black dark:text-white font-bold uppercase tracking-widest text-[10px] animate-pulse">{t('loading') || "Cargando planes..."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {displayPlans.map((plan: any, index: number) => (
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
          className="pt-16 pb-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-black dark:text-white text-[9px] font-bold tracking-widest uppercase"
        >
          <div className="flex items-center gap-2.5 bg-transparent px-4 py-2 rounded-none border border-black/20 dark:border-white/20 shadow-none">
            <ShieldCheck className="w-5 h-5 text-black dark:text-white" />
            <span>{t('secure_payments') || "Pagos Seguros"}</span>
          </div>
          <div className="flex items-center gap-2.5 bg-transparent px-4 py-2 rounded-none border border-black/20 dark:border-white/20 shadow-none">
            <CreditCard className="w-5 h-5 text-black dark:text-white" />
            <span>{t('accept_cards') || "Aceptamos todas las tarjetas"}</span>
          </div>
          <div className="flex items-center gap-2.5 bg-transparent px-4 py-2 rounded-none border border-black/20 dark:border-white/20 shadow-none">
            <CheckCircle2 className="w-5 h-5 text-black dark:text-white" />
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
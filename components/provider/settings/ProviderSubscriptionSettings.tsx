"use client";

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import {
  ShieldCheck, CreditCard, CheckCircle2, Zap, AlertTriangle,
  Clock, CheckCircle, XCircle, RefreshCw, Mail
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

// Componentes Modulares
import { PlansHeader } from '@/components/dashboard/subscription/PlansHeader';
import { ConfirmationModal } from '@/components/dashboard/subscription/ConfirmationModal';
import { handleApiError } from '@/lib/handleApiError';
import { useParams, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

// Utilidades
import { BackendPlan, buildFeaturesForPlan } from '@/lib/subscriptionUtils';
import { subscriptionService, CurrentSubscription } from '@/services/subscription.service';

// Tipos adicionales
export type UserRole = "paciente" | "proveedor";
export type BillingCycle = "monthly" | "yearly";

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: any[];
  savings?: number;
  isPopular?: boolean;
  planKey?: string;
  isEnterprise?: boolean;    // Plan empresarial: contactar ventas, no checkout
  hasStripeId?: boolean;     // Si el plan tiene stripePriceId en la BD
}

// Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// ── Helper: días restantes ────────────────────────────────────────────────────
function getDaysLeft(endDate: string | null | undefined): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

// ── Banner de estado de suscripción ──────────────────────────────────────────
function SubscriptionStatusBanner({ sub }: { sub: CurrentSubscription | null }) {
  if (!sub) return null;

  const daysLeft = getDaysLeft(sub.currentPeriodEnd);
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isUrgent = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;

  let bg = 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10';
  let Icon = CheckCircle;
  let text = '';
  let subtext = '';

  if (sub.status === 'ACTIVE' || sub.status === 'TRIALING') {
    if (isExpired) {
      bg = 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50';
      Icon = XCircle;
      text = 'Plan vencido';
      subtext = 'Tu período ha terminado. Selecciona un plan para continuar.';
    } else if (isUrgent) {
      bg = 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50';
      Icon = AlertTriangle;
      text = `${daysLeft} día${daysLeft === 1 ? '' : 's'} restante${daysLeft === 1 ? '' : 's'}`;
      subtext = `Tu plan "${sub.planName}" vence pronto. Renueva para evitar interrupciones.`;
    } else {
      bg = 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/50';
      Icon = CheckCircle;
      text = sub.status === 'TRIALING'
        ? `Período de prueba — ${daysLeft ?? '?'} días restantes`
        : `Plan activo — ${daysLeft ?? '?'} días restantes`;
      subtext = `Plan: ${sub.planName}`;
    }
  } else if (sub.status === 'PAST_DUE') {
    bg = 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50';
    Icon = AlertTriangle;
    text = 'Pago pendiente';
    subtext = 'No pudimos procesar tu pago. Actualiza tu método de pago.';
  } else if (sub.status === 'CANCELED') {
    bg = 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700';
    Icon = XCircle;
    text = 'Suscripción cancelada';
    subtext = sub.cancelAtPeriodEnd
      ? `Tendrás acceso hasta que venza el período actual.`
      : 'Selecciona un plan para volver a activar tu cuenta.';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'w-full max-w-2xl mx-auto flex items-start gap-4 p-4 border rounded-none mb-8',
        bg
      )}
    >
      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest">{text}</p>
        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">{subtext}</p>
      </div>
    </motion.div>
  );
}

// ── Pricing Card adaptada para el dashboard ───────────────────────────────────
interface DashboardPricingCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  currentSub: CurrentSubscription | null;
  locale: string | string[];
  index: number;
}

function DashboardPricingCard({ plan, onSelect, currentSub, locale, index }: DashboardPricingCardProps) {
  const t = useTranslations('SettingsSubscription.PricingCard');

  const daysLeft = getDaysLeft(currentSub?.currentPeriodEnd);
  const isExpiredOrCanceled =
    !currentSub ||
    currentSub.status === 'CANCELED' ||
    (daysLeft !== null && daysLeft <= 0);

  // ¿Es el plan que el usuario tiene activo ahora?
  const isCurrentPlan =
    !!currentSub &&
    !isExpiredOrCanceled &&
    currentSub.planName?.toLowerCase().includes(plan.planKey ?? '');

  // El plan empresarial siempre va a contacto, nunca checkout
  const canCheckout = !plan.isEnterprise && plan.hasStripeId;

  let btnLabel = '';
  let btnDisabled = false;
  let btnVariant: 'current' | 'enterprise' | 'upgrade' | 'nostripe' = 'upgrade';

  if (plan.isEnterprise) {
    btnLabel = 'Contactar Ventas';
    btnVariant = 'enterprise';
  } else if (!plan.hasStripeId) {
    btnLabel = 'No disponible';
    btnDisabled = true;
    btnVariant = 'nostripe';
  } else if (isCurrentPlan) {
    btnLabel = 'Tu plan actual ✓';
    btnVariant = 'current';
    // No deshabilitamos — el usuario puede cambiar su plan incluso si ya lo tiene
  } else {
    btnLabel = isExpiredOrCanceled
      ? `Activar ${plan.name}`
      : `Cambiar a ${plan.name}`;
    btnVariant = 'upgrade';
  }

  const btnStyles: Record<string, string> = {
    current:
      'bg-black/5 dark:bg-white/5 text-black dark:text-white border-black/30 dark:border-white/30 hover:bg-black/10 dark:hover:bg-white/10',
    enterprise:
      'bg-transparent border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
    upgrade:
      plan.isPopular
        ? 'bg-black text-white dark:bg-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 border-black dark:border-white'
        : 'bg-transparent border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
    nostripe:
      'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        'relative flex flex-col h-full border rounded-none transition-all duration-300',
        plan.isPopular
          ? 'border-2 border-black dark:border-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,1)]'
          : 'border border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white'
      )}
    >
      {/* Popular badge */}
      {plan.isPopular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
          <span className="bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold uppercase tracking-widest px-4 py-1 border border-black dark:border-white">
            ⭐ MÁS POPULAR
          </span>
        </div>
      )}

      {/* Current plan badge */}
      {isCurrentPlan && (
        <div className="absolute top-3 right-3">
          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] font-bold uppercase tracking-widest px-2 py-1 border border-green-300 dark:border-green-700">
            ACTIVO
          </span>
        </div>
      )}

      {/* Header */}
      <div className={cn(
        'p-6 pb-4 text-center border-b space-y-3',
        plan.isPopular
          ? 'bg-black/5 dark:bg-white/5 border-black/20 dark:border-white/20'
          : 'bg-transparent border-black/10 dark:border-white/10'
      )}>
        <h3 className="text-xl font-bold uppercase tracking-tighter text-black dark:text-white">
          {plan.name}
        </h3>
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 leading-relaxed min-h-[32px]">
          {plan.description}
        </p>

        {/* Price */}
        <div className="flex items-baseline justify-center gap-1 pt-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {locale === 'en' && plan.price > 0 ? '~$' : '$'}
          </span>
          <span className="text-5xl font-bold tracking-tighter text-black dark:text-white">
            {plan.price.toLocaleString()}
          </span>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-1">
            {locale === 'en' && plan.price > 0 ? 'USD' : 'MXN'}/
            {plan.duration === 'monthly' ? 'mes' : 'año'}
          </span>
        </div>

        {plan.savings && plan.savings > 0 && (
          <span className="inline-flex items-center gap-1 bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white text-[9px] font-bold uppercase tracking-widest px-2 py-1">
            <Zap className="w-3 h-3" />
            Ahorra ${plan.savings.toLocaleString()}
          </span>
        )}
      </div>

      {/* Features */}
      <div className="p-6 pt-4 flex-1">
        <ul className="space-y-3">
          {plan.features.map((feature: any, i: number) => (
            <li key={i} className="flex items-start gap-2.5 text-left">
              <CheckCircle2 className={cn(
                'w-4 h-4 mt-0.5 shrink-0',
                feature.highlighted ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'
              )} />
              <span className={cn(
                'text-[11px] font-bold uppercase tracking-widest',
                feature.highlighted ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'
              )}>
                {feature.title}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="p-6 pt-0">
        <button
          disabled={btnDisabled}
          onClick={() => {
            if (plan.isEnterprise) {
              window.open('mailto:ventas@quhealthy.org?subject=Plan%20Empresarial%20QuHealthy', '_blank');
              return;
            }
            if (!btnDisabled) onSelect(plan);
          }}
          className={cn(
            'w-full h-11 text-[10px] uppercase tracking-widest font-bold transition-all duration-200 border flex items-center justify-center gap-2 rounded-none',
            btnStyles[btnVariant]
          )}
        >
          {plan.isEnterprise ? (
            <><Mail className="w-4 h-4" />{btnLabel}</>
          ) : (
            <>{btnLabel}</>
          )}
        </button>
        <p className="text-[9px] font-bold uppercase tracking-widest text-center text-gray-400 mt-2">
          Sin contratos. Cancela cuando quieras.
        </p>
      </div>
    </motion.div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function ProviderSubscriptionSettings() {
  const t = useTranslations('SettingsSubscription');
  const tPricing = useTranslations('Pricing');
  const params = useParams();
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get('planId');
  const locale = (params?.locale as string | string[]) || 'es';

  const role: UserRole = "proveedor";

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawPlans, setRawPlans] = useState<BackendPlan[]>([]);
  const [displayPlans, setDisplayPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null);
  const [isLoadingSub, setIsLoadingSub] = useState(true);

  // 1. Cargar suscripción actual del proveedor
  useEffect(() => {
    const loadCurrentSub = async () => {
      setIsLoadingSub(true);
      try {
        const sub = await subscriptionService.getCurrentSubscription();
        setCurrentSub(sub);
      } catch {
        setCurrentSub(null);
      } finally {
        setIsLoadingSub(false);
      }
    };
    loadCurrentSub();
  }, []);

  // 2. Cargar planes disponibles del backend
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get<BackendPlan[]>('/api/payments/plans');
        setRawPlans(data);
      } catch (err) {
        console.error("Error cargando planes:", err);
        toast.error("No se pudieron cargar los planes. Intenta de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // 3. Filtrar y mapear Backend → UI
  useEffect(() => {
    if (rawPlans.length === 0) return;

    const currentInterval = billingCycle === "monthly" ? "MONTHLY" : "YEARLY";
    const filtered = rawPlans.filter((p: BackendPlan) => p.billingInterval === currentInterval);

    const EXCHANGE_RATE = 20;

    const uiPlans: Plan[] = filtered.map((bp: BackendPlan) => {
      const nameLower = bp.name.toLowerCase();
      let planKey = "basic";
      if (nameLower.includes("gratis") || nameLower.includes("free")) planKey = "free";
      else if (nameLower.includes("estándar") || nameLower.includes("standard")) planKey = "standard";
      else if (nameLower.includes("premium")) planKey = "premium";
      else if (nameLower.includes("empresarial") || nameLower.includes("enterprise")) planKey = "enterprise";

      const isEnterprise = planKey === "enterprise";
      const displayPrice = locale === 'en' ? Math.round(bp.price / EXCHANGE_RATE) : bp.price;

      // Cálculo de ahorro anual vs. mensual equivalente
      const matchingMonthly = rawPlans.find(
        (m: BackendPlan) =>
          m.name.replace(" Anual", "") === bp.name.replace(" Anual", "") &&
          m.billingInterval === "MONTHLY"
      );
      const baseMonthlyPrice = matchingMonthly
        ? (locale === 'en' ? Math.round(matchingMonthly.price / EXCHANGE_RATE) : matchingMonthly.price)
        : displayPrice / 12;
      const savings =
        currentInterval === "YEARLY" && baseMonthlyPrice > 0
          ? (baseMonthlyPrice * 12) - displayPrice
          : undefined;

      const isPopular = nameLower.includes("estándar") || nameLower.includes("standard") || nameLower.includes("prof");

      return {
        id: bp.stripePriceId || `plan_${bp.id}`,
        name: isEnterprise
          ? 'Empresarial'
          : (() => {
              try { return tPricing(`plans.${planKey}.title`); }
              catch { return bp.name; }
            })(),
        description: (() => {
          try { return tPricing(`plans.${planKey}.description`); }
          catch { return bp.description || ''; }
        })(),
        price: displayPrice,
        duration: billingCycle,
        savings: savings && savings > 0 ? savings : undefined,
        isPopular,
        features: buildFeaturesForPlan(bp, currentInterval === "YEARLY", tPricing),
        planKey,
        isEnterprise,
        hasStripeId: !!bp.stripePriceId,
      };
    }).sort((a: Plan, b: Plan) => a.price - b.price);

    setDisplayPlans(uiPlans);

    // Auto-abrir modal si viene ?planId=X en la URL
    if (planIdParam && !selectedPlan) {
      const match = uiPlans.find(p => p.id === planIdParam || p.id === `plan_${planIdParam}`);
      if (match) setSelectedPlan(match);
    }
  }, [billingCycle, rawPlans, planIdParam, locale]);

  // Manejo del checkout con Stripe
  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    toast.info(t('toast_processing') || "Procesando petición...");

    const matchingBackendPlan = rawPlans.find(
      (bp: BackendPlan) => (bp.stripePriceId || `plan_${bp.id}`) === selectedPlan.id
    );

    if (!matchingBackendPlan) {
      toast.error("Error identificando el plan en la base de datos.");
      setIsProcessing(false);
      return;
    }

    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/${locale}/provider/dashboard/settings/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/${locale}/provider/dashboard/settings#subscription`;

    try {
      const payload = {
        planId: matchingBackendPlan.id,
        successUrl,
        cancelUrl,
        gateway: "STRIPE",
      };

      console.log("Enviando petición a /api/payments/subscriptions/checkout", payload);
      const response = await axiosInstance.post('/api/payments/subscriptions/checkout', payload);
      const data = response.data;
      console.log("Respuesta del checkout:", data);

      if (data && data.url) {
        console.log("Redirigiendo a:", data.url);
        window.location.assign(data.url);
        return;
      }
      
      if (data && data.sessionId) {
        console.log("Redirigiendo via Stripe SDK con session:", data.sessionId);
        const stripe = await stripePromise;
        if (!stripe) throw new Error("Error cargando pasarela de pago.");
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) throw error;
      } else {
        throw new Error("El servidor no devolvió una URL válida de pago.");
      }
    } catch (err: any) {
      console.error("Error en handleCheckout:", err);
      handleApiError(err);
      setTimeout(() => setSelectedPlan(null), 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  const isReady = !isLoading && !isLoadingSub;

  return (
    <div className="min-h-screen bg-transparent px-4 py-12 md:p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-7xl mx-auto space-y-12">

        {/* Header con Toggle de facturación */}
        <PlansHeader
          role={role}
          billingCycle={billingCycle}
          setBillingCycle={(cycle) => setBillingCycle(cycle as BillingCycle)}
        />

        {/* Banner de estado de suscripción actual */}
        {!isLoadingSub && <SubscriptionStatusBanner sub={currentSub} />}

        {/* Grid de Planes */}
        {!isReady ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-black/20 border-t-black rounded-none animate-spin dark:border-white/20 dark:border-t-white" />
            <p className="text-black dark:text-white font-bold uppercase tracking-widest text-[10px] animate-pulse">
              {t('loading') || "Cargando planes..."}
            </p>
          </div>
        ) : displayPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
            <XCircle className="w-10 h-10 text-gray-400" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              No hay planes disponibles en este momento.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-black dark:border-white px-4 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reintentar
            </button>
          </div>
        ) : (
          <div className={cn(
            "grid gap-8 max-w-6xl mx-auto items-stretch",
            displayPlans.length <= 3
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}>
            {displayPlans.map((plan, index) => (
              <DashboardPricingCard
                key={plan.id}
                plan={plan}
                onSelect={setSelectedPlan}
                currentSub={currentSub}
                locale={locale}
                index={index}
              />
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
            <Clock className="w-5 h-5 text-black dark:text-white" />
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
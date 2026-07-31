"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Zap,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Mail,
  Sparkles,
} from "lucide-react";

import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib/handleApiError";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Componentes Modulares
import { PlansHeader } from "@/components/dashboard/subscription/PlansHeader";
import { ConfirmationModal } from "@/components/dashboard/subscription/ConfirmationModal";

// Utilidades y Servicios
import { BackendPlan, buildFeaturesForPlan } from "@/lib/subscriptionUtils";
import {
  subscriptionService,
  CurrentSubscription,
} from "@/services/subscription.service";

// Tipos
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
  isEnterprise?: boolean;
  hasStripeId?: boolean;
}

// Stripe SDK
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

// ── Helper: Días Restantes ──────────────────────────────────────────────
function getDaysLeft(endDate: string | null | undefined): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

// ── BANNER DE ESTADO DE SUSCRIPCIÓN ─────────────────────────────────────
function SubscriptionStatusBanner({
  sub,
}: {
  sub: CurrentSubscription | null;
}) {
  const t = useTranslations("SettingsSubscription.status");

  if (!sub) return null;

  const daysLeft = getDaysLeft(sub.currentPeriodEnd);
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isUrgent = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;

  let bgClass =
    "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200";
  let Icon = CheckCircle;
  let titleText = "";
  let descText = "";

  if (sub.status === "ACTIVE" || sub.status === "TRIALING") {
    if (isExpired) {
      bgClass =
        "bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40 text-rose-900 dark:text-rose-200";
      Icon = XCircle;
      titleText = t("expired_title");
      descText = t("expired_desc");
    } else if (isUrgent) {
      bgClass =
        "bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40 text-amber-900 dark:text-amber-200";
      Icon = AlertTriangle;
      titleText = t("urgent_title", { days: daysLeft ?? 0 });
      descText = t("urgent_desc", { plan: sub.planName });
    } else {
      bgClass =
        "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200";
      Icon = CheckCircle;
      titleText =
        sub.status === "TRIALING"
          ? t("trial_title", { days: daysLeft ?? 0 })
          : t("active_title", { days: daysLeft ?? 0 });
      descText = t("active_desc", { plan: sub.planName });
    }
  } else if (sub.status === "PAST_DUE") {
    bgClass =
      "bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40 text-rose-900 dark:text-rose-200";
    Icon = AlertTriangle;
    titleText = t("past_due_title");
    descText = t("past_due_desc");
  } else if (sub.status === "CANCELED") {
    bgClass =
      "bg-gray-50/60 dark:bg-[#050505] border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200";
    Icon = XCircle;
    titleText = t("canceled_title");
    descText = sub.cancelAtPeriodEnd ? t("canceled_end") : t("canceled_now");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "w-full max-w-2xl mx-auto flex items-start gap-3.5 p-4 rounded-2xl border shadow-2xs font-sans",
        bgClass
      )}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={2} />
      <div className="space-y-0.5 min-w-0">
        <p className="text-xs font-bold tracking-tight">{titleText}</p>
        <p className="text-xs font-medium opacity-80 leading-relaxed">
          {descText}
        </p>
      </div>
    </motion.div>
  );
}

// ── TARJETA DE PRECIO PARA DASHBOARD ────────────────────────────────────
interface DashboardPricingCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  currentSub: CurrentSubscription | null;
  locale: string | string[];
  index: number;
}

function DashboardPricingCard({
  plan,
  onSelect,
  currentSub,
  locale,
  index,
}: DashboardPricingCardProps) {
  const t = useTranslations("SettingsSubscription.PricingCard");

  const daysLeft = getDaysLeft(currentSub?.currentPeriodEnd);
  const isExpiredOrCanceled =
    !currentSub ||
    currentSub.status === "CANCELED" ||
    (daysLeft !== null && daysLeft <= 0);

  const isCurrentPlan =
    !!currentSub &&
    !isExpiredOrCanceled &&
    currentSub.planName?.toLowerCase().includes(plan.planKey ?? "");

  let btnLabel = "";
  let btnDisabled = false;
  let btnVariant: "current" | "enterprise" | "upgrade" | "nostripe" =
    "upgrade";

  if (plan.isEnterprise) {
    btnLabel = t("contact_sales");
    btnVariant = "enterprise";
  } else if (!plan.hasStripeId) {
    btnLabel = t("unavailable");
    btnDisabled = true;
    btnVariant = "nostripe";
  } else if (isCurrentPlan) {
    btnLabel = t("current_plan");
    btnVariant = "current";
  } else {
    btnLabel = isExpiredOrCanceled
      ? t("activate_plan", { name: plan.name })
      : t("switch_plan", { name: plan.name });
    btnVariant = "upgrade";
  }

  const btnStyles: Record<string, string> = {
    current:
      "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/50",
    enterprise:
      "bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 dark:hover:bg-emerald-600 dark:hover:text-white",
    upgrade: plan.isPopular
      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs border-0"
      : "bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 dark:hover:bg-emerald-600 dark:hover:text-white",
    nostripe:
      "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06, ease: "easeOut" }}
      className={cn(
        "relative flex flex-col h-full rounded-3xl bg-white dark:bg-[#0a0a0a] transition-all duration-200 shadow-2xs font-sans overflow-hidden select-none",
        plan.isPopular
          ? "border-2 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20"
          : "border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 hover:shadow-md"
      )}
    >
      {/* Insignia Popular */}
      {plan.isPopular && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
            {t("popular_badge")}
          </Badge>
        </div>
      )}

      {/* Insignia de Plan Actual */}
      {isCurrentPlan && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
            {t("active_badge")}
          </Badge>
        </div>
      )}

      {/* Cabecera */}
      <div
        className={cn(
          "p-6 pb-5 text-center border-b space-y-3",
          plan.isPopular
            ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40"
            : "bg-gray-50/50 dark:bg-[#050505] border-gray-100 dark:border-gray-800"
        )}
      >
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          {plan.name}
        </h3>

        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 min-h-[32px] leading-relaxed">
          {plan.description}
        </p>

        {/* Precio */}
        <div className="flex items-baseline justify-center gap-1 pt-1">
          <span className="text-xs font-mono font-bold text-gray-400">
            {locale === "en" && plan.price > 0 ? "~$" : "$"}
          </span>
          <span className="text-4xl sm:text-5xl font-mono font-black text-gray-900 dark:text-white tracking-tight">
            {plan.price.toLocaleString()}
          </span>
          <span className="text-xs font-mono font-bold text-gray-400 ml-1">
            {locale === "en" && plan.price > 0 ? "USD" : "MXN"}
            {plan.duration === "monthly" ? t("per_month") : t("per_year")}
          </span>
        </div>

        {plan.savings && plan.savings > 0 && (
          <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
            <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <span>{t("save_amount", { amount: plan.savings.toLocaleString() })}</span>
          </span>
        )}
      </div>

      {/* Características */}
      <div className="p-6 pt-5 flex-1 space-y-3">
        <ul className="space-y-3">
          {plan.features.map((feature: any, i: number) => (
            <li key={i} className="flex items-start gap-2.5 text-left">
              <CheckCircle2
                className={cn(
                  "w-4 h-4 mt-0.5 shrink-0",
                  feature.highlighted
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-400"
                )}
                strokeWidth={2}
              />
              <span
                className={cn(
                  "text-xs font-medium leading-relaxed",
                  feature.highlighted
                    ? "font-bold text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                {feature.title}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Botón CTA */}
      <div className="p-6 pt-0 space-y-2">
        <Button
          type="button"
          disabled={btnDisabled}
          onClick={() => {
            if (plan.isEnterprise) {
              window.open(
                "mailto:ventas@quhealthy.org?subject=Plan%20Empresarial%20QuHealthy",
                "_blank"
              );
              return;
            }
            if (!btnDisabled) onSelect(plan);
          }}
          className={cn(
            "w-full h-11 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs",
            btnStyles[btnVariant]
          )}
        >
          {plan.isEnterprise ? (
            <>
              <Mail className="w-4 h-4" strokeWidth={2} />
              <span>{btnLabel}</span>
            </>
          ) : (
            <span>{btnLabel}</span>
          )}
        </Button>

        <p className="text-[11px] font-medium text-center text-gray-400">
          {t("no_contracts")}
        </p>
      </div>
    </motion.div>
  );
}

// ── COMPONENTE PRINCIPAL DE CONFIGURACIÓN DE SUSCRIPCIÓN ────────────────
export function ProviderSubscriptionSettings() {
  const t = useTranslations("SettingsSubscription");
  const tPricing = useTranslations("Pricing");
  const params = useParams();
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get("planId");
  const locale = (params?.locale as string | string[]) || "es";

  const role: UserRole = "proveedor";

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawPlans, setRawPlans] = useState<BackendPlan[]>([]);
  const [displayPlans, setDisplayPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(
    null
  );
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
        const { data } = await axiosInstance.get<BackendPlan[]>(
          "/api/payments/plans"
        );
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
    const filtered = rawPlans.filter(
      (p: BackendPlan) => p.billingInterval === currentInterval
    );

    const EXCHANGE_RATE = 20;

    const uiPlans: Plan[] = filtered
      .map((bp: BackendPlan) => {
        const nameLower = bp.name.toLowerCase();
        let planKey = "basic";
        if (nameLower.includes("gratis") || nameLower.includes("free"))
          planKey = "free";
        else if (
          nameLower.includes("estándar") ||
          nameLower.includes("standard")
        )
          planKey = "standard";
        else if (nameLower.includes("premium")) planKey = "premium";
        else if (
          nameLower.includes("empresarial") ||
          nameLower.includes("enterprise")
        )
          planKey = "enterprise";

        const isEnterprise = planKey === "enterprise";
        const displayPrice =
          locale === "en" ? Math.round(bp.price / EXCHANGE_RATE) : bp.price;

        const matchingMonthly = rawPlans.find(
          (m: BackendPlan) =>
            m.name.replace(" Anual", "") === bp.name.replace(" Anual", "") &&
            m.billingInterval === "MONTHLY"
        );
        const baseMonthlyPrice = matchingMonthly
          ? locale === "en"
            ? Math.round(matchingMonthly.price / EXCHANGE_RATE)
            : matchingMonthly.price
          : displayPrice / 12;

        const savings =
          currentInterval === "YEARLY" && baseMonthlyPrice > 0
            ? baseMonthlyPrice * 12 - displayPrice
            : undefined;

        const isPopular =
          nameLower.includes("estándar") ||
          nameLower.includes("standard") ||
          nameLower.includes("prof");

        return {
          id: bp.stripePriceId || `plan_${bp.id}`,
          name: isEnterprise
            ? t("enterprise_name")
            : (() => {
                try {
                  return tPricing(`plans.${planKey}.title`);
                } catch {
                  return bp.name;
                }
              })(),
          description: (() => {
            try {
              return tPricing(`plans.${planKey}.description`);
            } catch {
              return bp.description || "";
            }
          })(),
          price: displayPrice,
          duration: billingCycle,
          savings: savings && savings > 0 ? savings : undefined,
          isPopular,
          features: buildFeaturesForPlan(
            bp,
            currentInterval === "YEARLY",
            tPricing
          ),
          planKey,
          isEnterprise,
          hasStripeId: !!bp.stripePriceId,
        };
      })
      .sort((a: Plan, b: Plan) => a.price - b.price);

    setDisplayPlans(uiPlans);

    if (planIdParam && !selectedPlan) {
      const match = uiPlans.find(
        (p) => p.id === planIdParam || p.id === `plan_${planIdParam}`
      );
      if (match) setSelectedPlan(match);
    }
  }, [billingCycle, rawPlans, planIdParam, locale, t, tPricing, selectedPlan]);

  // Manejo del checkout con Stripe
  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    toast.info(t("toast_processing"));

    const matchingBackendPlan = rawPlans.find(
      (bp: BackendPlan) =>
        (bp.stripePriceId || `plan_${bp.id}`) === selectedPlan.id
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

      const response = await axiosInstance.post(
        "/api/payments/subscriptions/checkout",
        payload
      );
      const data = response.data;

      if (data && data.url) {
        window.location.assign(data.url);
        return;
      }

      if (data && data.sessionId) {
        const stripe = await stripePromise;
        if (!stripe) throw new Error("Error cargando pasarela de pago.");
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });
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
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-8">
      {/* ── ENCABEZADO Y SELECTOR DE FACTURACIÓN ──────────────────────── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <Sparkles className="w-6 h-6" strokeWidth={2} />
          </div>

          <div className="space-y-0.5">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {t("title")}
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <PlansHeader
          role={role}
          billingCycle={billingCycle}
          setBillingCycle={(cycle) => setBillingCycle(cycle as BillingCycle)}
        />
      </div>

      {/* Banner de Estado */}
      {!isLoadingSub && <SubscriptionStatusBanner sub={currentSub} />}

      {/* ── PARRILLA DE PLANES ────────────────────────────────────────── */}
      {!isReady ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs font-semibold text-gray-400">
            {t("loading")}
          </p>
        </div>
      ) : displayPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-[#050505] p-6">
          <XCircle className="w-10 h-10 text-gray-400" strokeWidth={2} />
          <p className="text-xs font-semibold text-gray-500">
            {t("no_plans")}
          </p>
          <Button
            type="button"
            onClick={() => window.location.reload()}
            variant="outline"
            className="rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold transition-all shadow-2xs h-9 px-4 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
            <span>{t("retry")}</span>
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-6 mx-auto items-stretch",
            displayPlans.length <= 3
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}
        >
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

      {/* ── INSIGNIAS DE CONFIANZA ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs font-medium text-gray-500 dark:text-gray-400"
      >
        <div className="flex items-center gap-2 bg-gray-50/60 dark:bg-[#050505] px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>{t("secure_payments")}</span>
        </div>

        <div className="flex items-center gap-2 bg-gray-50/60 dark:bg-[#050505] px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-2xs">
          <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>{t("accept_cards")}</span>
        </div>

        <div className="flex items-center gap-2 bg-gray-50/60 dark:bg-[#050505] px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-2xs">
          <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>{t("cancel_anytime")}</span>
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
  );
}
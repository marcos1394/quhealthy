"use client";

/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Activity,
  Laptop,
  CreditCard,
  MessageSquare,
  Check,
  ArrowUpRight,
  Sparkles,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

// UI Components
import { Switch } from "@/components/ui/switch";
import { QhSpinner } from "@/components/ui/QhSpinner";
import axiosInstance from "@/lib/axios";
import { useSessionStore } from "@/stores/SessionStore";
import { BackendPlan, buildFeaturesForPlan } from "@/lib/subscriptionUtils";
import { cn } from "@/lib/utils";

interface UIPlan {
  id: string;
  title: string;
  description: string;
  price: number;
  isPopular: boolean;
  features: { title: string; icon?: React.ReactNode; highlighted?: boolean }[];
  originalId: number;
  planKey: string;
}

const ANNUAL_DISCOUNT = 0.2; // 20% de descuento

export default function BusinessPage() {
  const t = useTranslations("PublicBusiness");
  const tPricing = useTranslations("Pricing");
  const locale = useLocale();
  const { isAuthenticated, role } = useSessionStore();

  const [isAnnual, setIsAnnual] = useState(false);
  const [rawPlans, setRawPlans] = useState<BackendPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await axiosInstance.get<BackendPlan[]>(
          "/api/payments/plans",
        );
        setRawPlans(data);
      } catch (err) {
        console.error("Error fetching plans:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const monthlyPlans = rawPlans.filter((p) => p.billingInterval === "MONTHLY");
  const EXCHANGE_RATE = 20;

  const displayPlans: UIPlan[] = monthlyPlans
    .sort((a, b) => a.price - b.price)
    .map((bp) => {
      const nameLower = bp.name.toLowerCase();
      const isPopular =
        nameLower.includes("estándar") || nameLower.includes("prof");

      let planKey = "basic";
      if (nameLower.includes("gratis") || nameLower.includes("free"))
        planKey = "free";
      else if (nameLower.includes("estándar") || nameLower.includes("standard"))
        planKey = "standard";
      else if (nameLower.includes("premium")) planKey = "premium";
      else if (
        nameLower.includes("empresarial") ||
        nameLower.includes("enterprise")
      )
        planKey = "enterprise";

      const displayPrice =
        locale === "en" ? Math.round(bp.price / EXCHANGE_RATE) : bp.price;

      return {
        id: bp.stripePriceId || `plan_${bp.id}`,
        title: tPricing(`plans.${planKey}.title`, { defaultValue: bp.name }),
        description: tPricing(`plans.${planKey}.description`, { defaultValue: "Plan diseñado para profesionales de la salud." }),
        price: displayPrice,
        isPopular,
        features:
          planKey === "enterprise"
            ? (tPricing.raw(`plans.enterprise.features`) as string[]).map(
                (f: string) => ({ title: f, highlighted: false }),
              )
            : buildFeaturesForPlan(bp, isAnnual, tPricing),
        originalId: bp.id,
        planKey,
      };
    });

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      
      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Texto Hero */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Breadcrumb Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800/60 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm">
                <Link
                  href="/"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  QuHealthy
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-900 dark:text-white font-bold">
                  Para Profesionales
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                  {t("title_light", { defaultValue: "Software de Gestión Clínica e " })}
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {t("title_highlight", { defaultValue: "Inteligencia Médica" })}
                  </span>
                </h1>

                <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 font-normal leading-relaxed max-w-2xl pt-1">
                  {t("subtitle", { defaultValue: "Digitaliza tu consultorio con expediente NOM-004, agenda automatizada, recordatorios WhatsApp y facturación en un solo lugar." })}
                </p>
              </div>

              {/* Botones CTA */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("pricing")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="h-12 px-7 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
                >
                  <span>{t("cta_primary", { defaultValue: "Ver Planes y Precios" })}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </button>

                <Link href="/provider/register" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full h-12 px-7 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>{t("cta_secondary", { defaultValue: "Probar Gratis" })}</span>
                    <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Visual Dashboard Mockup Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="lg:col-span-5"
            >
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-5">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                    QuHealthy Clinical OS
                  </span>
                </div>

                {/* Grid de Métricas Simuladas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50/60 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Consultas del Mes</span>
                    <p className="text-xl font-bold font-mono text-gray-900 dark:text-white">128</p>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <Zap className="w-3 h-3" /> +18% vs mes anterior
                    </span>
                  </div>

                  <div className="bg-gray-50/60 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Confirmación WhatsApp</span>
                    <p className="text-xl font-bold font-mono text-gray-900 dark:text-white">96.4%</p>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Cero ausentismo
                    </span>
                  </div>
                </div>

                {/* Banner de Expediente NOM-004 */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#0a0a0a] border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Cumplimiento NOM-004-SSA3</h4>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Cifrado de grado médico y firma electrónica.</p>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── BENTO FEATURES GRID ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505]">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          
          <div className="mb-14 space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Funcionalidades Clave</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight pt-1">
              {t("bento_title", { defaultValue: "Todo lo que Necesitas para Operar tu Consultorio" })}
            </h2>
            <p className="text-sm md:text-base text-gray-500 font-medium">
              {t("bento_subtitle", { defaultValue: "Diseñado para ahorrar tiempo administrativo y concentrarte en tus pacientes." })}
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Feature 1 */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:border-emerald-500/30 transition-all space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <Activity className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("bento.f1_title", { defaultValue: "Expediente Clínico Digital" })}
                </h3>
                <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("bento.f1_desc", { defaultValue: "Historial de antecedentes, notas SOAP evolutivas, recetas e interpretación asistida por IA." })}
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:border-emerald-500/30 transition-all space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <Laptop className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("bento.f2_title", { defaultValue: "Agenda Multicanal e Intuitiva" })}
                </h3>
                <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("bento.f2_desc", { defaultValue: "Control de horarios, consultas presenciales o videollamadas con recordatorios automáticos." })}
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:border-emerald-500/30 transition-all space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <CreditCard className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("bento.f3_title", { defaultValue: "Cobros y Facturación Electrónica" })}
                </h3>
                <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("bento.f3_desc", { defaultValue: "Procesamiento de pagos con tarjetas bancarias y emisión automática de facturas SAT." })}
                </p>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:border-emerald-500/30 transition-all space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <MessageSquare className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("bento.f4_title", { defaultValue: "Notificaciones por WhatsApp" })}
                </h3>
                <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("bento.f4_desc", { defaultValue: "Avisos de confirmación y cancelación directa por mensajes para reducir ausentismos." })}
                </p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ── PRICING SECTION ───────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 md:py-28 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          
          {/* Header Precios */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
                <Building2 className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{tPricing("badge", { defaultValue: "Planes Transparentes" })}</span>
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight pt-1">
                {tPricing("title_start", { defaultValue: "Elige el Plan Ideal para tu " })}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {tPricing("title_highlight", { defaultValue: "Práctica Médica" })}
                </span>
              </h2>
            </div>

            {/* Toggle Facturación Mensual / Anual */}
            <div className="bg-gray-50 dark:bg-[#050505] p-2 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 shrink-0 shadow-sm">
              <span
                className={cn(
                  "text-xs font-bold transition-colors pl-2",
                  !isAnnual ? "text-gray-900 dark:text-white" : "text-gray-400"
                )}
              >
                {tPricing("billing.monthly", { defaultValue: "Mensual" })}
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                disabled={isLoading}
                className="data-[state=checked]:bg-emerald-600"
              />
              <span
                className={cn(
                  "text-xs font-bold transition-colors flex items-center gap-1.5 pr-1",
                  isAnnual ? "text-gray-900 dark:text-white" : "text-gray-400"
                )}
              >
                <span>{tPricing("billing.annual", { defaultValue: "Anual" })}</span>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                  -20% Ahorro
                </span>
              </span>
            </div>
          </div>

          {/* Estado de Carga */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-semibold text-gray-400">Cargando planes de suscripción...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayPlans.map((plan, index) => {
                const monthlyPrice = plan.price;
                const finalPrice = isAnnual
                  ? Math.round(monthlyPrice * (1 - ANNUAL_DISCOUNT))
                  : monthlyPrice;

                return (
                  <motion.div
                    key={plan.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className={cn(
                      "bg-white dark:bg-[#0a0a0a] rounded-3xl p-7 shadow-sm border flex flex-col justify-between relative transition-all",
                      plan.isPopular
                        ? "border-2 border-emerald-500 dark:border-emerald-500 shadow-md"
                        : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                    )}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3.5 right-6 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                        {tPricing("badges.popular", { defaultValue: "Más Popular" })}
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Titulo & Descripcion */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {plan.title}
                        </h3>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 min-h-[36px]">
                          {plan.description}
                        </p>
                      </div>

                      {/* Precio */}
                      <div className="py-4 border-y border-gray-100 dark:border-gray-800">
                        {plan.planKey === "enterprise" ? (
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {locale === "en" ? "Custom" : "A la medida"}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold font-mono text-gray-900 dark:text-white">
                                {locale === "en" && finalPrice > 0 ? "~$" : "$"}
                                {finalPrice}
                              </span>
                              <span className="text-xs font-semibold text-gray-400">
                                {locale === "en" && finalPrice > 0 ? "USD " : ""}/
                                {tPricing("price_frequency", { defaultValue: "mes" })}
                              </span>
                            </div>

                            {isAnnual && monthlyPrice > 0 && (
                              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <span className="line-through text-gray-400 mr-1.5">
                                  ${monthlyPrice}
                                </span>
                                20% de ahorro incluido
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Features List */}
                      <ul className="space-y-2.5 pt-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                            <span className={cn(feature.highlighted && "font-bold text-gray-900 dark:text-white")}>
                              {feature.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <div className="pt-8">
                      <Link
                        href={
                          (plan as any).planKey === "enterprise"
                            ? "/contact"
                            : isAuthenticated && role === "ROLE_PROVIDER"
                              ? `/provider/settings/subscription?planId=${plan.originalId}`
                              : `/provider/register?planId=${plan.originalId}`
                        }
                        className="block w-full"
                      >
                        <button
                          type="button"
                          className={cn(
                            "w-full h-11 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2",
                            plan.isPopular
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#111]"
                          )}
                        >
                          <span>{tPricing(`plans.${plan.planKey}.button_text`, { defaultValue: "Comenzar Ahora" })}</span>
                          <ArrowRight className="w-4 h-4" strokeWidth={2} />
                        </button>
                      </Link>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}

          <p className="text-center mt-12 text-xs font-semibold text-gray-400">
            {tPricing("footer", { defaultValue: "Todos los planes incluyen prueba gratuita de 14 días. Sin permanencia forzada." })}
          </p>

        </div>
      </section>

    </div>
  );
}
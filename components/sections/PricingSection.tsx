"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles, CheckCircle2, CreditCard, Tag, HeartHandshake, Truck, Building2, ShieldCheck, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { useSessionStore } from "@/stores/SessionStore";
import { Link } from "@/i18n/routing";
import axiosInstance from "@/lib/axios";
import { BackendPlan, buildFeaturesForPlan } from "@/lib/subscriptionUtils";
import { QhSpinner } from "@/components/ui/QhSpinner";

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

const ANNUAL_DISCOUNT = 0.20; // 20% de descuento al pagar anual

const PricingSection: React.FC = () => {
  const t = useTranslations('Pricing');
  const locale = useLocale();
  const { isAuthenticated, role } = useSessionStore();
  const [isAnnual, setIsAnnual] = useState(false);
  const [rawPlans, setRawPlans] = useState<BackendPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await axiosInstance.get<BackendPlan[]>('/api/payments/plans');
        setRawPlans(data);
      } catch (err) {
        console.error("Error fetching plans:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const monthlyPlans = rawPlans.filter(p => p.billingInterval === "MONTHLY");
  const EXCHANGE_RATE = 20;

  const displayPlans: UIPlan[] = monthlyPlans
    .sort((a, b) => a.price - b.price)
    .map((bp) => {
      const nameLower = bp.name.toLowerCase();
      const isPopular = nameLower.includes("estándar") || nameLower.includes("prof");
      
      let planKey = "basic";
      if (nameLower.includes("gratis") || nameLower.includes("free")) planKey = "free";
      else if (nameLower.includes("estándar") || nameLower.includes("standard")) planKey = "standard";
      else if (nameLower.includes("premium")) planKey = "premium";
      else if (nameLower.includes("empresarial") || nameLower.includes("enterprise")) planKey = "enterprise";

      const displayPrice = locale === 'en' ? Math.round(bp.price / EXCHANGE_RATE) : bp.price;

      return {
        id: bp.stripePriceId || `plan_${bp.id}`,
        title: t(`plans.${planKey}.title`),
        description: t(`plans.${planKey}.description`),
        price: displayPrice,
        isPopular,
        features: planKey === 'enterprise'
          ? (t.raw(`plans.enterprise.features`) as string[]).map((f: string) => ({ title: f, highlighted: false }))
          : buildFeaturesForPlan(bp, isAnnual, t),
        originalId: bp.id,
        planKey
      };
    });

  return (
    <section id="pricing" className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
      <div className="container mx-auto px-6 md:px-12 xl:px-20 max-w-7xl">
        
        {/* ── ENCABEZADO Y SELECTOR DE FACTURACIÓN ─────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
          
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
              <CreditCard className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{t('badge', { defaultValue: "Planes & Membresías" })}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.12]">
              {t('title_start')}{" "}
              <span className="font-serif italic text-emerald-600 dark:text-emerald-400 font-normal">
                {t('title_highlight')}
              </span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium max-w-xl leading-relaxed pt-1">
              {t('description')}
            </p>
          </div>

          {/* Toggle Mensual / Anual (Format Pill) */}
          <div className="p-1.5 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200/80 dark:border-gray-800 flex items-center gap-1 shadow-sm shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              disabled={isLoading}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-bold transition-all",
                !isAnnual
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {t('billing.monthly', { defaultValue: "Pago Mensual" })}
            </button>

            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              disabled={isLoading}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
                isAnnual
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <span>{t('billing.annual', { defaultValue: "Pago Anual" })}</span>
              <span className={cn(
                "px-2 py-0.5 text-[10px] font-extrabold rounded-full",
                isAnnual ? "bg-emerald-800 text-white" : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
              )}>
                -20%
              </span>
            </button>
          </div>

        </div>

        {/* ── CONTENEDOR DE TARJETAS DE PLANES ────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
            <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs font-semibold text-gray-400 animate-pulse">
              Consultando catálogo oficial de suscripciones...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch w-full max-w-7xl mx-auto">
            
            {displayPlans.map((plan, index) => {
              const monthlyPrice = plan.price;
              const finalPrice = isAnnual ? Math.round(monthlyPrice * (1 - ANNUAL_DISCOUNT)) : monthlyPrice;

              return (
                <motion.div
                  key={plan.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "relative p-7 md:p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between group shadow-sm",
                    plan.isPopular
                      ? "bg-gray-900 dark:bg-[#0a0a0a] text-white border-2 border-emerald-500/60 shadow-xl"
                      : "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 hover:border-emerald-500/30"
                  )}
                >
                  {/* Badge de Plan Popular */}
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm shrink-0 whitespace-nowrap">
                      <Sparkles className="w-3 h-3" />
                      <span>{t('badges.popular', { defaultValue: "Más Recomendado" })}</span>
                    </div>
                  )}

                  <div className="space-y-6 pt-2">
                    
                    {/* Título & Descripción */}
                    <div className="space-y-1.5">
                      <h3 className={cn(
                        "text-xl font-bold tracking-tight",
                        plan.isPopular ? "text-white" : "text-gray-900 dark:text-white"
                      )}>
                        {plan.title}
                      </h3>
                      <p className={cn(
                        "text-xs font-medium leading-relaxed min-h-[36px]",
                        plan.isPopular ? "text-gray-300" : "text-gray-500 dark:text-gray-400"
                      )}>
                        {plan.description}
                      </p>
                    </div>

                    {/* Desglose de Precio */}
                    <div className={cn(
                      "pb-6 border-b",
                      plan.isPopular ? "border-gray-800" : "border-gray-100 dark:border-gray-800"
                    )}>
                      {plan.planKey === 'enterprise' ? (
                        <div className="py-2">
                          <span className={cn(
                            "text-2xl font-bold tracking-tight",
                            plan.isPopular ? "text-white" : "text-gray-900 dark:text-white"
                          )}>
                            {locale === 'en' ? 'Custom Quote' : 'A la Medida'}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-1">
                            <span className={cn(
                              "text-4xl sm:text-5xl font-bold font-mono tracking-tight",
                              plan.isPopular ? "text-white" : "text-gray-900 dark:text-white"
                            )}>
                              {locale === 'en' && finalPrice > 0 ? '~$' : '$'}{finalPrice}
                            </span>
                            <span className={cn(
                              "text-xs font-bold uppercase tracking-wider",
                              plan.isPopular ? "text-emerald-400" : "text-gray-400"
                            )}>
                              {locale === 'en' && finalPrice > 0 ? 'USD ' : ''}/{t('price_frequency', { defaultValue: "mes" })}
                            </span>
                          </div>

                          {/* Precio Original Tachado (Suscripción Anual) */}
                          {isAnnual && monthlyPrice > 0 && (
                            <div className="flex items-center gap-2 pt-1 text-xs">
                              <span className="text-gray-400 line-through font-mono">
                                {locale === 'en' ? '~$' : '$'}{monthlyPrice}
                              </span>
                              <span className="font-bold text-emerald-500 text-[10px] uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                20% Ahorro
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Lista de Beneficios */}
                    <ul className="space-y-3 pt-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                            plan.isPopular
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                          )}>
                            {feature.icon ? (
                              feature.icon
                            ) : (
                              <Check className="w-3 h-3" strokeWidth={3} />
                            )}
                          </div>

                          <span className={cn(
                            "text-xs leading-relaxed",
                            feature.highlighted
                              ? (plan.isPopular ? "text-white font-bold" : "text-gray-900 dark:text-white font-bold")
                              : (plan.isPopular ? "text-gray-300 font-medium" : "text-gray-500 dark:text-gray-400 font-medium")
                          )}>
                            {feature.title}
                          </span>
                        </li>
                      ))}
                    </ul>

                  </div>

                  {/* Botón CTA de Acción */}
                  <div className="pt-8">
                    <Link
                      href={
                        (plan as any).planKey === 'enterprise' 
                          ? '/contact' 
                          : (isAuthenticated && role === 'ROLE_PROVIDER' 
                              ? `/provider/settings/subscription?planId=${plan.originalId}` 
                              : `/provider/register?planId=${plan.originalId}`)
                      }
                      className={cn(
                        "w-full h-11 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 group",
                        plan.isPopular
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                      )}
                    >
                      <span>{t(`plans.${(plan as any).planKey}.button_text`, { defaultValue: "Seleccionar Plan" })}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                    </Link>
                  </div>

                </motion.div>
              );
            })}

          </div>
        )}

        {/* ── PLANES A LA MEDIDA: FUNDACIONES Y PROVEEDORES DE INSUMOS ── */}
        <div className="mt-16 pt-12 border-t border-gray-100 dark:border-gray-800">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {t('custom_plans.title', { defaultValue: "Planes Especializados a la Medida" })}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {t('custom_plans.subtitle', { defaultValue: "Soluciones institucionales adaptadas para organismos asistenciales y empresas del sector salud." })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Tarjeta Fundaciones */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 hover:border-rose-500/30 transition-all shadow-xs flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-2xs">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 px-3 py-1 rounded-full">
                    {t('custom_plans.foundations.badge', { defaultValue: "A la Medida / Subsidiado" })}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('custom_plans.foundations.title', { defaultValue: "Para Fundaciones, OSCs y Asistencia Social" })}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t('custom_plans.foundations.description', { defaultValue: "Padrón de beneficiarios con CURP, jornadas de salud con IA, motor de vouchers sin custodia de fondos y medición de impacto SROI para donantes." })}
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{t('custom_plans.foundations.f1', { defaultValue: "0% Comisión por donativos y recaudación" })}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{t('custom_plans.foundations.f2', { defaultValue: "Reportes de transparencia y rendición fiscal SAT" })}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{t('custom_plans.foundations.f3', { defaultValue: "Acompañamiento y onboarding institucional dedicado" })}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Link
                    href="/foundation/register"
                    className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{t('custom_plans.foundations.register_button', { defaultValue: "Registrar Fundación" })}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/foundations"
                    className="h-11 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>{t('custom_plans.foundations.features_button', { defaultValue: "Ver Características" })}</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-[11px] font-medium text-gray-400">{t('custom_plans.contact_question', { defaultValue: "¿Dudas o plan a la medida?" })}</span>
                  <Link
                    href="/contact?topic=foundation"
                    className="font-bold text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{t('custom_plans.contact_link', { defaultValue: "Hablar con un asesor" })}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Tarjeta Proveedores de Insumos */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 hover:border-blue-500/30 transition-all shadow-xs flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40 px-3 py-1 rounded-full">
                    {t('custom_plans.suppliers.badge', { defaultValue: "A la Medida por Volumen" })}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('custom_plans.suppliers.title', { defaultValue: "Para Proveedores, Fabricantes y Farmacias" })}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t('custom_plans.suppliers.description', { defaultValue: "Canal B2B para abastecer a clínicas y médicos, catálogo sanitario con control de lotes COFEPRIS, cotizaciones formales y monitoreo de cadena de frío IoT." })}
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{t('custom_plans.suppliers.f1', { defaultValue: "Multi-almacén, kardex y trazabilidad de lotes" })}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{t('custom_plans.suppliers.f2', { defaultValue: "Cotizador formal B2B y órdenes de compra con IVA" })}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{t('custom_plans.suppliers.f3', { defaultValue: "Integración técnica y asesoría comercial personalizada" })}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Link
                    href="/supplier/register"
                    className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{t('custom_plans.suppliers.register_button', { defaultValue: "Registrar como Proveedor" })}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/suppliers"
                    className="h-11 px-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>{t('custom_plans.suppliers.features_button', { defaultValue: "Ver Características" })}</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-[11px] font-medium text-gray-400">{t('custom_plans.contact_question', { defaultValue: "¿Dudas o plan a la medida?" })}</span>
                  <Link
                    href="/contact?topic=supplier"
                    className="font-bold text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{t('custom_plans.contact_link', { defaultValue: "Hablar con un asesor" })}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer de la sección */}
        <div className="text-center mt-12">
          <p className="text-xs font-semibold text-gray-400">
            {t('footer', { defaultValue: "Todos los precios incluyen IVA y la facturación es procesada mediante encriptación SSL de grado bancario." })}
          </p>
        </div>

      </div>
    </section>
  );
};

export default PricingSection;
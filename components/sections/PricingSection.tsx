"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useTranslations, useLocale } from "next-intl";
import { useSessionStore } from "@/stores/SessionStore";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { BackendPlan, buildFeaturesForPlan } from "@/lib/subscriptionUtils";

interface UIPlan {
  id: string;
  title: string;
  description: string;
  price: number;
  isPopular: boolean;
  features: { title: string; icon?: React.ReactNode; highlighted?: boolean }[];
  originalId: number;
}

const ANNUAL_DISCOUNT = 0.20; // 20% de descuento al pagar anual

const PricingSection: React.FC = () => {
  const t = useTranslations('Pricing');
  const locale = useLocale();
  const { isAuthenticated, role } = useSessionStore();
  const [isAnnual, setIsAnnual] = useState(false); // ✅ Mensual por defecto
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

  // ✅ Siempre usamos los planes MONTHLY como fuente de verdad.
  // Si el usuario elige anual, calculamos el descuento en el frontend.
  const monthlyPlans = rawPlans.filter(p => p.billingInterval === "MONTHLY");

  const EXCHANGE_RATE = 20;

 // Ordenar por precio ascendente y mapear a UIPlan
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

      // Conversión aproximada a USD si el idioma es inglés
      const displayPrice = locale === 'en' ? Math.round(bp.price / EXCHANGE_RATE) : bp.price;


      return {
        id: bp.stripePriceId || `plan_${bp.id}`,
        title: t(`plans.${planKey}.title`),
        description: t(`plans.${planKey}.description`),
        price: displayPrice,
        isPopular,
        features: buildFeaturesForPlan(bp, isAnnual, t),
        originalId: bp.id,
        planKey
      };
    });

  return (
    <section id="pricing" className="py-24 md:py-32 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        {/* Editorial Header */}
        <div className="max-w-3xl mb-20 md:mb-28 mx-auto text-center">
          <span className="inline-block border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-full text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-widest uppercase mb-6">
            {t('badge')}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
            {t('title_start')} <span className="text-slate-500 dark:text-slate-400 font-serif italic">{t('title_highlight')}</span>
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-light max-w-2xl mx-auto">
            {t('description')}
          </p>

          {/* Toggle Mensual/Anual Minimalista */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <span className={cn(
              "text-sm font-medium transition-colors duration-300",
              !isAnnual ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
            )}>
              {t('billing.monthly')}
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              disabled={isLoading}
              className="data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-white data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700"
            />
            <span className={cn(
              "text-sm font-medium transition-colors duration-300 flex items-center gap-3",
              isAnnual ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
            )}>
              {t('billing.annual')}
              <span className="inline-block border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide">
                {t('billing.discount')}
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Layout */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-slate-300 animate-spin" />
          </div>
        ) : (
          <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-2 lg:gap-0 border-t border-slate-200 dark:border-slate-800 max-w-[1400px] mx-auto pt-8 md:pt-0 items-start"
              style={{ '--plan-cols': displayPlans.length } as React.CSSProperties}
            >
              <style>{`@media (min-width: 1024px) { [style*="--plan-cols"] { grid-template-columns: repeat(var(--plan-cols), minmax(0, 1fr)) !important; } }`}</style>
            {displayPlans.map((plan, index) => {
              const monthlyPrice = plan.price;
              // ✅ Si es anual: precio mensual con 20% de descuento, redondeado sin decimales
              const finalPrice = isAnnual
                ? Math.round(monthlyPrice * (1 - ANNUAL_DISCOUNT))
                : monthlyPrice;
              const isMiddle = plan.isPopular;

              return (
                <motion.div
                  key={plan.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "relative p-6 lg:p-8 flex flex-col transition-all duration-300 group/pricing",
                    isMiddle 
                      ? "bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 z-20 md:scale-[1.03]" 
                      : "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/20 rounded-3xl border border-transparent z-10"
                  )}
                >
                  {/* Glow behind popular plan */}
                  {isMiddle && (
                    <div className="absolute -inset-4 bg-slate-200/50 dark:bg-slate-800/20 blur-2xl opacity-50 -z-10 rounded-3xl pointer-events-none" />
                  )}

                  {/* Etiqueta Popular si aplica */}
                  {plan.isPopular && (
                    <div className="absolute top-0 left-10 md:-top-4 md:left-1/2 md:-translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-slate-900/20 dark:shadow-white/20">
                      {t('badges.popular')}
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-medium text-slate-900 dark:text-white mb-2">
                      {plan.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-light min-h-[40px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Precio Editorial */}
                  <div className="mb-10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
                        {locale === 'en' && finalPrice > 0 ? '~$' : '$'}{finalPrice}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-widest">
                        {locale === 'en' && finalPrice > 0 ? 'USD ' : ''}/{t('price_frequency')}
                      </span>
                    </div>
                    {/* ✅ Precio original tachado cuando es anual y el plan no es gratis */}
                    {isAnnual && monthlyPrice > 0 && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-slate-400 dark:text-slate-500 text-sm line-through">
                          {locale === 'en' ? '~$' : '$'}{monthlyPrice}{locale === 'en' ? ' USD' : ''}/{t('price_frequency')}
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          -20%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Lista de Features Líneas */}
                  <ul className="space-y-6 mb-12 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className={cn("p-1 rounded-full shrink-0 mt-0.5", feature.highlighted ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white")}>
                          {feature.icon ? feature.icon : <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                          {feature.title}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Botón CTA */}
                  <Link
                    href={isAuthenticated && role === 'PROVIDER' ? `/provider/settings/subscription?planId=${plan.originalId}` : `/provider/register?planId=${plan.originalId}`}
                    className={cn(
                      "inline-flex items-center justify-center w-full py-4 rounded-xl text-sm font-semibold tracking-wide transition-colors",
                      isMiddle
                        ? "bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900"
                        : "border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    {t(`plans.${(plan as any).planKey}.button_text`)}
                  </Link>

                </motion.div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-24 text-sm text-slate-500 font-light">
          {t('footer')}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
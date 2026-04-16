"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { useSessionStore } from "@/stores/SessionStore";
import Link from "next/link";

const PricingSection: React.FC = () => {
  const t = useTranslations('Pricing');
  const { isAuthenticated, role } = useSessionStore();
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      title: t('plans.basic.title'),
      price: 0,
      description: t('plans.basic.description'),
      features: [
        t('plans.basic.features.0'),
        t('plans.basic.features.1'),
        t('plans.basic.features.2'),
        t('plans.basic.features.3')
      ],
      includes: ["Búsqueda", "Reservas"],
      isPopular: false,
      buttonText: t('plans.basic.button_text'),
      notIncluded: []
    },
    {
      title: t('plans.premium.title'),
      price: 9.99,
      description: t('plans.premium.description'),
      features: [
        t('plans.premium.features.0'),
        t('plans.premium.features.1'),
        t('plans.premium.features.2'),
        t('plans.premium.features.3'),
        t('plans.premium.features.4')
      ],
      includes: ["Búsqueda", "Reservas", "Chat"],
      isPopular: true,
      buttonText: t('plans.premium.button_text'),
      notIncluded: []
    },
    {
      title: t('plans.business.title'),
      price: 24.99,
      description: t('plans.business.description'),
      features: [
        t('plans.business.features.0'),
        t('plans.business.features.1'),
        t('plans.business.features.2'),
        t('plans.business.features.3'),
        t('plans.business.features.4'),
        t('plans.business.features.5')
      ],
      includes: ["Búsqueda", "Reservas", "Chat", "Gestión"],
      isPopular: false,
      buttonText: t('plans.business.button_text'),
      notIncluded: []
    }
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12 xl:px-24">

        {/* Editorial Header */}
        <div className="max-w-3xl mb-20 md:mb-28 mx-auto text-center">
          <span className="inline-block border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-full text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-widest uppercase mb-6">
            {t('badge')}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
            {t('title_start')} <span className="text-medical-600 dark:text-medical-400 font-serif italic">{t('title_highlight')}</span>
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
              className="data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-white data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700"
            />
            <span className={cn(
              "text-sm font-medium transition-colors duration-300 flex items-center gap-3",
              isAnnual ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
            )}>
              {t('billing.annual')}
              <span className="inline-block border border-medical-200 dark:border-medical-800 bg-medical-50 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400 px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide">
                {t('billing.discount')}
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Layout - Borderless Columns */}
        <div className="grid md:grid-cols-3 gap-0 border-t border-slate-200 dark:border-slate-800 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const finalPrice = isAnnual ? Math.round(plan.price * 0.8) : plan.price;
            const isMiddle = index === 1;

            return (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "relative p-10 flex flex-col transition-all duration-300",
                  isMiddle ? "bg-[#FAFAFA] dark:bg-[#0A0A0A] md:border-x border-slate-200 dark:border-slate-800 md:-mt-8 md:-mb-8 md:pt-18 md:pb-18 md:rounded-2xl" : "hover:bg-slate-50 dark:hover:bg-slate-800/20"
                )}
              >
                {/* Etiqueta Popular si aplica */}
                {plan.isPopular && (
                  <div className="absolute top-0 left-10 md:-top-4 md:left-1/2 md:-translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase">
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
                <div className="mb-10 flex items-baseline gap-2">
                  <span className="text-5xl font-light text-slate-900 dark:text-white tracking-tighter">
                    ${finalPrice}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-light uppercase tracking-widest">
                    /{t('price_frequency')}
                  </span>
                </div>

                {/* Lista de Features Líneas */}
                <ul className="space-y-6 mb-12 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <Check className="w-5 h-5 text-slate-900 dark:text-white shrink-0" strokeWidth={1.5} />
                      <span className="text-slate-600 dark:text-slate-300 font-light leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                  {plan.notIncluded?.map((feature, i) => (
                    <li key={`not-${i}`} className="flex items-start gap-4 opacity-40 grayscale">
                      <X className="w-5 h-5 text-slate-400 shrink-0" strokeWidth={1.5} />
                      <span className="text-slate-500 font-light leading-relaxed line-through decoration-slate-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Botón CTA */}
                <Link
                  href={isAuthenticated && role === 'PROVIDER' ? '/provider/settings/subscription' : '/provider/register'}
                  className={cn(
                    "inline-flex items-center justify-center w-full py-4 rounded-xl text-sm font-semibold tracking-wide transition-colors",
                    plan.isPopular
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                      : "border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {plan.buttonText}
                </Link>

              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-24 text-sm text-slate-500 font-light">
          {t('footer')}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
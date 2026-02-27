"use client";
import React from "react";
import { motion } from "framer-motion";
import { Calendar, CreditCard, FileText, Video, Activity, Zap, Shield, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEATURES } from "@/lib/constants";
import { useTranslations } from "next-intl";

const iconMap: Record<string, React.ElementType> = {
  Calendar, CreditCard, FileText, Video, Activity, Zap, Shield, Users
};

const FeaturesSection = () => {
  const t = useTranslations('Features');

  return (
    <section id="features" className="py-24 md:py-32 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12 xl:px-24">

        {/* Header - Minimalist Editorial */}
        <div className="max-w-3xl mb-24">
          {/* Pill Badge Minimalista */}
          <div className="inline-block border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 backdrop-blur-sm mb-6">
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
              {t('badge')}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
            {t('title_start')}
            <span className="text-medical-600 dark:text-medical-400 font-serif italic ml-2">
              {t('title_highlight')}
            </span>
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-light max-w-2xl">
            {t('description')}
          </p>
        </div>

        {/* Asymmetric Minimalist Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 lg:gap-y-24">
          {FEATURES.map((feature: any, index: number) => {
            const IconComponent = iconMap[feature.iconName] || Activity;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group relative"
              >
                {/* Decorador de línea superior muy fino */}
                <div className="absolute -top-6 left-0 w-12 h-px bg-medical-600/30 dark:bg-medical-400/30 transition-all duration-500 group-hover:w-full" />

                <div className="flex flex-col h-full">
                  <div className="mb-6 inline-flex items-center justify-center text-medical-600 dark:text-medical-400">
                    <IconComponent className="w-8 h-8" strokeWidth={1} />
                  </div>

                  <h3 className="text-2xl font-medium text-slate-900 dark:text-white mb-4 tracking-tight">
                    {t(`items.${index}.title`)}
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light mb-8 flex-grow">
                    {t(`items.${index}.description`)}
                  </p>

                  <div className="mt-auto">
                    <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white hover:opacity-70 transition-opacity">
                      <span className="border-b border-transparent group-hover:border-slate-900 dark:group-hover:border-white transition-colors pb-0.5">
                        {t('explore')}
                      </span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer CTA Minimalist */}
        <div className="mt-32 pt-16 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 dark:text-slate-400 text-lg font-light">
            {t('cta_text')}
          </p>
          <a href="#" className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-none text-sm tracking-wide">
            {t('cta_button')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
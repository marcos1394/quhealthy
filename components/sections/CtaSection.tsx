"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSessionStore } from "@/stores/SessionStore";

const CtaSection: React.FC = () => {
  const t = useTranslations('Cta');
  const { isAuthenticated, role } = useSessionStore();

  const benefits = [
    t('benefits.0'),
    t('benefits.1'),
    t('benefits.2')
  ];

  return (
    <section className="py-24 md:py-32 bg-white dark:bg-slate-900 transition-colors duration-300 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-6 md:px-12 xl:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto flex flex-col items-center text-center"
        >
          {/* Headline Editorial */}
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-slate-900 dark:text-white leading-[1.05] mb-8">
            {t('title_start')} <br className="hidden md:block" />
            <span className="text-medical-600 dark:text-medical-400 font-serif italic">
              {t('title_highlight')}
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-light max-w-3xl leading-relaxed mb-12 relative">
            {t('description')}
          </p>

          {/* Benefits Inline Limpios */}
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 mb-14">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-medical-600 dark:text-medical-400" strokeWidth={1.5} />
                <span className="text-slate-600 dark:text-slate-300 font-medium text-lg">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
            <Link
              href={isAuthenticated ? (role === 'PROVIDER' ? '/dashboard' : '/appointments') : '/register'}
              className="group inline-flex items-center justify-center gap-2 px-10 py-5 w-full sm:w-auto rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-lg transition-all shadow-none"
            >
              {isAuthenticated ? "Ir a mi Panel" : t('button_primary')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            {!isAuthenticated && (
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-10 py-5 w-full sm:w-auto rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-900 dark:text-white font-medium text-lg transition-all"
              >
                {t('button_secondary')}
              </Link>
            )}
          </div>

          {/* Trust indicator - Fine print */}
          <p className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-16 text-slate-400 dark:text-slate-500 text-sm font-light uppercase tracking-widest">
            {t('trust_indicator')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
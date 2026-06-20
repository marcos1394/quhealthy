"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    <section className="py-24 md:py-32 bg-black dark:bg-white transition-colors duration-300 selection:bg-white/30 dark:selection:bg-black/30">
      <div className="container mx-auto px-6 md:px-12 xl:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto flex flex-col items-center text-center"
        >
          {/* Headline Editorial */}
          <h2 className="text-5xl md:text-6xl lg:text-[6rem] font-semibold tracking-tight text-white dark:text-black leading-[1.05] mb-8">
            {t('title_start')} <br className="hidden md:block" />
            <span className="font-serif italic text-gray-400 dark:text-gray-500 font-light pr-2">
              {t('title_highlight')}
            </span>
          </h2>

          <p className="text-lg md:text-xl text-gray-400 dark:text-gray-500 font-light max-w-2xl leading-relaxed mb-16">
            {t('description')}
          </p>

          {/* Benefits Inline (Estilo Arquitectónico Suizo) */}
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 mb-16">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {/* Cuadrado geométrico en lugar de un icono de check para mayor rigor visual */}
                <div className="w-1.5 h-1.5 bg-white dark:bg-black" /> 
                <span className="text-[10px] font-bold uppercase tracking-widest text-white dark:text-black">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          {/* CTAs a corte vivo */}
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
            <Link
              href={isAuthenticated ? (role === 'PROVIDER' ? '/dashboard' : '/appointments') : '/provider/register'}
              className="group inline-flex items-center justify-center bg-white dark:bg-black text-black dark:text-white px-8 h-14 rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors w-full sm:w-auto"
            >
              {isAuthenticated ? "Ir a mi Panel" : t('button_primary')}
              <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
            </Link>

            {!isAuthenticated && (
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center border border-white/30 dark:border-black/30 text-white dark:text-black px-8 h-14 rounded-none text-[10px] font-bold uppercase tracking-widest hover:border-white dark:hover:border-black transition-colors w-full sm:w-auto"
              >
                {t('button_secondary')}
              </Link>
            )}
          </div>

          {/* Trust indicator - Blueprint Footer */}
          <div className="w-full max-w-lg mt-24 pt-8 border-t border-white/20 dark:border-black/20">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {t('trust_indicator')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
"use client";

/* eslint-disable react-doctor/prefer-module-scope-static-value */

import React from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  Calendar,
  Map,
  Search,
  MessageSquare,
  Star,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { FEATURES } from "@/lib/constants";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mapeo seguro de los iconos que vienen de constants.ts
const iconMap: Record<string, React.ElementType> = {
  UserCheck,
  Calendar,
  Map,
  Search,
  MessageSquare,
  Star,
};

const FeaturesSection = () => {
  const t = useTranslations("Features");

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
    <section
      id="features"
      className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 border-b border-gray-100 dark:border-gray-800 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30"
    >
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        
        {/* ── ENCABEZADO EDITORIAL ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
          <div className="max-w-3xl space-y-3">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{t("badge", { defaultValue: "Capacidades de la Plataforma" })}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.12]">
              {t("title_start")}{" "}
              <span className="font-serif italic text-emerald-600 dark:text-emerald-400 font-normal">
                {t("title_highlight")}
              </span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium max-w-xl leading-relaxed pt-1">
              {t("description")}
            </p>
          </div>

          <div className="hidden md:block pb-1">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm group"
            >
              <span>{t("cta_button", { defaultValue: "Explorar Funcionalidades" })}</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
            </Link>
          </div>
        </div>

        {/* ── GRILLA DE CARACTERÍSTICAS (TARJETAS INDEPENDIENTES) ─────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {FEATURES.map((feature: any, index: number) => {
            const IconComponent = feature.icon || UserCheck;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-7 md:p-8 shadow-sm hover:border-emerald-500/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-6">
                  
                  {/* Icono + Número de Ítem */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-105 transition-transform">
                      <IconComponent className="w-6 h-6" strokeWidth={2} />
                    </div>

                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/40">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Título & Descripción */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {t(`items.${index}.title`)}
                    </h3>

                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {t(`items.${index}.description`)}
                    </p>
                  </div>

                </div>

                {/* Enlace Acción */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800/80 mt-6">
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                  >
                    <span>{t("explore", { defaultValue: "Conocer más" })}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                  </Link>
                </div>

              </motion.div>
            );
          })}
        </motion.div>

        {/* ── BOTÓN CTA INFERIOR (MÓVIL) ──────────────────────────────────── */}
        <div className="mt-10 md:hidden flex justify-center">
          <Link
            href="/discover"
            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 group"
          >
            <span>{t("cta_button", { defaultValue: "Explorar Funcionalidades" })}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
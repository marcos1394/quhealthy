"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  Building2,
  HeartHandshake,
  ShieldCheck,
  Award,
  Activity,
  Stethoscope,
  Users,
  TrendingUp,
  BarChart3,
  Sparkles,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  Globe,
  FileText,
  Check,
  ChevronDown,
  Lock,
  Eye,
  Heart,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FoundationsLandingPage() {
  const t = useTranslations("PublicFoundations");
  const locale = useLocale();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const capabilities = [
    {
      icon: Users,
      color: "rose",
      title: t("capabilities.c1_title"),
      description: t("capabilities.c1_desc"),
    },
    {
      icon: FileSpreadsheet,
      color: "indigo",
      title: t("capabilities.c2_title"),
      description: t("capabilities.c2_desc"),
    },
    {
      icon: Activity,
      color: "emerald",
      title: t("capabilities.c3_title"),
      description: t("capabilities.c3_desc"),
    },
    {
      icon: Lock,
      color: "purple",
      title: t("capabilities.c4_title"),
      description: t("capabilities.c4_desc"),
    },
    {
      icon: BarChart3,
      color: "blue",
      title: t("capabilities.c5_title"),
      description: t("capabilities.c5_desc"),
    },
    {
      icon: Globe,
      color: "amber",
      title: t("capabilities.c6_title"),
      description: t("capabilities.c6_desc"),
    },
  ];

  const ecosystemSteps = [
    {
      num: "01",
      icon: Building2,
      title: t("ecosystem.step1_title"),
      description: t("ecosystem.step1_desc"),
    },
    {
      num: "02",
      icon: Users,
      title: t("ecosystem.step2_title"),
      description: t("ecosystem.step2_desc"),
    },
    {
      num: "03",
      icon: Award,
      title: t("ecosystem.step3_title"),
      description: t("ecosystem.step3_desc"),
    },
    {
      num: "04",
      icon: Stethoscope,
      title: t("ecosystem.step4_title"),
      description: t("ecosystem.step4_desc"),
    },
  ];

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans overflow-hidden">
      {/* 🚀 1. HERO SECTION */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden border-b border-slate-200/80 dark:border-slate-800">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Top Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold tracking-wide"
            >
              <HeartHandshake className="w-4 h-4 text-rose-600" />
              {t("hero.badge")}
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none"
            >
              {t("hero.title_start")}
              <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
                {t("hero.title_highlight")}
              </span>
              {t("hero.title_end")}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto"
            >
              {t("hero.description")}
            </motion.p>

            {/* CTA Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link href="/onboarding/foundation">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-8 py-6 rounded-2xl shadow-lg shadow-rose-600/25 flex items-center gap-2 group cursor-pointer"
                >
                  {t("hero.cta_onboarding")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/discover">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm px-8 py-6 rounded-2xl cursor-pointer"
                >
                  {t("hero.cta_explore")}
                </Button>
              </Link>
            </motion.div>

            {/* Trust Badges Bar */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-left"
            >
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {t("hero.badges.donatary")}
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <Award className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {t("hero.badges.cluni")}
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <Lock className="w-5 h-5 text-purple-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {t("hero.badges.nom004")}
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <BarChart3 className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {t("hero.badges.sroi")}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 📊 2. STATS OVERVIEW BANNER */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                100%
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("stats.coverage")}
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-rose-600">
                0% Comisión
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Sin Custodia de Fondos
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-indigo-600">
                3.8x
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("stats.sroi")}
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-emerald-600">
                NOM-004
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Soberanía & Confidencialidad
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ⚡ 3. LAS 6 GRANDES CAPACIDADES INSTITUCIONALES */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3.5 h-3.5" />
              {t("capabilities.badge")}
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t("capabilities.title")}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              {t("capabilities.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                        cap.color === "rose" && "bg-rose-50 dark:bg-rose-950/50 text-rose-600",
                        cap.color === "indigo" && "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600",
                        cap.color === "emerald" && "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600",
                        cap.color === "purple" && "bg-purple-50 dark:bg-purple-950/50 text-purple-600",
                        cap.color === "blue" && "bg-blue-50 dark:bg-blue-950/50 text-blue-600",
                        cap.color === "amber" && "bg-amber-50 dark:bg-amber-950/50 text-amber-600"
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {cap.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {cap.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-slate-400 group-hover:text-rose-600 transition-colors">
                    <span>Acreditado QuHealthy</span>
                    <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🔄 4. ECOSISTEMA COLABORATIVO (FUNDACIÓN ↔ PACIENTE ↔ MÉDICOS) */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
              <Activity className="w-3.5 h-3.5" />
              {t("ecosystem.badge")}
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t("ecosystem.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecosystemSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 relative flex flex-col justify-between space-y-4 hover:border-rose-500/50 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-rose-500 font-mono">
                        {step.num}
                      </span>
                      <div className="p-2 rounded-xl bg-slate-700 text-slate-300">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white">{step.title}</h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 w-full" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ⚖️ 5. SEGURIDAD & MARCO JURÍDICO (SAT / LFPDPPP / NOM-004) */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("compliance.badge")}
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t("compliance.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("compliance.sat_title")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("compliance.sat_desc")}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("compliance.nom_title")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("compliance.nom_desc")}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("compliance.lfpdppp_title")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("compliance.lfpdppp_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ❓ 6. FAQ ACCORDION SECTION */}
      <section className="py-20 bg-slate-100/70 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5" />
              {t("faq.badge")}
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight">
              {t("faq.title")}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0",
                        isOpen && "rotate-180 text-rose-600"
                      )}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🚀 7. FINAL CTA BANNER */}
      <section className="py-20 lg:py-24 bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {t("cta.title")}
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t("cta.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/onboarding/foundation">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm px-8 py-6 rounded-2xl shadow-xl shadow-rose-600/30 flex items-center gap-2 cursor-pointer"
              >
                {t("cta.button_onboarding")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/20 hover:bg-white/10 text-white font-bold text-sm px-8 py-6 rounded-2xl cursor-pointer"
              >
                {t("cta.button_contact")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

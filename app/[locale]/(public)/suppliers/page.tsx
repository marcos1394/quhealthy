"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import {
  Truck,
  Boxes,
  ThermometerSnowflake,
  ShieldCheck,
  Award,
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
  Building2,
  DollarSign,
  PackageCheck,
  Activity,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SuppliersLandingPage() {
  const t = useTranslations("PublicSuppliers");
  const locale = useLocale();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const capabilities = [
    {
      icon: Boxes,
      color: "blue",
      title: t("capabilities.c1_title"),
      description: t("capabilities.c1_desc"),
    },
    {
      icon: DollarSign,
      color: "emerald",
      title: t("capabilities.c2_title"),
      description: t("capabilities.c2_desc"),
    },
    {
      icon: FileText,
      color: "indigo",
      title: t("capabilities.c3_title"),
      description: t("capabilities.c3_desc"),
    },
    {
      icon: Stethoscope,
      color: "purple",
      title: t("capabilities.c4_title"),
      description: t("capabilities.c4_desc"),
    },
    {
      icon: ThermometerSnowflake,
      color: "cyan",
      title: t("capabilities.c5_title"),
      description: t("capabilities.c5_desc"),
    },
    {
      icon: Warehouse,
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
      icon: Layers,
      title: t("ecosystem.step2_title"),
      description: t("ecosystem.step2_desc"),
    },
    {
      num: "03",
      icon: FileSpreadsheet,
      title: t("ecosystem.step3_title"),
      description: t("ecosystem.step3_desc"),
    },
    {
      num: "04",
      icon: PackageCheck,
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Top Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide"
            >
              <Truck className="w-4 h-4 text-blue-600" />
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
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
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
              <Link href="/supplier/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-6 rounded-2xl shadow-lg shadow-blue-600/25 flex items-center gap-2 group cursor-pointer"
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
                  {t("hero.badges.cofepris")}
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <ThermometerSnowflake className="w-5 h-5 text-cyan-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {t("hero.badges.coldchain")}
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <DollarSign className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {t("hero.badges.b2b")}
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <Stethoscope className="w-5 h-5 text-purple-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {t("hero.badges.rentals")}
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
                +2,500
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("stats.hospitals")}
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-blue-600">
                +15,000
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("stats.products")}
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-emerald-600">
                99.8%
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("stats.compliance")}
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-indigo-600">
                &lt; 15 min
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("stats.quotes")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ 3. PLATFORM CAPABILITIES GRID */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-[#0a0a0a] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              {t("capabilities.badge")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("capabilities.title")}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              {t("capabilities.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {capabilities.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-blue-500/30 transition-all group"
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                      item.color === "blue" && "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
                      item.color === "emerald" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
                      item.color === "indigo" && "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
                      item.color === "purple" && "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
                      item.color === "cyan" && "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400",
                      item.color === "amber" && "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                    )}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🔄 4. HOW IT WORKS / COMMERCIAL WORKFLOW */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              {t("ecosystem.badge")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("ecosystem.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {ecosystemSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200/70 dark:border-slate-700/60 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-blue-600 dark:text-blue-400">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-2xs">
                      <StepIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 📜 5. COMPLIANCE & QUALITY GUARANTEES */}
      <section className="py-20 bg-slate-50 dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-8">
            <div className="max-w-2xl space-y-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                {t("compliance.badge")}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold">
                {t("compliance.title")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
              <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/10">
                <h4 className="font-bold text-blue-400 text-base">{t("compliance.cofepris_title")}</h4>
                <p className="text-slate-300 leading-relaxed">{t("compliance.cofepris_desc")}</p>
              </div>

              <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/10">
                <h4 className="font-bold text-emerald-400 text-base">{t("compliance.nom072_title")}</h4>
                <p className="text-slate-300 leading-relaxed">{t("compliance.nom072_desc")}</p>
              </div>

              <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/10">
                <h4 className="font-bold text-cyan-400 text-base">{t("compliance.cold_title")}</h4>
                <p className="text-slate-300 leading-relaxed">{t("compliance.cold_desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💎 6. PLANES Y MODELOS COMERCIALES (A LA MEDIDA) */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("pricing.badge")}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t("pricing.title")}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              {t("pricing.subtitle")}
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold uppercase tracking-wider">
                  {t("pricing.plan_tag")}
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold">
                    {t("pricing.plan_title")}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-blue-400">{t("pricing.plan_price")}</span>
                    <span className="text-xs text-slate-400">{t("pricing.plan_price_period")}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {t("pricing.plan_description")}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link href="/supplier/register">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-8 py-5 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{t("hero.cta_onboarding")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Link href="/contact?topic=supplier">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto border-white/20 hover:bg-white/10 text-white font-bold text-xs px-6 py-5 rounded-2xl cursor-pointer"
                    >
                      <span>{t("pricing.cta_button")}</span>
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  {t("pricing.included_title")}
                </h4>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{t("pricing.f1_title")}:</strong> {t("pricing.f1_desc")}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{t("pricing.f2_title")}:</strong> {t("pricing.f2_desc")}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{t("pricing.f3_title")}:</strong> {t("pricing.f3_desc")}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{t("pricing.f4_title")}:</strong> {t("pricing.f4_desc")}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{t("pricing.f5_title")}:</strong> {t("pricing.f5_desc")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ❓ 7. FAQS ACCORDION */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              {t("faq.badge")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("faq.title")}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all bg-slate-50/50 dark:bg-slate-800/30"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300",
                      openFaq === idx && "rotate-180 text-blue-600"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/50 dark:border-slate-800 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 7. FINAL CTA BANNER */}
      <section className="py-20 bg-blue-600 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            {t("cta.title")}
          </h2>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
            {t("cta.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/supplier/register">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-blue-900 hover:bg-slate-100 font-extrabold text-sm px-8 py-6 rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer"
              >
                {t("cta.button_onboarding")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/contact?topic=supplier">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 font-bold text-sm px-8 py-6 rounded-2xl cursor-pointer"
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

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
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
  Mail,
  Calendar,
  Zap,
  Clock,
  ExternalLink,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FoundationsLandingPage() {
  const t = useTranslations("PublicFoundations");
  const locale = useLocale();

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const workflowSteps = [
    {
      num: "01",
      icon: Building2,
      title: t("ecosystem.step1_title"),
      description: t("ecosystem.step1_desc"),
      pill: "Acreditación CLUNI & SAT",
      detail: "La fundación configura sus causas benéficas, convenios médicos y criterios socioeconómicos de elegibilidad en su portal oficial.",
      badgeColor: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
    },
    {
      num: "02",
      icon: Users,
      title: t("ecosystem.step2_title"),
      description: t("ecosystem.step2_desc"),
      pill: "Padrón Único con CURP",
      detail: "Censo digital con prevención de duplicidades vía RENAPO. Registro ágil en brigadas comunitarias o postulación directa del paciente en línea.",
      badgeColor: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40"
    },
    {
      num: "03",
      icon: Award,
      title: t("ecosystem.step3_title"),
      description: t("ecosystem.step3_desc"),
      pill: "Voucher No Custodial",
      detail: "Trabajo Social evalúa el estudio socioeconómico y autoriza un FoundationVoucher trazable con QR para consultas, cirugías o medicinas.",
      badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/40"
    },
    {
      num: "04",
      icon: Stethoscope,
      title: t("ecosystem.step4_title"),
      description: t("ecosystem.step4_desc"),
      pill: "Rendición SROI & SAT",
      detail: "El beneficiario acude a la red médica aliada. La redención se certifica con folio clínico oficial y genera métricas de impacto para donantes.",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-rose-100 dark:selection:bg-rose-950/30 transition-colors duration-500 overflow-hidden">
      
      {/* ── 1. HERO ASIMÉTRICO CON MOCKUP DE IMPACTO EN VIVO ─────────────────── */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
        {/* Luces ambientales difuminadas */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Columna Izquierda: Mensaje Editorial y Propuesta */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Badge de Entrada */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-bold tracking-wide shadow-2xs">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>{t("hero.badge")}</span>
              </div>

              {/* Titular Editorial */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.12]">
                {t("hero.title_start")}
                <span className="font-serif italic text-rose-600 dark:text-rose-400 font-normal">
                  {t("hero.title_highlight")}
                </span>
                {t("hero.title_end")}
              </h1>

              {/* Descripción */}
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl font-normal">
                {t("hero.description")}
              </p>

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link href="/foundation/register">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 px-7 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>{t("hero.cta_onboarding")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/contact?topic=foundation">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-12 px-7 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Mail className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>{t("pricing.cta_button")}</span>
                  </Button>
                </Link>
              </div>

              {/* Micro-pills de Confianza y Cumplimiento */}
              <div className="pt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("hero.badges.donatary")}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-[11px] font-semibold">
                  <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{t("hero.badges.cluni")}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-[11px] font-semibold">
                  <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>{t("hero.badges.nom004")}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-[11px] font-semibold">
                  <BarChart3 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>{t("hero.badges.sroi")}</span>
                </div>
              </div>
            </motion.div>

            {/* Columna Derecha: Live Product UI Mockup (Simulación de Panel Social) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="lg:col-span-5 relative"
            >
              {/* Contenedor Principal Glassmorphism */}
              <div className="rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 p-6 shadow-xl relative overflow-hidden space-y-5">
                
                {/* Header del Mockup */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-xs">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">Panel Asistencial QuHealthy</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Sincronización RENAPO Activa
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                    I.A.P. / A.C.
                  </span>
                </div>

                {/* Tarjeta 1: Ficha de Beneficiario Validada */}
                <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121212] border border-gray-100 dark:border-gray-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center text-xs font-bold">
                        ME
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">
                          {t("mockup.beneficiary_name", { defaultValue: "María Elena Ramos Ortiz" })}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">CURP: RAOM780412MDFRRN09</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/40">
                      <CheckCircle2 className="w-3 h-3" />
                      {t("mockup.curp_verified", { defaultValue: "CURP Validado" })}
                    </span>
                  </div>
                </div>

                {/* Tarjeta 2: Jornada Comunitaria con Progreso */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Jornada Activa</span>
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">En Campo</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("mockup.campaign_title", { defaultValue: "Jornada Oftalmológica & Metabólica" })}
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-500">
                      <span>{t("mockup.campaign_progress", { defaultValue: "84% de la meta comunitaria" })}</span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">420/500 pacientes</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-rose-500 to-indigo-600 h-2 rounded-full w-[84%] transition-all duration-1000" />
                    </div>
                  </div>
                </div>

                {/* Dual Grid: SROI + Voucher */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-[#111] border border-indigo-100 dark:border-indigo-900/30">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {t("mockup.sroi_title", { defaultValue: "Retorno Social SROI" })}
                    </p>
                    <p className="text-lg font-black text-gray-900 dark:text-white mt-1">
                      {t("mockup.sroi_val", { defaultValue: "$3.80 MXN" })}
                    </p>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {t("mockup.sroi_sub", { defaultValue: "por cada $1 MXN invertido" })}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-[#111] border border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      <QrCode className="w-3 h-3" />
                      <span>{t("mockup.voucher_status", { defaultValue: "Voucher Canjeado" })}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white mt-1.5 truncate">
                      {t("mockup.voucher_clinic", { defaultValue: "Clínica San Ángel" })}
                    </p>
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">0% comisión QuHealthy</p>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 2. SOCIAL IMPACT BAR (MÉTRICAS CON PROFUNDIDAD) ────────────────── */}
      <section className="py-10 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">100%</h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {t("stats.coverage")}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">0% Comisión</h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {t("stats.commission_desc", { defaultValue: "Sin Custodia de Fondos" })}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">3.8x SROI</h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {t("stats.sroi")}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">NOM-004</h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {t("stats.confidentiality", { defaultValue: "Soberanía Clínica" })}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. BENTO GRID DE CAPACIDADES INSTITUCIONALES ───────────────────── */}
      <section className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505]">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("capabilities.badge")}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("capabilities.title")}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("capabilities.subtitle")}
            </p>
          </div>

          {/* Bento Grid Asimétrico */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Bento 1: Padrón y Dictamen Social (Grande - 7 cols) */}
            <div className="md:col-span-7 p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-6 group hover:border-rose-500/30 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("capabilities.c1_title")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("capabilities.c1_desc")}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Bandeja digital para Trabajadoras Sociales
                </span>
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">CURP 18 dígitos</span>
              </div>
            </div>

            {/* Bento 2: Motor de Vouchers No Custodial (5 cols) */}
            <div className="md:col-span-5 p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-6 group hover:border-indigo-500/30 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("capabilities.c2_title")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("capabilities.c2_desc")}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>0% Custodia de Fondos • Transparencia Total</span>
              </div>
            </div>

            {/* Bento 3: Jornadas de Salud con IA (4 cols) */}
            <div className="md:col-span-4 p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-6 group hover:border-emerald-500/30 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("capabilities.c3_title")}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("capabilities.c3_desc")}
                </p>
              </div>

              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Detección Temprana en Campo
              </span>
            </div>

            {/* Bento 4: Social BI, SROI & Rendición SAT (8 cols) */}
            <div className="md:col-span-8 p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-6 group hover:border-rose-500/30 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("capabilities.c5_title")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("capabilities.c5_desc")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 text-[11px] font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Reportes para Patronato y Convocatorias
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 text-[11px] font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  Sustento de Donativos Deducibles SAT
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 4. SIMULADOR INTERACTIVO DEL FLUJO ASISTENCIAL (TABS) ───────────── */}
      <section className="py-20 md:py-28 bg-white dark:bg-[#0a0a0a] border-y border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900/40">
              <Layers className="w-3.5 h-3.5" />
              <span>{t("ecosystem.badge")}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("ecosystem.title")}
            </h2>
          </div>

          {/* Navegación por Tabs Interactivos */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeWorkflowTab === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveWorkflowTab(idx)}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2",
                    isActive
                      ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 shadow-sm"
                      : "bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-black font-mono", isActive ? "text-rose-600 dark:text-rose-400" : "text-gray-400")}>
                      {step.num}
                    </span>
                    <Icon className={cn("w-4 h-4", isActive ? "text-rose-600 dark:text-rose-400" : "text-gray-400")} />
                  </div>
                  <p className={cn("text-xs font-bold truncate", isActive ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400")}>
                    {step.title}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Card Detallada de la Fase Seleccionada */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeWorkflowTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="p-8 sm:p-12 rounded-3xl bg-gray-50/70 dark:bg-[#111] border border-gray-200/80 dark:border-gray-800 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
            >
              <div className="space-y-4 max-w-2xl">
                <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border", workflowSteps[activeWorkflowTab].badgeColor)}>
                  <Check className="w-3.5 h-3.5" />
                  {workflowSteps[activeWorkflowTab].pill}
                </span>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {workflowSteps[activeWorkflowTab].title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {workflowSteps[activeWorkflowTab].detail}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <Link href="/foundation/register">
                  <Button className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer">
                    <span>Activar este módulo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* ── 5. PLAN INSTITUCIONAL & ACOMPAÑAMIENTO ─────────────────────────── */}
      <section className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505]">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900/40">
              <Award className="w-3.5 h-3.5" />
              <span>{t("pricing.badge")}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("pricing.title")}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("pricing.subtitle")}
            </p>
          </div>

          {/* Tarjeta de Plan Institucional Elevada */}
          <div className="rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-8 sm:p-12 shadow-sm space-y-8 hover:border-rose-500/30 transition-all">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                  {t("pricing.plan_tag")}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {t("pricing.plan_title")}
                </h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
                  {t("pricing.plan_price")}
                </span>
                <p className="text-xs text-gray-400">{t("pricing.plan_price_period")}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {t("pricing.plan_description")}
            </p>

            {/* Lista de Ventajas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{t("pricing.f1_title")}</p>
                  <p className="text-[11px] text-gray-400">{t("pricing.f1_desc")}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{t("pricing.f2_title")}</p>
                  <p className="text-[11px] text-gray-400">{t("pricing.f2_desc")}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{t("pricing.f3_title")}</p>
                  <p className="text-[11px] text-gray-400">{t("pricing.f3_desc")}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{t("pricing.f4_title")}</p>
                  <p className="text-[11px] text-gray-400">{t("pricing.f4_desc")}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{t("pricing.f5_title")}</p>
                  <p className="text-[11px] text-gray-400">{t("pricing.f5_desc")}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">CLUNI & SAT</p>
                  <p className="text-[11px] text-gray-400">Auditoría y conciliación fiscal de vouchers.</p>
                </div>
              </div>
            </div>

            {/* Acciones del Plan */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <Link href="/foundation/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-11 px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <span>{t("hero.cta_onboarding")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/contact?topic=foundation" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                  <Mail className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>{t("pricing.cta_button")}</span>
                </Button>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ── 6. PREGUNTAS FRECUENTES (ACCORDION EDITORIAL) ───────────────────── */}
      <section className="py-20 md:py-28 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 dark:bg-[#111] text-gray-600 dark:text-gray-300 text-xs font-bold border border-gray-200 dark:border-gray-800">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t("faq.badge")}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("faq.title")}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0d0d0d] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50/50 dark:hover:bg-[#111] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn("w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0", isOpen && "rotate-180 text-rose-600")}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-800/60">
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

      {/* ── 7. FINAL HIGH-IMPACT CTA BANNER ───────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505]">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          
          <div className="relative rounded-3xl bg-gray-900 dark:bg-[#0a0a0a] text-white p-8 sm:p-14 border border-gray-800 shadow-2xl overflow-hidden text-center space-y-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20 shadow-sm relative z-10">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Impacto Social Certificado</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight max-w-2xl mx-auto relative z-10">
              {t("cta.title")}
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed relative z-10">
              {t("cta.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4 relative z-10">
              <Link href="/foundation/register">
                <Button className="h-12 px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span>{t("cta.button_onboarding")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/contact?topic=foundation">
                <Button className="h-12 px-8 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{t("cta.button_contact")}</span>
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

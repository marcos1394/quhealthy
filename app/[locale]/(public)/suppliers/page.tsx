"use client";

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
  Mail,
  Zap,
  Clock,
  BadgePercent,
  Radio,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SuppliersLandingPage() {
  const t = useTranslations("PublicSuppliers");
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
      pill: "Verificación Sanitaria",
      detail: "Alta empresarial con validación de RFC, aviso de funcionamiento COFEPRIS y configuración de almacenes y equipo de logística.",
      badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/40"
    },
    {
      num: "02",
      icon: Layers,
      title: t("ecosystem.step2_title"),
      description: t("ecosystem.step2_desc"),
      pill: "Catálogo & Lotes",
      detail: "Carga masiva de insumos y equipos con fichas técnicas, lotes, semáforo de caducidad, registro sanitario y escalas de precios mayoreo.",
      badgeColor: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40"
    },
    {
      num: "03",
      icon: FileSpreadsheet,
      title: t("ecosystem.step3_title"),
      description: t("ecosystem.step3_desc"),
      pill: "Cotizador B2B & RFQ",
      detail: "Médicos y clínicas solicitan cotizaciones formales. Emisión instantánea con cálculo de IVA (16%), fletes y términos de crédito comercial.",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
    },
    {
      num: "04",
      icon: PackageCheck,
      title: t("ecosystem.step4_title"),
      description: t("ecosystem.step4_desc"),
      pill: "Cadena de Frío IoT",
      detail: "Despacho con validación de lote por escaneo, guía de rastreo y monitoreo de temperatura en tiempo real para biológicos y fármacos.",
      badgeColor: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/40"
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-blue-100 dark:selection:bg-blue-950/30 transition-colors duration-500 overflow-hidden">
      
      {/* ── 1. HERO ASIMÉTRICO CON MOCKUP B2B EN VIVO ──────────────────────── */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
        {/* Luces ambientales difuminadas */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Columna Izquierda: Mensaje Editorial B2B */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Badge de Entrada */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide shadow-2xs">
                <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{t("hero.badge")}</span>
              </div>

              {/* Titular Editorial */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.12]">
                {t("hero.title_start")}
                <span className="font-serif italic text-blue-600 dark:text-blue-400 font-normal">
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
                <Link href="/supplier/register">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>{t("hero.cta_onboarding")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/contact?topic=supplier">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-12 px-7 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{t("pricing.cta_button")}</span>
                  </Button>
                </Link>
              </div>

              {/* Micro-pills de Confianza y Cumplimiento */}
              <div className="pt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{t("hero.badges.cofepris")}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-[11px] font-semibold">
                  <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>{t("hero.badges.coldchain")}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-[11px] font-semibold">
                  <BadgePercent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("hero.badges.b2b")}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-[11px] font-semibold">
                  <Boxes className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{t("hero.badges.rentals")}</span>
                </div>
              </div>
            </motion.div>

            {/* Columna Derecha: Live Product UI Mockup (Panel Proveedor B2B) */}
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
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">Portal Proveedor QuHealthy</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        Telemetría IoT en Tiempo Real
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                    B2B & Clínicas
                  </span>
                </div>

                {/* Tarjeta 1: Sensor Cadena de Frío IoT */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50/70 to-white dark:from-cyan-950/20 dark:to-[#111] border border-cyan-100 dark:border-cyan-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center justify-center">
                        <ThermometerSnowflake className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {t("mockup.temp_status", { defaultValue: "Cadena de Frío Activa" })}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Sensor BLE en Ruta #SN-8291</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-cyan-600 dark:text-cyan-400 font-mono">
                        {t("mockup.temp_value", { defaultValue: "3.8°C" })}
                      </span>
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {t("mockup.temp_range", { defaultValue: "Rango óptimo (2°C - 8°C)" })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tarjeta 2: Cotización B2B Formal */}
                <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#121212] border border-gray-100 dark:border-gray-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {t("mockup.rfq_title", { defaultValue: "Cotización B2B #COT-2026-89" })}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {t("mockup.rfq_client", { defaultValue: "Hospital Ángeles Lomas • IVA desglosado" })}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900/40">
                      Net 30
                    </span>
                  </div>
                </div>

                {/* Dual Grid: Stock Multi-Almacén + COFEPRIS */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <Warehouse className="w-3 h-3 text-blue-600" />
                      <span>{t("mockup.stock_status", { defaultValue: "Stock Verificado" })}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white mt-1 truncate">
                      {t("mockup.warehouse_name", { defaultValue: "Almacén Central CDMX" })}
                    </p>
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Lote: LT-2026B • Cad: 2028</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{t("mockup.license_badge", { defaultValue: "COFEPRIS" })}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">
                      Reg. 1833C2021 SSA
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Dispositivo Clase II</p>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 2. DISTRIBUTION & SUPPLY METRIC BAR ───────────────────────────── */}
      <section className="py-10 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">100%</h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Trazabilidad por Lote
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">2°C - 8°C</h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {t("stats.compliance")}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">&lt; 15 min</h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {t("stats.quotes")}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#111] border border-gray-100 dark:border-gray-800 space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">COFEPRIS</h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Validación Sanitaria Oficial
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. BENTO GRID DE ABASTO Y LOGÍSTICA SANITARIA ───────────────────── */}
      <section className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505]">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-900/40">
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
            
            {/* Bento 1: Catálogo Regulatorio & Control de Lotes (7 cols) */}
            <div className="md:col-span-7 p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-6 group hover:border-blue-500/30 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Boxes className="w-6 h-6" />
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
                  Semáforo preventivo de caducidad
                </span>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">COFEPRIS & SAT</span>
              </div>
            </div>

            {/* Bento 2: Precios Escalonados por Volumen B2B (5 cols) */}
            <div className="md:col-span-5 p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-6 group hover:border-emerald-500/30 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("capabilities.c2_title")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("capabilities.c2_desc")}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <BadgePercent className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Descuentos automáticos por volumen para clínicas</span>
              </div>
            </div>

            {/* Bento 3: Cadena de Frío IoT (5 cols) */}
            <div className="md:col-span-5 p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-6 group hover:border-cyan-500/30 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <ThermometerSnowflake className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("capabilities.c5_title")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("capabilities.c5_desc")}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/30 text-[11px] font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-cyan-600 shrink-0 animate-pulse" />
                <span>Alertas térmicas inmediatas ante excursiones</span>
              </div>
            </div>

            {/* Bento 4: Cotizaciones Formales & PO (7 cols) */}
            <div className="md:col-span-7 p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-6 group hover:border-indigo-500/30 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("capabilities.c3_title")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("capabilities.c3_desc")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 text-[11px] font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  PDF Membretado con Desglose de IVA
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 text-[11px] font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Términos Net 15, Net 30 y Contado
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 4. SIMULADOR INTERACTIVO DEL CICLO B2B (TABS) ──────────────────── */}
      <section className="py-20 md:py-28 bg-white dark:bg-[#0a0a0a] border-y border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-900/40">
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
                      ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-900/60 shadow-sm"
                      : "bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-black font-mono", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400")}>
                      {step.num}
                    </span>
                    <Icon className={cn("w-4 h-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400")} />
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
                <Link href="/supplier/register">
                  <Button className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer">
                    <span>Activar este canal B2B</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* ── 5. PLAN COMERCIAL B2B A LA MEDIDA ──────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505]">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-900/40">
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

          {/* Tarjeta de Plan Comercial Elevada */}
          <div className="rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-8 sm:p-12 shadow-sm space-y-8 hover:border-blue-500/30 transition-all">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  {t("pricing.plan_tag")}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {t("pricing.plan_title")}
                </h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
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
                  <p className="text-xs font-bold text-gray-900 dark:text-white">CFDI 4.0 con IVA</p>
                  <p className="text-[11px] text-gray-400">Facturación electrónica automática por orden.</p>
                </div>
              </div>
            </div>

            {/* Acciones del Plan */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <Link href="/supplier/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <span>{t("hero.cta_onboarding")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/contact?topic=supplier" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                  <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
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
                      className={cn("w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0", isOpen && "rotate-180 text-blue-600")}
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
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20 shadow-sm relative z-10">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Red de Abasto Sanitario B2B</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight max-w-2xl mx-auto relative z-10">
              {t("cta.title")}
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed relative z-10">
              {t("cta.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4 relative z-10">
              <Link href="/supplier/register">
                <Button className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span>{t("cta.button_onboarding")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/contact?topic=supplier">
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

"use client";

/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  RefreshCcw, 
  Package, 
  DollarSign, 
  AlertOctagon, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Scale, 
  Mail,
  Clock,
  Truck,
  HelpCircle,
  Building2
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function ReturnsPage() {
  const t = useTranslations("PublicReturns");
  const [activeSection, setActiveSection] = useState("marketplace");

  const sections = [
    { id: "marketplace", title: t("intro_title", { defaultValue: "1. Modelo de Marketplace" }), icon: Building2 },
    { id: "physical", title: t("physical_title", { defaultValue: "2. Productos Físicos (30 Días)" }), icon: Package },
    { id: "fees", title: t("fees_title", { defaultValue: "3. Costos y Tarifas (0% Restocking)" }), icon: DollarSign },
    { id: "exemptions", title: t("exemptions_title", { defaultValue: "4. Excepciones Sanitarias" }), icon: AlertOctagon },
    { id: "services", title: t("services_title", { defaultValue: "5. Cancelación de Citas Médicas" }), icon: Calendar },
    { id: "refunds", title: t("refunds_title", { defaultValue: "6. Métodos y Tiempos de Reembolso" }), icon: CreditCard },
    { id: "process", title: t("process_title", { defaultValue: "7. Proceso Paso a Paso" }), icon: RefreshCcw },
    { id: "disputes", title: t("disputes_title", { defaultValue: "8. Garantía y Mediación" }), icon: Scale },
    { id: "contact", title: t("contact_title", { defaultValue: "9. Canales de Atención" }), icon: Mail },
  ];

  // UX ScrollSpy Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -75% 0px" }
    );

    sections.forEach((sec) => {
      const element = document.getElementById(sec.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [t]);

  // Smooth scroll handler con compensación de encabezado fijo
  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 110;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      
      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Breadcrumb */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800/60 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-2xs">
              <Link
                href="/"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                QuHealthy
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-bold">
                {t("breadcrumb", { defaultValue: "Legal y Garantía" })}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
                  <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Garantía Protegida Quhealthy</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-900/40">
                  <Clock className="w-3.5 h-3.5" />
                  <span>30 Días de Devolución</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 text-xs font-bold border border-purple-200 dark:border-purple-900/40">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>$0 Restocking Fee</span>
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
                {t("title", { defaultValue: "Política de Devoluciones, Reembolsos y Cancelaciones" })}
              </h1>

              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium max-w-3xl leading-relaxed pt-1">
                {t("subtitle", {
                  defaultValue:
                    "Lineamientos claros, transparentes y justos para la devolución de productos de salud, cancelación de consultas médicas y reembolsos en el ecosistema Quhealthy.",
                })}
              </p>

              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 pt-1">
                {t("date", { defaultValue: "Última actualización: 25 de Agosto de 2026" })}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECCIÓN DE CONTENIDO PRINCIPAL ─────────────────────────────────── */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* ── NAVEGACIÓN LATERAL (SCROLLSPY) ─────────────────────────── */}
            <motion.aside
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="w-full lg:w-72 shrink-0 lg:sticky lg:top-28 hidden lg:block"
            >
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-2xs space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
                  {t("toc", { defaultValue: "Tabla de Contenido" })}
                </p>

                <nav className="flex flex-col space-y-1 relative">
                  {sections.map((sec) => {
                    const isActive = activeSection === sec.id;
                    const Icon = sec.icon;
                    return (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        onClick={(e) => scrollToSection(e, sec.id)}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all leading-tight",
                          isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-900/40 shadow-2xs"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#111] hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                        <span className="truncate">{sec.title}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Caja de Ayuda Rápida */}
              <div className="mt-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-xs font-bold">¿Necesitas ayuda inmediata?</span>
                </div>
                <p className="text-[11px] font-medium text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                  Nuestro equipo de mediación y soporte al comprador atiende tus solicitudes con número de orden las 24 horas.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <span>Centro de Ayuda</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.aside>

            {/* ── CUERPO DEL DOCUMENTO ──────────────────────────────────── */}
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="flex-1 space-y-8 min-w-0"
            >
              {/* Tarjetas Resumen de Garantía */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-2xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("badges.b1_title", { defaultValue: "Garantía Protegida Quhealthy" })}
                  </h3>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t("badges.b1_desc", { defaultValue: "Protección integral para compradores y pacientes en todas las transacciones del marketplace." })}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-2xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("badges.b2_title", { defaultValue: "Plazo de 30 Días" })}
                  </h3>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t("badges.b2_desc", { defaultValue: "30 días naturales para devoluciones de productos físicos elegibles." })}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-2xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("badges.b3_title", { defaultValue: "Sin Cargos Ocultos (0% Restocking)" })}
                  </h3>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t("badges.b3_desc", { defaultValue: "$0 de comisión por reabastecimiento o tramitación de devolución." })}
                  </p>
                </div>
              </div>

              {/* SECCIÓN 1: Modelo de Marketplace */}
              <section id="marketplace" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Building2 className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {t("intro_title", { defaultValue: "1. Modelo de Marketplace e Intermediación" })}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("intro_desc", {
                    defaultValue:
                      "QuHealthy Inc. ('Quhealthy', 'la Plataforma') opera como un marketplace tecnológico de salud que conecta a usuarios y pacientes con Profesionales Médicos y Clínicas independientes (PROVIDER), Laboratorios y Farmacias, y Fabricantes y Distribuidores certificados de Insumos y Equipamiento Médico (SUPPLIER). Quhealthy no es el vendedor directo ni fabricante de los productos físicos ni presta directamente los servicios clínicos, sino que actúa como facilitador tecnológico y garante de la experiencia de compra a través de nuestro programa de Garantía Protegida Quhealthy.",
                  })}
                </p>
                <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#080808] border border-gray-100 dark:border-gray-800 space-y-2">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Estándares Obligatorios de Calidad</span>
                  </h4>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    Todos los proveedores, farmacias y clínicas que publican en Quhealthy se comprometen contractualmente a cumplir con esta política de devoluciones y con las regulaciones de protección al consumidor (PROFECO y normativas aplicables).
                  </p>
                </div>
              </section>

              {/* SECCIÓN 2: Productos Físicos */}
              <section id="physical" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Package className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {t("physical_title", { defaultValue: "2. Devolución de Productos Físicos y Equipamiento" })}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("physical_desc", {
                    defaultValue:
                      "Para todos los productos físicos comercializados a través de Quhealthy (dispositivos biomédicos, suplementos sellados, accesorios de salud y equipo de consultorio), los compradores cuentan con un plazo de 30 días naturales a partir de la recepción del paquete para solicitar una devolución.",
                  })}
                </p>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {t("physical_cond_title", { defaultValue: "Condiciones para la Aceptación:" })}
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-gray-50/70 dark:bg-[#080808] border border-gray-100 dark:border-gray-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {t("physical_cond_1", { defaultValue: "El artículo debe estar nuevo, sin uso y en perfectas condiciones estéticas y funcionales." })}
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-gray-50/70 dark:bg-[#080808] border border-gray-100 dark:border-gray-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {t("physical_cond_2", { defaultValue: "Debe conservar su empaque original de fábrica, sellos de seguridad intactos, manuales, accesorios y pólizas de garantía." })}
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-gray-50/70 dark:bg-[#080808] border border-gray-100 dark:border-gray-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {t("physical_cond_3", { defaultValue: "Los números de serie y etiquetas de lote deben coincidir exactamente con el registro de despacho del proveedor." })}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECCIÓN 3: Costos y Tarifas */}
              <section id="fees" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <DollarSign className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {t("fees_title", { defaultValue: "3. Gastos de Envío y Tarifas de Devolución" })}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                        Defectos o Envíos Incorrectos
                      </h4>
                      <Badge className="bg-emerald-500 text-white font-bold text-[10px]">Costo: $0.00</Badge>
                    </div>
                    <p className="text-[11px] font-medium text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed">
                      Quhealthy o el proveedor cubre el 100% del costo de paquetería emitiendo una guía prepagada sin cargo alguno para el comprador.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300">
                        Tarifa de Reabastecimiento
                      </h4>
                      <Badge className="bg-purple-500 text-white font-bold text-[10px]">Restocking: 0%</Badge>
                    </div>
                    <p className="text-[11px] font-medium text-purple-800/80 dark:text-purple-400/80 leading-relaxed">
                      Quhealthy NO cobra penalizaciones, tarifas por reintegración de inventario ni comisiones administrativas de devolución.
                    </p>
                  </div>
                </div>

                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  En casos de devolución voluntaria o cambio de opinión del cliente, el comprador cubre únicamente la tarifa de transporte de la guía de retorno al centro de despacho del proveedor.
                </p>
              </section>

              {/* SECCIÓN 4: Excepciones Sanitarias */}
              <section id="exemptions" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <AlertOctagon className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {t("exemptions_title", { defaultValue: "4. Excepciones Sanitarias y Productos No Retornables" })}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("exemptions_desc", {
                    defaultValue:
                      "En estricto apego a las regulaciones sanitarias aplicables (COFEPRIS, FDA y directrices internacionales de salud pública), NO son elegibles para devolución una vez entregados o abiertos:",
                  })}
                </p>

                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-start gap-2.5">
                    <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-300 leading-relaxed">
                      <strong>Medicamentos y Fármacos:</strong> Por seguridad de los pacientes, los medicamentos de prescripción y fármacos con sellos violados no pueden reincorporarse al mercado farmacéutico.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-start gap-2.5">
                    <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-300 leading-relaxed">
                      <strong>Material Estéril e Higiene:</strong> Insumos de higiene personal, cánulas, agujas, jeringas y material de curación con empaque primario abierto.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-start gap-2.5">
                    <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-300 leading-relaxed">
                      <strong>Dispositivos a Medida y Cadena de Frío:</strong> Prótesis personalizadas y biológicos/vacunas que requieran refrigeración controlada (salvo falla en telemetría IoT de transporte).
                    </p>
                  </div>
                </div>
              </section>

              {/* SECCIÓN 5: Cancelación de Citas Médicas */}
              <section id="services" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Calendar className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {t("services_title", { defaultValue: "5. Cancelaciones y Reembolsos de Consultas y Citas Médicas" })}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#080808] border border-gray-100 dark:border-gray-800 space-y-1.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Antelación &gt; 24h</h4>
                    <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">100% Reembolso o Reagendamiento</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Sin cargos ni penalizaciones al cancelar con al menos 24 horas previas.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#080808] border border-gray-100 dark:border-gray-800 space-y-1.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Antelación &lt; 24h</h4>
                    <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Política de la Clínica</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Aplica la política informada en el perfil del médico o reagendamiento sujeto a cupo.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#080808] border border-gray-100 dark:border-gray-800 space-y-1.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Cancelación del Doctor</h4>
                    <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">100% Reembolso Inmediato</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Reembolso total automático o cita prioritaria según preferencia del paciente.</p>
                  </div>
                </div>
              </section>

              {/* SECCIÓN 6: Métodos y Tiempos de Reembolso */}
              <section id="refunds" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <CreditCard className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {t("refunds_title", { defaultValue: "6. Métodos y Tiempos de Reembolso" })}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("refunds_desc", {
                    defaultValue:
                      "Una vez recibido e inspeccionado el artículo por el equipo de control de calidad (plazo de 1 a 3 días hábiles tras la recepción), el reembolso se emitirá automáticamente al método de pago original:",
                  })}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#080808] space-y-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Tarjetas de Crédito / Débito (Stripe / MercadoPago)</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      5 a 10 días hábiles en verse reflejado en su estado de cuenta según el banco emisor.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#080808] space-y-1">
                    <div className="flex items-center gap-2">
                      <RefreshCcw className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Transferencia SPEI / Quhealthy Wallet</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      24 a 48 horas hábiles con comprobante digital de liquidación.
                    </p>
                  </div>
                </div>
              </section>

              {/* SECCIÓN 7: Proceso Paso a Paso */}
              <section id="process" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <RefreshCcw className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {t("process_title", { defaultValue: "7. Proceso Paso a Paso para Devoluciones" })}
                  </h2>
                </div>

                <div className="space-y-3">
                  {[
                    { step: "1", title: "Inicia tu solicitud", desc: t("process_step_1", { defaultValue: "1. Inicia tu solicitud: Ingresa a tu panel en 'Mis Pedidos' y selecciona 'Solicitar Devolución', o escribe a soporte@quhealthy.org indicando tu Folio de Orden y motivo." }) },
                    { step: "2", title: "Validación y Guía", desc: t("process_step_2", { defaultValue: "2. Validación y Guía: En un plazo menor a 24 horas hábiles recibirás la aprobación y tu guía de paquetería prepagada (en casos elegibles) o las instrucciones de embalaje." }) },
                    { step: "3", title: "Envío del Paquete", desc: t("process_step_3", { defaultValue: "3. Envío del Paquete: Entrega el artículo debidamente protegido en la sucursal de paquetería autorizada (DHL, FedEx o Estafeta)." }) },
                    { step: "4", title: "Inspección y Reembolso", desc: t("process_step_4", { defaultValue: "4. Inspección y Reembolso: Al recibir y verificar el producto, se efectúa el reembolso total de forma automática." }) },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50/60 dark:bg-[#080808] border border-gray-100 dark:border-gray-800">
                      <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {s.step}
                      </div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pt-0.5">
                        {s.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECCIÓN 8: Garantía y Mediación */}
              <section id="disputes" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                    <Scale className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {t("disputes_title", { defaultValue: "8. Garantía Protegida Quhealthy y Mediación" })}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("disputes_desc", {
                    defaultValue:
                      "Si un proveedor o vendedor externo no responde a una solicitud de devolución justificada en un plazo de 48 horas hábiles, el equipo de resolución de Quhealthy intervendrá de oficio para dictaminar la disputa y garantizar el reembolso correspondiente de conformidad con la Ley Federal de Protección al Consumidor (PROFECO) y las normas aplicables.",
                  })}
                </p>
              </section>

              {/* SECCIÓN 9: Canales de Atención */}
              <section id="contact" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                    <Mail className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {t("contact_title", { defaultValue: "9. Canales Oficiales de Atención" })}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#080808] border border-gray-100 dark:border-gray-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Correo de Devoluciones</span>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">devoluciones@quhealthy.org</p>
                    <p className="text-[11px] text-gray-500">soporte@quhealthy.org</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#080808] border border-gray-100 dark:border-gray-800 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">WhatsApp & Mesa de Ayuda</span>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">+52 668 184 2487</p>
                    <p className="text-[11px] text-gray-500">Sede: QuHealthy Inc., Sinaloa, México</p>
                  </div>
                </div>
              </section>

              {/* Banner Final de Contacto */}
              <div className="bg-emerald-600 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold">¿Tienes dudas sobre una devolución o cancelación?</h4>
                  <p className="text-xs text-emerald-100 font-medium max-w-md pt-0.5">
                    Nuestro equipo de soporte y mediación médica te asiste con tu folio de orden en minutos.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="h-10 px-5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 transition-colors text-xs font-bold shadow-sm flex items-center gap-2 shrink-0"
                >
                  <span>Contactar a Soporte</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </Link>
              </div>

            </motion.article>

          </div>
        </div>
      </section>

    </div>
  );
}

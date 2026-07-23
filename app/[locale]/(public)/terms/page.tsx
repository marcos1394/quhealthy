"use client";

/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  ArrowRight, 
  FileText, 
  UserCheck, 
  XCircle, 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  RefreshCw 
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export default function TermsPage() {
  const t = useTranslations("PublicTerms");
  const [activeSection, setActiveSection] = useState("intro");

  const sections = [
    { id: "intro", title: t("intro_title", { defaultValue: "1. Aceptación de Términos" }), icon: FileText },
    { id: "use", title: t("use_title", { defaultValue: "2. Uso de la Plataforma" }), icon: UserCheck },
    { id: "cancel", title: t("cancel_title", { defaultValue: "3. Cancelaciones y Citas" }), icon: XCircle },
    { id: "privacy", title: t("privacy_title", { defaultValue: "4. Privacidad y Datos" }), icon: ShieldCheck },
    { id: "liability", title: t("liability_title", { defaultValue: "5. Limitación de Responsabilidad" }), icon: AlertTriangle },
    { id: "governing_law", title: t("governing_law_title", { defaultValue: "6. Legislación Aplicable" }), icon: Scale },
    { id: "changes", title: t("changes_title", { defaultValue: "7. Modificaciones a los Términos" }), icon: RefreshCw },
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
      { rootMargin: "-20% 0px -80% 0px" }
    );

    sections.forEach((sec) => {
      const element = document.getElementById(sec.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [t]);

  // Smooth scroll handler con compensación de encabezado
  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
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
            {/* Breadcrumb Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800/60 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm">
              <Link
                href="/"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                QuHealthy
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-bold">
                {t("breadcrumb", { defaultValue: "Términos del Servicio" })}
              </span>
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
                <FileText className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Condiciones de Uso de la Plataforma</span>
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
                {t("title", { defaultValue: "Términos y Condiciones del Servicio" })}
              </h1>

              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium max-w-3xl leading-relaxed pt-1">
                Lineamientos legales y regulaciones operativas que rigen el acceso y uso de los servicios de salud digital de QuHealthy.
              </p>
            </div>

            <p className="text-xs font-bold font-mono text-gray-400">
              {t("date", { defaultValue: "Última actualización: 15 de Enero, 2025" })}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── SECCIÓN DE CONTENIDO ──────────────────────────────────────────── */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* ── NAVEGACIÓN LATERAL (SCROLLSPY) ─────────────────────────── */}
            <motion.aside
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="w-full lg:w-64 shrink-0 lg:sticky lg:top-28 hidden lg:block"
            >
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-3">
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
                          "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all leading-tight",
                          isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-900/40"
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
            </motion.aside>

            {/* ── CUERPO DEL DOCUMENTO ──────────────────────────────────── */}
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="flex-1 space-y-8"
            >
              
              {/* Sección 1: Introducción */}
              <section id="intro" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <FileText className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("intro_title", { defaultValue: "1. Aceptación de los Términos" })}
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("intro_desc", { defaultValue: "Al acceder o hacer uso de la plataforma QuHealthy, declaras haber leído, comprendido y aceptado en su totalidad las presentes Condiciones de Servicio. Si no estás de acuerdo con alguna de las estipulaciones, debes abstenerte de utilizar la plataforma." })}
                </p>
              </section>

              {/* Sección 2: Uso de la Plataforma */}
              <section id="use" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <UserCheck className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("use_title", { defaultValue: "2. Uso de la Plataforma y Cuentas" })}
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("use_desc", { defaultValue: "Los usuarios garantizan brindar información veraz, exacta y actualizada durante su registro. Los profesionales de la salud aceptan someter su cédula profesional e información clínica a procesos de verificación previa autorización de perfil." })}
                </p>
              </section>

              {/* Sección 3: Cancelaciones y Citas */}
              <section id="cancel" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <XCircle className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("cancel_title", { defaultValue: "3. Gestión de Citas y Cancelaciones" })}
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("cancel_desc", { defaultValue: "Las citas programadas pueden reprogramarse o cancelarse sujeto a las políticas fijadas individualmente por cada especialista o consultorio médico. Los cobros de reserva quedan sujetos a las reglas de reembolso configuradas por el proveedor." })}
                </p>
              </section>

              {/* Sección 4: Privacidad y Datos */}
              <section id="privacy" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("privacy_title", { defaultValue: "4. Protección de Datos y Privacidad" })}
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("privacy_desc", { defaultValue: "El tratamiento de expedientes médicos y datos personales se regula a través de nuestro Aviso de Privacidad." })}{" "}
                  <Link
                    href="/privacy"
                    className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    <span>{t("privacy_link", { defaultValue: "Consultar Aviso de Privacidad" })}</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </Link>
                </p>
              </section>

              {/* Sección 5: Limitación de Responsabilidad */}
              <section id="liability" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <AlertTriangle className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("liability_title", { defaultValue: "5. Relación Médico-Paciente y Responsabilidad" })}
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("liability_desc", { defaultValue: "QuHealthy funge únicamente como un intermediario tecnológico de infraestructura y gestión. Las decisiones clínicas, diagnósticos y prescripciones médicas son responsabilidad exclusiva del profesional de la salud tratante." })}
                </p>
              </section>

              {/* Sección 6: Legislación Aplicable */}
              <section id="governing_law" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Scale className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("governing_law_title", { defaultValue: "6. Jurisdicción y Ley Aplicable" })}
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("governing_law_desc", { defaultValue: "Estos términos se rigen por las leyes vigentes de los Estados Unidos Mexicanos y las normas de salud de los órganos reguladores correspondientes." })}
                </p>
              </section>

              {/* Sección 7: Modificaciones */}
              <section id="changes" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <RefreshCw className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("changes_title", { defaultValue: "7. Actualizaciones de Términos" })}
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("changes_desc", { defaultValue: "QuHealthy se reserva el derecho de actualizar periódicamente estas condiciones para reflejar cambios legales o funcionales en los módulos de software." })}
                </p>
              </section>

              {/* Footer Section */}
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-12">
                <p className="text-xs font-medium text-gray-500">
                  {t("contact", { defaultValue: "¿Dudas sobre los Términos y Condiciones?" })}
                </p>
                <Link
                  href="/contact"
                  className="h-10 px-5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center gap-2 shrink-0"
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
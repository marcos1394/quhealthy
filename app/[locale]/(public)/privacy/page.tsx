"use client";

/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  ArrowRight, 
  FileText, 
  UserCheck, 
  Globe, 
  Share2, 
  KeyRound, 
  Users 
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export default function PrivacyPage() {
  const t = useTranslations("PublicPrivacy");
  const [activeSection, setActiveSection] = useState("intro");

  const sections = [
    { id: "intro", title: t("s1_title", { defaultValue: "1. Introducción" }), icon: FileText },
    { id: "data", title: t("s2_title", { defaultValue: "2. Información Recopilada" }), icon: UserCheck },
    { id: "usage", title: t("s3_title", { defaultValue: "3. Uso de la Información" }), icon: KeyRound },
    { id: "sharing", title: t("s4_title", { defaultValue: "4. Transferencia de Datos" }), icon: Share2 },
    { id: "security", title: t("s5_title", { defaultValue: "5. Seguridad y Cifrado" }), icon: Lock },
    { id: "transfers", title: t("s6_title", { defaultValue: "6. Transferencias Internacionales" }), icon: Globe },
    { id: "rights", title: t("s7_title", { defaultValue: "7. Derechos ARCO" }), icon: ShieldCheck },
    { id: "minors", title: t("s8_title", { defaultValue: "8. Protección de Menores" }), icon: Users },
  ];

  // UX Improvement: ScrollSpy (Detecta qué sección está en pantalla)
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

  // UX Improvement: Smooth Scroll con compensación de encabezado
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
                {t("breadcrumb", { defaultValue: "Aviso de Privacidad" })}
              </span>
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Protección de Datos e Historia Clínica</span>
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
                {t("title", { defaultValue: "Aviso de Privacidad Integral" })}
              </h1>

              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium max-w-3xl leading-relaxed pt-1">
                {t("subtitle", { defaultValue: "Compromiso absoluto con el tratamiento seguro, confidencial y transparente de tus datos personales y expedientes clínicos." })}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST BADGES SECTION ─────────────────────────────────────────── */}
      <section className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Badge 1 */}
            <div className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <ShieldCheck className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                {t("badges.b1_title", { defaultValue: "Cumplimiento HIPAA / LFPDPPP" })}
              </h3>
              <p className="text-xs font-medium text-gray-500 leading-relaxed">
                {t("badges.b1_desc", { defaultValue: "Alineados estrictamente con las normativas nacionales e internacionales de protección de datos personales." })}
              </p>
            </div>

            {/* Badge 2 */}
            <div className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <Lock className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                {t("badges.b2_title", { defaultValue: "Cifrado de Grado Médico" })}
              </h3>
              <p className="text-xs font-medium text-gray-500 leading-relaxed">
                {t("badges.b2_desc", { defaultValue: "Cifrado AES-256 en reposo y TLS 1.3 en tránsito para salvaguardar todos los registros clínicos." })}
              </p>
            </div>

            {/* Badge 3 */}
            <div className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <EyeOff className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                {t("badges.b3_title", { defaultValue: "Cero Venta de Datos" })}
              </h3>
              <p className="text-xs font-medium text-gray-500 leading-relaxed">
                {t("badges.b3_desc", { defaultValue: "Tus datos médicos jamás se comparten ni comercializan con anunciantes o terceros sin consentimiento explícito." })}
              </p>
            </div>
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
              {/* Intro Container */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-sm">
                <p className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t("intro", { defaultValue: "En QuHealthy, entendemos la sensibilidad crítica de la información médica y personal. Este Aviso de Privacidad regula la recolección, almacenamiento y procesamiento de datos en todas nuestras aplicaciones web y móviles." })}
                </p>
              </div>

              {/* Sección 1: Introducción */}
              <section id="intro" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <FileText className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("s1_title", { defaultValue: "1. Identidad del Responsable" })}
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("s1_desc", { defaultValue: "QuHealthy México S.A.P.I. de C.V., con domicilio legal en Los Mochis, Sinaloa, México, es el responsable directo del tratamiento de los datos personales proporcionados por pacientes y profesionales de la salud." })}
                </p>
              </section>

              {/* Sección 2: Información Recopilada */}
              <section id="data" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <UserCheck className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("s2_title", { defaultValue: "2. Información Recopilada" })}
                  </h2>
                </div>

                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("s2_desc", { defaultValue: "Para ofrecer nuestros servicios de gestión clínica y agenda médica, recabamos las siguientes categorías de datos:" })}
                </p>

                <ul className="space-y-2 pt-1 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
                  <li className="p-3 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
                    <strong className="text-gray-900 dark:text-white font-bold">{t("s2_l1", { defaultValue: "Datos Identificativos:" })}</strong> Nombre completo, correo electrónico, teléfono y dirección.
                  </li>
                  <li className="p-3 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
                    <strong className="text-gray-900 dark:text-white font-bold">{t("s2_l2", { defaultValue: "Datos Profesionales (Médicos):" })}</strong> Cédula profesional, especialidad y comprobante de ejercicio clínico.
                  </li>
                  <li className="p-3 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
                    <strong className="text-gray-900 dark:text-white font-bold">{t("s2_l3", { defaultValue: "Datos de Salud Sensibles:" })}</strong> Historial clínico, notas de evolución, diagnósticos, recetas y antecedentes biomédicos.
                  </li>
                </ul>
              </section>

              {/* Sección 3: Uso de la Información */}
              <section id="usage" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <KeyRound className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("s3_title", { defaultValue: "3. Finalidades del Tratamiento" })}
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("s3_desc", { defaultValue: "Los datos son procesados exclusivamente para brindar la atención médica solicitada, administrar expedientes en cumplimiento con la NOM-004-SSA3, coordinar citas y procesar cobros de servicios." })}
                </p>
              </section>

              {/* Sección 4: Transferencia de Datos */}
              <section id="sharing" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Share2 className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("s4_title", { defaultValue: "4. Transferencia de Datos" })}
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("s4_desc", { defaultValue: "No realizamos transferencias de datos a terceros sin autorización previa, salvo por requerimientos normativos o judiciales emitidos por autoridades competentes." })}
                </p>
              </section>

              {/* Sección 5: Seguridad y Cifrado */}
              <section id="security" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Lock className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("s5_title", { defaultValue: "5. Medidas de Seguridad" })}
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("s5_desc", { defaultValue: "Implementamos salvaguardas administrativas, técnicas y físicas avanzadas, incluyendo cifrado simétrico AES-256 en bases de datos y comunicaciones HTTPS/TLS 1.3." })}
                </p>
              </section>

              {/* Sección 6: Transferencias Internacionales */}
              <section id="transfers" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Globe className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("s6_title", { defaultValue: "6. Infraestructura Cloud" })}
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("s6_desc", { defaultValue: "Los servidores de alojamiento se encuentran situados en centros de datos con certificación ISO 27001 y SOC 2 Tipo II en la nube de Google Cloud Platform (GCP)." })}
                </p>
              </section>

              {/* Sección 7: Derechos ARCO */}
              <section id="rights" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("s7_title", { defaultValue: "7. Ejercicio de Derechos ARCO" })}
                  </h2>
                </div>

                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("s7_desc", { defaultValue: "Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus datos personales mediante solicitud formal enviada a nuestro comité de privacidad." })}
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 pt-1">
                  <li className="p-3 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
                    {t("s7_l1", { defaultValue: "• Acceso directo a tu expediente" })}
                  </li>
                  <li className="p-3 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
                    {t("s7_l2", { defaultValue: "• Rectificación de datos erróneos" })}
                  </li>
                  <li className="p-3 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
                    {t("s7_l3", { defaultValue: "• Cancelación de registros inactivos" })}
                  </li>
                  <li className="p-3 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
                    {t("s7_l4", { defaultValue: "• Oposición al uso publicitario" })}
                  </li>
                </ul>

                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 italic pt-2">
                  {t("s7_note", { defaultValue: "Para ejercer cualquier derecho ARCO, envía un correo a privacy@quhealthy.org adjuntando identificación oficial." })}
                </p>
              </section>

              {/* Sección 8: Protección de Menores */}
              <section id="minors" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Users className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("s8_title", { defaultValue: "8. Protección de Menores de Edad" })}
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("s8_desc", { defaultValue: "El registro de expediente de pacientes menores de edad únicamente se realiza con la autorización explícita de sus padres o tutores legales." })}
                </p>
              </section>

              {/* Footer Section */}
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-12">
                <p className="text-xs font-medium text-gray-500">
                  {t("contact", { defaultValue: "¿Dudas sobre la privacidad de tus datos?" })}
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
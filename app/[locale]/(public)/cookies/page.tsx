"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Cookie,
  ShieldAlert,
  BarChart3,
  Clock,
  Settings,
  UserCheck,
  ShieldCheck,
  Globe,
  Users,
  History,
  Mail,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// Renderizado de texto con sintaxis Markdown (**negrita** y *cursiva*)
const parseBoldAndItalic = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={`b-${i}`}
          className="text-gray-900 dark:text-white font-bold"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    const italicParts = part.split(/(\*[^*]+\*)/g);
    return italicParts.map((ip, j) => {
      if (ip.startsWith("*") && ip.endsWith("*")) {
        return (
          <em
            key={`i-${j}`}
            className="text-gray-500 dark:text-gray-400 italic"
          >
            {ip.slice(1, -1)}
          </em>
        );
      }
      return ip;
    });
  });
};

const renderText = (text: string) => {
  return text.split("\n\n").map((block, idx) => {
    if (block.includes("\n- ")) {
      const parts = block.split("\n- ");
      const intro = parts[0];
      const items = parts.slice(1);
      return (
        <div key={idx} className="mb-4">
          {intro && <p className="mb-2 text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal">{parseBoldAndItalic(intro)}</p>}
          <ul className="list-disc pl-5 space-y-1.5 marker:text-emerald-600 dark:marker:text-emerald-400 font-normal text-xs md:text-sm text-gray-600 dark:text-gray-300">
            {items.map((item, i) => (
              <li key={i}>{parseBoldAndItalic(item)}</li>
            ))}
          </ul>
        </div>
      );
    }
    return (
      <p
        key={idx}
        className="mb-4 text-xs md:text-sm text-gray-600 dark:text-gray-300 font-normal leading-relaxed"
      >
        {parseBoldAndItalic(block)}
      </p>
    );
  });
};

export default function CookiesPage() {
  const t = useTranslations("PublicCookies");
  const [activeSection, setActiveSection] = useState("intro");

  const sections = [
    { id: "intro", title: t("intro_title", { defaultValue: "1. Introducción" }), icon: Cookie },
    { id: "legal-frameworks", title: t("legal_title", { defaultValue: "2. Marco Legal y Normativo" }), icon: ShieldCheck },
    { id: "tipos", title: t("types_title", { defaultValue: "3. Categorías de Cookies" }), icon: Settings },
    { id: "duration", title: t("duration_title", { defaultValue: "4. Duración y Almacenamiento" }), icon: Clock },
    { id: "sensitive-data", title: t("sensitive_title", { defaultValue: "5. Datos de Salud Sensibles" }), icon: ShieldAlert },
    { id: "rights", title: t("rights_title", { defaultValue: "6. Derechos de los Usuarios" }), icon: UserCheck },
    { id: "consentimiento", title: t("consent_title", { defaultValue: "7. Gestión del Consentimiento" }), icon: Settings },
    { id: "terceros", title: t("thirdparty_title", { defaultValue: "8. Cookies de Terceros" }), icon: Globe },
    { id: "children", title: t("children_title", { defaultValue: "9. Privacidad de Menores" }), icon: Users },
    { id: "changes", title: t("changes_title", { defaultValue: "10. Cambios en la Política" }), icon: History },
    { id: "contacto", title: t("contact_title", { defaultValue: "11. Contacto de Privacidad" }), icon: Mail },
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

  // Smooth scroll handler con offset
  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
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

  const handleManagePreferences = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("quhealthy_cookie_consent");
      window.location.reload();
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
                {t("breadcrumb", { defaultValue: "Política de Cookies" })}
              </span>
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
                <Cookie className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Uso de Rastreadores y Privacidad</span>
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
                {t("title", { defaultValue: "Política de Uso de Cookies y Rastreadores" })}
              </h1>

              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium max-w-3xl leading-relaxed pt-1">
                {t("subtitle", { defaultValue: "Explicación transparente de cómo empleamos las cookies para garantizar la seguridad, personalizar tu experiencia y cumplir con las normativas internacionales." })}
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
              className="flex-1 space-y-10"
            >
              
              {/* Sección 1: Introducción */}
              <section id="intro" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Cookie className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("intro_title", { defaultValue: "1. Introducción" })}
                  </h2>
                </div>
                {renderText(t("intro_desc", { defaultValue: "Esta Política de Cookies explica qué son las cookies, cómo las utilizamos en la plataforma QuHealthy y las opciones que tienes para gestionar tus preferencias..." }))}
              </section>

              {/* Sección 2: Marco Legal */}
              <section id="legal-frameworks" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("legal_title", { defaultValue: "2. Marco Legal y Normativo" })}
                  </h2>
                </div>
                {renderText(t("legal_desc", { defaultValue: "Operamos en estricto apego al Reglamento General de Protección de Datos (GDPR) de la Unión Europea y la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México..." }))}
              </section>

              {/* Sección 3: Categorías de Cookies */}
              <section id="tipos" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Settings className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("types_title", { defaultValue: "3. Categorías de Cookies" })}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Esenciales */}
                  <div className="bg-gray-50/50 dark:bg-[#050505] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <ShieldAlert className="w-4 h-4" strokeWidth={2} />
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                        {t("types_essential", { defaultValue: "Cookies Esenciales" })}
                      </h3>
                    </div>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed">
                      {t("types_essential_desc", { defaultValue: "Requeridas para la autenticación, seguridad de sesión y cifrado SSL." })}
                    </p>
                  </div>

                  {/* Funcionales */}
                  <div className="bg-gray-50/50 dark:bg-[#050505] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <Settings className="w-4 h-4" strokeWidth={2} />
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                        {t("types_functional", { defaultValue: "Cookies Funcionales" })}
                      </h3>
                    </div>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed">
                      {t("types_functional_desc", { defaultValue: "Almacenan tus preferencias de idioma, tema visual y configuración regional." })}
                    </p>
                  </div>

                  {/* Analíticas */}
                  <div className="bg-gray-50/50 dark:bg-[#050505] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <BarChart3 className="w-4 h-4" strokeWidth={2} />
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                        {t("types_analytics", { defaultValue: "Cookies Analíticas" })}
                      </h3>
                    </div>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed">
                      {t("types_analytics_desc", { defaultValue: "Nos ayudan a entender el comportamiento de navegación para optimizar la velocidad y UX." })}
                    </p>
                  </div>

                  {/* Marketing */}
                  <div className="bg-gray-50/50 dark:bg-[#050505] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <Cookie className="w-4 h-4" strokeWidth={2} />
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                        {t("types_marketing", { defaultValue: "Cookies de Marketing" })}
                      </h3>
                    </div>
                    <div className="text-xs font-medium text-gray-500 leading-relaxed">
                      {renderText(t("types_marketing_desc", { defaultValue: "Utilizadas para medir campañas informativas sin rastrear tu expediente de salud." }))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Sección 4: Duración & Tabla */}
              <section id="duration" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Clock className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("duration_title", { defaultValue: "4. Duración y Almacenamiento" })}
                  </h2>
                </div>
                
                {renderText(t("duration_desc", { defaultValue: "A continuación detallamos el inventario técnico de las cookies activas en la plataforma:" }))}

                {/* Tabla Estilizada */}
                <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-x-auto shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold">
                        <th className="p-3.5">{t("duration_th_cookie", { defaultValue: "Cookie" })}</th>
                        <th className="p-3.5">{t("duration_th_category", { defaultValue: "Categoría" })}</th>
                        <th className="p-3.5">{t("duration_th_purpose", { defaultValue: "Propósito" })}</th>
                        <th className="p-3.5">{t("duration_th_duration", { defaultValue: "Duración" })}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 font-medium text-gray-600 dark:text-gray-300">
                      <tr>
                        <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{t("duration_row1_cookie", { defaultValue: "__qh_session" })}</td>
                        <td className="p-3.5"><span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold">{t("duration_row1_category", { defaultValue: "Esencial" })}</span></td>
                        <td className="p-3.5">{t("duration_row1_purpose", { defaultValue: "Mantiene la sesión de usuario segura" })}</td>
                        <td className="p-3.5 font-mono">{t("duration_row1_duration", { defaultValue: "Sesión" })}</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{t("duration_row2_cookie", { defaultValue: "__qh_auth_token" })}</td>
                        <td className="p-3.5"><span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold">{t("duration_row2_category", { defaultValue: "Esencial" })}</span></td>
                        <td className="p-3.5">{t("duration_row2_purpose", { defaultValue: "Token cifrado JWT de autenticación" })}</td>
                        <td className="p-3.5 font-mono">{t("duration_row2_duration", { defaultValue: "7 Días" })}</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{t("duration_row3_cookie", { defaultValue: "quhealthy_cookie_consent" })}</td>
                        <td className="p-3.5"><span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold">{t("duration_row3_category", { defaultValue: "Funcional" })}</span></td>
                        <td className="p-3.5">{t("duration_row3_purpose", { defaultValue: "Guarda la preferencia de cookies" })}</td>
                        <td className="p-3.5 font-mono">{t("duration_row3_duration", { defaultValue: "1 Año" })}</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{t("duration_row4_cookie", { defaultValue: "NEXT_LOCALE" })}</td>
                        <td className="p-3.5"><span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold">{t("duration_row4_category", { defaultValue: "Funcional" })}</span></td>
                        <td className="p-3.5">{t("duration_row4_purpose", { defaultValue: "Idioma seleccionado (es/en)" })}</td>
                        <td className="p-3.5 font-mono">{t("duration_row4_duration", { defaultValue: "1 Año" })}</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{t("duration_row5_cookie", { defaultValue: "_ga" })}</td>
                        <td className="p-3.5"><span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-[10px] font-bold">{t("duration_row5_category", { defaultValue: "Analítica" })}</span></td>
                        <td className="p-3.5">{t("duration_row5_purpose", { defaultValue: "Métricas anónimas de visita" })}</td>
                        <td className="p-3.5 font-mono">{t("duration_row5_duration", { defaultValue: "2 Años" })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Sección 5: Datos de Salud Sensibles */}
              <section id="sensitive-data" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ShieldAlert className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("sensitive_title", { defaultValue: "5. Datos de Salud Sensibles" })}
                  </h2>
                </div>
                {renderText(t("sensitive_desc", { defaultValue: "Garantía Cero Rastreo Médico: Las cookies nunca se utilizan para asociar expedientes clínicos, diagnósticos o recetas médicas con perfiles de marketing..." }))}
              </section>

              {/* Sección 6: Derechos de los Usuarios */}
              <section id="rights" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <UserCheck className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("rights_title", { defaultValue: "6. Derechos de los Usuarios" })}
                  </h2>
                </div>
                {renderText(t("rights_desc", { defaultValue: "Puedes retirar tu consentimiento para las cookies no esenciales en cualquier momento sin afectar tu acceso a las funciones básicas..." }))}
              </section>

              {/* Sección 7: Consentimiento & Botón */}
              <section id="consentimiento" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Settings className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("consent_title", { defaultValue: "7. Gestión del Consentimiento" })}
                  </h2>
                </div>
                {renderText(t("consent_desc", { defaultValue: "Haz clic a continuación si deseas restablecer el banner de preferencias de cookies para este navegador:" }))}

                <button
                  type="button"
                  onClick={handleManagePreferences}
                  className="h-11 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" strokeWidth={2} />
                  <span>{t("manage_btn", { defaultValue: "Restablecer Preferencias de Cookies" })}</span>
                </button>
              </section>

              {/* Sección 8: Terceros */}
              <section id="terceros" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Globe className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("thirdparty_title", { defaultValue: "8. Cookies de Terceros" })}
                  </h2>
                </div>
                {renderText(t("thirdparty_desc", { defaultValue: "Servicios como Stripe (procesamiento de pago) o Cloudflare (protección DDoS) pueden colocar cookies técnicas esenciales..." }))}
              </section>

              {/* Sección 9: Menores */}
              <section id="children" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Users className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("children_title", { defaultValue: "9. Privacidad de Menores" })}
                  </h2>
                </div>
                {renderText(t("children_desc", { defaultValue: "No recopilamos intencionalmente datos de menores de edad mediante cookies publicitarias..." }))}
              </section>

              {/* Sección 10: Cambios */}
              <section id="changes" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <History className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("changes_title", { defaultValue: "10. Cambios en la Política" })}
                  </h2>
                </div>
                {renderText(t("changes_desc", { defaultValue: "Esta política puede actualizarse periódicamente. Notificaremos cualquier cambio sustancial por correo..." }))}
              </section>

              {/* Sección 11: Contacto */}
              <section id="contacto" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Mail className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("contact_title", { defaultValue: "11. Contacto de Privacidad" })}
                  </h2>
                </div>
                {renderText(t("contact_desc", { defaultValue: "Para consultas relacionadas con cookies o privacidad de datos:" }))}

                <div className="pt-2">
                  <a
                    href={`mailto:${t("contact_link", { defaultValue: "privacy@quhealthy.org" })}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{t("contact_link", { defaultValue: "privacy@quhealthy.org" })}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </section>

            </motion.article>

          </div>
        </div>
      </section>

    </div>
  );
}
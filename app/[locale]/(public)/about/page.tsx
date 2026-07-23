"use client";

/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/js-hoist-intl */
/* eslint-disable react-doctor/no-giant-component */

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  HeartHandshake,
  Sparkles,
  Compass,
  Fingerprint,
  Earth,
  BadgeCheck,
  UserRound,
  ChevronRight,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePublicStats } from "@/hooks/usePublicStats";
import { cn } from "@/lib/utils";

export default function AboutPage() {
  const t = useTranslations("PublicAbout");
  const locale = useLocale();

  const { stats, isLoading: statsLoading } = usePublicStats();

  const numberFormatter = new Intl.NumberFormat(locale);

  const rawStats: {
    key: string;
    value: number;
    label: string;
    isRating?: boolean;
  }[] = [];

  if (stats?.patients != null)
    rawStats.push({
      key: "patients",
      value: stats.patients,
      label: t("stats.patients", { defaultValue: "Pacientes Registrados" }),
    });

  if (stats?.professionals != null)
    rawStats.push({
      key: "professionals",
      value: stats.professionals,
      label: t("stats.professionals", { defaultValue: "Especialistas Médicos" }),
    });

  const statCards = rawStats.map((s) => ({
    key: s.key,
    label: s.label,
    value: s.isRating
      ? `${s.value.toFixed(1)} ★`
      : numberFormatter.format(s.value),
  }));

  const values = [
    {
      icon: HeartHandshake,
      title: t("values.v1_title", { defaultValue: "Empatía Humana" }),
      description: t("values.v1_desc", { defaultValue: "Priorizamos la relación médico-paciente sobre los procesos administrativos." }),
    },
    {
      icon: Sparkles,
      title: t("values.v2_title", { defaultValue: "Innovación Clínica" }),
      description: t("values.v2_desc", { defaultValue: "Desarrollamos tecnología accesible de alto nivel para potenciar la atención en salud." }),
    },
    {
      icon: Compass,
      title: t("values.v3_title", { defaultValue: "Transparencia Total" }),
      description: t("values.v3_desc", { defaultValue: "Construimos confianza mediante la claridad en información, costos y procesos." }),
    },
  ];

  const trustPillars = [
    {
      icon: Fingerprint,
      title: t("trust.t1_title", { defaultValue: "Privacidad HIPAA / LFPDPPP" }),
      description: t("trust.t1_desc", { defaultValue: "Cifrado integral de expedientes clínicos y datos de salud en reposo y tránsito." }),
    },
    {
      icon: Earth,
      title: t("trust.t2_title", { defaultValue: "Cobertura Omnicanal" }),
      description: t("trust.t2_desc", { defaultValue: "Conectamos especialistas con pacientes en consultas presenciales y digitales." }),
    },
    {
      icon: BadgeCheck,
      title: t("trust.t3_title", { defaultValue: "Profesionales Verificados" }),
      description: t("trust.t3_desc", { defaultValue: "Validación estricta de cédulas profesionales e historial de cada proveedor." }),
    },
  ];

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      
      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Breadcrumb Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800/60 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm">
              <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                QuHealthy
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-bold">
                {t("breadcrumb", { defaultValue: "Acerca de Nosotros" })}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1] max-w-4xl">
              {t("title_light", { defaultValue: "Transformando el acceso a la " })}
              <span className="text-emerald-600 dark:text-emerald-400">
                {t("title_highlight", { defaultValue: "salud digital" })}
              </span>{" "}
              {t("title_dark", { defaultValue: "en América Latina." })}
            </h1>

            <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 font-normal max-w-3xl leading-relaxed pt-2">
              {t("subtitle", { defaultValue: "Creamos un ecosistema inteligente que conecta a pacientes con profesionales de la salud, optimizando expedientes, agendas y la experiencia médica integral." })}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── STATS SECTION ─────────────────────────────────────────────────── */}
      {!statsLoading && statCards.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50/50 dark:bg-[#050505]">
          <div className="container mx-auto px-6 md:px-12 max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
                <Users className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{t("stats_section_title", { defaultValue: "Impacto en Cifras" })}</span>
              </span>
              <div className="h-px bg-gray-200 dark:border-gray-800 flex-1" />
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {statCards.map((stat) => (
                <motion.div
                  key={stat.key}
                  variants={itemVariants}
                  className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between"
                >
                  <p className="text-3xl md:text-4xl font-bold font-mono text-gray-900 dark:text-white tracking-tight mb-2">
                    {stat.value}
                  </p>
                  <p className="text-xs font-semibold text-gray-500">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── MISSION SECTION (MANIFIESTO) ─────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white dark:bg-[#0a0a0a] border-y border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 md:p-14 shadow-sm space-y-6"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
              <Target className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Nuestro Manifiesto</span>
            </span>

            <h3 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
              {t("mission_title", { defaultValue: "Redefiniendo la salud digital mediante tecnología accesible e inteligente." })}
            </h3>

            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium leading-relaxed max-w-2xl mx-auto">
              {t("mission_desc", { defaultValue: "Creemos en un futuro donde la atención médica es fluida, transparente y centrada en el bienestar real del paciente, eliminando las barreras burocráticas y conectando vidas." })}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── VALUES SECTION ───────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505]">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="mb-14 space-y-2 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              {t("values_title", { defaultValue: "Nuestros Valores Fundamentales" })}
            </h2>
            <p className="text-sm md:text-base text-gray-500 font-medium">
              {t("values_subtitle", { defaultValue: "Principios que guían cada decisión y herramienta que construimos." })}
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-6 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {val.title}
                    </h3>
                    <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── TRUST & SECURITY SECTION ──────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="mb-14 space-y-2 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              {t("trust_title", { defaultValue: "Confianza y Seguridad Absoluta" })}
            </h2>
            <p className="text-sm md:text-base text-gray-500 font-medium">
              {t("trust_subtitle", { defaultValue: "Protección rigurosa de datos clínicos e infraestructura garantizada." })}
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12"
          >
            {trustPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-3xl p-7 shadow-sm space-y-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {pillar.title}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <span>{t("trust_cta_privacy", { defaultValue: "Política de Privacidad" })}</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
            <Link
              href="/cookies"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <span>{t("trust_cta_cookies", { defaultValue: "Política de Cookies" })}</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TEAM SECTION ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="mb-14 space-y-2 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              {t("team_title", { defaultValue: "Liderazgo y Equipo" })}
            </h2>
            <p className="text-sm md:text-base text-gray-500 font-medium">
              {t("team_subtitle", { defaultValue: "Ingenieros y profesionales comprometidos con transformar la salud." })}
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Founder card */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-4 hover:border-emerald-500/30 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm">
                <UserRound className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("team_founder_name", { defaultValue: "Marcos Sandoval Ruiz" })}
                </h3>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                  {t("team_founder_role", { defaultValue: "Founder & Lead Architect" })}
                </p>
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed pt-2">
                {t("team_founder_bio", { defaultValue: "Ingeniero con amplia experiencia en arquitectura de software, microservicios e infraestructura en la nube enfocada en tecnología médica." })}
              </p>
            </motion.div>

            {/* Partner 1 */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-4 hover:border-emerald-500/30 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm">
                <UserRound className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("team_partner_fausto_name", { defaultValue: "Fausto" })}
                </h3>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                  {t("team_partner_fausto_role", { defaultValue: "Strategic Advisor" })}
                </p>
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed pt-2">
                {t("team_partner_fausto_bio", { defaultValue: "Especialista en estrategia comercial y crecimiento operativo dentro del sector tecnológico y de salud." })}
              </p>
            </motion.div>

            {/* Partner 2 */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-4 hover:border-emerald-500/30 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm">
                <UserRound className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("team_partner_pedro_name", { defaultValue: "Pedro" })}
                </h3>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
                  {t("team_partner_pedro_role", { defaultValue: "Operations & Alliances" })}
                </p>
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed pt-2">
                {t("team_partner_pedro_bio", { defaultValue: "Enfocado en alianzas institucionales y la expansión de la red de profesionales de la salud." })}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CLOSING CTA SECTION ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gray-900 dark:bg-[#0a0a0a] border-t border-gray-800 m-4 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Forma parte del cambio</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            {t("cta_title", { defaultValue: "¿Listo para transformar tu práctica médica o gestión de salud?" })}
          </h2>

          <p className="text-xs md:text-base text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
            {t("cta_desc", { defaultValue: "Unete hoy a la plataforma médica inteligente y optimiza la atención de tus pacientes." })}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/provider/register"
              className="w-full sm:w-auto h-12 px-7 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
            >
              <span>{t("cta_provider_btn", { defaultValue: "Registrarme como Médico" })}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>

            <Link
              href="/contact"
              className="w-full sm:w-auto h-12 px-7 rounded-xl border border-gray-700 bg-white/5 hover:bg-white/10 text-white transition-colors text-xs font-bold shadow-sm flex items-center justify-center"
            >
              <span>{t("cta_contact_btn", { defaultValue: "Contactar Ventas" })}</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
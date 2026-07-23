"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-static-value */

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Briefcase,
  Laptop,
  HeartPulse,
  ChevronRight,
  Sparkles,
  Send,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import axiosInstance from "@/lib/axios";
import { useTranslations } from "next-intl";

import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

// Interfaz esperada del backend
interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  tag?: string;
  applyUrl?: string;
}

const fetcher = (url: string) =>
  axiosInstance.get<JobOpening[]>(url).then((res) => res.data);
const CAREERS_EMAIL = "careers@quhealthy.org";

function buildMailto(subject: string) {
  return `mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export default function CareersPage() {
  const t = useTranslations("PublicCareers");
  const {
    data: jobOpenings,
    isLoading,
    error,
    mutate,
  } = useSWR<JobOpening[]>("/api/careers/openings", fetcher, {
    revalidateOnFocus: false,
  });

  const benefits = [
    {
      icon: Laptop,
      title: t("benefits.b1_title", { defaultValue: "Trabajo Flexible y Remoto" }),
      desc: t("benefits.b1_desc", { defaultValue: "Fomentamos la autonomía con esquemas híbridos y remotos orientados a resultados." }),
    },
    {
      icon: HeartPulse,
      title: t("benefits.b2_title", { defaultValue: "Impacto en Salud Real" }),
      desc: t("benefits.b2_desc", { defaultValue: "Cada línea de código y diseño mejora directamente la atención médica de miles de pacientes." }),
    },
    {
      icon: Briefcase,
      title: t("benefits.b3_title", { defaultValue: "Crecimiento y Aprendizaje" }),
      desc: t("benefits.b3_desc", { defaultValue: "Acceso a certificaciones, cursos y un equipo de ingeniería y salud de alto nivel." }),
    },
  ];

  const handleApply = (job: JobOpening) => {
    if (job.applyUrl) {
      window.open(job.applyUrl, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = buildMailto(
        `${t("apply", { defaultValue: "Postulación" })}: ${job.title}`
      );
    }
  };

  const handleOpenApplication = () => {
    window.location.href = buildMailto(
      t("open_app_title", { defaultValue: "Candidatura Espontánea" })
    );
  };

  // Variantes de animación
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
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
                {t("breadcrumb", { defaultValue: "Carreras & Talento" })}
              </span>
            </div>

            <div className="max-w-3xl space-y-3">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                {t("title_light", { defaultValue: "Construye el Futuro de la " })}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {t("title_highlight", { defaultValue: "Salud Digital" })}
                </span>{" "}
                {t("title_dark", { defaultValue: "con Nosotros" })}
              </h1>

              <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 font-normal leading-relaxed max-w-2xl pt-1">
                {t("subtitle", { defaultValue: "Buscamos profesionales apasionados por resolver retos en tecnología médica, arquitectura de software e inteligencia clínica." })}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("openings")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="h-12 px-7 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
              >
                <span>{t("view_openings", { defaultValue: "Ver Posiciones Abiertas" })}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BENEFITS SECTION ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="mb-14 space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Cultura & Beneficios</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight pt-1">
              {t("why_title", { defaultValue: "¿Por qué trabajar en QuHealthy?" })}
            </h2>
            <p className="text-sm md:text-base text-gray-500 font-medium">
              {t("why_subtitle", { defaultValue: "Ofrecemos un entorno flexible, innovador y enfocado en generar impacto social duradero." })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.08,
                    ease: "easeOut",
                  }}
                  className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:border-emerald-500/30 transition-all space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {benefit.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── OPENINGS SECTION ──────────────────────────────────────────────── */}
      <section
        id="openings"
        className="py-20 md:py-28 bg-white dark:bg-[#0a0a0a] scroll-mt-10"
      >
        <div className="container mx-auto px-6 md:px-12 max-w-5xl space-y-8">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
                <Briefcase className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Oportunidades Laborales</span>
              </span>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight pt-1">
                {t("openings_title", { defaultValue: "Posiciones Disponibles" })}
              </h2>
            </div>

            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300">
              {jobOpenings?.length || 0} Vacantes
            </span>
          </div>

          <div>
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs font-semibold text-gray-400">
                  {t("loading", { defaultValue: "Buscando vacantes disponibles..." })}
                </p>
              </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <div className="bg-white dark:bg-[#0a0a0a] border border-red-200 dark:border-red-900/40 rounded-3xl p-8 text-center space-y-3 shadow-sm">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("error_title", { defaultValue: "Error al cargar las ofertas" })}
                </h3>
                <p className="text-xs font-medium text-gray-500 max-w-sm mx-auto">
                  {t("error_desc", { defaultValue: "No pudimos conectar con el servicio de empleos. Por favor reintenta." })}
                </p>
                <button
                  type="button"
                  onClick={() => mutate()}
                  className="h-10 px-5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {t("retry_btn", { defaultValue: "Reintentar" })}
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading &&
              !error &&
              (!jobOpenings || jobOpenings.length === 0) && (
                <div className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center space-y-3">
                  <Briefcase className="w-8 h-8 text-gray-400 mx-auto" strokeWidth={1.5} />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {t("empty_title", { defaultValue: "No hay vacantes abiertas por el momento" })}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 max-w-md mx-auto leading-relaxed">
                    {t("empty_desc", { defaultValue: "Constantemente buscamos talento. Envíanos tu candidatura espontánea a continuación." })}
                  </p>
                </div>
              )}

            {/* Jobs List */}
            {!isLoading && !error && jobOpenings && jobOpenings.length > 0 && (
              <motion.div
                variants={listVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="space-y-3"
              >
                {jobOpenings.map((job, idx) => (
                  <motion.div
                    variants={itemVariants}
                    key={job.id || idx}
                    onClick={() => handleApply(job)}
                    className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:border-emerald-500/30 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {job.title}
                        </h3>
                        {job.tag && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-[10px] font-bold">
                            {job.tag}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-gray-500">
                        <span className="text-gray-700 dark:text-gray-300">{job.department}</span>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{job.location}</span>
                        </span>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                        <span>{job.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 pt-2 md:pt-0">
                      <span>{t("apply", { defaultValue: "Postularme" })}</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={2} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Candidatura Espontánea Card */}
          <div className="bg-gray-900 dark:bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8 md:p-10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white mt-12">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Send className="w-4 h-4" />
                <span>Candidatura Espontánea</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {t("open_app_title", { defaultValue: "¿No encuentras tu puesto ideal?" })}
              </h3>
              <p className="text-xs font-medium text-gray-300 leading-relaxed">
                {t("open_app_desc", { defaultValue: "Envíanos tu CV e información profesional. Siempre estamos en búsqueda de talento excepcional para sumarse al equipo." })}
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenApplication}
              className="h-12 px-7 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm shrink-0 flex items-center gap-2"
            >
              <span>{t("open_app_btn", { defaultValue: "Enviar mi CV" })}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* EEO Statement */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 leading-relaxed">
              {t("eeo_statement", { defaultValue: "QuHealthy es un empleador que ofrece igualdad de oportunidades. Evaluamos a los candidatos sin distinción de raza, color, religión, sexo, orientación sexual, identidad de género, origen nacional, estado de discapacidad o cualquier otra característica protegida por la ley." })}
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
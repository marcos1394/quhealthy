"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Award,
  FileText,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  Scale
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TestimonialsSection: React.FC = () => {
  const t = useTranslations("Testimonials");

  const standards = [
    {
      id: "dgp",
      title: t("items.1.name"),
      subtitle: t("items.1.role"),
      description: t("items.1.text"),
      icon: Award,
      badge: "DGP / SEP",
      badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900/40",
      spec: "Cédula Federal • DGP SEP Verificada",
    },
    {
      id: "nom004",
      title: t("items.2.name"),
      subtitle: t("items.2.role"),
      description: t("items.2.text"),
      icon: FileText,
      badge: "NOM-004 & NOM-024",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40",
      spec: "Notas SOAP • Receta Digital QR • SSA & COFEPRIS",
    },
    {
      id: "privacy",
      title: t("items.3.name"),
      subtitle: t("items.3.role"),
      description: t("items.3.text"),
      icon: Lock,
      badge: "Cifrado Bancario",
      badgeColor: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/40",
      spec: "Cifrado AES-256 • Cumplimiento LFPDPPP • Servidores GCP",
    },
  ];

  return (
    <section
      id="estandares-clinicos"
      className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 border-t border-gray-100 dark:border-gray-800 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30"
    >
      <div className="container mx-auto px-6 md:px-12 xl:px-20 max-w-7xl">
        
        {/* ── ENCABEZADO PRINCIPAL (ALTA AUTORIDAD & SEO) ────────────────── */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
            <ShieldCheck className="w-4 h-4" strokeWidth={2} />
            <span>{t("badge", { defaultValue: "Rigor Clínico & Seguridad Jurídica" })}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.12]">
            {t("title_start", { defaultValue: "El Estándar Clínico " })}
            <span className="font-serif italic text-emerald-600 dark:text-emerald-400 font-normal">
              {t("title_highlight", { defaultValue: "QuHealthy" })}
            </span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-2xl pt-1">
            {t("description", {
              defaultValue:
                "Diseñado bajo el marco legal y sanitario de México. Una plataforma construida para respaldar tu práctica médica con total tranquilidad regulatoria y seguridad para tus pacientes.",
            })}
          </p>
        </div>

        {/* ── GRILLA DE PILARES CLÍNICOS Y NORMATIVOS ─────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-7xl mx-auto mb-12">
          {standards.map((standard, index) => {
            const Icon = standard.icon;
            return (
              <motion.div
                key={standard.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-7 md:p-8 shadow-sm hover:border-emerald-500/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Encabezado de la Tarjeta con Insignia Técnica */}
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>

                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold border",
                        standard.badgeColor
                      )}
                    >
                      {standard.badge}
                    </span>
                  </div>

                  {/* Títulos y Rol */}
                  <div className="pt-2">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug">
                      {standard.title}
                    </h3>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-1">
                      {standard.subtitle}
                    </p>
                  </div>

                  {/* Explicación Técnica y Regulatoria */}
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                    {standard.description}
                  </p>
                </div>

                {/* Footer de la tarjeta con especificación técnica */}
                <div className="pt-5 border-t border-gray-100 dark:border-gray-800/80 flex items-center gap-2 mt-6">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 truncate">
                    {standard.spec}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── BANNER DESTACADO: PROGRAMA DE MÉDICOS FUNDADORES 2026 ────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-3xl bg-gradient-to-br from-emerald-950/40 via-gray-900 to-black text-white p-8 sm:p-10 lg:p-12 border border-emerald-800/40 shadow-xl overflow-hidden max-w-7xl mx-auto"
        >
          {/* Luz ambiental de fondo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 max-w-2xl text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {t("founder_banner.badge", {
                    defaultValue: "Convocatoria Abierta • Grupo Pionero 2026",
                  })}
                </span>
              </div>

              <h3 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
                {t("founder_banner.title", {
                  defaultValue: "Programa de Médicos y Clínicas Fundadoras",
                })}
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {t("founder_banner.description", {
                  defaultValue:
                    "Estamos seleccionando a los primeros profesionales de la salud en México para co-diseñar el futuro de la práctica médica digital. Recibe onboarding prioritario 1-a-1, personalización de formatos clínicos y beneficios preferenciales vitalicios.",
                })}
              </p>

              {/* Badges de Beneficios Reales */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-semibold text-emerald-300">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Onboarding 1-a-1 personalizado
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sin costo de implementación
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Facturación CFDI 4.0 lista
                </span>
              </div>
            </div>

            {/* Botón CTA a Registro de Profesional */}
            <div className="shrink-0 w-full lg:w-auto">
              <Link href="/provider/register" className="block w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 px-7 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <span>
                    {t("founder_banner.button", {
                      defaultValue: "Comenzar como Médico Fundador",
                    })}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
export { TestimonialsSection as ClinicalStandardsSection };
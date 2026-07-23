"use client";

/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck,
  Activity,
  UserCheck,
  Star,
  FileText,
  CheckCircle2,
  Info,
  Award,
  Sparkles,
  ChevronRight,
  Mail,
  Calendar,
  Layers,
} from "lucide-react";
import { providerScoreService } from "@/services/providerScore.service";
import { QuScoreMethodologyResponse } from "@/types/providerScore";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

export default function QuScoreMethodologyPage() {
  const [methodology, setMethodology] =
    useState<QuScoreMethodologyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    providerScoreService
      .getScoreMethodology()
      .then(setMethodology)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const getPillarIcon = (key: string) => {
    switch (key) {
      case "P1":
        return <ShieldCheck className="w-6 h-6" strokeWidth={2} />;
      case "P2":
        return <Star className="w-6 h-6" strokeWidth={2} />;
      case "P3":
        return <UserCheck className="w-6 h-6" strokeWidth={2} />;
      case "P4":
        return <Activity className="w-6 h-6" strokeWidth={2} />;
      case "P5":
        return <FileText className="w-6 h-6" strokeWidth={2} />;
      default:
        return <Info className="w-6 h-6" strokeWidth={2} />;
    }
  };

  // ── ESTADO: CARGANDO ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center gap-3 transition-colors font-sans">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-400 animate-pulse">
          Sintetizando metodología algorítmica QuScore...
        </p>
      </div>
    );
  }

  // ── ESTADO: ERROR ──────────────────────────────────────────────────────────
  if (!methodology) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex items-center justify-center p-6 font-sans">
        <div className="bg-white dark:bg-[#0a0a0a] border border-red-200 dark:border-red-900/40 rounded-3xl p-8 max-w-md text-center space-y-3 shadow-sm">
          <Info className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Error de Recuperación
          </h3>
          <p className="text-xs font-medium text-gray-500">
            No fue posible cargar la metodología del QuScore. Por favor reintenta más tarde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      
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
              <Link
                href="/"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                QuHealthy
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-bold">
                Metodología QuScore
              </span>
            </div>

            <div className="max-w-4xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm">
                  <Activity className="h-6 w-6" strokeWidth={2} />
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                  Metodología <span className="text-emerald-600 dark:text-emerald-400">QuScore</span>
                </h1>
              </div>

              <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 font-normal leading-relaxed max-w-3xl pt-1">
                {methodology.description}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CONTENIDO PRINCIPAL ────────────────────────────────────────────── */}
      <div className="container mx-auto px-6 md:px-12 max-w-6xl mt-12 space-y-16">
        
        {/* BARRA DE METADATOS TÉCNICOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Info className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Versión del Algoritmo</p>
              <p className="text-sm font-bold font-mono text-gray-900 dark:text-white">
                {methodology.algorithmVersion}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Calendar className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Última Revisión Clínica</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {new Date(methodology.lastReviewedAt).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Mail className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contacto de Auditoría</p>
              <a
                href={`mailto:${methodology.feedbackContact}`}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline truncate block"
              >
                {methodology.feedbackContact}
              </a>
            </div>
          </div>
        </div>

        {/* LOS 5 PILARES DE CALIDAD */}
        <div className="space-y-8">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
              <Layers className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Estructura de Evaluación</span>
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight pt-1">
              Los 5 Pilares de la Calidad Médica
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(methodology.weights).map(([key, pillar], idx) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between group space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                      {getPillarIcon(key)}
                    </div>
                    <span className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                      {pillar.weightPercentage}%
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {pillar.name}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed min-h-[48px]">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Criterios Evaluados:</p>
                  {pillar.criteria.map((crit, cIdx) => (
                    <div
                      key={cIdx}
                      className="flex items-start gap-2 text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                      <CheckCircle2
                        className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"
                        strokeWidth={2}
                      />
                      <span className="leading-snug">{crit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* NIVELES DE RECONOCIMIENTO */}
        <div className="space-y-8">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Escala de Calificación</span>
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight pt-1">
              Niveles de Reconocimiento Profesional
            </h2>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
            {methodology.scoreBands.map((band, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-sm">
                    {band.bandName}
                  </span>
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
                    {band.minScore === 0 && band.maxScore === 0
                      ? "Nivel Inicial"
                      : `${band.minScore} - ${band.maxScore} Puntos`}
                  </span>
                </div>

                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-relaxed flex-1 sm:text-right">
                  {band.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* TRANSPARENCIA Y ÉTICA ALGORÍTMICA */}
        <div className="bg-gray-900 dark:bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8 md:p-10 shadow-xl text-white flex flex-col md:flex-row items-start gap-6 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-400 shadow-sm">
            <Award className="w-7 h-7" strokeWidth={2} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">
                Transparencia y Ética Algorítmica Garantizada
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-[10px] font-bold">
                100% Orgánico
              </span>
            </div>

            <p className="text-xs font-medium text-gray-300 leading-relaxed">
              El QuScore es un algoritmo estrictamente orgánico, transparente y ético. Cualquier entidad médica o especialista que invierta en promoción en la plataforma aparecerá claramente identificado con la etiqueta <strong className="text-white">"Patrocinado"</strong> de forma independiente.
            </p>

            <p className="text-xs font-bold text-emerald-400 pt-1 border-t border-gray-800">
              Ningún pago comercial o patrocinio puede alterar la puntuación del QuScore ni influir en el ranking orgánico de búsqueda.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
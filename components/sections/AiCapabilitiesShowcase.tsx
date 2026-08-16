"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Mic, 
  Languages, 
  FileText, 
  CheckCircle2, 
  BrainCircuit, 
  QrCode, 
  ShieldCheck, 
  Volume2, 
  Play, 
  Square,
  ArrowRight,
  Activity,
  Stethoscope,
  Pill,
  Clock,
  Check
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Link from "next/link";

type TabKey = "scribe" | "translation" | "prescription";

export const AiCapabilitiesShowcase: React.FC = () => {
  const t = useTranslations("AiCapabilities");
  const [activeTab, setActiveTab] = useState<TabKey>("scribe");
  const [isSimulatingScribe, setIsSimulatingScribe] = useState(true);

  const tabs: { key: TabKey; icon: React.ElementType; title: string; badge: string }[] = [
    {
      key: "scribe",
      icon: Mic,
      title: t("tabs.scribe.title"),
      badge: t("tabs.scribe.badge"),
    },
    {
      key: "translation",
      icon: Languages,
      title: t("tabs.translation.title"),
      badge: t("tabs.translation.badge"),
    },
    {
      key: "prescription",
      icon: Pill,
      title: t("tabs.prescription.title"),
      badge: t("tabs.prescription.badge"),
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-[#080808] border-b border-gray-100 dark:border-gray-800 transition-colors duration-500 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 xl:px-20 max-w-7xl">
        
        {/* ── ENCABEZADO DE SECCIÓN ────────────────────────────────────────── */}
        <div className="max-w-3xl mb-12 md:mb-16 mx-auto text-center flex flex-col items-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" strokeWidth={2} />
            <span>{t("badge")}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.12]">
            {t("title_start")}{" "}
            <span className="font-serif italic text-emerald-600 dark:text-emerald-400 font-normal">
              {t("title_highlight")}
            </span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xl mx-auto pt-1">
            {t("description")}
          </p>
        </div>

        {/* ── TABS SELECTOR INTERACTIVO ────────────────────────────────────── */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-2">
          <div className="p-1.5 rounded-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200/80 dark:border-gray-800 flex items-center gap-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  <span>{tab.title}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    )}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CONTENIDO DINÁMICO DEL TAB ──────────────────────────────────── */}
        <div className="grid lg:grid-cols-12 gap-8 items-center bg-gray-50/70 dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800/80 p-6 sm:p-10 shadow-sm">
          
          <AnimatePresence mode="wait">
            {activeTab === "scribe" && (
              <motion.div
                key="scribe"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="lg:col-span-12 grid lg:grid-cols-12 gap-8 items-center"
              >
                {/* Columna Izquierda: Descripción */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    <Mic className="w-3.5 h-3.5" />
                    <span>{t("scribe.tag")}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
                    {t("scribe.headline")}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {t("scribe.paragraph")}
                  </p>

                  <div className="space-y-3 pt-2">
                    {[
                      t("scribe.bullet1"),
                      t("scribe.bullet2"),
                      t("scribe.bullet3"),
                    ].map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/provider/dashboard"
                      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 group"
                    >
                      <span>{t("scribe.cta")}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Columna Derecha: Mockup Interactivo de AI Scribe */}
                <div className="lg:col-span-7 bg-white dark:bg-[#111] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-md space-y-4">
                  {/* Barra Superior del Mockup */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {t("scribe.mockup.live_recording")}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400">12:45 min</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                        {t("scribe.mockup.status_structuring")}
                      </span>
                    </div>
                  </div>

                  {/* Transcripción de Audio en Vivo */}
                  <div className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t("scribe.mockup.audio_stream")}</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium italic">
                      &ldquo;{t("scribe.mockup.sample_dialogue")}&rdquo;
                    </p>
                  </div>

                  {/* Formato SOAP Generado */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-900/30 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">S</span>
                        <span className="text-[11px] font-bold text-gray-900 dark:text-white">Subjetivo</span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug">
                        {t("scribe.mockup.soap_s")}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-900/30 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">O</span>
                        <span className="text-[11px] font-bold text-gray-900 dark:text-white">Objetivo</span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug">
                        {t("scribe.mockup.soap_o")}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-900/30 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">A</span>
                        <span className="text-[11px] font-bold text-gray-900 dark:text-white">Análisis CIE-10</span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug">
                        {t("scribe.mockup.soap_a")}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-900/30 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">P</span>
                        <span className="text-[11px] font-bold text-gray-900 dark:text-white">Plan de Manejo</span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug">
                        {t("scribe.mockup.soap_p")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "translation" && (
              <motion.div
                key="translation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="lg:col-span-12 grid lg:grid-cols-12 gap-8 items-center"
              >
                {/* Columna Izquierda: Descripción */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-100/70 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 text-xs font-bold">
                    <Languages className="w-3.5 h-3.5" />
                    <span>{t("translation.tag")}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
                    {t("translation.headline")}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {t("translation.paragraph")}
                  </p>

                  <div className="space-y-3 pt-2">
                    {[
                      t("translation.bullet1"),
                      t("translation.bullet2"),
                      t("translation.bullet3"),
                    ].map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/discover"
                      className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 group"
                    >
                      <span>{t("translation.cta")}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Columna Derecha: Mockup de Videollamada con Traducción */}
                <div className="lg:col-span-7 bg-gray-900 text-white rounded-2xl p-5 shadow-xl space-y-4 border border-gray-800 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold">Telemedicina Internacional HD</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-800/80 px-2.5 py-1 rounded-full text-[11px] font-mono">
                      <Languages className="w-3.5 h-3.5 text-sky-400" />
                      <span>ES ⇄ EN (Traducción Activa)</span>
                    </div>
                  </div>

                  {/* Ventana de Video Simulada */}
                  <div className="grid grid-cols-2 gap-3 h-44">
                    <div className="bg-gray-800/90 rounded-xl p-3 flex flex-col justify-between border border-gray-700/60 relative">
                      <span className="text-[10px] font-bold bg-black/60 px-2 py-0.5 rounded-md w-fit">
                        Dra. Sofía Valenzuela (México)
                      </span>
                      <div className="space-y-1 bg-black/70 p-2 rounded-lg backdrop-blur-xs">
                        <p className="text-[10px] text-gray-300">
                          &ldquo;Los estudios muestran que tu nivel de glucosa está bien controlado.&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-800/90 rounded-xl p-3 flex flex-col justify-between border border-gray-700/60 relative">
                      <span className="text-[10px] font-bold bg-black/60 px-2 py-0.5 rounded-md w-fit">
                        John Miller (Estados Unidos)
                      </span>
                      <div className="space-y-1 bg-sky-950/80 border border-sky-800/50 p-2 rounded-lg backdrop-blur-xs">
                        <span className="text-[9px] font-bold text-sky-300 uppercase tracking-wider">Subtítulo en vivo:</span>
                        <p className="text-[10px] text-white font-medium">
                          &ldquo;The lab tests show your glucose levels are very well controlled.&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Controles */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>Latencia de traducción &lt; 250ms</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                      Cifrado E2E NOM-024 / HIPAA
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "prescription" && (
              <motion.div
                key="prescription"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="lg:col-span-12 grid lg:grid-cols-12 gap-8 items-center"
              >
                {/* Columna Izquierda: Descripción */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-100/70 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 text-xs font-bold">
                    <Pill className="w-3.5 h-3.5" />
                    <span>{t("prescription.tag")}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
                    {t("prescription.headline")}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {t("prescription.paragraph")}
                  </p>

                  <div className="space-y-3 pt-2">
                    {[
                      t("prescription.bullet1"),
                      t("prescription.bullet2"),
                      t("prescription.bullet3"),
                    ].map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/provider/dashboard"
                      className="inline-flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 group"
                    >
                      <span>{t("prescription.cta")}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Columna Derecha: Mockup de Receta Digital con QR y Alertas */}
                <div className="lg:col-span-7 bg-white dark:bg-[#111] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-md space-y-4">
                  {/* Encabezado de Receta Oficial */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        Rx
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                          Receta Médica Digital Certificada
                        </h4>
                        <p className="text-[10px] text-gray-500">Cédula Profesional: 9834112 • COFEPRIS</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-900/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Firma Electrónica Válida</span>
                    </div>
                  </div>

                  {/* Medicamentos Prescritos con Sugerencia IA */}
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">Metformina 850mg (Tabletas)</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                          Dosificación Verificada por IA
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">Tomar 1 tableta cada 12 horas después de los alimentos por 90 días.</p>
                    </div>

                    {/* Alerta de Seguridad de Interacción */}
                    <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                          Sin interacciones medicamentosas detectadas
                        </span>
                        <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400">
                          El copiloto validó el historial de alergias y fármacos crónicos del expediente del paciente.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer con QR */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium">
                        Código QR escaneable en cualquier farmacia de México
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">Folio: QH-2026-8942</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
};

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flower2, 
  Activity, 
  Heart, 
  Utensils, 
  Users, 
  Watch, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Camera, 
  Baby, 
  Award,
  Zap
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Link from "next/link";

type JourneyKey = "womens" | "diabetes" | "oncology" | "nutrition" | "family" | "wearables";

export const SpecializedJourneysSection: React.FC = () => {
  const t = useTranslations("SpecializedJourneys");
  const [activeJourney, setActiveJourney] = useState<JourneyKey>("womens");

  const journeys: { key: JourneyKey; icon: React.ElementType; title: string; color: string }[] = [
    { key: "womens", icon: Flower2, title: t("journeys.womens.tab"), color: "text-pink-600 dark:text-pink-400" },
    { key: "diabetes", icon: Activity, title: t("journeys.diabetes.tab"), color: "text-blue-600 dark:text-blue-400" },
    { key: "oncology", icon: Heart, title: t("journeys.oncology.tab"), color: "text-purple-600 dark:text-purple-400" },
    { key: "nutrition", icon: Utensils, title: t("journeys.nutrition.tab"), color: "text-lime-600 dark:text-lime-400" },
    { key: "family", icon: Users, title: t("journeys.family.tab"), color: "text-amber-600 dark:text-amber-400" },
    { key: "wearables", icon: Watch, title: t("journeys.wearables.tab"), color: "text-emerald-600 dark:text-emerald-400" },
  ];

  return (
    <section className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 transition-colors duration-500 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 xl:px-20 max-w-7xl">
        
        {/* ── ENCABEZADO DE SECCIÓN ────────────────────────────────────────── */}
        <div className="max-w-3xl mb-12 md:mb-16 mx-auto text-center flex flex-col items-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
            <Activity className="w-3.5 h-3.5 animate-pulse" strokeWidth={2} />
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

        {/* ── SELECTOR DE RUTAS ESPECIALIZADAS ────────────────────────────── */}
        <div className="flex justify-start md:justify-center mb-10 overflow-x-auto pb-3 gap-2 no-scrollbar">
          {journeys.map((j) => {
            const Icon = j.icon;
            const isActive = activeJourney === j.key;
            return (
              <button
                key={j.key}
                type="button"
                onClick={() => setActiveJourney(j.key)}
                className={cn(
                  "px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer shrink-0 shadow-2xs",
                  isActive
                    ? "bg-white dark:bg-[#111] text-gray-900 dark:text-white border border-emerald-500/50 shadow-sm ring-2 ring-emerald-500/20"
                    : "bg-white/60 dark:bg-[#0a0a0a] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                )}
              >
                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800", isActive && "bg-emerald-50 dark:bg-emerald-950/50")}>
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500")} strokeWidth={2} />
                </div>
                <span>{j.title}</span>
              </button>
            );
          })}
        </div>

        {/* ── CARD PRINCIPAL DEL JOURNEY ─────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-10 shadow-sm">
          <AnimatePresence mode="wait">
            
            {/* 🌸 1. SALUD FEMENINA & EMBARAZO */}
            {activeJourney === "womens" && (
              <motion.div
                key="womens"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 text-xs font-bold">
                    <Flower2 className="w-3.5 h-3.5" />
                    <span>{t("journeys.womens.tag")}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {t("journeys.womens.headline")}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {t("journeys.womens.description")}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {[
                      t("journeys.womens.feature1"),
                      t("journeys.womens.feature2"),
                      t("journeys.womens.feature3"),
                      t("journeys.womens.feature4"),
                    ].map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/patient/dashboard/womens-health"
                      className="inline-flex items-center gap-2 text-xs font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 group"
                    >
                      <span>{t("journeys.womens.cta")}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Mockup Interactivo de Salud Femenina */}
                <div className="lg:col-span-6 bg-pink-50/40 dark:bg-[#111] rounded-2xl p-6 border border-pink-100 dark:border-gray-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Flower2 className="w-5 h-5 text-pink-600" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Ciclo Menstrual y Embarazo</span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300">
                      Semana 24 Gestación
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Próximo Periodo / Parto</span>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">12 de Octubre</p>
                      <span className="text-[10px] text-pink-600 font-medium">Predicción 98% de precisión</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Movimientos Fetales</span>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">14 en 2 horas</p>
                      <span className="text-[10px] text-emerald-600 font-medium">Parámetro saludable</span>
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span className="text-xs font-bold text-rose-900 dark:text-rose-200">Asistente Obstétrico IA Activo</span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-600">Alerta 24/7</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 🩸 2. DIABETES & SALUD METABÓLICA */}
            {activeJourney === "diabetes" && (
              <motion.div
                key="diabetes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{t("journeys.diabetes.tag")}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {t("journeys.diabetes.headline")}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {t("journeys.diabetes.description")}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {[
                      t("journeys.diabetes.feature1"),
                      t("journeys.diabetes.feature2"),
                      t("journeys.diabetes.feature3"),
                      t("journeys.diabetes.feature4"),
                    ].map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/patient/diabetes"
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 group"
                    >
                      <span>{t("journeys.diabetes.cta")}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-blue-50/40 dark:bg-[#111] rounded-2xl p-6 border border-blue-100 dark:border-gray-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-blue-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Panel Glucémico & HbA1c</span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                      Rango Óptimo
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Glucosa en Ayuno</span>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">96 mg/dL</p>
                      <span className="text-[10px] text-emerald-600 font-medium">Normal (70-99 mg/dL)</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">HbA1c Estimada</span>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">5.4%</p>
                      <span className="text-[10px] text-emerald-600 font-medium">Control metabólico excelente</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Alertas de Carbohidratos</span>
                      <p className="text-[10px] text-gray-500">Sincronizado con Food Analyzer IA</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-600">45g restantes</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 🎗️ 3. ONCOLOGÍA & ENFERMEDADES CRÓNICAS */}
            {activeJourney === "oncology" && (
              <motion.div
                key="oncology"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{t("journeys.oncology.tag")}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {t("journeys.oncology.headline")}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {t("journeys.oncology.description")}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {[
                      t("journeys.oncology.feature1"),
                      t("journeys.oncology.feature2"),
                      t("journeys.oncology.feature3"),
                      t("journeys.oncology.feature4"),
                    ].map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/patient/oncology"
                      className="inline-flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 group"
                    >
                      <span>{t("journeys.oncology.cta")}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-purple-50/40 dark:bg-[#111] rounded-2xl p-6 border border-purple-100 dark:border-gray-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-purple-600" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Estadiaje TNM y Ciclos</span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                      Ciclo 3 / 6 Completado
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 bg-white dark:bg-[#0a0a0a] rounded-xl text-center border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 font-bold">Tumor</span>
                      <p className="text-sm font-bold text-purple-600">T2</p>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-[#0a0a0a] rounded-xl text-center border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 font-bold">Nódulo</span>
                      <p className="text-sm font-bold text-purple-600">N0</p>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-[#0a0a0a] rounded-xl text-center border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 font-bold">Metástasis</span>
                      <p className="text-sm font-bold text-purple-600">M0</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Adherencia Farmacológica</span>
                      <span className="text-xs font-bold text-emerald-600">96%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[96%]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 🥗 4. NUTRICIÓN & FOOD ANALYZER IA */}
            {activeJourney === "nutrition" && (
              <motion.div
                key="nutrition"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-lime-50 dark:bg-lime-950/40 text-lime-800 dark:text-lime-300 text-xs font-bold">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>{t("journeys.nutrition.tag")}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {t("journeys.nutrition.headline")}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {t("journeys.nutrition.description")}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {[
                      t("journeys.nutrition.feature1"),
                      t("journeys.nutrition.feature2"),
                      t("journeys.nutrition.feature3"),
                      t("journeys.nutrition.feature4"),
                    ].map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-lime-600 dark:text-lime-400 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/patient/dashboard/nutrition"
                      className="inline-flex items-center gap-2 text-xs font-bold text-lime-700 dark:text-lime-400 hover:text-lime-800 group"
                    >
                      <span>{t("journeys.nutrition.cta")}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-lime-50/40 dark:bg-[#111] rounded-2xl p-6 border border-lime-100 dark:border-gray-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-lime-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-lime-700" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Escáner Fotográfico IA</span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-lime-100 text-lime-900 dark:bg-lime-950/60 dark:text-lime-300">
                      Reconocimiento en 1.2s
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Bowl de Salmón con Quinoa y Aguacate</span>
                      <span className="text-xs font-bold text-emerald-600">540 kcal</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-1.5 rounded bg-gray-50 dark:bg-gray-900">
                        <span className="text-[9px] text-gray-400">Proteína</span>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">38g</p>
                      </div>
                      <div className="p-1.5 rounded bg-gray-50 dark:bg-gray-900">
                        <span className="text-[9px] text-gray-400">Carbos</span>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">42g</p>
                      </div>
                      <div className="p-1.5 rounded bg-gray-50 dark:bg-gray-900">
                        <span className="text-[9px] text-gray-400">Grasas Saludables</span>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">18g</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 👨‍👩‍👧 5. FAMILIA & DEPENDIENTES */}
            {activeJourney === "family" && (
              <motion.div
                key="family"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold">
                    <Users className="w-3.5 h-3.5" />
                    <span>{t("journeys.family.tag")}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {t("journeys.family.headline")}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {t("journeys.family.description")}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {[
                      t("journeys.family.feature1"),
                      t("journeys.family.feature2"),
                      t("journeys.family.feature3"),
                      t("journeys.family.feature4"),
                    ].map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/patient/dashboard/family"
                      className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 group"
                    >
                      <span>{t("journeys.family.cta")}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-amber-50/40 dark:bg-[#111] rounded-2xl p-6 border border-amber-100 dark:border-gray-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Baby className="w-5 h-5 text-amber-600" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Cartilla Digital de Vacunación</span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                      Esquema al 100%
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Hexavalente (Dosis 3)</p>
                        <span className="text-[10px] text-gray-500">Aplicada el 15 de Febrero, 2026</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Completada</span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Triple Viral (SRP)</p>
                        <span className="text-[10px] text-gray-500">Próxima a los 12 meses de edad</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Programada</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ⌚ 6. WEARABLES & APPLE HEALTH */}
            {activeJourney === "wearables" && (
              <motion.div
                key="wearables"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    <Watch className="w-3.5 h-3.5" />
                    <span>{t("journeys.wearables.tag")}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {t("journeys.wearables.headline")}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {t("journeys.wearables.description")}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {[
                      t("journeys.wearables.feature1"),
                      t("journeys.wearables.feature2"),
                      t("journeys.wearables.feature3"),
                      t("journeys.wearables.feature4"),
                    ].map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/patient/dashboard/profile"
                      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 group"
                    >
                      <span>{t("journeys.wearables.cta")}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-emerald-50/40 dark:bg-[#111] rounded-2xl p-6 border border-emerald-100 dark:border-gray-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Watch className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Apple Health & Google Fit</span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Sincronizado Hoy
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Pasos Diarios</span>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">8,450 / 10k</p>
                      <span className="text-[10px] text-emerald-600 font-medium">84.5% de la meta</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Frecuencia Cardíaca</span>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">64 bpm</p>
                      <span className="text-[10px] text-emerald-600 font-medium">Reposo saludable</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Calidad del Sueño</span>
                      <p className="text-[10px] text-gray-500">7h 42m (Fase profunda 1h 30m)</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600">Restaurativo</span>
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

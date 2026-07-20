"use client";
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Activity,
  HeartPulse,
  BrainCircuit,
  Apple,
  Target,
  UserPlus,
  ShieldAlert,
  Watch,
  ArrowRight,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";
import { consumerProfileService } from "@/services/consumerProfile.service";
import { useConsumerOnboarding } from "@/hooks/useConsumerOnboarding";
import { Icd10Autocomplete } from "@/components/ui/Icd10Autocomplete";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { WearablesStep } from "./WearablesStep";
import { DependentsStep } from "./DependentsStep";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "consent", title: "Privacidad y Consentimiento", icon: ShieldAlert },
  { id: "identity", title: "Datos Demográficos", icon: UserPlus },
  { id: "vitals", title: "Antropometría y Vitales", icon: Activity },
  { id: "lifestyle", title: "Estilo de Vida", icon: Apple },
  { id: "clinical", title: "Historial Clínico", icon: HeartPulse },
  { id: "goals", title: "Tus Objetivos", icon: Target },
  { id: "wearables", title: "Dispositivos Médicos", icon: Watch },
  { id: "dependents", title: "Familia y Dependientes", icon: UserPlus },
];

export default function ConsumerOnboardingWizard() {
  const router = useRouter();
  const {
    currentStep,
    data,
    loading,
    initialLoading,
    updateData,
    handleNext,
    handleSkip,
    handleBack,
  } = useConsumerOnboarding(STEPS.length);

  // ---- Step Renders ----

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center transition-colors duration-300">
        <QhSpinner size="lg" className="mb-6" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
          Construyendo Expediente Base...
        </p>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="border-l-2 border-black dark:border-white pl-6 py-4 bg-gray-50 dark:bg-[#050505]">
              <div className="flex items-center gap-3 mb-3">
                <BrainCircuit
                  className="w-5 h-5 text-black dark:text-white"
                  strokeWidth={1.5}
                />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  Motor de Recomendaciones con IA
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-2xl">
                Para brindarte recomendaciones hiper-personalizadas (rutinas,
                prevención, dietas), QuHealthy utiliza inteligencia artificial.
                Tus datos de salud serán analizados mediante algoritmos de forma
                segura y anonimizada bajo la normativa LFPDPPP.
              </p>
            </div>

            <label
              className={cn(
                "flex items-start gap-4 p-6 border transition-colors cursor-pointer group",
                data.algorithmicConsentAccepted
                  ? "border-black dark:border-white bg-gray-50 dark:bg-[#050505]"
                  : "border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white",
              )}
            >
              <div className="relative flex items-start">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={data.algorithmicConsentAccepted}
                  onChange={(e) =>
                    updateData({ algorithmicConsentAccepted: e.target.checked })
                  }
                />
                <div
                  className={cn(
                    "w-5 h-5 border flex items-center justify-center transition-colors mt-0.5",
                    data.algorithmicConsentAccepted
                      ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black"
                      : "border-gray-300 dark:border-gray-700 bg-white dark:bg-black",
                  )}
                >
                  {data.algorithmicConsentAccepted && (
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">
                  Acepto el análisis algorítmico
                </p>
                <p className="text-[10px] text-gray-500 font-light uppercase tracking-wide">
                  Consiento el tratamiento de mis datos de salud y biométricos.
                </p>
              </div>
            </label>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-3">
                Sexo Biológico (Relevancia Clínica)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "MALE", label: "Masculino" },
                  { id: "FEMALE", label: "Femenino" },
                  { id: "OTHER", label: "Otro" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateData({ biologicalSex: option.id })}
                    className={cn(
                      "h-12 border text-[10px] sm:text-xs font-bold transition-all uppercase tracking-widest",
                      data.biologicalSex === option.id
                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                        : "bg-white text-gray-600 border-gray-200 hover:border-black dark:bg-[#0a0a0a] dark:text-gray-400 dark:border-gray-800 dark:hover:border-white",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-3">
                Tipo de Sangre
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "O+", label: "O+" },
                  { id: "O-", label: "O-" },
                  { id: "A+", label: "A+" },
                  { id: "A-", label: "A-" },
                  { id: "B+", label: "B+" },
                  { id: "B-", label: "B-" },
                  { id: "AB+", label: "AB+" },
                  { id: "AB-", label: "AB-" },
                  { id: "", label: "Desconozco" },
                ].map((option, idx) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateData({ bloodType: option.id })}
                    className={cn(
                      "h-12 border font-bold transition-all",
                      data.bloodType === option.id
                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                        : "bg-white text-gray-600 border-gray-200 hover:border-black dark:bg-[#0a0a0a] dark:text-gray-400 dark:border-gray-800 dark:hover:border-white",
                      option.id === ""
                        ? "col-span-4 text-[10px] uppercase tracking-widest"
                        : "text-sm sm:text-base",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* --- DATOS NOM-024 --- */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800 mt-8">
              <div className="border-l-2 border-black dark:border-white pl-4 py-2 mb-6 bg-gray-50 dark:bg-[#050505]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-1">
                  Datos Requeridos (NOM-024)
                </p>
                <p className="text-xs text-gray-500 font-light">
                  Información oficial requerida para tu expediente clínico.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">CURP</label>
                  <input
                    type="text"
                    placeholder="Tu CURP (18 caracteres)"
                    className="w-full h-12 rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:border-black dark:focus:border-white focus:ring-0 px-4 transition-colors outline-none uppercase"
                    value={data.curp || ""}
                    onChange={(e) => updateData({ curp: e.target.value.toUpperCase() })}
                    maxLength={18}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Derechohabiencia</label>
                  <CreatableSelect
                    options={[
                      { label: 'IMSS', value: 'IMSS' },
                      { label: 'ISSSTE', value: 'ISSSTE' },
                      { label: 'INSABI / SSA', value: 'INSABI' },
                      { label: 'PEMEX / SEDENA / SEMAR', value: 'PEMEX' },
                      { label: 'Seguro Médico Privado', value: 'SEGURO_PRIVADO' },
                      { label: 'Ninguna', value: 'NINGUNA' }
                    ]}
                    value={data.healthInsurance || ''}
                    onChange={(val) => updateData({ healthInsurance: val })}
                    placeholder="SELECCIONAR O CREAR"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Domicilio Completo</label>
                <textarea
                  placeholder="Calle, número, colonia, código postal, ciudad, estado"
                  className="w-full min-h-[80px] rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:border-black dark:focus:border-white focus:ring-0 p-4 transition-colors outline-none resize-none"
                  value={data.address || ""}
                  onChange={(e) => updateData({ address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Grupo Étnico</label>
                  <CreatableSelect
                    options={[
                      { label: 'Ninguno', value: 'Ninguno' },
                      { label: 'Náhuatl', value: 'Náhuatl' },
                      { label: 'Maya', value: 'Maya' },
                      { label: 'Zapoteco', value: 'Zapoteco' },
                      { label: 'Mixteco', value: 'Mixteco' },
                      { label: 'Otomí', value: 'Otomí' },
                      { label: 'Totonaca', value: 'Totonaca' },
                      { label: 'Tsotsil', value: 'Tsotsil' },
                      { label: 'Tzeltal', value: 'Tzeltal' },
                      { label: 'Mazahua', value: 'Mazahua' },
                      { label: 'Huasteco', value: 'Huasteco' }
                    ]}
                    value={data.ethnicGroup || ''}
                    onChange={(val) => updateData({ ethnicGroup: val })}
                    placeholder="SELECCIONAR O CREAR"
                  />
                </div>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white mt-8 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                Contacto de Emergencia
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Ej. María Pérez"
                    className="w-full h-12 rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:border-black dark:focus:border-white focus:ring-0 px-4 transition-colors outline-none"
                    value={data.emergencyContactName || ""}
                    onChange={(e) => updateData({ emergencyContactName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Ej. 55 1234 5678"
                    className="w-full h-12 rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:border-black dark:focus:border-white focus:ring-0 px-4 transition-colors outline-none"
                    value={data.emergencyContactPhone || ""}
                    onChange={(e) => updateData({ emergencyContactPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                Medidas Corporales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Peso Actual (kg)
                  </label>
                  <input
                    type="number"
                    placeholder="Ej. 75"
                    className="w-full h-12 rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:border-black dark:focus:border-white focus:ring-0 px-4 transition-colors outline-none"
                    value={data.weightKg}
                    onChange={(e) =>
                      updateData({
                        weightKg: e.target.value ? Number(e.target.value) : "",
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Estatura (cm)
                  </label>
                  <input
                    type="number"
                    placeholder="Ej. 175"
                    className="w-full h-12 rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:border-black dark:focus:border-white focus:ring-0 px-4 transition-colors outline-none"
                    value={data.heightCm}
                    onChange={(e) =>
                      updateData({
                        heightCm: e.target.value ? Number(e.target.value) : "",
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {data.weightKg && data.heightCm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-black text-white dark:bg-white dark:text-black flex justify-between items-center border border-black dark:border-white"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Índice de Masa Corporal (IMC)
                </span>
                <span className="text-2xl font-semibold tracking-tighter">
                  {(
                    Number(data.weightKg) /
                    Math.pow(Number(data.heightCm) / 100, 2)
                  ).toFixed(1)}
                </span>
              </motion.div>
            )}

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2 pt-4">
                Signos Vitales (Promedio Histórico)
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Ritmo Cardíaco Reposo (bpm)
                  </label>
                  <input
                    type="number"
                    placeholder="Ej. 65"
                    className="w-full h-12 rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:border-black dark:focus:border-white focus:ring-0 px-4 transition-colors outline-none"
                    value={data.restingHeartRate}
                    onChange={(e) =>
                      updateData({
                        restingHeartRate: e.target.value
                          ? Number(e.target.value)
                          : "",
                      })
                    }
                  />
                </div>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Presión Sistólica (Alta)
                    </label>
                    <input
                      type="number"
                      placeholder="Ej. 120"
                      className="w-full h-12 rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:border-black dark:focus:border-white focus:ring-0 px-4 transition-colors outline-none"
                      value={data.averageBloodPressureSystolic}
                      onChange={(e) =>
                        updateData({
                          averageBloodPressureSystolic: e.target.value
                            ? Number(e.target.value)
                            : "",
                        })
                      }
                    />
                  </div>
                  <span className="text-2xl font-light pb-2 text-gray-300 dark:text-gray-700">
                    /
                  </span>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Presión Diastólica (Baja)
                    </label>
                    <input
                      type="number"
                      placeholder="Ej. 80"
                      className="w-full h-12 rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:border-black dark:focus:border-white focus:ring-0 px-4 transition-colors outline-none"
                      value={data.averageBloodPressureDiastolic}
                      onChange={(e) =>
                        updateData({
                          averageBloodPressureDiastolic: e.target.value
                            ? Number(e.target.value)
                            : "",
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-3">
                Dieta Predominante
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { id: "", label: "Sin dieta específica" },
                  { id: "MEDITERRANEAN", label: "Mediterránea" },
                  { id: "VEGAN", label: "Vegana" },
                  { id: "VEGETARIAN", label: "Vegetariana" },
                  { id: "KETO", label: "Keto / Cetogénica" },
                  { id: "PALEO", label: "Paleo" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateData({ dietaryPreference: option.id })}
                    className={cn(
                      "h-12 border text-[10px] font-bold transition-all uppercase tracking-widest",
                      data.dietaryPreference === option.id
                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                        : "bg-white text-gray-600 border-gray-200 hover:border-black dark:bg-[#0a0a0a] dark:text-gray-400 dark:border-gray-800 dark:hover:border-white",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Días de ejercicio a la semana
                </label>
                <input
                  type="number"
                  placeholder="Ej. 3"
                  className="w-full h-12 rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:border-black dark:focus:border-white focus:ring-0 px-4 transition-colors outline-none"
                  value={data.exerciseDaysPerWeek}
                  onChange={(e) =>
                    updateData({
                      exerciseDaysPerWeek: e.target.value
                        ? Number(e.target.value)
                        : "",
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Minutos por día
                </label>
                <input
                  type="number"
                  placeholder="Ej. 45"
                  className="w-full h-12 rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:border-black dark:focus:border-white focus:ring-0 px-4 transition-colors outline-none"
                  value={data.exerciseMinutesPerDay}
                  onChange={(e) =>
                    updateData({
                      exerciseMinutesPerDay: e.target.value
                        ? Number(e.target.value)
                        : "",
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Horas promedio de sueño al día
                </label>
                <input
                  type="number"
                  placeholder="Ej. 7.5"
                  className="w-full h-12 rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:border-black dark:focus:border-white focus:ring-0 px-4 transition-colors outline-none"
                  value={data.sleepHoursAvg}
                  onChange={(e) =>
                    updateData({
                      sleepHoursAvg: e.target.value
                        ? Number(e.target.value)
                        : "",
                    })
                  }
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Nivel de estrés general (1-10)
                  </label>
                  <span className="text-[10px] font-bold text-black dark:text-white border border-gray-200 dark:border-gray-800 px-2 py-0.5">
                    Nivel {data.stressLevel}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  className="w-full h-1 bg-gray-200 dark:bg-gray-800 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:dark:bg-white [&::-webkit-slider-thumb]:rounded-none [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:dark:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-none transition-all"
                  value={data.stressLevel}
                  onChange={(e) =>
                    updateData({ stressLevel: Number(e.target.value) })
                  }
                />
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-3">
                  <span>Muy Bajo (1)</span>
                  <span>Extremo (10)</span>
                </div>
              </div>
            </div>

            {/* Checkbox Arquitectónico (Smoker) */}
            <label
              className={cn(
                "flex items-center gap-4 p-5 border transition-colors cursor-pointer group mt-4",
                data.isSmoker
                  ? "border-black dark:border-white bg-gray-50 dark:bg-[#050505]"
                  : "border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white",
              )}
            >
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={data.isSmoker}
                  onChange={(e) => updateData({ isSmoker: e.target.checked })}
                />
                <div
                  className={cn(
                    "w-5 h-5 border flex items-center justify-center transition-colors",
                    data.isSmoker
                      ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black"
                      : "border-gray-300 dark:border-gray-700 bg-white dark:bg-black",
                  )}
                >
                  {data.isSmoker && (
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  )}
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">
                Soy fumador(a) regular
              </span>
            </label>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <div className="border-l-2 border-black dark:border-white pl-4 py-2 bg-gray-50 dark:bg-[#050505]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-1">
                Catálogo Oficial CIE-10
              </p>
              <p className="text-xs text-gray-500 font-light">
                Utiliza términos médicos estandarizados para mapear tus
                padecimientos crónicos.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                Enfermedades Crónicas / Diagnósticos
              </label>
              <Icd10Autocomplete
                selectedConditions={data.medicalConditions}
                onChange={(newConditions) =>
                  updateData({ medicalConditions: newConditions })
                }
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                Alergias Conocidas
              </label>
              <textarea
                placeholder="Ej. Penicilina, Nueces, etc..."
                className="w-full rounded-none bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 p-4 text-sm font-light focus:border-black dark:focus:border-white focus:ring-0 transition-colors outline-none resize-none min-h-[100px]"
                onChange={(e) =>
                  updateData({ allergies: [{ name: e.target.value }] })
                }
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
              ¿Cuáles son tus objetivos principales?
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                "Bajar de Peso",
                "Mejorar longevidad",
                "Manejar estrés y ansiedad",
                "Mejorar calidad de sueño",
                "Ganar masa muscular",
              ].map((goal) => {
                const isSelected = data.healthGoals.includes(goal);
                return (
                  <label
                    key={goal}
                    className={cn(
                      "flex items-center gap-4 p-5 border transition-colors cursor-pointer group",
                      isSelected
                        ? "border-black dark:border-white bg-gray-50 dark:bg-[#050505]"
                        : "border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white",
                    )}
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isSelected}
                        onChange={(e) => {
                          const newGoals = e.target.checked
                            ? [...data.healthGoals, goal]
                            : data.healthGoals.filter((g) => g !== goal);
                          updateData({ healthGoals: newGoals });
                        }}
                      />
                      <div
                        className={cn(
                          "w-5 h-5 border flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black"
                            : "border-gray-300 dark:border-gray-700 bg-white dark:bg-black",
                        )}
                      >
                        {isSelected && (
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">
                      {goal}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      case 6:
        return <WearablesStep />;
      case 7:
        return <DependentsStep />;
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 0 && !data.algorithmicConsentAccepted) return true;
    if (currentStep === 1 && !data.biologicalSex) return true;
    return false;
  };

  const showSkipButton = true;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      {/* Header / Progress (Architectural) */}
      <div className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-serif italic tracking-tight text-black dark:text-white">
              QuHealthy.
            </h1>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-200 dark:border-gray-800 px-3 py-1">
              Paso 0{currentStep + 1} / 0{STEPS.length}
            </div>
          </div>

          <div className="w-full h-px bg-gray-200 dark:bg-gray-800 relative">
            <motion.div
              className="absolute top-0 left-0 h-full bg-black dark:bg-white"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentStep + 1) / STEPS.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-16 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 p-8 md:p-12"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12 border-b border-gray-200 dark:border-gray-800 pb-8">
              <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] shrink-0">
                {React.createElement(STEPS[currentStep].icon, {
                  className: "w-6 h-6 text-black dark:text-white",
                  strokeWidth: 1.5,
                })}
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-black dark:text-white tracking-tight">
                  {STEPS[currentStep].title}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
                  Sección {currentStep + 1}
                </p>
              </div>
            </div>

            {/* Step Content */}
            <div className="min-h-[300px]">{renderStepContent()}</div>

            {/* Actions (Flush Buttons) */}
            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center gap-4">
              <div className="flex w-full md:w-auto gap-4">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 md:flex-none h-14 px-8 border border-gray-200 dark:border-gray-800 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors"
                  >
                    Retroceder
                  </button>
                )}
                {showSkipButton && (
                  <button
                    onClick={handleSkip}
                    disabled={loading}
                    className="flex-1 md:flex-none h-14 px-8 border border-gray-200 dark:border-gray-800 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors"
                  >
                    Omitir
                  </button>
                )}
              </div>

              <button
                onClick={handleNext}
                disabled={isNextDisabled() || loading}
                className={cn(
                  "w-full md:flex-1 h-14 px-8 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-4 group",
                  isNextDisabled() || loading
                    ? "bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-800"
                    : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-0",
                )}
              >
                {loading
                  ? "Sincronizando..."
                  : currentStep === STEPS.length - 1
                    ? "Completar Registro"
                    : "Guardar y Continuar"}
                {!loading && (
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    strokeWidth={2}
                  />
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

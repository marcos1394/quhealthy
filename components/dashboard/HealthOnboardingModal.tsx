"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Activity } from "lucide-react";

import { HealthProfilePayload, ActivityLevel } from "@/types/healthscore";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface HealthOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: HealthProfilePayload) => Promise<boolean>;
  isSubmitting: boolean;
}

export function HealthOnboardingModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: HealthOnboardingModalProps) {
  const t = useTranslations("PatientDashboard.Modal");
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState<HealthProfilePayload>({
    weightKg: 70,
    heightCm: 170,
    activityLevel: "MODERATE",
    isSmoker: false,
    waterIntakeLiters: 2,
    stressLevel: 5,
    sleepHoursAvg: 7,
  });

  if (!isOpen) return null;

  const updateForm = (field: keyof HealthProfilePayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between p-6 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
              <Activity className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {t("title")}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs font-mono">
                {t("subtitle", { current: step, total: totalSteps })}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs shrink-0 disabled:opacity-50"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── BARRA DE PROGRESO ─────────────────────────────────────── */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1 relative">
          <div
            className="absolute top-0 left-0 h-full bg-emerald-600 transition-all duration-300 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* ── CONTENIDO DINÁMICO ─────────────────────────────────────── */}
        <div className="p-6 sm:p-8 min-h-[320px] flex flex-col justify-center bg-white dark:bg-[#0a0a0a]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="w-full space-y-6"
            >
              {/* PASO 1: Biometría Base */}
              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight uppercase border-b border-gray-100 dark:border-gray-800 pb-2">
                    {t("step1_title")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                        {t("weight_label")}
                      </label>
                      <input
                        type="number"
                        value={formData.weightKg}
                        onChange={(e) =>
                          updateForm("weightKg", parseFloat(e.target.value) || 0)
                        }
                        className="w-full h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                        {t("height_label")}
                      </label>
                      <input
                        type="number"
                        value={formData.heightCm}
                        onChange={(e) =>
                          updateForm("heightCm", parseFloat(e.target.value) || 0)
                        }
                        className="w-full h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: Actividad Física */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight uppercase border-b border-gray-100 dark:border-gray-800 pb-2">
                    {t("step2_title")}
                  </h3>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {t("activity_label")}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: "SEDENTARY", label: t("act_sedentary") },
                        { id: "LIGHT", label: t("act_light") },
                        { id: "MODERATE", label: t("act_moderate") },
                        { id: "HIGH", label: t("act_high") },
                        { id: "ATHLETE", label: t("act_athlete") },
                      ].map((act) => {
                        const isSelected = formData.activityLevel === act.id;
                        return (
                          <button
                            key={act.id}
                            type="button"
                            onClick={() =>
                              updateForm(
                                "activityLevel",
                                act.id as ActivityLevel
                              )
                            }
                            className={cn(
                              "w-full text-left px-4 h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs flex items-center justify-between",
                              isSelected
                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500/30"
                            )}
                          >
                            <span>{act.label}</span>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 3: Hábitos y Estilo de Vida */}
              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight uppercase border-b border-gray-100 dark:border-gray-800 pb-2">
                    {t("step3_title")}
                  </h3>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      {t("smoker_label")}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => updateForm("isSmoker", true)}
                        className={cn(
                          "h-11 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs",
                          formData.isSmoker
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                            : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500/30"
                        )}
                      >
                        {t("yes")}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateForm("isSmoker", false)}
                        className={cn(
                          "h-11 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs",
                          !formData.isSmoker
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                            : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500/30"
                        )}
                      >
                        {t("no")}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                        {t("water_label")}
                      </label>
                      <span className="text-[11px] font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-full px-2.5 py-0.5 shadow-2xs">
                        {t("water_unit", {
                          liters: formData.waterIntakeLiters || "",
                        })}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={formData.waterIntakeLiters}
                      onChange={(e) =>
                        updateForm(
                          "waterIntakeLiters",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>
                </div>
              )}

              {/* PASO 4: Bienestar y Descanso */}
              {step === 4 && (
                <div className="space-y-5">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight uppercase border-b border-gray-100 dark:border-gray-800 pb-2">
                    {t("step4_title")}
                  </h3>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                        {t("stress_label")}
                      </label>
                      <span className="text-[11px] font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-full px-2.5 py-0.5 shadow-2xs">
                        {t("stress_unit", { level: formData.stressLevel })}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={formData.stressLevel}
                      onChange={(e) =>
                        updateForm("stressLevel", parseInt(e.target.value, 10))
                      }
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                        {t("sleep_label")}
                      </label>
                      <span className="text-[11px] font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-full px-2.5 py-0.5 shadow-2xs">
                        {t("sleep_unit", { hours: formData.sleepHoursAvg || ""})}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="12"
                      step="0.5"
                      value={formData.sleepHoursAvg}
                      onChange={(e) =>
                        updateForm("sleepHoursAvg", parseFloat(e.target.value))
                      }
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── FOOTER DE ACCIONES ─────────────────────────────────────── */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            className="h-11 px-4 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            <span>{t("btn_back")}</span>
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer border-0"
            >
              <span>{t("btn_next")}</span>
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("btn_submitting")}</span>
                </>
              ) : (
                <span>{t("btn_submit")}</span>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
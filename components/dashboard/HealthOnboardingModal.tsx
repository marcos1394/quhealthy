"use client";
/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HealthProfilePayload, ActivityLevel } from "@/types/healthscore";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 dark:bg-[#0a0a0a]/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col overflow-hidden"
      >
        {/* Header del Modal */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
              {t("title")}
            </h2>
            <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2.5 py-1 rounded-full inline-block">
              {t("subtitle", { current: step, total: totalSteps })}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Barra de Progreso */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1 relative">
          <div
            className="absolute top-0 left-0 h-full bg-teal-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Contenido Dinámico */}
        <div className="p-8 min-h-[340px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full space-y-8"
            >
              {/* PASO 1: Biometría */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                    {t("step1_title")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 block">
                        {t("weight_label")}
                      </label>
                      <input
                        type="number"
                        value={formData.weightKg}
                        onChange={(e) =>
                          updateForm("weightKg", parseFloat(e.target.value))
                        }
                        className="w-full h-12 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl px-4 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 block">
                        {t("height_label")}
                      </label>
                      <input
                        type="number"
                        value={formData.heightCm}
                        onChange={(e) =>
                          updateForm("heightCm", parseFloat(e.target.value))
                        }
                        className="w-full h-12 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl px-4 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: Actividad */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                    {t("step2_title")}
                  </h3>
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-500 block">
                      {t("activity_label")}
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: "SEDENTARY", label: t("act_sedentary") },
                        { id: "LIGHT", label: t("act_light") },
                        { id: "MODERATE", label: t("act_moderate") },
                        { id: "HIGH", label: t("act_high") },
                        { id: "ATHLETE", label: t("act_athlete") },
                      ].map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() =>
                            updateForm("activityLevel", act.id as ActivityLevel)
                          }
                          className={cn(
                            "w-full text-left px-4 h-12 text-sm font-semibold rounded-xl border transition-colors",
                            formData.activityLevel === act.id
                              ? "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30"
                              : "bg-white text-gray-600 border-gray-200 hover:border-teal-200 hover:bg-teal-50/50 dark:bg-[#0a0a0a] dark:border-gray-800 dark:text-gray-400 dark:hover:border-gray-700",
                          )}
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 3: Hábitos */}
              {step === 3 && (
                <div className="space-y-8">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                    {t("step3_title")}
                  </h3>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-500 block">
                      {t("smoker_label")}
                    </label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        onClick={() => updateForm("isSmoker", true)}
                        className={cn(
                          "flex-1 rounded-xl h-12 text-sm font-semibold border transition-colors",
                          formData.isSmoker
                            ? "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30 dark:hover:bg-teal-500/20"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-[#0a0a0a] dark:text-gray-400 dark:border-gray-800 dark:hover:border-gray-700",
                        )}
                      >
                        {t("yes")}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => updateForm("isSmoker", false)}
                        className={cn(
                          "flex-1 rounded-xl h-12 text-sm font-semibold border transition-colors",
                          !formData.isSmoker
                            ? "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30 dark:hover:bg-teal-500/20"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-[#0a0a0a] dark:text-gray-400 dark:border-gray-800 dark:hover:border-gray-700",
                        )}
                      >
                        {t("no")}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-500 block">
                        {t("water_label")}
                      </label>
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 rounded-full px-2.5 py-1">
                        {formData.waterIntakeLiters} Litros
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={formData.waterIntakeLiters}
                      onChange={(e) =>
                        updateForm("waterIntakeLiters", parseFloat(e.target.value))
                      }
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-teal-500 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full transition-all"
                    />
                  </div>
                </div>
              )}

              {/* PASO 4: Mental */}
              {step === 4 && (
                <div className="space-y-8">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                    {t("step4_title")}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-500 block">
                        {t("stress_label")}
                      </label>
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 rounded-full px-2.5 py-1">
                        Nivel {formData.stressLevel}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={formData.stressLevel}
                      onChange={(e) =>
                        updateForm("stressLevel", parseInt(e.target.value))
                      }
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-teal-500 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-500 block">
                        {t("sleep_label")}
                      </label>
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 rounded-full px-2.5 py-1">
                        {formData.sleepHoursAvg} Horas
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
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-teal-500 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full transition-all"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            className="rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors px-4 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 mr-1" strokeWidth={2} /> {t("btn_back")}
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              className="rounded-xl bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 h-11 px-6 text-sm font-bold transition-colors border-0"
            >
              {t("btn_next")} <ChevronRight className="w-4 h-4 ml-1" strokeWidth={2} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-xl bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 h-11 px-6 text-sm font-bold transition-colors border-0 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {t("btn_submit")}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
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
  Shield,
} from "lucide-react";

import { useConsumerOnboarding } from "@/hooks/useConsumerOnboarding";
import { Icd10Autocomplete } from "@/components/ui/Icd10Autocomplete";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WearablesStep } from "./WearablesStep";
import { DependentsStep } from "./DependentsStep";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

export default function ConsumerOnboardingWizard() {
  const router = useRouter();
  const t = useTranslations("OnboardingConsumer");

  const STEPS = [
    { id: "consent", title: t("steps.consent.title"), icon: ShieldAlert },
    { id: "identity", title: t("steps.identity.title"), icon: UserPlus },
    { id: "vitals", title: t("steps.vitals.title"), icon: Activity },
    { id: "lifestyle", title: t("steps.lifestyle.title"), icon: Apple },
    { id: "clinical", title: t("steps.clinical.title"), icon: HeartPulse },
    { id: "goals", title: t("steps.goals.title"), icon: Target },
    { id: "wearables", title: t("steps.wearables.title"), icon: Watch },
    { id: "dependents", title: t("steps.dependents.title"), icon: UserPlus },
  ];

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

  // ── ESTADO: CARGA INICIAL DE EXPEDIENTE ───────────────────────────────────
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center gap-3 transition-colors duration-500 font-sans">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-400 animate-pulse">
          {t("loading_initial")}
        </p>
      </div>
    );
  }

  // ── RENDERIZADO CONTENIDO DE CADA PASO ────────────────────────────────────
  const renderStepContent = () => {
    switch (currentStep) {
      // ── PASO 0: PRIVACIDAD Y RECOMENDACIONES ────────────────────────────────
      case 0:
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
              <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                <BrainCircuit className="w-5 h-5 shrink-0" strokeWidth={2} />
                <span>{t("steps.consent.ai_banner_title")}</span>
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                {t("steps.consent.ai_banner_desc")}
              </p>
            </div>

            <label
              className={cn(
                "flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer group shadow-sm",
                data.algorithmicConsentAccepted
                  ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-emerald-500/30"
              )}
            >
              <div className="relative flex items-center pt-0.5">
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
                    "w-5 h-5 rounded-lg border flex items-center justify-center transition-colors",
                    data.algorithmicConsentAccepted
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505]"
                  )}
                >
                  {data.algorithmicConsentAccepted && (
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  )}
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {t("steps.consent.checkbox_label")}
                </p>
                <p className="text-[11px] font-medium text-gray-500">
                  {t("steps.consent.checkbox_desc")}
                </p>
              </div>
            </label>
          </div>
        );

      // ── PASO 1: DATOS BÁSICOS E IDENTIFICACIÓN ───────────────────────────
      case 1:
        return (
          <div className="space-y-6">
            {/* Sexo Biológico */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                {t("steps.identity.biological_sex_label")}
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "MALE", label: t("steps.identity.sexes.male") },
                  { id: "FEMALE", label: t("steps.identity.sexes.female") },
                  { id: "OTHER", label: t("steps.identity.sexes.other") },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateData({ biologicalSex: option.id })}
                    className={cn(
                      "h-11 rounded-xl border text-xs font-bold transition-all px-2",
                      data.biologicalSex === option.id
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500/50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de Sangre */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                {t("steps.identity.blood_type_label")}
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
                  { id: "", label: t("steps.identity.blood_type_unknown") },
                ].map((option) => (
                  <button
                    key={option.id || "unknown"}
                    type="button"
                    onClick={() => updateData({ bloodType: option.id })}
                    className={cn(
                      "h-11 rounded-xl border text-xs font-bold transition-all",
                      data.bloodType === option.id
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500/50",
                      option.id === "" && "col-span-4"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SECCIÓN IDENTIFICACIÓN ADICIONAL */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("steps.identity.nom024_title")}</span>
                </p>
                <p className="text-[11px] font-medium text-gray-500">
                  {t("steps.identity.nom024_desc")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("steps.identity.curp_label")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("steps.identity.curp_placeholder")}
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-bold font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-4 uppercase transition-all"
                    value={data.curp || ""}
                    onChange={(e) => updateData({ curp: e.target.value.toUpperCase() })}
                    maxLength={18}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("steps.identity.insurance_label")}
                  </label>
                  <Select
                    value={data.healthInsurance || ""}
                    onValueChange={(val) => updateData({ healthInsurance: val })}
                  >
                    <SelectTrigger className="w-full h-11 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-emerald-500/20">
                      <SelectValue placeholder={t("steps.identity.insurance_placeholder")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans">
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="IMSS">
                        {t("steps.identity.insurance_options.imss")}
                      </SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="ISSSTE">
                        {t("steps.identity.insurance_options.issste")}
                      </SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="INSABI">
                        {t("steps.identity.insurance_options.insabi")}
                      </SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="PEMEX">
                        {t("steps.identity.insurance_options.pemex")}
                      </SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="SEGURO_PRIVADO">
                        {t("steps.identity.insurance_options.private")}
                      </SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="NINGUNA">
                        {t("steps.identity.insurance_options.none")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("steps.identity.address_label")}
                </label>
                <textarea
                  placeholder={t("steps.identity.address_placeholder")}
                  className="w-full min-h-[72px] rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 p-3.5 transition-all resize-none"
                  value={data.address || ""}
                  onChange={(e) => updateData({ address: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("steps.identity.ethnic_label")}
                </label>
                <Select
                  value={data.ethnicGroup || ""}
                  onValueChange={(val) => updateData({ ethnicGroup: val })}
                >
                  <SelectTrigger className="w-full h-12 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-emerald-500/20">
                    <SelectValue placeholder={t("steps.identity.ethnic_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ninguno">Ninguno</SelectItem>
                    <SelectItem value="Náhuatl">Náhuatl</SelectItem>
                    <SelectItem value="Maya">Maya</SelectItem>
                    <SelectItem value="Zapoteco">Zapoteco</SelectItem>
                    <SelectItem value="Mixteco">Mixteco</SelectItem>
                    <SelectItem value="Otomí">Otomí</SelectItem>
                    <SelectItem value="Totonaca">Totonaca</SelectItem>
                    <SelectItem value="Tsotsil">Tsotsil</SelectItem>
                    <SelectItem value="Tzeltal">Tzeltal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contacto de Emergencia */}
              <div className="pt-2 space-y-3">
                <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {t("steps.identity.emergency_title")}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {t("steps.identity.emergency_name_label")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("steps.identity.emergency_name_placeholder")}
                      className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-4 transition-all"
                      value={data.emergencyContactName || ""}
                      onChange={(e) => updateData({ emergencyContactName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {t("steps.identity.emergency_phone_label")}
                    </label>
                    <input
                      type="tel"
                      placeholder={t("steps.identity.emergency_phone_placeholder")}
                      className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-4 transition-all"
                      value={data.emergencyContactPhone || ""}
                      onChange={(e) => updateData({ emergencyContactPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        );

      // ── PASO 2: MEDIDAS Y SIGNOS VITALES ─────────────────────────────────
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                {t("steps.vitals.body_measurements_title")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("steps.vitals.weight_label")}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={t("steps.vitals.weight_placeholder")}
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-4 transition-all"
                    value={data.weightKg}
                    onChange={(e) =>
                      updateData({
                        weightKg: e.target.value ? Number(e.target.value) : "",
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("steps.vitals.height_label")}
                  </label>
                  <input
                    type="number"
                    placeholder={t("steps.vitals.height_placeholder")}
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-4 transition-all"
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

            {/* Cálculo de IMC */}
            {data.weightKg && data.heightCm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-emerald-600 text-white shadow-md flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 block">
                    {t("steps.vitals.bmi_title")}
                  </span>
                  <span className="text-xs font-medium text-emerald-50">
                    {t("steps.vitals.bmi_desc")}
                  </span>
                </div>
                <span className="text-3xl font-bold font-mono tracking-tight">
                  {(
                    Number(data.weightKg) /
                    Math.pow(Number(data.heightCm) / 100, 2)
                  ).toFixed(1)}
                </span>
              </motion.div>
            )}

            {/* Promedio de Signos Vitales */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                {t("steps.vitals.vitals_title")}
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("steps.vitals.hr_label")}
                  </label>
                  <input
                    type="number"
                    placeholder={t("steps.vitals.hr_placeholder")}
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-4 transition-all"
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

                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t("steps.vitals.bp_systolic_label")}
                    </label>
                    <input
                      type="number"
                      placeholder={t("steps.vitals.bp_systolic_placeholder")}
                      className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-4 transition-all"
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

                  <span className="text-2xl font-light text-gray-300 pt-5">/</span>

                  <div className="flex-1 space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t("steps.vitals.bp_diastolic_label")}
                    </label>
                    <input
                      type="number"
                      placeholder={t("steps.vitals.bp_diastolic_placeholder")}
                      className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-4 transition-all"
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

      // ── PASO 3: ESTILO DE VIDA Y HÁBITOS ─────────────────────────────────
      case 3:
        return (
          <div className="space-y-6">
            {/* Dieta */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                {t("steps.lifestyle.diet_label")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "", label: t("steps.lifestyle.diet_options.none") },
                  { id: "MEDITERRANEAN", label: t("steps.lifestyle.diet_options.mediterranean") },
                  { id: "VEGAN", label: t("steps.lifestyle.diet_options.vegan") },
                  { id: "VEGETARIAN", label: t("steps.lifestyle.diet_options.vegetarian") },
                  { id: "KETO", label: t("steps.lifestyle.diet_options.keto") },
                  { id: "PALEO", label: t("steps.lifestyle.diet_options.paleo") },
                ].map((option) => (
                  <button
                    key={option.id || "none"}
                    type="button"
                    onClick={() => updateData({ dietaryPreference: option.id })}
                    className={cn(
                      "h-11 rounded-xl border text-xs font-bold transition-all px-2",
                      data.dietaryPreference === option.id
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500/50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ejercicio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("steps.lifestyle.exercise_days_label")}
                </label>
                <input
                  type="number"
                  placeholder={t("steps.lifestyle.exercise_days_placeholder")}
                  className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-4 transition-all"
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

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("steps.lifestyle.exercise_mins_label")}
                </label>
                <input
                  type="number"
                  placeholder={t("steps.lifestyle.exercise_mins_placeholder")}
                  className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-4 transition-all"
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

            {/* Sueño y Estrés */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("steps.lifestyle.sleep_hours_label")}
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder={t("steps.lifestyle.sleep_hours_placeholder")}
                  className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-4 transition-all"
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

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("steps.lifestyle.stress_label")}
                  </label>
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {t("steps.lifestyle.stress_value", { value: data.stressLevel })}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  value={data.stressLevel}
                  onChange={(e) =>
                    updateData({ stressLevel: Number(e.target.value) })
                  }
                />
                <div className="flex justify-between text-[10px] font-semibold text-gray-400 pt-0.5">
                  <span>{t("steps.lifestyle.stress_low")}</span>
                  <span>{t("steps.lifestyle.stress_high")}</span>
                </div>
              </div>
            </div>

            {/* Fumador */}
            <label
              className={cn(
                "flex items-center gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer group shadow-sm",
                data.isSmoker
                  ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-emerald-500/30"
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
                    "w-5 h-5 rounded-lg border flex items-center justify-center transition-colors",
                    data.isSmoker
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505]"
                  )}
                >
                  {data.isSmoker && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </div>
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {t("steps.lifestyle.smoker_label")}
              </span>
            </label>
          </div>
        );

      // ── PASO 4: ANTECEDENTES MÉDICOS ──────────────────────────────────────
      case 4:
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1">
              <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t("steps.clinical.icd10_title")}</span>
              </p>
              <p className="text-[11px] font-medium text-gray-500">
                {t("steps.clinical.icd10_desc")}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                {t("steps.clinical.chronic_conditions_label")}
              </label>
              <Icd10Autocomplete
                selectedConditions={data.medicalConditions}
                onChange={(newConditions) =>
                  updateData({ medicalConditions: newConditions })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                {t("steps.clinical.allergies_label")}
              </label>
              <textarea
                placeholder={t("steps.clinical.allergies_placeholder")}
                className="w-full rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 p-3.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none min-h-[90px]"
                onChange={(e) =>
                  updateData({ allergies: [{ name: e.target.value }] })
                }
              />
            </div>
          </div>
        );

      // ── PASO 5: METAS DE SALUD ───────────────────────────────────────────
      case 5:
        const GOAL_OPTIONS = [
          { id: "Pérdida de Peso y Control Metabolico", label: t("steps.goals.options.weight") },
          { id: "Optimización de Longevidad y Salud Cardiovascular", label: t("steps.goals.options.longevity") },
          { id: "Manejo de Estrés, Ansiedad y Salud Mental", label: t("steps.goals.options.stress") },
          { id: "Mejora de la Calidad del Sueño y Descanso", label: t("steps.goals.options.sleep") },
          { id: "Aumento de Masa Muscular y Rendimiento Deportivo", label: t("steps.goals.options.muscle") },
          { id: "Control de Padecimientos Crónicos", label: t("steps.goals.options.chronic") },
        ];

        return (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              {t("steps.goals.heading")}
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {GOAL_OPTIONS.map((goalObj) => {
                const isSelected = data.healthGoals.includes(goalObj.id);
                return (
                  <label
                    key={goalObj.id}
                    className={cn(
                      "flex items-center gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer group shadow-sm",
                      isSelected
                        ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-emerald-500/30"
                    )}
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isSelected}
                        onChange={(e) => {
                          const newGoals = e.target.checked
                            ? [...data.healthGoals, goalObj.id]
                            : data.healthGoals.filter((g) => g !== goalObj.id);
                          updateData({ healthGoals: newGoals });
                        }}
                      />
                      <div
                        className={cn(
                          "w-5 h-5 rounded-lg border flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505]"
                        )}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {goalObj.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      // ── PASO 6: WEARABLES ────────────────────────────────────────────────
      case 6:
        return <WearablesStep />;

      // ── PASO 7: DEPENDIENTES ──────────────────────────────────────────────
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

  const StepIcon = STEPS[currentStep].icon;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-20">
      {/* ── HEADER DE PROGRESO FLOTANTE ────────────────────────────────────── */}
      <header className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 p-5 sm:p-6 sticky top-0 z-50 transition-all">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>{t("header_brand")}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">•</span>
              <span className="text-xs font-semibold text-gray-400">{t("header_sub")}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
              <span>
                {t("step_progress", {
                  current: currentStep + 1,
                  total: STEPS.length,
                })}
              </span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <motion.div
              className="h-full bg-emerald-600 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentStep + 1) / STEPS.length) * 100}%`,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      {/* ── CONTENEDOR PRINCIPAL DEL PASO ──────────────────────────────────── */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-6 pt-8 sm:pt-12 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col justify-between space-y-8"
          >
            {/* Step Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                <StepIcon className="w-6 h-6" strokeWidth={2} />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {STEPS[currentStep].title}
                </h2>
                <p className="text-xs font-semibold text-gray-400 pt-0.5">
                  {t("step_section", {
                    current: currentStep + 1,
                    total: STEPS.length,
                  })}
                </p>
              </div>
            </div>

            {/* Step Content */}
            <div className="min-h-[280px]">{renderStepContent()}</div>

            {/* Actions Footer */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 sm:flex-none h-11 px-5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {t("btn_back")}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={loading}
                  className="flex-1 sm:flex-none h-11 px-5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {t("btn_skip")}
                </button>
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={isNextDisabled() || loading}
                className={cn(
                  "w-full sm:w-auto h-11 px-7 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50",
                  isNextDisabled() || loading
                    ? "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                )}
              >
                {loading ? (
                  <>
                    <QhSpinner size="sm" className="text-white" />
                    <span>{t("btn_saving")}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {currentStep === STEPS.length - 1
                        ? t("btn_finish")
                        : t("btn_next")}
                    </span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ShieldAlert,
  Droplet,
  FileCheck2,
  HeartPulse,
  ArrowRight,
  Shield,
  Stethoscope,
  Plus,
} from "lucide-react";
import { ConsumerProfile } from "@/types/consumerProfile";

interface PatientClinicalSummaryCardProps {
  profile?: ConsumerProfile | null;
  isLoading?: boolean;
}

export function PatientClinicalSummaryCard({
  profile,
  isLoading = false,
}: PatientClinicalSummaryCardProps) {
  const router = useRouter();
  const t = useTranslations("PatientDashboard.ClinicalSummary");

  const bloodType = profile?.bloodType?.trim() || null;

  const rawAllergies = profile?.allergies || [];
  const allergiesList = Array.isArray(rawAllergies)
    ? rawAllergies
        .map((a: any) => (typeof a === "string" ? a : a?.name || a?.allergen || ""))
        .filter(Boolean)
    : [];

  const rawConditions = profile?.medicalConditions || [];
  const conditionsList = Array.isArray(rawConditions)
    ? rawConditions
        .map((c: any) => (typeof c === "string" ? c : c?.name || c?.condition || c?.cie10Code || ""))
        .filter(Boolean)
    : [];

  if (profile?.chronicDiseases && profile.chronicDiseases.trim().length > 0) {
    conditionsList.push(profile.chronicDiseases.trim());
  }

  const insuranceText =
    profile?.insuranceProvider ||
    (profile?.healthInsurance ? profile.healthInsurance : null);

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-200/80 dark:border-gray-800 p-6 sm:p-7 shadow-xs font-sans select-none space-y-5 transition-all">
      {/* ── CABECERA ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>{t("title")}</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {t("subtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/patient/dashboard/vault")}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{t("view_vault")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── CUADRÍCULA DE PARÁMETROS CRÍTICOS NOM-024 ────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Grupo Sanguíneo */}
        <div
          onClick={() => router.push("/patient/profile")}
          className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 space-y-1 cursor-pointer hover:border-rose-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              {t("blood_type")}
            </span>
            <Droplet className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-base sm:text-lg font-black font-mono text-gray-900 dark:text-white truncate">
            {bloodType || t("none_registered")}
          </p>
        </div>

        {/* Alergias */}
        <div
          onClick={() => router.push("/patient/profile")}
          className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 space-y-1 cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              {t("allergies")}
            </span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
            {allergiesList.length > 0
              ? allergiesList.slice(0, 2).join(", ")
              : t("none_registered")}
          </p>
        </div>

        {/* Diagnósticos Activos CIE-10 */}
        <div
          onClick={() => router.push("/patient/profile")}
          className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 space-y-1 cursor-pointer hover:border-indigo-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
              {t("diagnoses")}
            </span>
            <Stethoscope className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
            {conditionsList.length > 0
              ? conditionsList[0]
              : t("none_registered")}
          </p>
        </div>

        {/* Seguro Médico */}
        <div
          onClick={() => router.push("/patient/profile")}
          className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-1 cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              {t("insurance")}
            </span>
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
            {insuranceText || t("none_registered")}
          </p>
        </div>
      </div>
    </div>
  );
}

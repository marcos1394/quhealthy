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
} from "lucide-react";

interface PatientClinicalSummaryCardProps {
  bloodType?: string;
  allergies?: string[];
  activeDiagnoses?: string[];
  insuranceProvider?: string;
}

export function PatientClinicalSummaryCard({
  bloodType = "O+",
  allergies = ["Ninguna conocida"],
  activeDiagnoses = ["E11 - Control Metabólico", "Z00.0 - Chequeo General"],
  insuranceProvider = "GNP Seguros • Póliza Activa",
}: PatientClinicalSummaryCardProps) {
  const router = useRouter();
  const t = useTranslations("PatientDashboard.ClinicalSummary");

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
        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              {t("blood_type")}
            </span>
            <Droplet className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-xl font-black font-mono text-gray-900 dark:text-white">
            {bloodType}
          </p>
        </div>

        {/* Alergias */}
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              {t("allergies")}
            </span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
            {allergies.join(", ")}
          </p>
        </div>

        {/* Diagnósticos Activos CIE-10 */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
              {t("diagnoses")}
            </span>
            <Stethoscope className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
            {activeDiagnoses[0] || t("none_registered")}
          </p>
        </div>

        {/* Seguro Médico */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              {t("insurance")}
            </span>
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
            {insuranceProvider}
          </p>
        </div>
      </div>
    </div>
  );
}

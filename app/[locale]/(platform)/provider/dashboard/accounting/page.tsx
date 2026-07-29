"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Landmark,
  ArrowRight,
  FileText,
  Banknote,
  Building2,
} from "lucide-react";

import { QhSpinner } from "@/components/ui/QhSpinner";

export default function AccountingDashboardPage() {
  const t = useTranslations("AccountingDashboard");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-10">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
              <Landmark className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-bold shadow-sm">
                <span>{t("erp_tag")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1.5">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* ── SECCIONES PRINCIPALES ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Tarjeta: Plan de Cuentas */}
          <div
            onClick={() =>
              router.push("/provider/dashboard/accounting/accounts")
            }
            className="group rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 flex flex-col justify-between cursor-pointer hover:border-emerald-500/50 hover:shadow-md transition-all min-h-[220px] shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                <FileText className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 transition-all flex items-center justify-center">
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("accounts_title")}
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("accounts_desc")}
              </p>
            </div>
          </div>

          {/* Tarjeta: Centros de Costos */}
          <div
            onClick={() =>
              router.push("/provider/dashboard/accounting/cost-centers")
            }
            className="group rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 flex flex-col justify-between cursor-pointer hover:border-emerald-500/50 hover:shadow-md transition-all min-h-[220px] shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                <Building2 className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 transition-all flex items-center justify-center">
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("cost_centers_title")}
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("cost_centers_desc")}
              </p>
            </div>
          </div>

          {/* Tarjeta: Pólizas (Próximamente) */}
          <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#080808] p-8 flex flex-col justify-between min-h-[220px] opacity-75 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800/60 text-gray-400 flex items-center justify-center shrink-0">
                <Banknote className="w-6 h-6" strokeWidth={2} />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-200/80 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {t("phase_2_badge")}
              </span>
            </div>
            <div className="mt-8">
              <h2 className="text-lg font-bold tracking-tight text-gray-500 dark:text-gray-400 mb-1">
                {t("vouchers_title")}
              </h2>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 leading-relaxed">
                {t("vouchers_desc")}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
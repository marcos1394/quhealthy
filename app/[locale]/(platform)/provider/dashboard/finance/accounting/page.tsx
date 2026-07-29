"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BookOpen, FileText, Activity, Calculator } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AccountingDashboardPage() {
  const t = useTranslations("SatAccounting");

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
              <Calculator className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* ── GRID MÓDULOS CONTABLES SAT ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* MÓDULO 1: PÓLIZAS CONTABLES */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
              <FileText className="w-7 h-7" strokeWidth={2} />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {t("journals.title")}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2 mb-8 leading-relaxed max-w-xs">
              {t("journals.description")}
            </p>
            <Link
              href="/provider/dashboard/finance/accounting/journals"
              className="w-full mt-auto"
            >
              <Button className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 text-xs font-bold transition-all shadow-sm border-0">
                {t("journals.button")}
              </Button>
            </Link>
          </div>

          {/* MÓDULO 2: CATÁLOGO DE CUENTAS */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="w-7 h-7" strokeWidth={2} />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {t("accounts.title")}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2 mb-8 leading-relaxed max-w-xs">
              {t("accounts.description")}
            </p>
            <Link
              href="/provider/dashboard/finance/accounting/accounts"
              className="w-full mt-auto"
            >
              <Button className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 text-xs font-bold transition-all shadow-sm border-0">
                {t("accounts.button")}
              </Button>
            </Link>
          </div>

          {/* MÓDULO 3: BALANZA DE COMPROBACIÓN (PRÓXIMAMENTE) */}
          <div className="bg-white/60 dark:bg-[#0a0a0a]/60 border border-gray-100 dark:border-gray-800/60 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-sm opacity-60">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 shadow-sm">
              <Activity className="w-7 h-7" strokeWidth={2} />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {t("trial_balance.title")}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2 mb-8 leading-relaxed max-w-xs">
              {t("trial_balance.description")}
            </p>
            <Button
              disabled
              variant="outline"
              className="w-full mt-auto rounded-xl border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 h-11 text-xs font-bold cursor-not-allowed"
            >
              {t("trial_balance.button")}
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
}
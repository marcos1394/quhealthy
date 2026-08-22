"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Wallet,
  Pill,
  Vault,
  ShoppingBag,
  ArrowRight,
  PlusCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientClinicalMetricsGridProps {
  walletBalance?: number;
  currency?: string;
  activePackagesCount?: number;
  pendingPrescriptionsCount?: number;
  vaultDocsCount?: number;
  activeOrdersCount?: number;
  isLoading?: boolean;
}

export function PatientClinicalMetricsGrid({
  walletBalance = 0,
  currency = "MXN",
  activePackagesCount = 0,
  pendingPrescriptionsCount = 0,
  vaultDocsCount = 0,
  activeOrdersCount = 0,
  isLoading = false,
}: PatientClinicalMetricsGridProps) {
  const router = useRouter();
  const t = useTranslations("PatientDashboard.ClinicalMetrics");

  const formattedBalance = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(walletBalance);

  return (
    <div className="w-full font-sans transition-colors space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight">
          {t("section_title")}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* ── 1. CARD QUWALLET Y CRÉDITOS ───────────────────────────────── */}
        <div
          onClick={() => router.push("/patient/dashboard/wallet")}
          className="group relative rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800/80 p-5 flex flex-col justify-between min-h-[175px] shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 cursor-pointer select-none"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" strokeWidth={2} />
            </div>

            <div className="w-7 h-7 rounded-xl bg-gray-50 dark:bg-[#141414] flex items-center justify-center text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <div className="space-y-1 mt-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t("wallet_title")}
            </span>
            <h4 className="text-xl font-black font-mono text-gray-900 dark:text-white tracking-tight">
              {isLoading ? "..." : formattedBalance}
            </h4>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
              {t("wallet_packages", { count: activePackagesCount })}
            </p>
          </div>
        </div>

        {/* ── 2. CARD TRATAMIENTOS Y RECETAS ACTIVAS ─────────────────────── */}
        <div
          onClick={() => router.push("/patient/dashboard/treatments")}
          className="group relative rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800/80 p-5 flex flex-col justify-between min-h-[175px] shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 cursor-pointer select-none"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5" strokeWidth={2} />
            </div>

            <div className="w-7 h-7 rounded-xl bg-gray-50 dark:bg-[#141414] flex items-center justify-center text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <div className="space-y-1 mt-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t("treatments_title")}
            </span>
            <h4 className="text-xl font-black font-mono text-gray-900 dark:text-white tracking-tight">
              {isLoading ? "..." : t("treatments_active", { count: pendingPrescriptionsCount })}
            </h4>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
              {t("treatments_desc")}
            </p>
          </div>
        </div>

        {/* ── 3. CARD EXPEDIENTE & VAULT DIGITAL ────────────────────────── */}
        <div
          onClick={() => router.push("/patient/dashboard/vault")}
          className="group relative rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800/80 p-5 flex flex-col justify-between min-h-[175px] shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 cursor-pointer select-none"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Vault className="w-5 h-5" strokeWidth={2} />
            </div>

            <div className="w-7 h-7 rounded-xl bg-gray-50 dark:bg-[#141414] flex items-center justify-center text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <div className="space-y-1 mt-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t("vault_title")}
            </span>
            <h4 className="text-xl font-black font-mono text-gray-900 dark:text-white tracking-tight">
              {isLoading ? "..." : t("vault_docs", { count: vaultDocsCount })}
            </h4>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
              {t("vault_desc")}
            </p>
          </div>
        </div>

        {/* ── 4. CARD PEDIDOS Y TIENDA ──────────────────────────────────── */}
        <div
          onClick={() => router.push("/patient/dashboard/orders")}
          className="group relative rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800/80 p-5 flex flex-col justify-between min-h-[175px] shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 cursor-pointer select-none"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" strokeWidth={2} />
            </div>

            <div className="w-7 h-7 rounded-xl bg-gray-50 dark:bg-[#141414] flex items-center justify-center text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <div className="space-y-1 mt-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t("orders_title")}
            </span>
            <h4 className="text-xl font-black font-mono text-gray-900 dark:text-white tracking-tight">
              {isLoading ? "..." : t("orders_active", { count: activeOrdersCount })}
            </h4>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
              {t("orders_desc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

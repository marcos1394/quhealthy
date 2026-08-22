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
  Sparkles,
  ShieldCheck,
  CreditCard,
  Layers,
  Package,
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
    <div className="w-full font-sans transition-colors space-y-4 select-none">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{t("section_title")}</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* ── 1. CARD QUWALLET Y CRÉDITOS ───────────────────────────────── */}
        <div
          onClick={() => router.push("/patient/dashboard/wallet")}
          className="group relative rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white dark:to-[#0a0a0a] border border-emerald-200/80 dark:border-emerald-900/40 p-5 sm:p-6 flex flex-col justify-between min-h-[190px] shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-28 h-28 bg-emerald-400/15 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Wallet className="w-6 h-6" strokeWidth={2} />
            </div>

            <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-[#141414]/80 backdrop-blur-md border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shadow-2xs">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <div className="space-y-1 mt-4 relative z-10">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t("wallet_title")}
            </span>
            <h4 className="text-2xl font-black font-mono text-gray-900 dark:text-white tracking-tight">
              {isLoading ? "..." : formattedBalance}
            </h4>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold font-mono">
                <Layers className="w-3 h-3" />
                <span>{t("wallet_packages", { count: activePackagesCount })}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. CARD TRATAMIENTOS Y RECETAS ACTIVAS ─────────────────────── */}
        <div
          onClick={() => router.push("/patient/dashboard/treatments")}
          className="group relative rounded-3xl bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-white dark:to-[#0a0a0a] border border-cyan-200/80 dark:border-cyan-900/40 p-5 sm:p-6 flex flex-col justify-between min-h-[190px] shadow-xs hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-28 h-28 bg-cyan-400/15 dark:bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Pill className="w-6 h-6" strokeWidth={2} />
            </div>

            <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-[#141414]/80 backdrop-blur-md border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors shadow-2xs">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <div className="space-y-1 mt-4 relative z-10">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t("treatments_title")}
            </span>
            <h4 className="text-2xl font-black font-mono text-gray-900 dark:text-white tracking-tight">
              {isLoading ? "..." : t("treatments_active", { count: pendingPrescriptionsCount })}
            </h4>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate pt-1">
              {t("treatments_desc")}
            </p>
          </div>
        </div>

        {/* ── 3. CARD EXPEDIENTE & VAULT DIGITAL ────────────────────────── */}
        <div
          onClick={() => router.push("/patient/dashboard/vault")}
          className="group relative rounded-3xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-white dark:to-[#0a0a0a] border border-indigo-200/80 dark:border-indigo-900/40 p-5 sm:p-6 flex flex-col justify-between min-h-[190px] shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-28 h-28 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Vault className="w-6 h-6" strokeWidth={2} />
            </div>

            <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-[#141414]/80 backdrop-blur-md border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shadow-2xs">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <div className="space-y-1 mt-4 relative z-10">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t("vault_title")}
            </span>
            <h4 className="text-2xl font-black font-mono text-gray-900 dark:text-white tracking-tight">
              {isLoading ? "..." : t("vault_docs", { count: vaultDocsCount })}
            </h4>
            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-1 truncate">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t("vault_desc")}</span>
            </div>
          </div>
        </div>

        {/* ── 4. CARD PEDIDOS Y TIENDA ──────────────────────────────────── */}
        <div
          onClick={() => router.push("/patient/dashboard/orders")}
          className="group relative rounded-3xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-white dark:to-[#0a0a0a] border border-purple-200/80 dark:border-purple-900/40 p-5 sm:p-6 flex flex-col justify-between min-h-[190px] shadow-xs hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-28 h-28 bg-purple-400/15 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6" strokeWidth={2} />
            </div>

            <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-[#141414]/80 backdrop-blur-md border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors shadow-2xs">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <div className="space-y-1 mt-4 relative z-10">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t("orders_title")}
            </span>
            <h4 className="text-2xl font-black font-mono text-gray-900 dark:text-white tracking-tight">
              {isLoading ? "..." : t("orders_active", { count: activeOrdersCount })}
            </h4>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate pt-1">
              {t("orders_desc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

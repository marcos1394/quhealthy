"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Package, Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

import { usePackages } from "@/hooks/usePackages";
import { PackageCard } from "@/components/packages/PackageCard";
import { EmptyPackages } from "@/components/packages/EmptyPackages";
import { SuggestedUpgrades } from "@/components/packages/SuggestedUpgrades";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function ConsumerPackagesPage() {
  const t = useTranslations("PatientPackages");
  const router = useRouter();

  // 🚀 Hook de Producción
  const { packages, isLoading } = usePackages();

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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto px-6 py-10 sm:py-12 lg:px-12 space-y-10"
      >
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm">
              <Package className="h-7 w-7" strokeWidth={2} />
            </div>
            <div className="max-w-2xl">
              <div className="mb-2.5 inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-bold rounded-full shadow-sm">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                <span>{t("badge_my_packages")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1.5">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/discover")}
            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-6 text-xs font-bold transition-all shadow-sm border-0 shrink-0 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2} />
            <span>{t("btn_explore")}</span>
          </Button>
        </div>

        {/* ── GRID DE PAQUETES ─────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-gray-800 pb-4">
            <Activity
              className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
              strokeWidth={2}
            />
            <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              {t("active_title")}
            </h2>
          </div>

          {packages.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {packages.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PackageCard pkg={pkg} />
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyPackages />
          )}
        </div>

        {/* ── SECCIÓN DE RECOMENDACIONES ─────────────────────────────── */}
        <SuggestedUpgrades />
      </motion.div>
    </div>
  );
}
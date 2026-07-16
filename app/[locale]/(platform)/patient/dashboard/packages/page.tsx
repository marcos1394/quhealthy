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
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
        <QhSpinner size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
          {t("loading", { defaultValue: "Verificando balances de crédito..." })}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto px-6 py-12 md:px-12 md:py-16 space-y-12 pb-24"
      >
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
          <div className="flex items-start gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
              <Package
                className="h-6 w-6 text-black dark:text-white"
                strokeWidth={1.5}
              />
            </div>
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                <Sparkles className="h-3 w-3" strokeWidth={2} />
                Mis Paquetes
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white uppercase mb-2">
                {t("title", { defaultValue: "Cartera de Contratos" })}
              </h1>
              <p className="text-xs font-light leading-relaxed text-gray-500">
                {t("subtitle", {
                  defaultValue:
                    "Auditoría, gestión y redención de créditos en paquetes clínicos prepagados.",
                })}
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/discover")}
            className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0 shrink-0"
          >
            <Sparkles className="w-4 h-4 mr-3" strokeWidth={2} />
            {t("btn_explore", { defaultValue: "Nuevo Contrato" })}
          </Button>
        </div>

        {/* --- GRID DE PAQUETES --- */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
            <Activity
              className="w-4 h-4 text-black dark:text-white"
              strokeWidth={1.5}
            />
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              {t("active_title", { defaultValue: "Contratos en Ejecución" })}
            </h2>
          </div>

          {packages.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {packages.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
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

        {/* --- UP-SELLING SECTION --- */}
        <SuggestedUpgrades />
      </motion.div>
    </div>
  );
}

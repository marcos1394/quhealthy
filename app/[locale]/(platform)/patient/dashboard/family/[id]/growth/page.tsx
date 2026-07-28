"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Baby } from "lucide-react";
import { ParentGrowthContainer } from "@/components/growth/ParentGrowthContainer";
import { useFamily } from "@/hooks/useFamily";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function DependentGrowthPage() {
  const t = useTranslations("PatientFamilyDashboard");
  const params = useParams();
  const router = useRouter();
  const memberId = Number(params.id);

  const { family, isLoading } = useFamily();
  const [activeDependent, setActiveDependent] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && family) {
      const dep = family.find((f) => f.id === memberId);
      if (dep) {
        setActiveDependent(dep);
      } else {
        router.push("/patient/dashboard/family");
      }
    }
  }, [isLoading, family, memberId, router]);

  if (isLoading || !activeDependent) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505]">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading_growth")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-5xl mx-auto px-6 py-10 sm:py-12 space-y-10">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-gray-100 dark:border-gray-800 pb-8"
        >
          <button
            onClick={() => router.back()}
            aria-label={t("btn_back")}
            className="w-12 h-12 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-sm shrink-0"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>

          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {activeDependent.firstName} {activeDependent.lastName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3 mt-0.5">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shadow-sm shrink-0">
                <Baby className="w-5 h-5" strokeWidth={2} />
              </div>
              <span>{t("growth_title")}</span>
            </h1>
          </div>
        </motion.div>

        {/* ── CONTENEDOR DE GRÁFICAS DE CRECIMIENTO ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ParentGrowthContainer
            dependentId={memberId}
            sex={activeDependent.gender === "FEMALE" ? "FEMALE" : "MALE"}
          />
        </motion.div>
      </div>
    </div>
  );
}
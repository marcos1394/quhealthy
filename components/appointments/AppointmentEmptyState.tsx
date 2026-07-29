"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Calendar, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TabValue } from "./AppointmentFilters";

interface AppointmentEmptyStateProps {
  activeTab: TabValue;
  searchQuery: string;
}

export function AppointmentEmptyState({
  activeTab,
  searchQuery,
}: AppointmentEmptyStateProps) {
  const router = useRouter();
  const t = useTranslations("PatientAppointments");

  const getEmptyMessage = () => {
    if (searchQuery) return t("empty_search");
    if (activeTab === "upcoming") return t("empty_upcoming");
    if (activeTab === "past") return t("empty_past");
    return t("empty_cancelled");
  };

  const getEmptyHint = () => {
    if (searchQuery) return t("empty_search_hint");
    return t("empty_hint");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] transition-colors font-sans text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 shadow-sm">
        <Calendar className="w-7 h-7" strokeWidth={2} />
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
        {getEmptyMessage()}
      </h3>

      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 max-w-sm leading-relaxed">
        {getEmptyHint()}
      </p>

      {!searchQuery && (
        <Button
          onClick={() => router.push("/discover")}
          className="h-11 px-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>{t("btn_find")}</span>
        </Button>
      )}
    </motion.div>
  );
}
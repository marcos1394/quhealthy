"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Bell, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { NotificationSettings } from "@/components/settings/NotificationSettings";

export default function PatientAlertsPage() {
  const t = useTranslations("SettingsSecurity");

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* ── HEADER PRINCIPAL ────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <Link
            href="/patient/dashboard/settings"
            className="w-10 h-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-sm shrink-0"
          >
            <ArrowLeft
              className="w-4 h-4 text-gray-700 dark:text-gray-200"
              strokeWidth={2}
            />
          </Link>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
            <Bell className="w-6 h-6" strokeWidth={2} />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              {t("options.alerts.title")}
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {t("options.alerts.desc")}
            </p>
          </div>
        </div>

        {/* ── TARJETA CONFIGURACIÓN DE ALERTAS ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <NotificationSettings />
        </motion.div>
      </div>
    </div>
  );
}

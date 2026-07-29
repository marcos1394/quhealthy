"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import {
  Calendar,
  Download,
  Share,
  Bell,
  ArrowRight,
  Home,
  ShieldCheck,
  Check,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface Props {
  t?: any;
  router: any;
  copied: boolean;
  isDownloading: boolean;
  handleAddToCalendar: () => void;
  downloadInvoice: () => void;
  handleShare: () => void;
  handleEnableAlert: () => void;
}

export function ActionButtons({
  router,
  copied,
  isDownloading,
  handleAddToCalendar,
  downloadInvoice,
  handleShare,
  handleEnableAlert,
}: Props) {
  const t = useTranslations("AppointmentConfirmation");

  return (
    <div className="pt-6 font-sans">
      {/* ── HERRAMIENTAS RÁPIDAS (ACCIONES SECUNDARIAS) ────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {/* Agendar en Calendario */}
        <button
          onClick={handleAddToCalendar}
          className="flex flex-col items-center justify-center gap-2.5 py-4 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-emerald-500/30 dark:hover:border-emerald-900/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all shadow-xs group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" strokeWidth={2} />
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {t("btn_calendar")}
          </span>
        </button>

        {/* Descargar PDF */}
        <button
          onClick={downloadInvoice}
          disabled={isDownloading}
          className="flex flex-col items-center justify-center gap-2.5 py-4 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-emerald-500/30 dark:hover:border-emerald-900/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all shadow-xs group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            {isDownloading ? (
              <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Download className="w-5 h-5" strokeWidth={2} />
            )}
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {isDownloading ? t("btn_downloading") : t("btn_pdf")}
          </span>
        </button>

        {/* Compartir */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center justify-center gap-2.5 py-4 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-emerald-500/30 dark:hover:border-emerald-900/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all shadow-xs group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            {copied ? (
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
            ) : (
              <Share className="w-5 h-5" strokeWidth={2} />
            )}
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {copied ? t("btn_copied") : t("btn_share")}
          </span>
        </button>

        {/* Recordatorio */}
        <button
          onClick={handleEnableAlert}
          className="flex flex-col items-center justify-center gap-2.5 py-4 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-emerald-500/30 dark:hover:border-emerald-900/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all shadow-xs group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            <Bell className="w-5 h-5" strokeWidth={2} />
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {t("btn_reminder")}
          </span>
        </button>
      </div>

      {/* ── BOTONES PRINCIPALES DE NAVEGACIÓN ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => router.push("/patient/dashboard/appointments")}
          className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 border-0"
        >
          <span>{t("btn_appointments")}</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </Button>

        <Button
          onClick={() => router.push("/patient/dashboard")}
          variant="outline"
          className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>{t("btn_home")}</span>
        </Button>
      </div>

      {/* ── SELLO DE CONFIANZA Y SEGURIDAD ───────────────────────────────── */}
      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-gray-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
        <span>{t("security_seal")}</span>
      </div>
    </div>
  );
}
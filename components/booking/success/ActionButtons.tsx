"use client";
/* eslint-disable react-doctor/button-has-type */

import React from "react";
import {
  Calendar,
  Download,
  Share,
  Bell,
  ArrowRight,
  Home,
  ShieldCheck,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

interface Props {
  t: any;
  router: any;
  copied: boolean;
  isDownloading: boolean;
  handleAddToCalendar: () => void;
  downloadInvoice: () => void;
  handleShare: () => void;
  handleEnableAlert: () => void;
}

export function ActionButtons({
  t,
  router,
  copied,
  isDownloading,
  handleAddToCalendar,
  downloadInvoice,
  handleShare,
  handleEnableAlert,
}: Props) {
  return (
    <div className="mt-10 pt-8">
      {/* Herramientas del Documento */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <button
          onClick={handleAddToCalendar}
          className="flex flex-col items-center justify-center gap-3 py-5 bg-white dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-quhealthy-green/40 dark:hover:border-emerald-800/40 hover:bg-quhealthy-green/5 dark:hover:bg-emerald-950/20 transition-all shadow-sm group"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center group-hover:bg-quhealthy-green/10 dark:group-hover:bg-emerald-900/30 transition-colors">
            <Calendar
              className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-quhealthy-green dark:group-hover:text-emerald-400 transition-colors"
              strokeWidth={1.5}
            />
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {t("btn_calendar", { defaultValue: "Agendar" })}
          </span>
        </button>

        <button
          onClick={downloadInvoice}
          disabled={isDownloading}
          className="flex flex-col items-center justify-center gap-3 py-5 bg-white dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-quhealthy-green/40 dark:hover:border-emerald-800/40 hover:bg-quhealthy-green/5 dark:hover:bg-emerald-950/20 transition-all shadow-sm group disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center group-hover:bg-quhealthy-green/10 dark:group-hover:bg-emerald-900/30 transition-colors">
            {isDownloading ? (
              <Loader2
                className="w-5 h-5 animate-spin text-gray-500 dark:text-gray-400"
                strokeWidth={1.5}
              />
            ) : (
              <Download
                className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-quhealthy-green dark:group-hover:text-emerald-400 transition-colors"
                strokeWidth={1.5}
              />
            )}
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            PDF
          </span>
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center justify-center gap-3 py-5 bg-white dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-quhealthy-green/40 dark:hover:border-emerald-800/40 hover:bg-quhealthy-green/5 dark:hover:bg-emerald-950/20 transition-all shadow-sm group"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center group-hover:bg-quhealthy-green/10 dark:group-hover:bg-emerald-900/30 transition-colors">
            {copied ? (
              <Check
                className="w-5 h-5 text-quhealthy-green dark:text-emerald-400"
                strokeWidth={2}
              />
            ) : (
              <Share
                className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-quhealthy-green dark:group-hover:text-emerald-400 transition-colors"
                strokeWidth={1.5}
              />
            )}
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {t("btn_share", { defaultValue: "Compartir" })}
          </span>
        </button>

        <button
          onClick={handleEnableAlert}
          className="flex flex-col items-center justify-center gap-3 py-5 bg-white dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-quhealthy-green/40 dark:hover:border-emerald-800/40 hover:bg-quhealthy-green/5 dark:hover:bg-emerald-950/20 transition-all shadow-sm group"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center group-hover:bg-quhealthy-green/10 dark:group-hover:bg-emerald-900/30 transition-colors">
            <Bell
              className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-quhealthy-green dark:group-hover:text-emerald-400 transition-colors"
              strokeWidth={1.5}
            />
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Recordatorio
          </span>
        </button>
      </div>

      {/* Botones de Navegación */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => router.push("/patient/dashboard/appointments")}
          className="flex-1 h-12 rounded-xl bg-quhealthy-green hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 text-sm font-bold transition-colors border-0 flex items-center justify-center px-6 shadow-md shadow-emerald-900/20"
        >
          {t("btn_appointments", { defaultValue: "Ver Mis Citas" })}
          <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
        </Button>
        <Button
          onClick={() => router.push("/patient/dashboard")}
          variant="outline"
          className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#050505] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-bold transition-colors flex items-center justify-center px-6"
        >
          <Home className="w-4 h-4 mr-2" strokeWidth={1.5} />
          {t("btn_home", { defaultValue: "Ir al Panel" })}
        </Button>
      </div>

      {/* Sello de Confianza */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500">
        <ShieldCheck className="w-4 h-4 text-quhealthy-green dark:text-emerald-400" strokeWidth={1.5} />
        <span>Transacción procesada bajo estándares de cifrado seguros.</span>
      </div>
    </div>
  );
}

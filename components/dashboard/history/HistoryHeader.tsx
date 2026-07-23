"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, Loader2, CheckCircle2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

export type UserRole = "paciente" | "proveedor";

interface HistoryHeaderProps {
  role: UserRole;
  entryCount: number;
  onExport: () => void;
  onShare?: () => void;
}

export const HistoryHeader: React.FC<HistoryHeaderProps> = ({ entryCount, onExport, onShare }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const t = useTranslations("DashboardHistory");

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      await onExport();
      setExportSuccess(true);
      toast.success(t("export_success", { defaultValue: "Extracción de datos completada." }), { theme: "colored" });
      setTimeout(() => setExportSuccess(false), 3000);
    } catch {
      return;
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    onShare?.();
    toast.success(t("share_success", { defaultValue: "Enlace operativo copiado al portapapeles." }), { theme: "colored" });
  };

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
      
      {onShare && (
        <button 
          type="button"
          onClick={handleShare}
          className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold flex items-center justify-center gap-2 shadow-sm shrink-0"
        >
          <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>{t("share", { defaultValue: "Compartir" })}</span>
        </button>
      )}

      <button 
        type="button"
        onClick={handleExport} 
        disabled={isExporting || entryCount === 0}
        className={cn(
          "flex-1 sm:flex-none h-10 px-5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]",
          exportSuccess 
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" 
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        )}
      >
        <AnimatePresence mode="wait">
          {isExporting ? (
            <motion.span 
              key="exporting" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
              <span>{t("exporting", { defaultValue: "Extrayendo..." })}</span>
            </motion.span>
          ) : exportSuccess ? (
            <motion.span 
              key="done" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
              <span>{t("exported", { defaultValue: "Completado" })}</span>
            </motion.span>
          ) : (
            <motion.span 
              key="idle" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" strokeWidth={2} />
              <span>{t("export_csv", { defaultValue: "Extraer CSV" })}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>

    </div>
  );
};
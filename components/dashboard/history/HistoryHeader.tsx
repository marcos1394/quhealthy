"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, CheckCircle2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { handleApiError } from '@/lib/handleApiError';

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
      toast.success(t("export_success"));
      setTimeout(() => setExportSuccess(false), 3000);
    } catch {
      return;
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    onShare?.();
    toast.success(t("share_success"));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2.5">
      {onShare && (
        <Button variant="outline" onClick={handleShare}
          className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium text-sm transition-colors">
          <Share2 className="w-4 h-4 mr-2" />{t("share")}
        </Button>
      )}

      <Button variant="outline" onClick={handleExport} disabled={isExporting || entryCount === 0}
        className={cn(
          "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium text-sm min-w-[140px] transition-colors",
          exportSuccess ? "border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : ""
        )}>
        <AnimatePresence mode="wait">
          {isExporting ? (
            <motion.span key="exporting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
              <Loader2 className="w-4 h-4 animate-spin" />{t("exporting")}
            </motion.span>
          ) : exportSuccess ? (
            <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />{t("exported")}
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
              <FileDown className="w-4 h-4" />{t("export_csv")}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
};
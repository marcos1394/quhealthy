"use client"
/* eslint-disable react-doctor/button-has-type */;

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
 toast.success(t("export_success", { defaultValue: "EXTRACCIÓN DE DATOS COMPLETADA." }));
 setTimeout(() => setExportSuccess(false), 3000);
 } catch {
 return;
 } finally {
 setIsExporting(false);
 }
 };

 const handleShare = () => {
 onShare?.();
 toast.success(t("share_success", { defaultValue: "ENLACE OPERATIVO COPIADO." }));
 };

 return (
 <div className="flex flex-col sm:flex-row gap-0 border border-black/20 dark:border-white/20 w-full sm:w-auto bg-white dark:bg-[#0a0a0a]">
 
 {onShare && (
 <button 
 onClick={handleShare}
 className="flex-1 sm:flex-none h-10 px-6 flex items-center justify-center gap-2 border-b sm:border-b-0 sm:border-r border-black/10 dark:border-white/10 bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none"
 >
 <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
 {t("share", { defaultValue: "COMPARTIR" })}
 </button>
 )}

 <button 
 onClick={handleExport} 
 disabled={isExporting || entryCount === 0}
 className={cn(
 "flex-1 sm:flex-none h-10 px-6 flex items-center justify-center gap-2 transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none min-w-[160px] disabled:opacity-50",
 exportSuccess 
 ? "bg-black text-white dark:bg-white dark:text-black" 
 : "bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111]"
 )}
 >
 <AnimatePresence mode="wait">
 {isExporting ? (
 <motion.span key="exporting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
 <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
 {t("exporting", { defaultValue: "EXTRAYENDO..." })}
 </motion.span>
 ) : exportSuccess ? (
 <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
 <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
 {t("exported", { defaultValue: "COMPLETADO" })}
 </motion.span>
 ) : (
 <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
 <FileDown className="w-3.5 h-3.5" strokeWidth={1.5} />
 {t("export_csv", { defaultValue: "EXTRAER CSV" })}
 </motion.span>
 )}
 </AnimatePresence>
 </button>

 </div>
 );
};
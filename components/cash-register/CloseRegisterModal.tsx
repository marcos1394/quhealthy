"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { cashRegisterService } from "@/services/cash-register.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface CloseRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  registerId: number;
  expectedBalance: number;
  onSuccess: () => void;
}

export const CloseRegisterModal: React.FC<CloseRegisterModalProps> = ({
  isOpen,
  onClose,
  registerId,
  expectedBalance,
  onSuccess,
}) => {
  const t = useTranslations("CashRegister");
  const [actualBalance, setActualBalance] = useState<number>(expectedBalance);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const difference = actualBalance - expectedBalance;

  const handleCloseRegister = async () => {
    if (actualBalance < 0) {
      toast.error(t("error_negative_balance"));
      return;
    }

    try {
      setIsSubmitting(true);
      await cashRegisterService.closeRegister(registerId, {
        actualClosingBalance: actualBalance,
        closingNotes: notes || undefined,
      });
      toast.success(t("toast_close_success"));
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || t("error_close_generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between p-6 sm:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-xs">
                <Calculator className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {t("close_modal_protocol")}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {t("close_modal_title")}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4 text-gray-500" strokeWidth={2} />
            </button>
          </div>

          {/* ── BODY ───────────────────────────────────────────────────── */}
          <div className="flex flex-col bg-gray-50/40 dark:bg-[#050505]/50 overflow-y-auto max-h-[70vh] custom-scrollbar">
            {/* Balance Esperado */}
            <div className="bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500">
                  {t("expected_balance")}
                </p>
                <p className="text-3xl font-bold font-mono text-gray-900 dark:text-white tracking-tight">
                  ${expectedBalance.toFixed(2)}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 hidden sm:flex text-emerald-600 dark:text-emerald-400 shadow-xs">
                <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
              </div>
            </div>

            {/* Arqueo Físico */}
            <div className="bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span>{t("step_1_label")}</span>
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={actualBalance}
                  onChange={(e) =>
                    setActualBalance(parseFloat(e.target.value) || 0)
                  }
                  className="w-full h-12 pl-9 pr-4 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 shadow-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Alerta de Diferencia */}
            {difference !== 0 && (
              <div
                className={cn(
                  "p-6 sm:p-8 flex items-start gap-4 border-b border-gray-100 dark:border-gray-800 transition-colors",
                  difference > 0
                    ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500"
                    : "bg-red-50/60 dark:bg-red-950/20 border-l-4 border-l-red-500"
                )}
              >
                <AlertCircle
                  className={cn(
                    "w-5 h-5 shrink-0 mt-0.5",
                    difference > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                  strokeWidth={2}
                />
                <div className="space-y-0.5">
                  <p
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      difference > 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-red-700 dark:text-red-400"
                    )}
                  >
                    {difference > 0
                      ? t("surplus_detected")
                      : t("shortage_detected")}
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold font-mono tracking-tight",
                      difference > 0
                        ? "text-emerald-900 dark:text-emerald-200"
                        : "text-red-900 dark:text-red-200"
                    )}
                  >
                    ${Math.abs(difference).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Justificación */}
            <div className="bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span>{t("step_2_label")}</span>
              </label>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-4 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none shadow-sm"
                placeholder={t("notes_placeholder")}
              />
            </div>
          </div>

          {/* ── FOOTER ─────────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {t("btn_cancel")}
            </button>

            <button
              type="button"
              onClick={handleCloseRegister}
              disabled={isSubmitting || actualBalance < 0}
              className="w-full sm:w-auto h-11 px-7 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm border-0 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("btn_processing")}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  <span>{t("btn_confirm")}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
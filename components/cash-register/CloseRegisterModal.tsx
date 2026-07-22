"use client";
/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { cashRegisterService } from "@/services/cash-register.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useTranslations } from "next-intl";
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
  const [actualBalance, setActualBalance] = useState<number>(expectedBalance);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("CashRegister");

  const difference = actualBalance - expectedBalance;

  const handleCloseRegister = async () => {
    if (actualBalance < 0) {
      toast.error("EL BALANCE NO PUEDE SER NEGATIVO.");
      return;
    }

    try {
      setIsSubmitting(true);
      await cashRegisterService.closeRegister(registerId, {
        actualClosingBalance: actualBalance,
        closingNotes: notes || undefined,
      });
      toast.success("CAJA CERRADA CORRECTAMENTE.");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "ERROR AL CERRAR LA CAJA");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-xl bg-white dark:bg-[#0a0a0a] border border-black dark:border-white flex flex-col rounded-none overflow-hidden shadow-2xl"
        >
          {/* HEADER ARQUITECTÓNICO */}
          <div className="flex items-start justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-black/20 dark:border-white/20 shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                <Calculator
                  className="w-6 h-6 text-black dark:text-white"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Protocolo Financiero
                </p>
                <h2 className="text-xl md:text-2xl font-semibold text-black dark:text-white uppercase tracking-tight leading-none">
                  CIERRE DE CAJA
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-12 h-12 flex items-center justify-center border border-transparent hover:border-black/20 dark:hover:border-white/20 transition-colors shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
            </button>
          </div>

          {/* BODY (BLUEPRINT GRID) */}
          <div className="flex flex-col bg-gray-50 dark:bg-[#050505] overflow-y-auto max-h-[70vh] custom-scrollbar">
            {/* Balance Esperado (Lectura) */}
            <div className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                  BALANCE ESPERADO DEL SISTEMA
                </p>
                <p className="text-3xl md:text-4xl font-semibold text-black dark:text-white tracking-tight">
                  ${expectedBalance.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center justify-center hidden sm:flex">
                <CheckCircle2
                  className="w-5 h-5 text-gray-400"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Arqueo Físico (Input) */}
            <div className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 border-b border-black/10 dark:border-white/10">
              <label className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">
                  1
                </span>
                EFECTIVO CONTADO (ARQUEO) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
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
                  className="w-full h-14 pl-9 pr-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-black dark:text-white text-xl font-semibold focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-300 dark:placeholder:text-gray-700"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Diferencia Alerta */}
            {difference !== 0 && (
              <div
                className={cn(
                  "p-6 md:p-8 flex items-start gap-4 border-b border-black/10 dark:border-white/10 transition-colors",
                  difference > 0
                    ? "bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-l-emerald-500"
                    : "bg-red-50 dark:bg-red-900/10 border-l-4 border-l-red-500",
                )}
              >
                <AlertCircle
                  className={cn(
                    "w-6 h-6 shrink-0 mt-1",
                    difference > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                  strokeWidth={1.5}
                />
                <div>
                  <p
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-widest mb-1",
                      difference > 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-red-700 dark:text-red-400",
                    )}
                  >
                    {difference > 0
                      ? "SOBRANTE DETECTADO"
                      : "FALTANTE DETECTADO"}
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-semibold tracking-tight",
                      difference > 0
                        ? "text-emerald-800 dark:text-emerald-300"
                        : "text-red-800 dark:text-red-300",
                    )}
                  >
                    ${Math.abs(difference).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Justificación */}
            <div className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8">
              <label className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">
                  2
                </span>
                JUSTIFICACIÓN (OPCIONAL)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-black dark:text-white text-xs font-semibold focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none"
                placeholder="OBSERVACIONES DEL CIERRE..."
              />
            </div>
          </div>

          {/* FOOTER ESTRICTO */}
          <div className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 flex flex-col sm:flex-row justify-end gap-4 border-t border-black/20 dark:border-white/20 shrink-0">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-14 px-8 border border-black/20 dark:border-white/20 text-black dark:text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-[#111] transition-colors rounded-none"
            >
              CANCELAR
            </button>
            <button
              onClick={handleCloseRegister}
              disabled={isSubmitting || actualBalance < 0}
              className="w-full sm:w-auto h-14 px-10 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-3 disabled:opacity-50 border-0 rounded-none"
            >
              {isSubmitting ? (
                <QhSpinner className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
              )}
              {isSubmitting ? "PROCESANDO..." : "CONFIRMAR CIERRE"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

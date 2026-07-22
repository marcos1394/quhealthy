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
      toast.error("El balance no puede ser negativo.");
      return;
    }

    try {
      setIsSubmitting(true);
      await cashRegisterService.closeRegister(registerId, {
        actualClosingBalance: actualBalance,
        closingNotes: notes || undefined,
      });
      toast.success("Caja cerrada correctamente.");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error al cerrar la caja");
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
          className="w-full max-w-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* HEADER */}
          <div className="flex items-start justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                <Calculator
                  className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Protocolo Financiero
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                  Cierre de Caja
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" strokeWidth={2} />
            </button>
          </div>

          {/* BODY */}
          <div className="flex flex-col bg-gray-50/50 dark:bg-[#050505]/50 overflow-y-auto max-h-[70vh] custom-scrollbar">
            {/* Balance Esperado (Lectura) */}
            <div className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Balance Esperado del Sistema
                </p>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  ${expectedBalance.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#111] flex items-center justify-center hidden sm:flex">
                <CheckCircle2
                  className="w-6 h-6 text-emerald-500"
                  strokeWidth={2}
                />
              </div>
            </div>

            {/* Arqueo Físico (Input) */}
            <div className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600">
                  1
                </span>
                Efectivo Contado (Arqueo) *
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
                  className="w-full h-14 pl-9 pr-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xl font-bold focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Diferencia Alerta */}
            {difference !== 0 && (
              <div
                className={cn(
                  "p-6 md:p-8 flex items-start gap-4 border-b border-gray-100 dark:border-gray-800 transition-colors",
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
                  strokeWidth={2}
                />
                <div>
                  <p
                    className={cn(
                      "text-xs font-bold uppercase tracking-widest mb-1",
                      difference > 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-red-700 dark:text-red-400",
                    )}
                  >
                    {difference > 0
                      ? "Sobrante Detectado"
                      : "Faltante Detectado"}
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold tracking-tight",
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
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600">
                  2
                </span>
                Justificación (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none"
                placeholder="Observaciones del cierre..."
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 flex flex-col sm:flex-row justify-end gap-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 px-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] text-sm font-bold transition-colors shadow-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleCloseRegister}
              disabled={isSubmitting || actualBalance < 0}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 border-0 shadow-sm"
            >
              {isSubmitting ? (
                <QhSpinner className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
              )}
              {isSubmitting ? "Procesando..." : "Confirmar Cierre"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

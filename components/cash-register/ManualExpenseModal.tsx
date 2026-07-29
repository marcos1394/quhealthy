"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useReducer, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { paymentService } from "@/services/payment.service";
import { DenominationMap } from "@/types/cash-register";
import { QhSpinner } from "@/components/ui/QhSpinner";

const DENOMINATIONS = [
  "1000",
  "500",
  "200",
  "100",
  "50",
  "20",
  "10",
  "5",
  "2",
  "1",
  "0.5",
];

const denomLabel = (d: string) => `$${d}`;

const denomTotal = (denoms: DenominationMap): number =>
  Object.entries(denoms).reduce(
    (acc, [d, count]) => acc + parseFloat(d) * (count || 0),
    0
  );

const cleanDenoms = (denoms: DenominationMap): DenominationMap | undefined => {
  const clean = Object.fromEntries(
    Object.entries(denoms).filter(([, v]) => v > 0)
  );
  return Object.keys(clean).length > 0 ? clean : undefined;
};

interface ManualExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentDenominations?: DenominationMap | null;
  maxExpectedBalance: number;
}

interface FormState {
  isProcessing: boolean;
  description: string;
  totalAmountStr: string;
  showDenominations: boolean;
  expenseDenoms: DenominationMap;
}

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: any }
  | { type: "RESET" };

const initialState: FormState = {
  isProcessing: false,
  description: "",
  totalAmountStr: "",
  showDenominations: false,
  expenseDenoms: {},
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

export const ManualExpenseModal: React.FC<ManualExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentDenominations,
  maxExpectedBalance,
}) => {
  const t = useTranslations("CashRegister.expense_modal");

  const [state, dispatch] = useReducer(formReducer, initialState);
  const {
    isProcessing,
    description,
    totalAmountStr,
    showDenominations,
    expenseDenoms,
  } = state;

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "RESET" });
    }
  }, [isOpen]);

  const expenseTotal = useMemo(
    () => denomTotal(expenseDenoms),
    [expenseDenoms]
  );

  const hasDenoms = Object.values(expenseDenoms).some((v) => v > 0);

  const parsedTotal = hasDenoms
    ? expenseTotal
    : parseFloat(totalAmountStr || "0");

  const isValid = description.trim().length > 0 && parsedTotal > 0;
  const isOverBalance = parsedTotal > maxExpectedBalance;

  const updateExpenseDenom = (denom: string, count: number) => {
    const maxAvailable = currentDenominations?.[denom] || 0;
    const newCount = Math.min(Math.max(0, count), maxAvailable);
    dispatch({
      type: "SET_FIELD",
      field: "expenseDenoms",
      value: { ...expenseDenoms, [denom]: newCount },
    });
  };

  const handleRegisterExpense = async () => {
    if (!isValid) return;

    dispatch({ type: "SET_FIELD", field: "isProcessing", value: true });
    try {
      await paymentService.registerManualExpense({
        amount: parsedTotal,
        description: description.trim(),
        expenseDenominations: hasDenoms
          ? cleanDenoms(expenseDenoms)
          : undefined,
      });
      toast.success(t("toast_success"));
      onSuccess();
    } catch (error) {
      console.error("Error procesando gasto:", error);
      toast.error(t("toast_error"));
    } finally {
      dispatch({ type: "SET_FIELD", field: "isProcessing", value: false });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col rounded-3xl"
        >
          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between p-6 sm:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-xs">
                <Banknote className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {t("operation_title")}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {t("modal_title")}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0 cursor-pointer text-gray-500"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* ── BODY ───────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/40 dark:bg-[#050505]/50 flex flex-col">
            <div className="grid grid-cols-1 gap-0">
              {/* Concepto del Gasto */}
              <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>{t("step_concept")}</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "description",
                      value: e.target.value,
                    })
                  }
                  placeholder={t("concept_placeholder")}
                  className="w-full h-11 px-4 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm"
                />
              </div>

              {/* Monto Total (Si no hay desglose) */}
              {!hasDenoms && (
                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>{t("step_amount")}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={totalAmountStr}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "totalAmountStr",
                          value: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      className="w-full h-12 pl-9 pr-4 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Desglose de Denominaciones */}
              <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "showDenominations",
                      value: !showDenominations,
                    })
                  }
                  className="w-full flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {t("toggle_breakdown")}
                  </span>
                  {showDenominations ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" strokeWidth={2} />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" strokeWidth={2} />
                  )}
                </button>

                <AnimatePresence>
                  {showDenominations && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b border-gray-100 dark:border-gray-800 overflow-hidden"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-6 sm:p-8 bg-gray-50/50 dark:bg-[#050505]">
                        {DENOMINATIONS.map((denom) => {
                          const available = currentDenominations?.[denom] || 0;
                          if (available <= 0) return null;
                          return (
                            <div
                              key={`exp-${denom}`}
                              className="border border-gray-100 dark:border-gray-800 p-3.5 rounded-2xl flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] shadow-xs space-y-1"
                            >
                              <span className="text-xs font-bold font-mono text-gray-900 dark:text-white">
                                {denomLabel(denom)}
                              </span>
                              <span className="text-[10px] font-semibold text-gray-400">
                                {t("available_count", { count: available })}
                              </span>
                              <input
                                type="number"
                                min="0"
                                max={available}
                                value={expenseDenoms[denom] || ""}
                                onChange={(e) =>
                                  updateExpenseDenom(
                                    denom,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white text-xs font-bold font-mono text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400"
                                placeholder="0"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Total Calculado */}
              {hasDenoms && (
                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">
                    {t("total_breakdown")}
                  </span>
                  <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
                    ${expenseTotal.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Alerta de Fondo Insuficiente */}
              {isOverBalance && (
                <div className="p-6 sm:p-8 flex items-start gap-4 border-b border-gray-100 dark:border-gray-800 bg-red-50/60 dark:bg-red-950/20 border-l-4 border-l-red-500 transition-colors">
                  <AlertCircle
                    className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                      {t("insufficient_funds_title")}
                    </p>
                    <p className="text-xs font-medium text-red-800 dark:text-red-300">
                      {t("insufficient_funds_desc", {
                        amount: maxExpectedBalance.toFixed(2),
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── FOOTER ─────────────────────────────────────────────────── */}
          <div className="p-6 sm:p-8 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="w-full sm:w-auto h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {t("btn_cancel")}
            </button>

            <button
              type="button"
              onClick={handleRegisterExpense}
              disabled={!isValid || isProcessing || isOverBalance}
              className="w-full sm:w-auto h-11 px-7 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm border-0 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("btn_processing")}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  <span>{t("btn_submit")}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
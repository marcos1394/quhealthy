"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-event-handler */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/js-combine-iterations */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useReducer, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  Calculator,
  CheckCircle2,
  X,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { paymentService } from "@/services/payment.service";
import { DenominationMap } from "@/types/cash-register";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

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

const suggestChange = (
  changeAmount: number,
  availableInRegister: DenominationMap
): DenominationMap => {
  const suggestion: DenominationMap = {};
  let remaining = changeAmount;

  const sortedDenoms = DENOMINATIONS.map((d) => parseFloat(d)).sort(
    (a, b) => b - a
  );

  for (const denomValue of sortedDenoms) {
    if (remaining <= 0) break;
    const denomKey = denomValue.toString();
    const availableCount = availableInRegister[denomKey] || 0;
    if (availableCount <= 0 || denomValue > remaining) continue;

    const needed = Math.floor(remaining / denomValue);
    const canUse = Math.min(needed, availableCount);
    if (canUse > 0) {
      suggestion[denomKey] = canUse;
      remaining = Math.round((remaining - canUse * denomValue) * 100) / 100;
    }
  }

  return suggestion;
};

interface CashCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointmentId: number;
  totalAmount: number;
  patientName: string;
  registerDenominations?: DenominationMap | null;
}

interface FormState {
  isProcessing: boolean;
  showReceivedDenoms: boolean;
  showChangeDenoms: boolean;
  receivedDenoms: DenominationMap;
  changeDenoms: DenominationMap;
}

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: any }
  | { type: "RESET" };

const initialState: FormState = {
  isProcessing: false,
  showReceivedDenoms: true,
  showChangeDenoms: false,
  receivedDenoms: {},
  changeDenoms: {},
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

export const CashCheckoutModal: React.FC<CashCheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  appointmentId,
  totalAmount,
  patientName,
  registerDenominations,
}) => {
  const t = useTranslations("CashRegister.checkout_modal");

  const [state, dispatch] = useReducer(formReducer, initialState);
  const {
    isProcessing,
    showReceivedDenoms,
    showChangeDenoms,
    receivedDenoms,
    changeDenoms,
  } = state;

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "RESET" });
    }
  }, [isOpen]);

  const receivedTotal = useMemo(
    () => denomTotal(receivedDenoms),
    [receivedDenoms]
  );
  const changeTotal = useMemo(() => denomTotal(changeDenoms), [changeDenoms]);

  const correctChange = receivedTotal - totalAmount;
  const isValid = receivedTotal >= totalAmount;

  const availableDenoms = useMemo(() => {
    const available: DenominationMap = {};
    DENOMINATIONS.forEach((d) => {
      available[d] =
        (registerDenominations?.[d] || 0) + (receivedDenoms[d] || 0);
    });
    return available;
  }, [registerDenominations, receivedDenoms]);

  useEffect(() => {
    if (isValid && correctChange > 0) {
      const suggested = suggestChange(correctChange, availableDenoms);
      dispatch({ type: "SET_FIELD", field: "changeDenoms", value: suggested });
      dispatch({ type: "SET_FIELD", field: "showChangeDenoms", value: true });
    } else {
      dispatch({ type: "SET_FIELD", field: "changeDenoms", value: {} });
    }
  }, [receivedTotal, totalAmount, isValid, correctChange, availableDenoms]);

  const updateReceivedDenom = (denom: string, count: number) => {
    dispatch({
      type: "SET_FIELD",
      field: "receivedDenoms",
      value: { ...receivedDenoms, [denom]: Math.max(0, count) },
    });
  };

  const updateChangeDenom = (denom: string, count: number) => {
    const maxAvailable = availableDenoms[denom] || 0;
    const newCount = Math.min(Math.max(0, count), maxAvailable);
    dispatch({
      type: "SET_FIELD",
      field: "changeDenoms",
      value: { ...changeDenoms, [denom]: newCount },
    });
  };

  const handleCheckout = async () => {
    if (!isValid) return;

    if (correctChange > 0 && Math.abs(changeTotal - correctChange) > 0.01) {
      toast.error(
        t("toast_mismatch_error", {
          changeTotal: changeTotal.toFixed(2),
          correctChange: correctChange.toFixed(2),
        })
      );
      return;
    }

    dispatch({ type: "SET_FIELD", field: "isProcessing", value: true });
    try {
      await paymentService.processCashCheckout({
        appointmentId,
        totalAmount,
        amountReceived: receivedTotal,
        description: `Cobro en efectivo: ${patientName}`,
        receivedDenominations: cleanDenoms(receivedDenoms),
        changeDenominations: cleanDenoms(changeDenoms),
      });
      toast.success(t("toast_success"));
      onSuccess();
    } catch (error) {
      console.error("Error procesando cobro:", error);
      toast.error(t("toast_error"));
    } finally {
      dispatch({ type: "SET_FIELD", field: "isProcessing", value: false });
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
          className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-3xl shadow-2xl"
        >
          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-[#0a0a0a]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex justify-center items-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-xs">
                <Banknote className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {t("terminal_title")}
                </p>
                <h3 className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-white leading-tight">
                  {t("modal_title")}
                </h3>
                <p className="text-xs font-medium text-gray-500 truncate">
                  {patientName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* ── BODY PRINCIPAL ─────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/40 dark:bg-[#050505]/50">
            {/* Total a cobrar */}
            <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-between p-6 sm:p-8">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500">
                  {t("total_to_pay")}
                </p>
                <p className="text-3xl sm:text-4xl font-bold font-mono text-gray-900 dark:text-white tracking-tight">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-xs">
                <Calculator className="w-6 h-6" strokeWidth={2} />
              </div>
            </div>

            {/* Efectivo Recibido */}
            <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "showReceivedDenoms",
                    value: !showReceivedDenoms,
                  })
                }
                className="w-full flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ArrowDown className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {t("cash_received")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-sm font-bold font-mono",
                      isValid
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-900 dark:text-white"
                    )}
                  >
                    ${receivedTotal.toFixed(2)}
                  </span>
                  {showReceivedDenoms ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" strokeWidth={2} />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" strokeWidth={2} />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {showReceivedDenoms && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-b border-gray-100 dark:border-gray-800 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-6 sm:p-8 bg-gray-50/50 dark:bg-[#050505]">
                      {DENOMINATIONS.map((denom) => (
                        <div
                          key={`recv-${denom}`}
                          className="border border-gray-100 dark:border-gray-800 p-3.5 rounded-2xl flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] shadow-xs space-y-1"
                        >
                          <span className="text-xs font-bold font-mono text-gray-900 dark:text-white">
                            {denomLabel(denom)}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={receivedDenoms[denom] || ""}
                            onChange={(e) =>
                              updateReceivedDenom(
                                denom,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white text-xs font-bold font-mono text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cambio a Entregar */}
            {isValid && correctChange > 0 && (
              <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "showChangeDenoms",
                      value: !showChangeDenoms,
                    })
                  }
                  className="w-full flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      <ArrowUp className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {t("change_to_give")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
                      ${correctChange.toFixed(2)}
                    </span>
                    {showChangeDenoms ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" strokeWidth={2} />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" strokeWidth={2} />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {showChangeDenoms && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b border-gray-100 dark:border-gray-800 overflow-hidden"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-6 sm:p-8 bg-amber-50/30 dark:bg-amber-950/10">
                        {DENOMINATIONS.filter((d) => parseFloat(d) >= 1).map(
                          (denom) => {
                            const available = availableDenoms[denom] || 0;
                            const used = changeDenoms[denom] || 0;
                            if (available <= 0 && used <= 0) return null;
                            return (
                              <div
                                key={`change-${denom}`}
                                className="border border-amber-200/60 dark:border-amber-900/30 p-3.5 rounded-2xl flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] shadow-xs space-y-1"
                              >
                                <span className="text-xs font-bold font-mono text-gray-900 dark:text-white">
                                  {denomLabel(denom)}
                                </span>
                                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                  {t("disp_count", { count: available })}
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  max={available}
                                  value={used || ""}
                                  onChange={(e) =>
                                    updateChangeDenom(
                                      denom,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="w-full h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white text-xs font-bold font-mono text-center focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-gray-400"
                                  placeholder="0"
                                />
                              </div>
                            );
                          }
                        )}
                      </div>

                      {Math.abs(changeTotal - correctChange) > 0.01 && (
                        <div className="p-4 bg-red-50/80 dark:bg-red-950/20 text-center border-t border-red-100 dark:border-red-900/30">
                          <p className="text-xs font-bold text-red-600 dark:text-red-400">
                            {t("warning_mismatch", {
                              sum: changeTotal.toFixed(2),
                              correct: correctChange.toFixed(2),
                            })}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Resumen Final */}
            <div className="p-6 sm:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                  <span>{t("received_summary")}</span>
                  <span className="font-bold font-mono text-gray-900 dark:text-white">
                    ${receivedTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                  <span>{t("charge_summary")}</span>
                  <span className="font-bold font-mono text-gray-900 dark:text-white">
                    -${totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="h-px w-full bg-gray-100 dark:bg-gray-800" />
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("remanent_summary")}
                  </span>
                  <span
                    className={cn(
                      "font-bold font-mono text-2xl tracking-tight",
                      isValid
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-300 dark:text-gray-700"
                    )}
                  >
                    ${isValid ? correctChange.toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── FOOTER ─────────────────────────────────────────────────── */}
          <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0 bg-white dark:bg-[#0a0a0a]">
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
              onClick={handleCheckout}
              disabled={
                !isValid ||
                isProcessing ||
                (correctChange > 0 &&
                  Math.abs(changeTotal - correctChange) > 0.01)
              }
              className="w-full sm:w-auto h-11 px-7 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 border-0 shadow-sm cursor-pointer"
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
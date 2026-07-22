"use client";
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-event-handler */

import React, { useState, useMemo, useEffect } from "react";
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
const denomLabel = (d: string) => (parseFloat(d) >= 20 ? `$${d}` : `$${d}`);
const denomTotal = (denoms: DenominationMap): number =>
  Object.entries(denoms).reduce(
    (acc, [d, count]) => acc + parseFloat(d) * (count || 0),
    0,
  );
const cleanDenoms = (denoms: DenominationMap): DenominationMap | undefined => {
  const clean = Object.fromEntries(
    Object.entries(denoms).filter(([, v]) => v > 0),
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

export const ManualExpenseModal = ({
  isOpen,
  onClose,
  onSuccess,
  currentDenominations,
  maxExpectedBalance,
}: ManualExpenseModalProps) => {
  const [
    {
      isProcessing,
      description,
      totalAmountStr,
      showDenominations,
      expenseDenoms,
    },
    dispatch,
  ] = React.useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case "SET_ISPROCESSING":
          return {
            ...state,
            isProcessing:
              typeof action.payload === "function"
                ? action.payload(state.isProcessing)
                : action.payload,
          };
        case "SET_DESCRIPTION":
          return {
            ...state,
            description:
              typeof action.payload === "function"
                ? action.payload(state.description)
                : action.payload,
          };
        case "SET_TOTALAMOUNTSTR":
          return {
            ...state,
            totalAmountStr:
              typeof action.payload === "function"
                ? action.payload(state.totalAmountStr)
                : action.payload,
          };
        case "SET_SHOWDENOMINATIONS":
          return {
            ...state,
            showDenominations:
              typeof action.payload === "function"
                ? action.payload(state.showDenominations)
                : action.payload,
          };
        case "SET_EXPENSEDENOMS":
          return {
            ...state,
            expenseDenoms:
              typeof action.payload === "function"
                ? action.payload(state.expenseDenoms)
                : action.payload,
          };
        default:
          return state;
      }
    },
    {
      isProcessing: false,
      description: "",
      totalAmountStr: "",
      showDenominations: false,
      expenseDenoms: {},
    },
  );

  const setIsProcessing = (val: any) =>
    dispatch({ type: "SET_ISPROCESSING", payload: val });
  const setDescription = (val: any) =>
    dispatch({ type: "SET_DESCRIPTION", payload: val });
  const setTotalAmountStr = (val: any) =>
    dispatch({ type: "SET_TOTALAMOUNTSTR", payload: val });
  const setShowDenominations = (val: any) =>
    dispatch({ type: "SET_SHOWDENOMINATIONS", payload: val });
  const setExpenseDenoms = (val: any) =>
    dispatch({ type: "SET_EXPENSEDENOMS", payload: val });

  useEffect(() => {
    if (isOpen) {
      setDescription("");
      setTotalAmountStr("");
      setExpenseDenoms({});
      setShowDenominations(false);
    }
  }, [isOpen]);

  const expenseTotal = useMemo(
    () => denomTotal(expenseDenoms),
    [expenseDenoms],
  );
  const hasDenoms = Object.values(expenseDenoms).some((v: any) => v > 0);

  const parsedTotal = hasDenoms
    ? expenseTotal
    : parseFloat(totalAmountStr || "0");
  const isValid = description.trim().length > 0 && parsedTotal > 0;
  const isOverBalance = parsedTotal > maxExpectedBalance;

  const updateExpenseDenom = (denom: string, count: number) => {
    const maxAvailable = currentDenominations?.[denom] || 0;
    setExpenseDenoms((prev: any) => ({
      ...prev,
      [denom]: Math.min(Math.max(0, count), maxAvailable),
    }));
  };

  const handleRegisterExpense = async () => {
    if (!isValid) return;

    setIsProcessing(true);
    try {
      await paymentService.registerManualExpense({
        amount: parsedTotal,
        description: description.trim(),
        expenseDenominations: hasDenoms
          ? cleanDenoms(expenseDenoms)
          : undefined,
      });
      toast.success("GASTO REGISTRADO EXITOSAMENTE.");
      onSuccess();
    } catch (error) {
      console.error("Error procesando gasto:", error);
      toast.error("FALLO AL REGISTRAR EL GASTO EN CAJA.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col rounded-none"
        >
          {/* HEADER ARQUITECTÓNICO */}
          <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-black/20 dark:border-white/20 shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white flex items-center justify-center shrink-0">
                <Banknote className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Operación Contable
                </p>
                <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
                  REGISTRO DE GASTO
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center border border-transparent hover:border-black/20 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
            </button>
          </div>

          {/* BODY (BLUEPRINT GRID) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#050505] flex flex-col">
            <div className="grid grid-cols-1 gap-0">
              {/* Concepto del Gasto */}
              <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">
                    1
                  </span>
                  CONCEPTO DE LA SALIDA *
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="EJ. INSUMOS, PAPELERÍA..."
                  className="w-full h-14 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                />
              </div>

              {/* Monto Total (Si no hay desglose) */}
              {!hasDenoms && (
                <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                    <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">
                      2
                    </span>
                    MONTO TOTAL A RETIRAR *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={totalAmountStr}
                      onChange={(e) => setTotalAmountStr(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-14 pl-9 pr-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-black dark:text-white text-xl font-semibold focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-300 dark:placeholder:text-gray-700"
                    />
                  </div>
                </div>
              )}

              {/* Desglose de Denominaciones */}
              <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
                <button
                  type="button"
                  onClick={() => setShowDenominations(!showDenominations)}
                  className="w-full flex items-center justify-between p-6 md:p-8 border-b border-black/10 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none group"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    DESGLOSAR DENOMINACIONES (OPCIONAL)
                  </span>
                  {showDenominations ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showDenominations && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border-b border-black/10 dark:border-white/10 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 bg-gray-50 dark:bg-[#050505] border-t border-l border-black/10 dark:border-white/10">
                      {DENOMINATIONS.map((denom) => {
                        const available = currentDenominations?.[denom] || 0;
                        if (available <= 0) return null;
                        return (
                          <div
                            key={`exp-${denom}`}
                            className="border-r border-b border-black/10 dark:border-white/10 p-4 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]"
                          >
                            <span className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white mb-1">
                              {denomLabel(denom)}
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                              DISP: {available}
                            </span>
                            <input
                              type="number"
                              min="0"
                              max={available}
                              value={expenseDenoms[denom] || ""}
                              onChange={(e) =>
                                updateExpenseDenom(
                                  denom,
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white text-xs font-semibold text-center focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-300 dark:placeholder:text-gray-700"
                              placeholder="0"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Total Calculado */}
              {hasDenoms && (
                <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                    TOTAL DESGLOSADO
                  </span>
                  <span className="text-3xl font-semibold tracking-tight text-black dark:text-white">
                    ${expenseTotal.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Alerta de Límite Excedido */}
              {isOverBalance && (
                <div className="p-6 md:p-8 flex items-start gap-4 border-b border-black/10 dark:border-white/10 bg-red-50 dark:bg-red-900/10 border-l-4 border-l-red-500 transition-colors">
                  <AlertCircle
                    className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
                    strokeWidth={1.5}
                  />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-red-700 dark:text-red-400 mb-1">
                      FONDO INSUFICIENTE
                    </p>
                    <p className="text-xs font-semibold text-red-800 dark:text-red-300">
                      EL MONTO SUPERA EL BALANCE ACTUAL DEL SISTEMA ($
                      {maxExpectedBalance.toFixed(2)}).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER DE COMANDOS */}
          <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-black/20 dark:border-white/20 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
            <button
              onClick={onClose}
              className="w-full sm:w-auto h-14 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none"
            >
              CANCELAR
            </button>
            <button
              onClick={handleRegisterExpense}
              disabled={!isValid || isProcessing || isOverBalance}
              className="w-full sm:w-auto h-14 px-10 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-0 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-3 disabled:opacity-50 rounded-none"
            >
              {isProcessing ? (
                <>
                  <QhSpinner size="sm" className="text-current" /> PROCESANDO...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />{" "}
                  REGISTRAR GASTO
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useReducer } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  Play,
  Ban,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  CheckCircle2,
  History,
  Banknote,
} from "lucide-react";
import { toast } from "react-toastify";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cashRegisterService } from "@/services/cash-register.service";
import { paymentService } from "@/services/payment.service";
import { DenominationMap } from "@/types/cash-register";
import { CloseRegisterModal } from "@/components/cash-register/CloseRegisterModal";
import { ManualExpenseModal } from "@/components/cash-register/ManualExpenseModal";
import { PosCheckoutModal } from "@/components/pos/PosCheckoutModal";
import { ThermalTicketModal } from "@/components/pos/ThermalTicketModal";
import { PosReceipt } from "@/types/pos";
import { useSessionStore } from "@/stores/SessionStore";
import { useProviderRole } from "@/hooks/useProviderRole";
import { Zap, Printer } from "lucide-react";

interface State {
  register: any;
  report: any;
  isLoading: boolean;
  activeTab: "current" | "history";
  history: any[];
  isHistoryLoading: boolean;
  initialBalance: string;
  isOpening: boolean;
  showBreakdown: boolean;
  breakdown: Record<string, number>;
  isCloseModalOpen: boolean;
  isExpenseModalOpen: boolean;
  isPosModalOpen: boolean;
  isTicketModalOpen: boolean;
  currentReceipt: PosReceipt | null;
}

type Action =
  | { type: "SET_REGISTER"; payload: any }
  | { type: "SET_REPORT"; payload: any }
  | { type: "SET_ISLOADING"; payload: boolean }
  | { type: "SET_ACTIVETAB"; payload: "current" | "history" }
  | { type: "SET_HISTORY"; payload: any[] }
  | { type: "SET_ISHISTORYLOADING"; payload: boolean }
  | { type: "SET_INITIALBALANCE"; payload: string }
  | { type: "SET_ISOPENING"; payload: boolean }
  | { type: "SET_SHOWBREAKDOWN"; payload: boolean }
  | { type: "SET_BREAKDOWN"; payload: Record<string, number> }
  | { type: "SET_ISCLOSEMODALOPEN"; payload: boolean }
  | { type: "SET_ISEXPENSEMODALOPEN"; payload: boolean }
  | { type: "SET_ISPOSMODALOPEN"; payload: boolean }
  | { type: "SET_ISTICKETMODALOPEN"; payload: boolean }
  | { type: "SET_CURRENTRECEIPT"; payload: PosReceipt | null };

const initialState: State = {
  register: null,
  report: null,
  isLoading: true,
  activeTab: "current",
  history: [],
  isHistoryLoading: false,
  initialBalance: "",
  isOpening: false,
  showBreakdown: false,
  breakdown: {
    "1000": 0,
    "500": 0,
    "200": 0,
    "100": 0,
    "50": 0,
    "20": 0,
    "10": 0,
    "5": 0,
    "2": 0,
    "1": 0,
    "0.5": 0,
  },
  isCloseModalOpen: false,
  isExpenseModalOpen: false,
  isPosModalOpen: false,
  isTicketModalOpen: false,
  currentReceipt: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_REGISTER":
      return { ...state, register: action.payload };
    case "SET_REPORT":
      return { ...state, report: action.payload };
    case "SET_ISLOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ACTIVETAB":
      return { ...state, activeTab: action.payload };
    case "SET_HISTORY":
      return { ...state, history: action.payload };
    case "SET_ISHISTORYLOADING":
      return { ...state, isHistoryLoading: action.payload };
    case "SET_INITIALBALANCE":
      return { ...state, initialBalance: action.payload };
    case "SET_ISOPENING":
      return { ...state, isOpening: action.payload };
    case "SET_SHOWBREAKDOWN":
      return { ...state, showBreakdown: action.payload };
    case "SET_BREAKDOWN":
      return { ...state, breakdown: action.payload };
    case "SET_ISCLOSEMODALOPEN":
      return { ...state, isCloseModalOpen: action.payload };
    case "SET_ISEXPENSEMODALOPEN":
      return { ...state, isExpenseModalOpen: action.payload };
    case "SET_ISPOSMODALOPEN":
      return { ...state, isPosModalOpen: action.payload };
    case "SET_ISTICKETMODALOPEN":
      return { ...state, isTicketModalOpen: action.payload };
    case "SET_CURRENTRECEIPT":
      return { ...state, currentReceipt: action.payload };
    default:
      return state;
  }
}

export default function CashRegisterPage() {
  const t = useTranslations("CashRegister");
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isStaff } = useProviderRole();
  const { user, status: doctorStatus } = useSessionStore();

  const {
    register,
    report,
    isLoading,
    activeTab,
    history,
    isHistoryLoading,
    initialBalance,
    isOpening,
    showBreakdown,
    breakdown,
    isCloseModalOpen,
    isExpenseModalOpen,
    isPosModalOpen,
    isTicketModalOpen,
    currentReceipt,
  } = state;

  const setRegister = (val: any) =>
    dispatch({ type: "SET_REGISTER", payload: val });
  const setReport = (val: any) =>
    dispatch({ type: "SET_REPORT", payload: val });
  const setIsLoading = (val: boolean) =>
    dispatch({ type: "SET_ISLOADING", payload: val });
  const setActiveTab = (val: "current" | "history") =>
    dispatch({ type: "SET_ACTIVETAB", payload: val });
  const setHistory = (val: any[]) =>
    dispatch({ type: "SET_HISTORY", payload: val });
  const setIsHistoryLoading = (val: boolean) =>
    dispatch({ type: "SET_ISHISTORYLOADING", payload: val });
  const setInitialBalance = (val: string) =>
    dispatch({ type: "SET_INITIALBALANCE", payload: val });
  const setIsOpening = (val: boolean) =>
    dispatch({ type: "SET_ISOPENING", payload: val });
  const setShowBreakdown = (val: boolean) =>
    dispatch({ type: "SET_SHOWBREAKDOWN", payload: val });
  const setBreakdown = (val: Record<string, number>) =>
    dispatch({ type: "SET_BREAKDOWN", payload: val });
  const setIsCloseModalOpen = (val: boolean) =>
    dispatch({ type: "SET_ISCLOSEMODALOPEN", payload: val });
  const setIsExpenseModalOpen = (val: boolean) =>
    dispatch({ type: "SET_ISEXPENSEMODALOPEN", payload: val });
  const setIsPosModalOpen = (val: boolean) =>
    dispatch({ type: "SET_ISPOSMODALOPEN", payload: val });
  const setIsTicketModalOpen = (val: boolean) =>
    dispatch({ type: "SET_ISTICKETMODALOPEN", payload: val });
  const setCurrentReceipt = (val: PosReceipt | null) =>
    dispatch({ type: "SET_CURRENTRECEIPT", payload: val });

  const updateBreakdown = (denom: string, count: number) => {
    const newBreakdown = { ...breakdown, [denom]: count };
    setBreakdown(newBreakdown);
    const total = Object.entries(newBreakdown).reduce(
      (acc, [d, c]) => acc + parseFloat(d) * c,
      0
    );
    setInitialBalance(total > 0 ? total.toString() : "");
  };

  const fetchHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const res = await paymentService.getCashRegisterHistory(0, 50);
      if (res?.content) {
        setHistory(res.content);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const fetchCurrentRegister = async () => {
    try {
      setIsLoading(true);
      const current = await cashRegisterService.getCurrentRegister();
      setRegister(current);

      if (current) {
        const reportData = await cashRegisterService.getRegisterReport(
          current.id
        );
        setReport(reportData);
      } else {
        setReport(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentRegister();
    fetchHistory();
  }, []);

  const handleOpenRegister = async () => {
    const parsedBalance = parseFloat(initialBalance || "0");
    if (parsedBalance < 0) {
      toast.error(t("closed.toast_negative_balance"));
      return;
    }
    const hasBreakdownValues =
      showBreakdown && Object.values(breakdown).some((v) => v > 0);
    const cleanDenoms: DenominationMap | undefined = hasBreakdownValues
      ? (Object.fromEntries(
          Object.entries(breakdown).filter(([, v]) => v > 0)
        ) as any)
      : undefined;

    try {
      setIsOpening(true);
      await cashRegisterService.openRegister({
        locationId: null,
        initialBalance: parsedBalance,
        initialDenominations: cleanDenoms,
      });
      toast.success(t("closed.toast_open_success"));
      fetchCurrentRegister();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || t("closed.toast_open_error"));
    } finally {
      setIsOpening(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  // ── VISTA 1: CAJA CERRADA ───────────────────────────────────────────
  if (!register) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
        <div className="max-w-3xl mx-auto px-6 py-10 sm:py-12 space-y-8">
          
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden">
            {/* Header Tarjeta */}
            <div className="border-b border-gray-100 dark:border-gray-800 p-6 sm:p-8 flex items-start gap-5 bg-white dark:bg-[#0a0a0a]">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm text-gray-400">
                <Calculator className="w-7 h-7" strokeWidth={2} />
              </div>
              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 text-[10px] font-bold shadow-sm">
                  <span>{t("closed.status_inactive")}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {t("closed.title")}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {t("closed.subtitle")}
                </p>
              </div>
            </div>

            {/* Formulario Apertura */}
            <div className="flex flex-col bg-gray-50/50 dark:bg-[#050505]">
              <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    1
                  </span>
                  <span>{t("closed.step_1")}</span>
                </label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={initialBalance}
                    onChange={(e) => {
                      setInitialBalance(e.target.value);
                      if (showBreakdown) {
                        setBreakdown({
                          "1000": 0,
                          "500": 0,
                          "200": 0,
                          "100": 0,
                          "50": 0,
                          "20": 0,
                          "10": 0,
                          "5": 0,
                          "2": 0,
                          "1": 0,
                          "0.5": 0,
                        });
                      }
                    }}
                    className="w-full h-12 pl-9 pr-4 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400"
                    placeholder={t("closed.placeholder_amount")}
                  />
                </div>
              </div>

              {/* Matriz de Desglose Opcional */}
              <div className="bg-white dark:bg-[#0a0a0a]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-[#111] transition-colors rounded-none h-auto"
                >
                  <span className="text-xs font-bold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    {showBreakdown
                      ? t("closed.hide_breakdown")
                      : t("closed.show_breakdown")}
                  </span>
                </Button>

                <AnimatePresence>
                  {showBreakdown && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50/50 dark:bg-[#050505]"
                    >
                      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">
                          {t("closed.breakdown_help")}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-l border-gray-100 dark:border-gray-800">
                        {[
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
                        ].map((denom) => (
                          <div
                            key={denom}
                            className="border-r border-b border-gray-100 dark:border-gray-800 p-4 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]"
                          >
                            <span className="text-xs font-bold font-mono text-gray-900 dark:text-white mb-2">
                              ${denom}
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={breakdown[denom] || ""}
                              onChange={(e) =>
                                updateBreakdown(
                                  denom,
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white text-xs font-bold font-mono text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400"
                              placeholder="0"
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Botón de Confirmación */}
              <div className="p-6 sm:p-8 bg-white dark:bg-[#0a0a0a]">
                <Button
                  onClick={handleOpenRegister}
                  disabled={isOpening || !initialBalance}
                  className="w-full h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2"
                >
                  {isOpening ? (
                    <>
                      <QhSpinner size="sm" />
                      <span>{t("closed.btn_opening")}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" strokeWidth={2} />
                      <span>{t("closed.btn_open")}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── VISTA 2: CAJA ABIERTA (DASHBOARD TURNO) ─────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* Navegación por pestañas */}
        <div className="flex bg-gray-100/70 dark:bg-gray-800/40 p-1.5 rounded-2xl w-fit shadow-sm">
          <button
            onClick={() => setActiveTab("current")}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === "current"
                ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Calculator className="w-4 h-4" strokeWidth={2} />
            <span>{t("active.tab_current")}</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === "history"
                ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <History className="w-4 h-4" strokeWidth={2} />
            <span>{t("active.tab_history")}</span>
          </button>
        </div>

        {/* ── PESTAÑA: CAJA ACTIVA ─────────────────────────────────────── */}
        {activeTab === "current" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header Turno Activo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Calculator className="w-7 h-7" strokeWidth={2} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {t("active.title")}
                    </h1>
                    <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {t("active.status_open")}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-gray-400">
                    {t("active.opened_at", {
                      date: new Date(register.openedAt).toLocaleString(),
                    })}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
                <Button
                  onClick={() => setIsPosModalOpen(true)}
                  className="flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs h-11 px-5 shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer border-0"
                >
                  <Zap className="w-4 h-4" />
                  <span>Cobro en Caja / POS</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="flex-1 sm:flex-none rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all h-11 px-4 shadow-sm flex items-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4 text-rose-500" strokeWidth={2} />
                  <span>{t("active.btn_expense")}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={fetchCurrentRegister}
                  className="w-11 h-11 p-0 rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-300 shadow-sm flex items-center justify-center"
                >
                  <RefreshCcw className="w-4 h-4" strokeWidth={2} />
                </Button>

                <Button
                  onClick={() => setIsCloseModalOpen(true)}
                  className="flex-1 sm:flex-none rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/40 text-xs font-bold transition-all h-11 px-4 shadow-sm flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" strokeWidth={2} />
                  <span>{t("active.btn_close")}</span>
                </Button>
              </div>
            </div>

            {/* Tarjetas KPIs Soft Health */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Balance Inicial */}
              <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-gray-500 flex items-center justify-center shrink-0">
                    <Calculator className="w-4.5 h-4.5" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("active.kpi_initial")}
                  </span>
                </div>
                <p className="text-2xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
                  ${register.initialBalance.toFixed(2)}
                </p>
              </div>

              {/* Ingresos */}
              <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ArrowDownRight className="w-4.5 h-4.5" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("active.kpi_income")}
                  </span>
                </div>
                <p className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                  +$
                  {report?.transactions
                    ?.filter((tx: any) => tx.transactionType === "INCOME")
                    ?.reduce((acc: number, tx: any) => acc + tx.amount, 0)
                    ?.toFixed(2) || "0.00"}
                </p>
              </div>

              {/* Egresos */}
              <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4.5 h-4.5" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("active.kpi_expense")}
                  </span>
                </div>
                <p className="text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400">
                  -$
                  {report?.transactions
                    ?.filter((tx: any) => tx.transactionType === "EXPENSE")
                    ?.reduce((acc: number, tx: any) => acc + tx.amount, 0)
                    ?.toFixed(2) || "0.00"}
                </p>
              </div>

              {/* Balance Esperado */}
              <div className="bg-emerald-600 dark:bg-emerald-500 text-white rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
                <div className="absolute -top-4 -right-4 p-4 opacity-10">
                  <Banknote className="w-24 h-24 text-white" />
                </div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                    <CheckCircle2 className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                    {t("active.kpi_expected")}
                  </span>
                </div>
                <p className="text-2xl font-bold font-mono tracking-tight text-white relative z-10">
                  $
                  {register.expectedClosingBalance?.toFixed(2) ||
                    register.initialBalance.toFixed(2)}
                </p>
              </div>

            </div>

            {/* Listado Transacciones Turno */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {t("active.ledger_title")}
                </h3>
              </div>

              {report?.transactions && report.transactions.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {report.transactions.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="p-6 hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                              tx.transactionType === "INCOME"
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {tx.transactionType === "INCOME" ? (
                              <ArrowDownRight className="w-5 h-5" strokeWidth={2} />
                            ) : (
                              <ArrowUpRight className="w-5 h-5" strokeWidth={2} />
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                              {tx.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                {tx.referenceType}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400">
                                {new Date(tx.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                hrs
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <p
                            className={cn(
                              "text-sm font-bold font-mono",
                              tx.transactionType === "INCOME"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {tx.transactionType === "INCOME" ? "+" : "-"}$
                            {tx.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Desglose Billetes/Monedas */}
                      {tx.denominations &&
                        Object.keys(tx.denominations).length > 0 && (
                          <div className="mt-3 sm:ml-14 flex flex-wrap gap-1.5">
                            {Object.entries(tx.denominations)
                              .filter(([, count]: [string, any]) => count > 0)
                              .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
                              .map(([denom, count]) => (
                                <span
                                  key={denom}
                                  className={cn(
                                    "text-[10px] font-bold font-mono px-2 py-0.5 rounded-md border",
                                    tx.transactionType === "INCOME"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                                      : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40"
                                  )}
                                >
                                  {String(count)} × ${denom}
                                </span>
                              ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                    <Banknote className="w-7 h-7" strokeWidth={2} />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    {t("active.empty_title")}
                  </h4>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                    {t("active.empty_desc")}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── PESTAÑA: HISTORIAL DE CAJAS ──────────────────────────────── */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {t("history.title")}
                </h3>
                <Button
                  variant="outline"
                  onClick={fetchHistory}
                  className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all h-9 px-3.5 shadow-sm flex items-center gap-2"
                >
                  <RefreshCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>{t("history.btn_refresh")}</span>
                </Button>
              </div>

              {isHistoryLoading ? (
                <div className="p-16 flex flex-col items-center justify-center text-center">
                  <QhSpinner size="lg" />
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
                    {t("history.loading")}
                  </p>
                </div>
              ) : history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {t("history.th_status")}
                        </th>
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {t("history.th_opened")}
                        </th>
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {t("history.th_closed")}
                        </th>
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {t("history.th_initial")}
                        </th>
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {t("history.th_final")}
                        </th>
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">
                          {t("history.th_difference")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                      {history.map((h: any) => (
                        <tr
                          key={h.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            {h.status === "OPEN" ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 px-2.5 py-0.5 text-[10px] font-bold rounded-full inline-flex items-center gap-1.5 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {t("history.status_open")}
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 px-2.5 py-0.5 text-[10px] font-bold rounded-full inline-flex items-center gap-1.5 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                {t("history.status_closed")}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
                            {new Date(h.openedAt).toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
                            {h.closedAt ? (
                              new Date(h.closedAt).toLocaleString()
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-xs font-bold font-mono text-gray-900 dark:text-white">
                            ${h.initialBalance.toFixed(2)}
                          </td>
                          <td className="py-4 px-6 text-xs font-bold font-mono text-gray-900 dark:text-white">
                            ${(h.actualClosingBalance || 0).toFixed(2)}
                          </td>
                          <td className="py-4 px-6 text-right font-mono">
                            {h.balanceDifference !== undefined &&
                            h.balanceDifference !== null ? (
                              <span
                                className={cn(
                                  "text-xs font-bold",
                                  h.balanceDifference > 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : h.balanceDifference < 0
                                    ? "text-rose-600 dark:text-rose-400"
                                    : "text-gray-500"
                                )}
                              >
                                {h.balanceDifference > 0 ? "+" : ""}
                                ${h.balanceDifference.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                    <AlertCircle className="w-7 h-7" strokeWidth={2} />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    {t("history.empty_title")}
                  </h4>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                    {t("history.empty_desc")}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── MODALES OPERATIVOS CAJA ──────────────────────────────────── */}
        <CloseRegisterModal
          isOpen={isCloseModalOpen}
          onClose={() => setIsCloseModalOpen(false)}
          registerId={register.id}
          expectedBalance={
            register.expectedClosingBalance || register.initialBalance
          }
          onSuccess={() => {
            fetchCurrentRegister();
            fetchHistory();
          }}
        />

        <ManualExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          onSuccess={() => {
            setIsExpenseModalOpen(false);
            fetchCurrentRegister();
          }}
          currentDenominations={
            register.currentDenominations || register.initialDenominations
          }
          maxExpectedBalance={
            register.expectedClosingBalance || register.initialBalance
          }
        />

        {/* ── MODAL POS MULTIFORMA (SPLIT PAYMENT) ────────────────────── */}
        <PosCheckoutModal
          isOpen={isPosModalOpen}
          onClose={() => setIsPosModalOpen(false)}
          onSuccess={(receipt) => {
            setCurrentReceipt(receipt);
            setIsTicketModalOpen(true);
            fetchCurrentRegister();
            fetchHistory();
          }}
        />

        {/* ── MODAL TICKET TÉRMICO (80MM / SAT CFDI 4.0) ─────────────── */}
        <ThermalTicketModal
          isOpen={isTicketModalOpen}
          onClose={() => {
            setIsTicketModalOpen(false);
            setCurrentReceipt(null);
          }}
          receipt={currentReceipt}
          doctorProfile={{
            displayName: user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : undefined,
            license: (doctorStatus as any)?.professionalLicense,
            specialty: (doctorStatus as any)?.primarySpecialty,
            address: (doctorStatus as any)?.workAddress,
            logoUrl: user?.profileImageUrl || undefined,
          }}
        />

      </div>
    </div>
  );
}
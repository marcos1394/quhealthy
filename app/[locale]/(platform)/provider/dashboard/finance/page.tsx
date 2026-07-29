"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { AlertCircle, DollarSign, Activity } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { budgetService, BudgetSummaryDTO } from "@/services/budget.service";

export default function FinanceDashboardPage() {
  const t = useTranslations("FinanceDashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<BudgetSummaryDTO | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const budgets = await budgetService.listBudgets();
      const activeBudget =
        (budgets || []).find((b) => b.status === "ACTIVE") || (budgets || [])[0];

      if (activeBudget) {
        const data = await budgetService.getBudgetSummary(activeBudget.id);
        setSummary(data);
      }
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  if (!summary) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center font-sans">
        <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm max-w-md w-full">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-6">
            {t("empty_state.message")}
          </p>
          <Link href="/provider/dashboard/finance/budgets">
            <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold text-xs h-11 px-6 shadow-sm border-0 transition-all">
              {t("empty_state.btn_create_budget")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Cálculos de montos y porcentajes
  const totalProjectedExpense = summary.totalProjectedExpense || 0;
  const totalCommittedExpense = summary.totalCommittedExpense || 0;
  const totalActualExpense = summary.totalActualExpense || 0;

  const committedPercentage =
    totalProjectedExpense > 0
      ? Math.round((totalCommittedExpense / totalProjectedExpense) * 100)
      : 0;

  const actualPercentage =
    summary.expenseConsumptionPercentage ||
    (totalProjectedExpense > 0
      ? Math.round((totalActualExpense / totalProjectedExpense) * 100)
      : 0);

  const availableToCommit =
    totalProjectedExpense - totalCommittedExpense - totalActualExpense;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner de Resumen Activo */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3 shadow-sm inline-flex items-center gap-2 text-xs">
          <span className="font-medium text-gray-500 dark:text-gray-400">
            {t("summary_banner.label")}
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {summary.name}
          </span>
        </div>

        {/* Grid de Métricas Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Tarjeta: Metas de Ingreso */}
          <div className="border border-gray-100 dark:border-gray-800 p-6 sm:p-8 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <DollarSign className="w-6 h-6" strokeWidth={2} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("income_card.title")}
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                  ${(summary.totalActualIncome || 0).toLocaleString()}
                  <span className="text-sm sm:text-lg text-gray-400 font-medium ml-2">
                    / ${(summary.totalProjectedIncome || 0).toLocaleString()}
                  </span>
                </p>

                <div className="w-full bg-gray-100 dark:bg-gray-800/80 h-3 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(
                        summary.incomeCompletionPercentage || 0,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 text-right mt-6">
              {t("income_card.reached", {
                percentage: summary.incomeCompletionPercentage || 0,
              })}
            </p>
          </div>

          {/* Tarjeta: Embudo de Gastos */}
          <div className="border border-gray-100 dark:border-gray-800 p-6 sm:p-8 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm transition-all hover:shadow-md flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40 text-orange-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Activity className="w-6 h-6" strokeWidth={2} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("expense_card.title")}
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold bg-gray-50 dark:bg-[#050505] px-3 py-1.5 rounded-xl text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800 self-start sm:self-auto">
                {t("expense_card.total_label", {
                  total: `$${totalProjectedExpense.toLocaleString()}`,
                })}
              </span>
            </div>

            <div className="space-y-5 flex-1">
              {/* Autorizado */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {t("expense_card.authorized")}
                  </span>
                  <span className="font-mono font-bold text-gray-400">100%</span>
                </div>
                <div className="w-full bg-blue-100 dark:bg-blue-950/40 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-full rounded-full" />
                </div>
              </div>

              {/* Comprometido */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {t("expense_card.committed")}
                  </span>
                  <span className="font-mono font-bold text-amber-600/90 dark:text-amber-400/90">
                    ${totalCommittedExpense.toLocaleString()}{" "}
                    <span className="ml-1 text-[10px]">
                      ({committedPercentage}%)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800/80 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(committedPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Ejecutado */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {t("expense_card.executed")}
                  </span>
                  <span className="font-mono font-bold text-orange-600/90 dark:text-orange-400/90">
                    ${totalActualExpense.toLocaleString()}{" "}
                    <span className="ml-1 text-[10px]">
                      ({actualPercentage}%)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800/80 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(actualPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Disponible */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {t("expense_card.available")}
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ${availableToCommit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Alertas Activas */}
        {summary.alerts && summary.alerts.length > 0 && (
          <div className="border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/10 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <h3 className="text-base font-bold text-rose-700 dark:text-rose-400 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
              <span>{t("alerts.title")}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 bg-white dark:bg-[#0a0a0a] p-5 border border-rose-100 dark:border-rose-900/30 rounded-2xl shadow-sm"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                      alert.type === "DANGER"
                        ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400"
                        : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400"
                    )}
                  >
                    <AlertCircle
                      className={cn(
                        "w-5 h-5",
                        alert.type === "DANGER" && "animate-pulse"
                      )}
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      {alert.category}
                    </p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
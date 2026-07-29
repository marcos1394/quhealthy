"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { Plus, ArrowRight, FileText, Calculator } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { budgetService, BudgetDTO } from "@/services/budget.service";
import { CreateBudgetDrawer } from "./CreateBudgetDrawer";

export default function BudgetsPage() {
  const t = useTranslations("Budgets");
  const router = useRouter();

  const [budgets, setBudgets] = useState<BudgetDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await budgetService.listBudgets();
      setBudgets(data || []);
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

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

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
              <Calculator className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsDrawerOpen(true)}
            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-5 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>{t("btn_new")}</span>
          </Button>
        </div>

        {/* ── GRID TARJETAS DE PRESUPUESTOS ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const statusBadgeConfig = {
              ACTIVE: {
                label: t("status.active"),
                style:
                  "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40",
              },
              SUPERSEDED: {
                label: t("status.superseded"),
                style:
                  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40",
              },
              CLOSED: {
                label: t("status.closed"),
                style:
                  "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40",
              },
              ARCHIVED: {
                label: t("status.archived"),
                style:
                  "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
              },
            };

            const statusInfo =
              statusBadgeConfig[
                budget.status as keyof typeof statusBadgeConfig
              ] || {
                label: t("status.draft"),
                style:
                  "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40",
              };

            return (
              <div
                key={budget.id}
                onClick={() =>
                  router.push(`/provider/dashboard/finance/budgets/${budget.id}`)
                }
                className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:group-hover:bg-emerald-950/30 dark:group-hover:text-emerald-400 transition-colors shadow-sm">
                      <FileText className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <span
                      className={cn(
                        "inline-flex px-2.5 py-0.5 text-[10px] font-bold rounded-full shadow-sm border",
                        statusInfo.style
                      )}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {budget.name}
                    <span className="text-xs font-mono font-medium text-gray-400 ml-2">
                      {t("version", { version: budget.version || 1 })}
                    </span>
                  </h2>

                  <div className="space-y-2 mb-6 pt-2 border-t border-gray-50 dark:border-gray-800/50">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex justify-between">
                      <span>{t("income")}:</span>
                      <span className="font-bold font-mono text-gray-900 dark:text-white">
                        $
                        {(budget.totalProjectedIncome || 0).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex justify-between">
                      <span>{t("expenses")}:</span>
                      <span className="font-bold font-mono text-gray-900 dark:text-white">
                        $
                        {(budget.totalProjectedExpense || 0).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end text-xs font-bold text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mt-4">
                  <span>{t("view_detail")}</span>
                  <ArrowRight
                    className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1"
                    strokeWidth={2}
                  />
                </div>
              </div>
            );
          })}

          {budgets.length === 0 && (
            <div className="col-span-full p-16 text-center border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {t("empty_state")}
              </p>
            </div>
          )}
        </div>

        {/* ── DRAWER CREACIÓN PRESUPUESTO ───────────────────────────────── */}
        <CreateBudgetDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onSuccess={fetchBudgets}
        />

      </div>
    </div>
  );
}
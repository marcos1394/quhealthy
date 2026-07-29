"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Plus, Settings, Building2, CalendarRange } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { accountingService } from "@/services/accounting.service";
import { financeService, BudgetPeriodDTO } from "@/services/finance.service";
import { CostCenterDTO } from "@/types/accounting";
import { CreateFiscalYearDrawer } from "./CreateFiscalYearDrawer";
import { CreateCostCenterDrawer } from "./CreateCostCenterDrawer";

export default function SettingsPage() {
  const t = useTranslations("FinanceSettings");
  const router = useRouter();

  const [budgetPeriods, setBudgetPeriods] = useState<BudgetPeriodDTO[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenterDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para Drawers
  const [isPeriodDrawerOpen, setIsPeriodDrawerOpen] = useState(false);
  const [isCostCenterDrawerOpen, setIsCostCenterDrawerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [periodsRes, costCentersRes] = await Promise.all([
        financeService.listBudgetPeriods(),
        accountingService.listCostCenters(),
      ]);
      setBudgetPeriods(periodsRes || []);
      setCostCenters(costCentersRes || []);
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
              <Settings className="w-7 h-7" strokeWidth={2} />
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

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              className="rounded-xl h-11 px-5 text-xs font-bold border-gray-200 dark:border-gray-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 transition-all shadow-sm flex items-center gap-2"
              onClick={() =>
                router.push("/provider/dashboard/finance/settings/policies")
              }
            >
              <Settings className="w-4 h-4" strokeWidth={2} />
              <span>{t("btn_policies")}</span>
            </Button>
          </div>
        </div>

        {/* ── GRID PRINCIPAL ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Tarjeta: Años Fiscales */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-sm">
                  <CalendarRange className="w-5 h-5" strokeWidth={2} />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  {t("fiscal_years.title")}
                </h2>
              </div>
              <Button
                className="h-10 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-sm transition-all border-0 flex items-center gap-1.5"
                onClick={() => setIsPeriodDrawerOpen(true)}
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>{t("fiscal_years.btn_new")}</span>
              </Button>
            </div>

            <div className="p-6 sm:p-8 space-y-4 flex-1">
              {budgetPeriods.length > 0 ? (
                budgetPeriods.map((period) => (
                  <div
                    key={period.id}
                    className="flex justify-between items-center p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/40 dark:bg-[#050505]/40 hover:bg-gray-50 dark:hover:bg-[#111] transition-all"
                  >
                    <div>
                      <p className="font-bold text-xs text-gray-900 dark:text-white">
                        {t("fiscal_years.fiscal_year_label", {
                          year: period.year,
                        })}
                      </p>
                      <p className="text-[10px] font-mono font-medium text-gray-400 mt-1 uppercase tracking-wider">
                        {t("fiscal_years.date_range", {
                          startDate: period.startDate,
                          endDate: period.endDate,
                        })}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex px-3 py-1 text-[10px] font-bold rounded-full shadow-sm border",
                        period.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                          : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                      )}
                    >
                      {period.status === "ACTIVE"
                        ? t("fiscal_years.status_active")
                        : period.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/30 dark:bg-[#050505]">
                  <p className="text-xs font-bold text-gray-400">
                    {t("fiscal_years.empty_state")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta: Centros de Costo */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Building2 className="w-5 h-5" strokeWidth={2} />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  {t("cost_centers.title")}
                </h2>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-xl text-xs font-bold border-gray-200 dark:border-gray-800 shadow-sm flex-1 sm:flex-none"
                  onClick={() =>
                    router.push(
                      "/provider/dashboard/finance/settings/cost-centers"
                    )
                  }
                >
                  {t("cost_centers.btn_view_tree")}
                </Button>
                <Button
                  className="h-10 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-sm transition-all border-0 flex items-center gap-1.5 flex-1 sm:flex-none justify-center"
                  onClick={() => setIsCostCenterDrawerOpen(true)}
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  <span>{t("cost_centers.btn_new")}</span>
                </Button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4 flex-1">
              {costCenters.length > 0 ? (
                costCenters.map((cc) => (
                  <div
                    key={cc.id}
                    className="flex justify-between items-center p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/40 dark:bg-[#050505]/40 hover:bg-gray-50 dark:hover:bg-[#111] transition-all"
                  >
                    <div>
                      <p className="font-bold text-xs text-gray-900 dark:text-white">
                        {cc.name}
                      </p>
                      <p className="text-[10px] font-mono font-bold text-gray-400 mt-0.5 uppercase">
                        {cc.code}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex px-3 py-1 text-[10px] font-bold rounded-full shadow-sm border",
                        cc.active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40"
                      )}
                    >
                      {cc.active
                        ? t("cost_centers.status_active")
                        : t("cost_centers.status_inactive")}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/30 dark:bg-[#050505]">
                  <p className="text-xs font-bold text-gray-400">
                    {t("cost_centers.empty_state")}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── DRAWERS ─────────────────────────────────────────────────── */}
        <CreateFiscalYearDrawer
          open={isPeriodDrawerOpen}
          onOpenChange={setIsPeriodDrawerOpen}
          onSuccess={fetchData}
        />

        <CreateCostCenterDrawer
          open={isCostCenterDrawerOpen}
          onOpenChange={setIsCostCenterDrawerOpen}
          onSuccess={fetchData}
        />

      </div>
    </div>
  );
}
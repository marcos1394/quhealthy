"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { Save, X, FileText } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { budgetService, BudgetRequestDTO } from "@/services/budget.service";
import { financeService, BudgetPeriodDTO } from "@/services/finance.service";
import { accountingService } from "@/services/accounting.service";
import { CostCenterDTO } from "@/types/accounting";

interface CreateBudgetForm {
  name: string;
  periodId: string;
  costCenterId: string;
}

interface CreateBudgetDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateBudgetDrawer({
  open,
  onOpenChange,
  onSuccess,
}: CreateBudgetDrawerProps) {
  const t = useTranslations("CreateBudgetDrawer");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBudgetForm>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [periods, setPeriods] = useState<BudgetPeriodDTO[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenterDTO[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (open) {
      const loadData = async () => {
        setIsLoadingData(true);
        try {
          const [periodsData, costCentersData] = await Promise.all([
            financeService.listBudgetPeriods(),
            accountingService.listCostCenters(),
          ]);
          setPeriods(periodsData || []);
          setCostCenters(costCentersData || []);
        } catch (error) {
          console.error(error);
          toast.error(t("toasts.load_catalogs_error"));
        } finally {
          setIsLoadingData(false);
        }
      };
      loadData();
    } else {
      reset();
    }
  }, [open, reset, t]);

  const onSubmit = async (data: CreateBudgetForm) => {
    setIsSubmitting(true);
    try {
      const payload: BudgetRequestDTO = {
        name: data.name,
        periodId: Number(data.periodId),
        costCenterId: data.costCenterId ? Number(data.costCenterId) : null,
      };

      await budgetService.createBudget(payload);
      toast.success(t("toasts.create_success"));
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || t("toasts.create_error")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border-l border-gray-100 dark:border-gray-800 p-0 overflow-y-auto sm:rounded-l-3xl shadow-2xl flex flex-col h-full font-sans text-gray-900 dark:text-white">
        
        {/* ── HEADER SHEET ────────────────────────────────────────────── */}
        <SheetHeader className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] shrink-0 rounded-tl-3xl text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                <FileText className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <SheetTitle className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                  {t("title")}
                </SheetTitle>
                <SheetDescription className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                  {t("subtitle")}
                </SheetDescription>
              </div>
            </div>
            <SheetClose className="w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X className="w-4 h-4" strokeWidth={2} />
            </SheetClose>
          </div>
        </SheetHeader>

        {/* ── FORMULARIO PRINCIPAL ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
              <QhSpinner size="md" />
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
                {t("loading")}
              </p>
            </div>
          ) : (
            <form
              id="create-budget-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Nombre */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_name")}
                </label>
                <input
                  {...register("name", { required: true })}
                  className="w-full h-11 px-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all"
                  placeholder={t("placeholder_name")}
                />
                {errors.name && (
                  <span className="text-[10px] text-rose-500 font-bold">
                    {t("field_required")}
                  </span>
                )}
              </div>

              {/* Periodo Fiscal */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_period")}
                </label>
                <select
                  {...register("periodId", { required: true })}
                  className="w-full h-11 px-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all"
                >
                  <option value="">{t("placeholder_period")}</option>
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.year} - {p.status}
                    </option>
                  ))}
                </select>
                {errors.periodId && (
                  <span className="text-[10px] text-rose-500 font-bold">
                    {t("field_required")}
                  </span>
                )}
              </div>

              {/* Centro de Costos */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_cost_center")}
                </label>
                <select
                  {...register("costCenterId")}
                  className="w-full h-11 px-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all"
                >
                  <option value="">
                    {t("placeholder_cost_center_general")}
                  </option>
                  {costCenters.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.code} - {cc.name}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          )}
        </div>

        {/* ── FOOTER ACCIONES ─────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] shrink-0 rounded-bl-3xl">
          <button
            type="submit"
            form="create-budget-form"
            disabled={isSubmitting || isLoadingData}
            className="w-full h-11 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-all text-xs font-bold flex items-center justify-center gap-2 border-0 rounded-xl shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <QhSpinner size="sm" />
                <span>{t("btn_submitting")}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_submit")}</span>
              </>
            )}
          </button>
        </div>

      </SheetContent>
    </Sheet>
  );
}
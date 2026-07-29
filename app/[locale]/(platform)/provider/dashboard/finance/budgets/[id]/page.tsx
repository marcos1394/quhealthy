"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { toast } from "react-toastify";
import { ArrowLeft, Save, Plus, Calculator } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { financeService } from "@/services/finance.service";

const INCOME_CATEGORY_KEYS = [
  "CONSULTATIONS",
  "SURGERIES_AND_PROCEDURES",
  "LABORATORY",
  "PHARMACY",
  "HOSPITALIZATION",
  "IMAGING",
  "OTHER_INCOME",
];

const EXPENSE_CATEGORY_KEYS = [
  "PAYROLL_MEDICAL",
  "PAYROLL_ADMIN",
  "MEDICAL_SUPPLIES",
  "PHARMACEUTICALS",
  "EQUIPMENT_MAINTENANCE",
  "RENT",
  "UTILITIES",
  "MARKETING",
  "INSURANCE_AND_MALPRACTICE",
  "TAXES",
  "OTHER_EXPENSE",
];

export default function BudgetBuilderPage() {
  const t = useTranslations("BudgetBuilder");
  const router = useRouter();
  const params = useParams();
  const budgetId = params.id as string;
  const isEditing = budgetId !== "new";

  const {
    data: budget,
    isLoading,
    mutate,
  } = useSWR(isEditing ? ["budget", budgetId] : null, () =>
    financeService.getBudget(budgetId)
  );

  const [localItems, setLocalItems] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (budget && budget.items) {
      setLocalItems(budget.items);
    }
  }, [budget]);

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

  const currentBudget = budget || {
    name: t("title_new"),
    totalProjectedIncome: 0,
    totalProjectedExpense: 0,
    items: [],
  };

  const handleAddItem = (type: "INCOME" | "EXPENSE") => {
    setLocalItems([
      ...localItems,
      {
        id: `new-${Date.now()}`,
        type,
        category: type === "INCOME" ? "CONSULTATIONS" : "OTHER_EXPENSE",
        description: "",
        projectedAmount: 0,
      },
    ]);
  };

  const handleItemChange = (
    id: string | number,
    field: string,
    value: any
  ) => {
    setLocalItems(
      localItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const newItems = localItems.filter(
        (item) => typeof item.id === "string" && item.id.startsWith("new-")
      );

      for (const item of newItems) {
        await financeService.addBudgetLineItem(budgetId, {
          type: item.type,
          category: item.category,
          description: item.description || "N/A",
          projectedAmount: Number(item.projectedAmount),
        });
      }

      if (newItems.length > 0) {
        toast.success(t("toasts.updated_success"));
        mutate();
      } else {
        toast.info(t("toasts.no_new_items"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.save_error"));
    } finally {
      setIsSaving(false);
    }
  };

  const utility =
    (currentBudget.totalProjectedIncome || 0) -
    (currentBudget.totalProjectedExpense || 0);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER CON ACCIONES ───────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-12 h-12 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-sm text-gray-600 dark:text-gray-400 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
                <Calculator className="w-7 h-7" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                  {isEditing ? currentBudget.name : t("title_new")}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("subtitle")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isEditing && (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    `/provider/dashboard/finance/budgets/${budgetId}/calendar`
                  )
                }
                className="rounded-xl h-11 px-5 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all shadow-sm"
              >
                {t("btn_schedule")}
              </Button>
            )}
            <Button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-6 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <QhSpinner size="sm" />
                  <span>{t("btn_saving")}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" strokeWidth={2} />
                  <span>{t("btn_save")}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ── GRID INGRESOS Y GASTOS (2 COLUMNAS) ─────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* COLUMNA INGRESOS */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-6 border-b border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                {t("projected_income")}
              </h2>
              <span className="text-lg font-bold font-mono text-emerald-800 dark:text-emerald-400">
                $
                {currentBudget.totalProjectedIncome?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="p-6 space-y-4 flex-1 bg-gray-50/30 dark:bg-[#050505]/30">
              {localItems
                .filter((i: any) => i.type === "INCOME")
                .map((item: any) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-1/3">
                      <Select
                        value={item.category}
                        onValueChange={(value) =>
                          handleItemChange(item.id, "category", value)
                        }
                      >
                        <SelectTrigger className="w-full bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 h-11 px-3 text-xs font-bold rounded-xl shadow-sm">
                          <SelectValue placeholder={t("placeholder_category")} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg max-h-60 z-50">
                          {INCOME_CATEGORY_KEYS.map((catKey) => (
                            <SelectItem
                              key={catKey}
                              value={catKey}
                              className="text-xs font-bold rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                            >
                              {t(`categories.${catKey}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Input
                      className="flex-1 bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 h-11 px-3 text-xs font-bold rounded-xl shadow-sm"
                      value={item.description || ""}
                      onChange={(e) =>
                        handleItemChange(item.id, "description", e.target.value)
                      }
                      placeholder={t("placeholder_description")}
                    />

                    <div className="relative w-32 shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                        $
                      </span>
                      <Input
                        type="number"
                        className="w-full bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 h-11 pl-7 pr-3 text-xs font-bold text-right font-mono rounded-xl shadow-sm"
                        value={item.projectedAmount || item.amount || ""}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "projectedAmount",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}

              <Button
                onClick={() => handleAddItem("INCOME")}
                variant="outline"
                className="w-full rounded-2xl border-dashed border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-200 h-11 shadow-sm transition-all mt-2 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_add_income")}</span>
              </Button>
            </div>
          </div>

          {/* COLUMNA GASTOS */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-6 border-b border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                {t("projected_expense")}
              </h2>
              <span className="text-lg font-bold font-mono text-amber-800 dark:text-amber-400">
                $
                {currentBudget.totalProjectedExpense?.toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </span>
            </div>

            <div className="p-6 space-y-4 flex-1 bg-gray-50/30 dark:bg-[#050505]/30">
              {localItems
                .filter((i: any) => i.type === "EXPENSE")
                .map((item: any) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-1/3">
                      <Select
                        value={item.category}
                        onValueChange={(value) =>
                          handleItemChange(item.id, "category", value)
                        }
                      >
                        <SelectTrigger className="w-full bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 h-11 px-3 text-xs font-bold rounded-xl shadow-sm">
                          <SelectValue placeholder={t("placeholder_category")} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg max-h-60 z-50">
                          {EXPENSE_CATEGORY_KEYS.map((catKey) => (
                            <SelectItem
                              key={catKey}
                              value={catKey}
                              className="text-xs font-bold rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                            >
                              {t(`categories.${catKey}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Input
                      className="flex-1 bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 h-11 px-3 text-xs font-bold rounded-xl shadow-sm"
                      value={item.description || ""}
                      onChange={(e) =>
                        handleItemChange(item.id, "description", e.target.value)
                      }
                      placeholder={t("placeholder_description")}
                    />

                    <div className="relative w-32 shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                        $
                      </span>
                      <Input
                        type="number"
                        className="w-full bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 h-11 pl-7 pr-3 text-xs font-bold text-right font-mono rounded-xl shadow-sm"
                        value={item.projectedAmount || item.amount || ""}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "projectedAmount",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}

              <Button
                onClick={() => handleAddItem("EXPENSE")}
                variant="outline"
                className="w-full rounded-2xl border-dashed border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-700 dark:hover:text-amber-400 hover:border-amber-200 h-11 shadow-sm transition-all mt-2 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_add_expense")}</span>
              </Button>
            </div>
          </div>

        </div>

        {/* ── UTILIDAD PROYECTADA RESUMEN ──────────────────────────────── */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex justify-end">
          <div className="bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-right inline-block min-w-[280px]">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              {t("projected_utility")}
            </p>
            <p
              className={cn(
                "text-3xl sm:text-4xl font-bold tracking-tight font-mono",
                utility >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              $
              {utility.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
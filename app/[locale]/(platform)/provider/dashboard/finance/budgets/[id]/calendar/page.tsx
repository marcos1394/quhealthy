"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { CalendarDays, Save, ArrowLeft, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  budgetService,
  BudgetLineItemDTO,
  BudgetMonthlyDistributionDTO,
} from "@/services/budget.service";

const MONTH_KEYS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

export default function BudgetCalendarPage() {
  const t = useTranslations("BudgetCalendar");
  const params = useParams();
  const router = useRouter();
  const budgetId = Number(params.id);

  const [lineItems, setLineItems] = useState<BudgetLineItemDTO[]>([]);
  const [distributions, setDistributions] = useState<
    Record<number, BudgetMonthlyDistributionDTO[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!budgetId) return;
    setIsLoading(true);
    try {
      const items = await budgetService.getBudgetLineItems(budgetId);
      setLineItems(items || []);

      const distMap: Record<number, BudgetMonthlyDistributionDTO[]> = {};
      for (const item of items) {
        const dists = await budgetService.getMonthlyDistribution(item.id);
        if (!dists || dists.length === 0) {
          distMap[item.id] = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            projectedAmount: 0,
            actualAmount: 0,
            committedAmount: 0,
          }));
        } else {
          distMap[item.id] = dists;
        }
      }
      setDistributions(distMap);
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [budgetId, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAmountChange = (
    lineItemId: number,
    monthIndex: number,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    setDistributions((prev) => {
      const updatedItemDists = [...(prev[lineItemId] || [])];
      updatedItemDists[monthIndex] = {
        ...updatedItemDists[monthIndex],
        projectedAmount: numValue,
      };
      return { ...prev, [lineItemId]: updatedItemDists };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const item of lineItems) {
        await budgetService.saveMonthlyDistribution(
          item.id,
          distributions[item.id]
        );
      }
      toast.success(t("toasts.save_success"));
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.save_error"));
    } finally {
      setIsSaving(false);
    }
  };

  const autoDistribute = (lineItemId: number, totalAmount: number) => {
    const monthlyAmount = totalAmount / 12;
    setDistributions((prev) => {
      const updated = (prev[lineItemId] || []).map((d) => ({
        ...d,
        projectedAmount: monthlyAmount,
      }));
      return { ...prev, [lineItemId]: updated };
    });
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

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER CON BOTÓN VOLVER ─────────────────────────────────── */}
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
                <CalendarDays className="w-7 h-7" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                  {t("title")}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("subtitle", { id: budgetId })}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-6 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2 shrink-0"
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

        {/* ── TABLA MATRIZ MENSUAL ────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead className="bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-64">
                    {t("th_line_item")}
                  </th>
                  <th className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right w-36">
                    {t("th_annual_total")}
                  </th>
                  {MONTH_KEYS.map((mKey) => (
                    <th
                      key={mKey}
                      className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right w-28"
                    >
                      {t(`months.${mKey}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {lineItems.map((item) => {
                  const itemDists = distributions[item.id] || [];
                  const totalAnual = itemDists.reduce(
                    (sum, d) => sum + (d.projectedAmount || 0),
                    0
                  );
                  const isBalanced =
                    Math.abs(totalAnual - item.projectedAmount) < 0.01;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors group"
                    >
                      <td className="p-4 px-6 align-top">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm border",
                              item.type === "INCOME"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40"
                            )}
                          >
                            {item.type === "INCOME"
                              ? t("type_income")
                              : t("type_expense")}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              autoDistribute(item.id, item.projectedAmount)
                            }
                            className="h-6 px-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 opacity-0 group-hover:opacity-100 transition-all rounded-lg flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" strokeWidth={2} />
                            <span>{t("btn_auto_distribute")}</span>
                          </button>
                        </div>
                      </td>

                      <td className="p-4 px-6 text-right align-top">
                        <p
                          className={cn(
                            "text-xs font-bold font-mono",
                            !isBalanced
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-gray-900 dark:text-white"
                          )}
                        >
                          $
                          {totalAnual.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono mt-1 font-semibold">
                          / ${item.projectedAmount.toLocaleString()}
                        </p>
                      </td>

                      {itemDists.map((d, idx) => (
                        <td key={idx} className="p-3 align-top">
                          <Input
                            type="number"
                            value={d.projectedAmount || ""}
                            onChange={(e) =>
                              handleAmountChange(item.id, idx, e.target.value)
                            }
                            className="h-10 text-xs font-mono font-bold text-right rounded-xl border-gray-200 dark:border-gray-800 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500/20 bg-white dark:bg-[#0a0a0a]"
                            placeholder="0.00"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {lineItems.length === 0 && (
              <div className="p-16 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                {t("empty_state")}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
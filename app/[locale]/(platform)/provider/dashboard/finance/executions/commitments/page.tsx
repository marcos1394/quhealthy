"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { BookmarkCheck, Plus, Link as LinkIcon, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import {
  budgetService,
  BudgetCommitmentDTO,
} from "@/services/budget.service";
import { CreateCommitmentDrawer } from "./CreateCommitmentDrawer";

export default function CommitmentsPage() {
  const t = useTranslations("BudgetCommitments");

  const [commitments, setCommitments] = useState<BudgetCommitmentDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadCommitments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await budgetService.listCommitments();
      setCommitments(data || []);
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadCommitments();
  }, [loadCommitments]);

  const handleCancel = async (id: number) => {
    if (!confirm(t("confirm_cancel"))) return;
    try {
      await budgetService.cancelCommitment(id);
      toast.success(t("toasts.cancel_success"));
      loadCommitments();
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.cancel_error"));
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

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
              <BookmarkCheck className="w-7 h-7" strokeWidth={2} />
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

        {/* ── TABLA DE COMPROMISOS ─────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("th_date")}
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("th_line_item")}
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("th_reason")}
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">
                    {t("th_amount")}
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">
                    {t("th_status")}
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">
                    {t("th_actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {commitments.length > 0 ? (
                  commitments.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors group"
                    >
                      <td className="py-4 px-6 text-xs font-mono font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-6">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {c.lineItem.name}
                        </p>
                        <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                          {c.costCenterId
                            ? t("cost_center", { id: c.costCenterId })
                            : t("no_cost_center")}
                        </p>
                      </td>

                      <td
                        className="py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 max-w-[220px] truncate"
                        title={c.reason}
                      >
                        {c.reason}
                      </td>

                      <td className="py-4 px-6 text-right text-xs font-bold font-mono text-gray-900 dark:text-white whitespace-nowrap">
                        $
                        {c.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span
                          className={cn(
                            "inline-flex px-2.5 py-0.5 text-[10px] font-bold rounded-full shadow-sm border",
                            c.status === "ACTIVE"
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40"
                              : c.status === "EXECUTED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                              : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          )}
                        >
                          {c.status === "ACTIVE"
                            ? t("status.active")
                            : c.status === "EXECUTED"
                            ? t("status.executed")
                            : t("status.cancelled")}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {c.status === "ACTIVE" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                title={t("actions.link_invoice_tooltip")}
                                className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-colors"
                                onClick={() =>
                                  toast.info(t("toasts.link_in_development"))
                                }
                              >
                                <LinkIcon className="w-4 h-4" strokeWidth={2} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title={t("actions.cancel_tooltip")}
                                className="h-8 w-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                                onClick={() => handleCancel(c.id)}
                              >
                                <XCircle className="w-4 h-4" strokeWidth={2} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-16 text-center text-xs font-semibold text-gray-500 dark:text-gray-400"
                    >
                      {t("empty_state")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── DRAWER CREACIÓN COMPROMISO ────────────────────────────────── */}
        <CreateCommitmentDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onSuccess={loadCommitments}
        />

      </div>
    </div>
  );
}
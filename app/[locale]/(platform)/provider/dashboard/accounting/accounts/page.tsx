"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, FileText, Plus, BookOpen } from "lucide-react";
import { toast } from "react-toastify";

import { AccountDTO } from "@/types/accounting";
import { accountingService } from "@/services/accounting.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";

export default function AccountsPage() {
  const t = useTranslations("AccountingAccounts");
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountingService.listAccounts();
        setAccounts(data);
      } catch (error) {
        console.error("Error loading accounts:", error);
        toast.error(t("toast_error"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccounts();
  }, [t]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-10">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-start gap-5">
            <Button
              variant="outline"
              onClick={() => router.push("/provider/dashboard/accounting")}
              className="w-12 h-12 p-0 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-300 shadow-sm shrink-0 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </Button>

            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-bold shadow-sm">
                <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{t("erp_tag")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t("title")}
              </h1>
            </div>
          </div>

          <Button
            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-6 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>{t("btn_new_account")}</span>
          </Button>
        </div>

        {/* ── TABLA DE PLAN DE CUENTAS ──────────────────────────────────── */}
        <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]">
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("th_code")}
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("th_name")}
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("th_type")}
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("th_nature")}
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">
                    {t("th_actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {accounts.length > 0 ? (
                  accounts.map((acc) => (
                    <tr
                      key={acc.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors"
                    >
                      <td className="py-4 px-6 text-xs font-mono font-bold text-gray-900 dark:text-white">
                        {acc.code}
                      </td>
                      <td className="py-4 px-6 text-xs font-medium text-gray-800 dark:text-gray-200">
                        <span
                          style={{
                            paddingLeft: `${(acc.level - 1) * 1.5}rem`,
                          }}
                          className="inline-flex items-center"
                        >
                          {acc.level > 1 && (
                            <span className="text-emerald-500 font-bold mr-2">
                              └─
                            </span>
                          )}
                          {acc.name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800/80 text-[10px] font-bold uppercase tracking-wider">
                          {acc.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800/80 text-[10px] font-bold uppercase tracking-wider">
                          {acc.nature}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="ghost"
                          className="h-8 px-3 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        >
                          {t("btn_edit")}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 px-6 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <FileText className="w-6 h-6" strokeWidth={2} />
                      </div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {t("empty_title")}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  FileDown,
  FileText,
  Filter,
  Calendar as CalendarIcon,
  DownloadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function FinanceReportsPage() {
  const t = useTranslations("FinanceReports");
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (reportKey: string, reportTitle: string) => {
    setIsExporting(reportKey);
    try {
      // Simulación de endpoint de descarga de reportes
      await new Promise((r) => setTimeout(r, 1500));
      toast.success(t("toasts.export_success", { type: reportTitle }));
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.export_error"));
    } finally {
      setIsExporting(null);
    }
  };

  const reports = [
    {
      key: "income_statement",
      icon: <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />,
      iconBg: "bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40",
      tagColor: "text-blue-600 dark:text-blue-400",
      titleKey: "income_statement.title",
      tagKey: "income_statement.tag",
      descKey: "income_statement.description",
    },
    {
      key: "budget_variance",
      icon: <Filter className="w-6 h-6 text-purple-600 dark:text-purple-400" strokeWidth={2} />,
      iconBg: "bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40",
      tagColor: "text-purple-600 dark:text-purple-400",
      titleKey: "budget_variance.title",
      tagKey: "budget_variance.tag",
      descKey: "budget_variance.description",
    },
    {
      key: "cash_flow",
      icon: <CalendarIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40",
      tagColor: "text-emerald-600 dark:text-emerald-400",
      titleKey: "cash_flow.title",
      tagKey: "cash_flow.tag",
      descKey: "cash_flow.description",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
              <DownloadCloud className="w-7 h-7" strokeWidth={2} />
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
        </div>

        {/* ── TARJETAS DE REPORTES ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const isThisExporting = isExporting === report.key;
            const reportTitle = t(report.titleKey as any);

            return (
              <div
                key={report.key}
                className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all duration-300 group flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-start gap-4 mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105 ${report.iconBg}`}
                    >
                      {report.icon}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 dark:text-white">
                        {reportTitle}
                      </h2>
                      <p
                        className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${report.tagColor}`}
                      >
                        {t(report.tagKey as any)}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                    {t(report.descKey as any)}
                  </p>
                </div>

                <Button
                  variant="outline"
                  disabled={isExporting !== null}
                  onClick={() => handleExport(report.key, reportTitle)}
                  className="w-full rounded-xl h-11 text-xs font-bold border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isThisExporting ? (
                    <>
                      <QhSpinner size="sm" />
                      <span>{t("btn_exporting")}</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" strokeWidth={2} />
                      <span>{t("btn_download")}</span>
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
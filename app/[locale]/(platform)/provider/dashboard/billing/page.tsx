"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */

import React, { Suspense, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Building2,
  ReceiptText,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  CalendarDays,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  FileText as FileTextIcon,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { toast } from "react-toastify";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useBillingHistory } from "@/hooks/useBillingHistory";
import StripeConnectCard from "@/components/dashboard/billing/StripeConnectCard";
import { cn } from "@/lib/utils";

function StripeConnectCardSkeleton() {
  return (
    <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 rounded-3xl shadow-sm transition-colors">
      <div className="flex items-start gap-5 animate-pulse">
        <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 shrink-0" />
        <div className="space-y-4 flex-1 mt-2">
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="h-2 w-full max-w-md bg-gray-100 dark:bg-gray-800/60 rounded-lg" />
          <div className="h-2 w-3/4 max-w-sm bg-gray-100 dark:bg-gray-800/60 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function BillingSettingsPage() {
  const t = useTranslations("DashboardBilling");
  const locale = useLocale();
  const { transactions, isLoading, page, totalPages, fetchPage } =
    useBillingHistory();
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const dateLocale = locale === "en" ? enUS : es;

  const exportToCSV = () => {
    toast.success("Extracción CSV en curso...");
  };
  const exportToPDF = () => {
    toast.success("Extracción PDF en curso...");
  };

  const getStatusBadge = (status: string) => {
    const baseClass =
      "px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap inline-flex items-center gap-1 rounded-full border shadow-sm";

    switch (status) {
      case "SUCCEEDED":
        return (
          <span
            className={cn(
              baseClass,
              "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            {t("table.settled")}
          </span>
        );
      case "FAILED":
        return (
          <span
            className={cn(
              baseClass,
              "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40"
            )}
          >
            <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
            {t("table.failed")}
          </span>
        );
      case "REFUNDED":
        return (
          <span
            className={cn(
              baseClass,
              "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
            )}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" strokeWidth={2} />
            {t("table.refunded")}
          </span>
        );
      default:
        return (
          <span
            className={cn(
              baseClass,
              "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
            )}
          >
            {status}
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === "APPOINTMENT_PAYMENT") return t("types.appointment_payment");
    if (type === "SUBSCRIPTION_CHARGE") return t("types.subscription_charge");
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-12 space-y-12">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-bold shadow-sm">
                <span>Auditoría Contable</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-3.5 py-1.5 text-xs font-bold rounded-full flex items-center gap-2 shadow-sm">
              <Sparkles className="w-4 h-4" strokeWidth={2} />
              <span>Operativa Financiera</span>
            </span>
          </div>
        </div>

        <div className="space-y-12">
          
          {/* ── SECCIÓN 1: STRIPE CONNECT ──────────────────────────────── */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                <Building2 className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("stripe_section")}
                </h2>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("stripe_subtitle")}
                </p>
              </div>
            </div>

            <Suspense fallback={<StripeConnectCardSkeleton />}>
              <StripeConnectCard />
            </Suspense>
          </section>

          {/* ── SECCIÓN 2: HISTORIAL TRANSACCIONAL ─────────────────────── */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <ReceiptText className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("transactions_title")}
                  </h2>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("transactions_subtitle")}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  className="flex-1 sm:flex-none rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-300 text-xs font-bold transition-all h-10 px-4 shadow-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" strokeWidth={2} />
                  <span>{t("export_csv")}</span>
                </Button>

                <Button
                  onClick={exportToPDF}
                  className="flex-1 sm:flex-none rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-xs font-bold transition-all h-10 px-4 border-0 shadow-sm flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" strokeWidth={2} />
                  <span>{t("export_pdf")}</span>
                </Button>
              </div>
            </div>

            {/* TABLA TRANSACCIONAL */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden transition-all">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-[#050505]">
                  <QhSpinner size="lg" />
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
                    {t("loading")}
                  </p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-16 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                    <ReceiptText className="w-7 h-7" strokeWidth={2} />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    {t("empty.title")}
                  </h4>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                    {t("empty.description")}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]">
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {t("table.date")}
                        </th>
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {t("table.service")}
                        </th>
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {t("table.status")}
                        </th>
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">
                          {t("table.amount")}
                        </th>
                        <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">
                          {t("table.receipt")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                      {transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors group cursor-pointer"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0">
                                <CalendarDays className="w-4 h-4 text-gray-400" strokeWidth={2} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                  {format(new Date(tx.date), "dd MMM yyyy", { locale: dateLocale })}
                                </span>
                                <span className="text-[10px] font-medium text-gray-400 font-mono">
                                  {format(new Date(tx.date), "HH:mm")} hrs
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2.5">
                              <CreditCard className="w-4 h-4 text-gray-400" strokeWidth={2} />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                  {getTypeLabel(tx.type)}
                                </span>
                                {tx.appointmentId && (
                                  <span className="text-[10px] font-mono text-gray-400">
                                    Ref: #{tx.appointmentId}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            {getStatusBadge(tx.status)}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                                {tx.amount.toLocaleString(locale === "en" ? "en-US" : "es-MX", {
                                  style: "currency",
                                  currency: tx.currency,
                                })}
                              </span>
                              <span className="text-[9px] font-bold text-gray-400 uppercase">
                                {tx.currency}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setSelectedTx(tx)}
                                className="w-8 h-8 p-0 rounded-xl border-gray-200 dark:border-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                              >
                                <FileTextIcon className="w-4 h-4" strokeWidth={2} />
                              </Button>

                              {tx.receiptUrl && (
                                <a
                                  href={tx.receiptUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-8 h-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" strokeWidth={2} />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PAGINACIÓN */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 gap-4">
                  <span className="text-xs font-medium text-gray-500">
                    {t("pagination.page_of", {
                      page: page + 1,
                      totalPages,
                    })}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fetchPage(page - 1)}
                      disabled={page === 0}
                      className="rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold h-9 px-3.5 shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" strokeWidth={2} />
                      <span>{t("pagination.previous")}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fetchPage(page + 1)}
                      disabled={page >= totalPages - 1}
                      className="rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold h-9 px-3.5 shadow-sm"
                    >
                      <span>{t("pagination.next")}</span>
                      <ChevronRight className="w-4 h-4 ml-1" strokeWidth={2} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

      </div>

      {/* ── MODAL COMPROBANTE TÉCNICO ─────────────────────────────────── */}
      <Dialog open={!!selectedTx} onOpenChange={(o) => !o && setSelectedTx(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl">
          <div className="bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 p-6 sm:p-8 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                <ReceiptText className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                  {t("modal.internal_receipt")}
                </p>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  DOC-{selectedTx?.id?.substring(0, 8).toUpperCase() || "0001"}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarDays className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                  <p className="text-xs font-medium text-gray-500">
                    {selectedTx &&
                      format(new Date(selectedTx.date), "dd MMM yyyy", {
                        locale: dateLocale,
                      })}
                  </p>
                </div>
              </div>
            </div>
            {selectedTx && getStatusBadge(selectedTx.status)}
          </div>

          {selectedTx && (
            <div className="bg-white dark:bg-[#0a0a0a]">
              <div className="grid grid-cols-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]">
                <div className="border-r border-gray-100 dark:border-gray-800 p-6 sm:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    {t("modal.sender")}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("modal.patient")}
                  </p>
                  <p className="text-xs font-mono text-gray-500 mt-1">
                    Ref: #{selectedTx.appointmentId || "N/A"}
                  </p>
                </div>
                <div className="p-6 sm:p-8 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    {t("modal.receiver")}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Quhealthy Services
                  </p>
                  <p className="text-xs font-mono text-gray-500 mt-1">
                    Divisa: {selectedTx.currency}
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("modal.description")}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("modal.amount")}
                  </p>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800/50">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {getTypeLabel(selectedTx.type)}
                  </p>
                  <p className="text-base font-bold font-mono text-gray-900 dark:text-white">
                    {selectedTx.amount.toLocaleString(locale === "en" ? "en-US" : "es-MX", {
                      style: "currency",
                      currency: selectedTx.currency,
                    })}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {t("modal.total_settled")}
                  </p>
                  <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {selectedTx.amount.toLocaleString(locale === "en" ? "en-US" : "es-MX", {
                      style: "currency",
                      currency: selectedTx.currency,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50/50 dark:bg-[#050505] p-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => toast.success("Ejecutando protocolo de impresión...")}
              className="rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold h-11 px-5 shadow-sm flex items-center gap-2"
            >
              <Printer className="w-4 h-4" strokeWidth={2} />
              <span>{t("modal.print")}</span>
            </Button>
            <Button
              onClick={() => toast.success("Extrayendo documento PDF...")}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-xs font-bold h-11 px-5 border-0 shadow-sm flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" strokeWidth={2} />
              <span>{t("modal.download_pdf")}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
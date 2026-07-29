"use client";

/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import {
  ReceiptText,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  CalendarDays,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  ExternalLink,
  FileText as FileTextIcon,
  Printer,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { es } from "date-fns/locale";
import { useTranslations } from "next-intl";

import { useBillingHistory } from "@/hooks/useBillingHistory";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function BillingTransactions() {
  const { transactions, isLoading, page, totalPages, fetchPage } =
    useBillingHistory();
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const t = useTranslations("DashboardBilling");

  const exportToCSV = () => {
    toast.info(t("csv_exporting"));
  };

  const exportToPDF = () => {
    toast.info(t("pdf_exporting"));
  };

  const getStatusBadge = (status: string) => {
    const baseClass =
      "px-3 py-1 text-xs font-bold rounded-full inline-flex items-center gap-1.5 shadow-2xs";

    switch (status) {
      case "SUCCEEDED":
        return (
          <span
            className={cn(
              baseClass,
              "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("status_settled")}</span>
          </span>
        );
      case "FAILED":
        return (
          <span
            className={cn(
              baseClass,
              "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/40"
            )}
          >
            <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("status_failed")}</span>
          </span>
        );
      case "REFUNDED":
        return (
          <span
            className={cn(
              baseClass,
              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            )}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("status_refunded")}</span>
          </span>
        );
      default:
        return (
          <span
            className={cn(
              baseClass,
              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            )}
          >
            {status}
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === "APPOINTMENT_PAYMENT") return t("type_appointment");
    if (type === "SUBSCRIPTION_CHARGE") return t("type_subscription");
    return type.replace(/_/g, " ");
  };

  return (
    <>
      {/* ── SECCIÓN 2: HISTORIAL TRANSACCIONAL ───────────────────────────── */}
      <section className="font-sans transition-colors space-y-6">
        {/* Cabecera y Acciones de Exportación */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <ReceiptText className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("transactions_title")}
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {t("transactions_subtitle")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={exportToCSV}
              className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>{t("btn_export_csv")}</span>
            </button>

            <button
              type="button"
              onClick={exportToPDF}
              className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer border-0"
            >
              <FileDown className="w-4 h-4" strokeWidth={2} />
              <span>{t("btn_export_pdf")}</span>
            </button>
          </div>
        </div>

        {/* ── TABLA DE DATOS ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col transition-colors">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-3">
              <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-semibold text-gray-400">{t("loading")}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 sm:p-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                <ReceiptText className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("empty_title")}
                </h4>
                <p className="text-xs font-medium text-gray-500 max-w-sm leading-relaxed">
                  {t("empty_desc")}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[750px] border-collapse">
                <thead className="bg-gray-50/60 dark:bg-[#050505] text-xs font-bold text-gray-500 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4">{t("table_date")}</th>
                    <th className="px-6 py-4">{t("table_concept")}</th>
                    <th className="px-6 py-4">{t("table_status")}</th>
                    <th className="px-6 py-4 text-right">{t("table_amount")}</th>
                    <th className="px-6 py-4 text-center">{t("table_receipt")}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 bg-white dark:bg-[#0a0a0a]">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition-colors cursor-pointer group"
                    >
                      {/* Fecha */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5 text-xs font-bold text-gray-900 dark:text-white">
                          <CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                          <span>
                            {format(new Date(tx.date), "dd MMM yyyy", {
                              locale: es,
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-gray-400 font-mono pl-6 mt-0.5">
                          {format(new Date(tx.date), "HH:mm")} hrs
                        </p>
                      </td>

                      {/* Concepto */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={2} />
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {getTypeLabel(tx.type)}
                          </span>
                        </div>
                        {tx.appointmentId && (
                          <p className="text-[11px] font-medium font-mono text-gray-400 pl-6 mt-0.5">
                            {t("ref_id", { id: tx.appointmentId })}
                          </p>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4">{getStatusBadge(tx.status)}</td>

                      {/* Importe */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-baseline gap-1">
                          <span className="text-sm font-bold font-mono text-gray-900 dark:text-white">
                            {tx.amount.toLocaleString("es-MX", {
                              style: "currency",
                              currency: tx.currency,
                            })}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            {tx.currency}
                          </span>
                        </div>
                      </td>

                      {/* Comprobantes */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedTx(tx)}
                            title={t("modal_receipt_title")}
                            className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-[#111] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 border border-gray-100 dark:border-gray-800 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <FileTextIcon className="w-4 h-4" strokeWidth={2} />
                          </button>

                          {tx.receiptUrl && (
                            <a
                              href={tx.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Stripe Receipt"
                              className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-[#111] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 border border-gray-100 dark:border-gray-800 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
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

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 gap-3">
                  <div className="text-xs font-semibold text-gray-500">
                    {t("pagination_page", {
                      page: page + 1,
                      total: totalPages,
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fetchPage(page - 1)}
                      disabled={page === 0}
                      className="h-9 px-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-40 text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                      <span>{t("pagination_prev")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fetchPage(page + 1)}
                      disabled={page >= totalPages - 1}
                      className="h-9 px-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-40 text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t("pagination_next")}</span>
                      <ChevronRight className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── MODAL COMPROBANTE DE PAGO ─────────────────────────────────── */}
      <Dialog
        open={!!selectedTx}
        onOpenChange={(open) => !open && setSelectedTx(null)}
      >
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl font-sans transition-colors">
          {/* Header Modal */}
          <div className="p-6 sm:p-8 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
                <ReceiptText className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {t("modal_receipt_subtitle")}
                </p>
                <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  DOC-
                  {selectedTx?.id?.substring(0, 8).toUpperCase() || "0001"}
                </DialogTitle>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 font-mono">
                  <CalendarDays className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>
                    {selectedTx &&
                      format(new Date(selectedTx.date), "dd MMM yyyy", {
                        locale: es,
                      })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedTx && getStatusBadge(selectedTx.status)}
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Body Modal */}
          {selectedTx && (
            <div className="p-6 sm:p-8 space-y-6 bg-white dark:bg-[#0a0a0a]">
              <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 shadow-xs">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-gray-400">
                    {t("modal_sender")}
                  </p>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("modal_patient")}
                  </p>
                  <p className="text-[11px] font-semibold text-gray-400 font-mono">
                    Ref: #{selectedTx.appointmentId || "N/A"}
                  </p>
                </div>

                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold uppercase text-gray-400">
                    {t("modal_receiver")}
                  </p>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    QuHealthy Services
                  </p>
                  <p className="text-[11px] font-semibold text-gray-400 font-mono">
                    {t("modal_currency")}: {selectedTx.currency}
                  </p>
                </div>
              </div>

              {/* Detalle de Cobro */}
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xs">
                <div className="p-4 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs font-bold text-gray-500">
                  <span>{t("modal_description")}</span>
                  <span>{t("table_amount")}</span>
                </div>

                <div className="p-4 flex justify-between items-center bg-white dark:bg-[#0a0a0a]">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {getTypeLabel(selectedTx.type)}
                  </span>
                  <span className="text-base font-bold font-mono text-gray-900 dark:text-white">
                    {selectedTx.amount.toLocaleString("es-MX", {
                      style: "currency",
                      currency: selectedTx.currency,
                    })}
                  </span>
                </div>

                <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("modal_total_paid")}
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {selectedTx.amount.toLocaleString("es-MX", {
                      style: "currency",
                      currency: selectedTx.currency,
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Modal */}
          <div className="p-5 sm:p-6 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
            <button
              type="button"
              className="h-11 px-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => toast.info(t("print_notice"))}
            >
              <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>{t("btn_print")}</span>
            </button>

            <button
              type="button"
              className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border-0"
              onClick={() => toast.info(t("pdf_download_notice"))}
            >
              <FileDown className="w-4 h-4" strokeWidth={2} />
              <span>{t("btn_download_pdf")}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
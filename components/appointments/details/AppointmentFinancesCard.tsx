"use client";

/* eslint-disable react-doctor/prefer-explicit-variants */
/* eslint-disable react-doctor/js-hoist-intl */
import React from "react";
import { Receipt, FileText, CreditCard, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";

export function AppointmentFinancesCard({
  totalPrice,
  currency,
  paymentStatus,
  downloadInvoice,
  isDownloading,
  handlePayNow,
  isProcessingPayment,
}: {
  totalPrice?: number;
  currency?: string;
  paymentStatus: string;
  downloadInvoice: () => void;
  isDownloading: boolean;
  handlePayNow: () => void;
  isProcessingPayment: boolean;
}) {
  const t = useTranslations("AppointmentDetails.finances");

  const formattedPrice = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(totalPrice || 0);

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden space-y-6 p-6 sm:p-8 font-sans">
      <div className="pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
          <Receipt className="w-5 h-5" strokeWidth={2} />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h3>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
            {t("final_amount")}
          </span>
          <span className="text-3xl font-bold font-mono text-gray-900 dark:text-white tracking-tight">
            {formattedPrice}
          </span>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
          {paymentStatus === "SETTLED" ? (
            <Button
              type="button"
              onClick={downloadInvoice}
              disabled={isDownloading}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-between px-6 disabled:opacity-50"
            >
              <span>{t("download_receipt")}</span>
              {isDownloading ? (
                <QhSpinner size="sm" className="text-white" />
              ) : (
                <FileText className="w-4 h-4" strokeWidth={2} />
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
                <p className="text-xs font-bold">
                  {t("status_unpaid")}
                </p>
              </div>

              <Button
                type="button"
                onClick={handlePayNow}
                disabled={isProcessingPayment}
                className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-between px-6 disabled:opacity-50"
              >
                <span>{t("pay_now")}</span>
                {isProcessingPayment ? (
                  <QhSpinner size="sm" className="text-white" />
                ) : (
                  <CreditCard className="w-4 h-4" strokeWidth={2} />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
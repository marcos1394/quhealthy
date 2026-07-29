"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { QrCode } from "lucide-react";
import { useTranslations } from "next-intl";

import { QhSpinner } from "@/components/ui/QhSpinner";

interface Props {
  t?: any;
  qrCodeUrl: string | null;
}

export function QrCodeCard({ qrCodeUrl }: Props) {
  const t = useTranslations("AppointmentConfirmation");

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden mb-8 flex flex-col font-sans transition-colors">
      <div className="bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 p-6 text-center space-y-1">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <QrCode className="w-4 h-4" strokeWidth={2} />
          </span>
          <span>{t("qr_label")}</span>
        </h2>
        <p className="text-xs font-medium text-gray-500 max-w-sm mx-auto">
          {t("tip_arrive")}
        </p>
      </div>

      <div className="p-8 flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          {qrCodeUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={qrCodeUrl}
              alt={t("qr_label")}
              className="w-44 h-44 object-contain mix-blend-multiply"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center bg-gray-50 rounded-xl">
              <QhSpinner size="md" className="text-emerald-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
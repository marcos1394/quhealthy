"use client";

import React from "react";
import Image from "next/image";
import { QrCode } from "lucide-react";
import { useTranslations } from "next-intl";

export function AppointmentQrCard({
  status,
  qrCodeUrl,
}: {
  status: string;
  qrCodeUrl?: string | null;
}) {
  const t = useTranslations("AppointmentDetails.qr");

  if (status !== "SCHEDULED" || !qrCodeUrl) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 font-sans">
      <div className="pb-4 border-b border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center space-y-1">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mb-1">
          <QrCode className="w-5 h-5" strokeWidth={2} />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h3>
        <p className="text-xs font-medium text-gray-500 max-w-sm">
          {t("subtitle")}
        </p>
      </div>

      <div className="flex items-center justify-center p-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <Image
            src={qrCodeUrl}
            alt="Código QR Check-in"
            width={180}
            height={180}
            className="w-44 h-44 object-contain mix-blend-multiply"
          />
        </div>
      </div>
    </div>
  );
}
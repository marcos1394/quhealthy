"use client";

import React from "react";
import { QrCode } from "lucide-react";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface Props {
  t: any;
  qrCodeUrl: string | null;
}

export function QrCodeCard({ t, qrCodeUrl }: Props) {
  return (
    <div className="bg-white dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden mb-12 flex flex-col">
      <div className="bg-gray-50 dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 p-5 text-center">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2 mb-2">
          <span className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-1.5 rounded-lg inline-flex">
            <QrCode className="w-4 h-4 text-quhealthy-green dark:text-emerald-400" strokeWidth={1.5} />
          </span>
          {t("qr_label", { defaultValue: "Credencial Criptográfica" })}
        </h2>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {t("tip_arrive", {
            defaultValue:
              "Presentar en recepción al arribar a las instalaciones.",
          })}
        </p>
      </div>
      <div className="p-8 flex items-center justify-center bg-white dark:bg-[#050505]">
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
          {qrCodeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrCodeUrl}
              alt={t("qr_label")}
              className="w-48 h-48 object-contain bg-white dark:bg-white rounded-lg"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-100 rounded-lg">
              <QhSpinner size="md" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

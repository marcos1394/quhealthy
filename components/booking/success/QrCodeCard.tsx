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
    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] mb-12 flex flex-col">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-6 text-center">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center justify-center gap-2 mb-2">
          <QrCode className="w-4 h-4" strokeWidth={1.5} />{" "}
          {t("qr_label", { defaultValue: "Credencial Criptográfica" })}
        </h2>
        <p className="text-[9px] uppercase tracking-widest text-gray-500 font-light">
          {t("tip_arrive", {
            defaultValue:
              "PRESENTAR EN RECEPCIÓN AL ARRIBAR A LAS INSTALACIONES.",
          })}
        </p>
      </div>
      <div className="p-8 flex items-center justify-center bg-white">
        <div className="p-4 border border-black shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
          {qrCodeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrCodeUrl}
              alt={t("qr_label")}
              className="w-48 h-48 object-contain mix-blend-multiply"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-gray-50">
              <QhSpinner size="md" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

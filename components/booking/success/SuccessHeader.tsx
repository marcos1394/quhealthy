"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { Check, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  t?: any;
  email?: string;
}

export function SuccessHeader({ email }: Props) {
  const t = useTranslations("AppointmentConfirmation");

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm mb-8 font-sans transition-colors">
      <div className="p-8 sm:p-12 text-center flex flex-col items-center">
        {/* Sello de Aprobación */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 shadow-sm">
          <Check className="w-10 h-10" strokeWidth={3} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          {t("title")}
        </h1>

        <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
          {t("subtitle")}
        </p>

        {email && (
          <div className="inline-flex items-center gap-2.5 bg-gray-50/80 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-2 shadow-xs">
            <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {t("receipt_sent_to")}{" "}
              <span className="font-bold text-gray-900 dark:text-white font-mono">{email}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";

export function ReviewLoader() {
  const t = useTranslations("PatientReviews");

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 font-sans select-none transition-colors">
      <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-4 animate-pulse">
        {t("loading_validation")}
      </p>
    </div>
  );
}

export function ReviewError({ message }: { message: string }) {
  const t = useTranslations("PatientReviews");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-6 font-sans select-none transition-colors">
      <div className="max-w-md w-full border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 text-center rounded-3xl shadow-2xs space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-2xs">
          <AlertCircle className="w-7 h-7" strokeWidth={2} />
        </div>

        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            {t("error_title")}
          </h2>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {message}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => router.push("/patient/dashboard")}
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-xs font-bold transition-all shadow-xs border-0 cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          <span>{t("btn_back_home")}</span>
        </Button>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Smartphone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SharedTwoFactorManager } from "@/components/shared/settings/security/SharedTwoFactorManager";

export default function FoundationTwoFactorPage() {
  const t = useTranslations("Settings2FA");

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in-0 duration-300">
      <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <Link
          href="/foundation/settings#security"
          className="w-10 h-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-200" strokeWidth={2} />
        </Link>
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
          <Smartphone className="w-6 h-6" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
            {t("title")}
          </h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            {t("subtitle")}
          </p>
        </div>
      </div>
      <SharedTwoFactorManager redirectUrl="/foundation/dashboard" />
    </div>
  );
}

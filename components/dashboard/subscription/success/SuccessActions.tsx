"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, Receipt } from "lucide-react";

export const SuccessActions = () => {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale;
  const t = useTranslations("SettingsSubscription.Success");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-8 w-full max-w-md mx-auto font-sans"
    >
      <button
        type="button"
        onClick={() => router.push(`/${locale}/provider/dashboard`)}
        className="w-full sm:w-auto h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0"
      >
        <LayoutDashboard className="w-4 h-4" strokeWidth={2} />
        <span>{t("btn_dashboard")}</span>
      </button>

      <button
        type="button"
        onClick={() =>
          router.push(`/${locale}/provider/dashboard/settings/billing`)
        }
        className="w-full sm:w-auto h-11 px-6 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
      >
        <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
        <span>{t("btn_billing")}</span>
      </button>
    </motion.div>
  );
};
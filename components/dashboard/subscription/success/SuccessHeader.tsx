"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

export const SuccessHeader = () => {
  const t = useTranslations("SettingsSubscription.Success");

  return (
    <div className="flex flex-col items-center text-center space-y-3 font-sans transition-colors">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 shadow-2xs"
      >
        <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight"
      >
        {t("title")}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-md leading-relaxed"
      >
        {t("subtitle")}
      </motion.p>
    </div>
  );
};
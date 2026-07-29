"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";

export const NextStepsList = () => {
  const t = useTranslations("SettingsSubscription.Success");

  const steps = [
    {
      icon: <Sparkles className="w-5 h-5 text-amber-500" strokeWidth={2} />,
      title: t("step1_title"),
      description: t("step1_desc"),
    },
    {
      icon: (
        <Mail
          className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
          strokeWidth={2}
        />
      ),
      title: t("step2_title"),
      description: t("step2_desc"),
    },
    {
      icon: <LayoutDashboard className="w-5 h-5 text-blue-500" strokeWidth={2} />,
      title: t("step3_title"),
      description: t("step3_desc"),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg mx-auto shadow-sm font-sans transition-colors"
    >
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
        {t("next_steps")}
      </h3>
      <div className="space-y-5">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-2xs">
              {step.icon}
            </div>
            <div className="space-y-0.5 pt-0.5">
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {step.title}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
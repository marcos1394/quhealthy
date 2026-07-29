"use client";

/* eslint-disable deslop/unused-export */
/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Sparkles, TrendingUp, Users, Heart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type UserRole = "paciente" | "proveedor";
export type BillingCycle = "monthly" | "yearly";

interface PlansHeaderProps {
  role: UserRole;
  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;
}

export const PlansHeader: React.FC<PlansHeaderProps> = ({
  role,
  billingCycle,
  setBillingCycle,
}) => {
  const t = useTranslations("SettingsSubscription.PlansHeader");

  const calculateYearlySavings = () => {
    const monthlyBase = 50;
    const yearlyTotal = monthlyBase * 12;
    return Math.round(yearlyTotal * 0.2);
  };

  const yearlySavings = calculateYearlySavings();

  const roleContent = {
    paciente: {
      title: t("role_patient_title"),
      subtitle: t("role_patient_subtitle"),
      icon: Heart,
      highlight: t("role_patient_highlight"),
    },
    proveedor: {
      title: t("role_provider_title"),
      subtitle: t("role_provider_subtitle"),
      icon: TrendingUp,
      highlight: t("role_provider_highlight"),
    },
  };

  const content = roleContent[role];
  const Icon = content.icon;

  return (
    <div className="text-center mb-12 space-y-6 font-sans transition-colors">
      {/* Icon Badge */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-2xs"
      >
        <Icon className="w-8 h-8" strokeWidth={2} />
      </motion.div>

      {/* Title & Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-3"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
          {content.title}
        </h1>

        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {content.subtitle}
        </p>

        {/* Social Proof Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="pt-2"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-2xs">
            <Users className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{content.highlight}</span>
          </span>
        </motion.div>
      </motion.div>

      {/* Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-col items-center gap-3 pt-2"
      >
        {/* Savings Preview */}
        {billingCycle === "yearly" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <span>{t("savings_yearly", { amount: yearlySavings })}</span>
          </motion.div>
        )}

        {/* Toggle Buttons */}
        <div className="inline-flex items-center p-1.5 bg-gray-100/80 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xs">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0",
              billingCycle === "monthly"
                ? "bg-white dark:bg-[#111] text-gray-900 dark:text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <span>{t("toggle_monthly")}</span>
          </button>

          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-0",
              billingCycle === "yearly"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <span>{t("toggle_yearly")}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-all",
                billingCycle === "yearly"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              )}
            >
              <Zap className="w-3 h-3" strokeWidth={2} />
              <span>{t("badge_discount")}</span>
            </span>
          </button>
        </div>

        {/* Info Text */}
        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 pt-1">
          {billingCycle === "yearly" ? t("info_yearly") : t("info_monthly")}
        </p>
      </motion.div>

      {/* Separator */}
      <div className="w-20 h-px bg-gray-200 dark:bg-gray-800 mx-auto rounded-full pt-2" />
    </div>
  );
};

export const PlansHeaderCompact: React.FC<PlansHeaderProps> = ({
  role,
  billingCycle,
  setBillingCycle,
}) => {
  const t = useTranslations("SettingsSubscription.PlansHeader");

  return (
    <div className="text-center mb-8 space-y-4 font-sans transition-colors">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
        {role === "paciente"
          ? t("compact_patient_title")
          : t("compact_provider_title")}
      </h2>

      <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xs">
        <button
          type="button"
          onClick={() => setBillingCycle("monthly")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-0",
            billingCycle === "monthly"
              ? "bg-white dark:bg-[#111] text-gray-900 dark:text-white shadow-2xs"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          {t("toggle_monthly")}
        </button>

        <button
          type="button"
          onClick={() => setBillingCycle("yearly")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-0",
            billingCycle === "yearly"
              ? "bg-emerald-600 text-white shadow-2xs"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          <span>{t("toggle_yearly")}</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono",
              billingCycle === "yearly"
                ? "bg-white/20 text-white"
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
            )}
          >
            {t("badge_discount")}
          </span>
        </button>
      </div>
    </div>
  );
};
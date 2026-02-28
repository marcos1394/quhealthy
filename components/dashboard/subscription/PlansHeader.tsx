"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  setBillingCycle
}) => {
  const t = useTranslations('SettingsSubscription.PlansHeader');

  // Helper para calcular ahorro anual
  const calculateYearlySavings = () => {
    const monthlyBase = 50;
    const yearlyTotal = monthlyBase * 12;
    const savings = Math.round(yearlyTotal * 0.2);
    return savings;
  };

  const yearlySavings = calculateYearlySavings();

  const roleContent = {
    paciente: {
      title: t('role_patient_title'),
      subtitle: t('role_patient_subtitle'),
      icon: Heart,
      highlight: t('role_patient_highlight')
    },
    proveedor: {
      title: t('role_provider_title'),
      subtitle: t('role_provider_subtitle'),
      icon: TrendingUp,
      highlight: t('role_provider_highlight')
    }
  };

  const content = roleContent[role];
  const Icon = content.icon;

  return (
    <div className="text-center mb-16 space-y-6">

      {/* Icon Badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="inline-flex items-center justify-center.tsx"
      >
        <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-2xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
          <Icon className="w-8 h-8 text-medical-600 dark:text-medical-400" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-3"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          {content.title}
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          {content.subtitle}
        </p>

        {/* Social Proof Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 mt-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-full"
        >
          <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            {content.highlight}
          </span>
        </motion.div>
      </motion.div>

      {/* Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col items-center gap-4 mt-8"
      >

        {/* Savings Preview */}
        {billingCycle === "yearly" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-4 py-2 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {t('savings_yearly', { amount: yearlySavings })}
            </span>
          </motion.div>
        )}

        {/* Toggle Buttons */}
        <div className="inline-flex items-center p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">

          {/* Monthly Button */}
          <Button
            variant="ghost"
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "relative rounded-xl px-8 py-3 font-semibold transition-all duration-300",
              billingCycle === "monthly"
                ? "text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:text-white"
            )}
          >
            {billingCycle === "monthly" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {t('toggle_monthly')}
            </span>
          </Button>

          {/* Yearly Button */}
          <Button
            variant="ghost"
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "relative rounded-xl px-8 py-3 font-semibold transition-all duration-300",
              billingCycle === "yearly"
                ? "bg-medical-600 text-white shadow-md shadow-medical-500/20"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
            )}
          >
            {billingCycle === "yearly" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-medical-600 rounded-xl"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {t('toggle_yearly')}
              <Badge className={cn(
                "ml-1 text-xs px-2 py-0.5 font-bold transition-all shadow-none",
                billingCycle === "yearly"
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-medical-50 text-medical-600 dark:bg-medical-500/20 dark:text-medical-300 hover:bg-medical-100"
              )}>
                <Zap className="w-3 h-3 mr-1" />
                {t('badge_discount')}
              </Badge>
            </span>
          </Button>
        </div>

        {/* Info Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-slate-500 dark:text-slate-400 mt-2"
        >
          {billingCycle === "yearly"
            ? t('info_yearly')
            : t('info_monthly')}
        </motion.p>
      </motion.div>

      {/* Separator with gradient */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-24 h-1 bg-gradient-to-r from-transparent via-medical-500 to-transparent mx-auto rounded-full mt-8 opacity-50"
      />
    </div>
  );
};

export const PlansHeaderCompact: React.FC<PlansHeaderProps> = ({
  role,
  billingCycle,
  setBillingCycle
}) => {
  const t = useTranslations('SettingsSubscription.PlansHeader');

  return (
    <div className="text-center mb-8 space-y-4">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
        {role === "paciente"
          ? t('compact_patient_title')
          : t('compact_provider_title')}
      </h2>

      <div className="inline-flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <Button
          variant="ghost"
          onClick={() => setBillingCycle("monthly")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm transition-all",
            billingCycle === "monthly"
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          )}
        >
          {t('toggle_monthly')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setBillingCycle("yearly")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm transition-all flex items-center",
            billingCycle === "yearly"
              ? "bg-medical-600 text-white font-medium"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          )}
        >
          {t('toggle_yearly')}
          <Badge className={cn("ml-2 shadow-none border-0 text-[10px]", billingCycle === "yearly" ? "bg-white/20 hover:bg-white/30" : "bg-medical-50 text-medical-600 dark:bg-medical-500/20 dark:text-medical-300")}>
            {t('badge_discount')}
          </Badge>
        </Button>
      </div>
    </div>
  );
};
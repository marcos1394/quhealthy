"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Info,
  X,
  Calendar,
  RefreshCw,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Plan } from "./PricingCard";

interface ConfirmationModalProps {
  plan: Plan | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  plan,
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const t = useTranslations("SettingsSubscription.ConfirmationModal");

  if (!plan) return null;

  const getNextBillingDate = () => {
    const date = new Date();
    if (plan.duration === "monthly") {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const calculateSavings = () => {
    if (!plan.savings) return 0;
    return Math.round(plan.price * 0.2);
  };

  const savings = calculateSavings();
  const nextBillingDate = getNextBillingDate();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onCancel()}>
      <DialogContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 sm:max-w-xl max-h-[90vh] flex flex-col shadow-2xl p-0 overflow-hidden rounded-3xl font-sans transition-colors">
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          {/* Header decorativo */}
          <div className="p-6 sm:p-8 pb-4 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
            <DialogHeader className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
                  <ShieldCheck className="w-6 h-6" strokeWidth={2} />
                </div>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              <div className="space-y-1">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                  {t("title")}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("subtitle")}
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>

          <div className="px-6 sm:px-8 py-6 space-y-5">
            {/* Tarjeta Resumen de Plan */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50/60 dark:bg-[#050505] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 text-left shadow-2xs space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <RefreshCw className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    {plan.duration === "monthly"
                      ? t("billing_monthly")
                      : t("billing_yearly")}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-xs font-bold text-gray-400">$</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                      {plan.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-gray-400">
                    /{plan.duration === "monthly" ? t("duration_monthly") : t("duration_yearly")}
                  </p>
                </div>
              </div>

              {/* Lista de Características */}
              <div className="space-y-2.5 bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {t("includes")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {plan.features.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                        strokeWidth={2}
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-medium leading-tight">
                        {feature.title}
                      </span>
                    </div>
                  ))}
                </div>
                {plan.features.length > 4 && (
                  <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 font-semibold flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
                      <span>{t("more_benefits", { count: plan.features.length - 4 })}</span>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Desglose de Facturación */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3 px-1"
            >
              <div className="space-y-2 text-left">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-gray-500 font-medium">{t("subtotal")}</span>
                  <span className="text-gray-900 dark:text-white font-bold font-mono">
                    ${plan.price.toLocaleString()}
                  </span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-xs items-center text-emerald-700 dark:text-emerald-400 font-medium">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {t("yearly_savings")}
                    </span>
                    <span className="font-bold font-mono">-${savings.toLocaleString()}</span>
                  </div>
                )}

                <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

                <div className="flex justify-between items-center py-1">
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {t("total_today")}
                  </span>
                  <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white tracking-tight">
                    ${plan.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Información de Próxima Renovación */}
              <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-start gap-3.5 text-left shadow-2xs">
                <div className="bg-white dark:bg-[#0a0a0a] p-2 rounded-xl border border-gray-200 dark:border-gray-800 shrink-0 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                  <Calendar className="w-4 h-4" strokeWidth={2} />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("next_billing_title")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    {t("next_billing_desc", { date: nextBillingDate })}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Garantías y Seguridad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                <div className="flex-1 space-y-0.5">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("secure_payment_title")}
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium leading-tight">
                    {t("secure_payment_desc")}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
                <RefreshCw className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" strokeWidth={2} />
                <div className="flex-1 space-y-0.5">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("no_commitment_title")}
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium leading-tight">
                    {t("no_commitment_desc")}
                  </p>
                </div>
              </div>
            </div>

            {/* Información Importante */}
            <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-start gap-3 text-left shadow-2xs">
              <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" strokeWidth={2} />
              <div className="flex-1 text-xs text-gray-600 dark:text-gray-400 font-medium space-y-1">
                <p className="font-bold text-gray-900 dark:text-white">
                  {t("important_info_title")}
                </p>
                <ul className="space-y-1 list-disc list-outside ml-3.5 text-[11px] leading-relaxed">
                  <li>{t("important_info_1")}</li>
                  <li>{t("important_info_2")}</li>
                  <li>{t("important_info_3")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 rounded-b-3xl">
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <QhSpinner size="sm" className="text-white" />
                    <span>{t("btn_processing")}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" strokeWidth={2} />
                    <span>{t("btn_confirm", { amount: plan.price.toLocaleString() })}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full h-10 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all font-bold text-xs rounded-xl shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {t("btn_cancel")}
            </button>

            {/* Badges de confianza */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider pt-2">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{t("trust_ssl")}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-500" />
                <span>{t("trust_pci")}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-indigo-500" />
                <span>{t("trust_no_commitment")}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
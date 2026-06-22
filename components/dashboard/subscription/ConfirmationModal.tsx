"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Lock,
  Sparkles,
  Info,
  X,
  Calendar,
  RefreshCw,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plan } from './PricingCard';

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
  isLoading = false
}) => {
  const [agreed, setAgreed] = useState(false);
  const t = useTranslations('SettingsSubscription.ConfirmationModal');

  if (!plan) return null;

  const getNextBillingDate = () => {
    const date = new Date();
    if (plan.duration === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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
      <DialogContent className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-0 sm:max-w-xl max-h-[90vh] flex flex-col shadow-2xl p-0 overflow-hidden rounded-[2rem]">

        <div className="flex-1 overflow-y-auto relative">
          {/* Decorative background gradient */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 opacity-50 z-0 pointer-events-none" />

        <div className="relative z-10 p-8 pb-4">
          {/* Header */}
          <DialogHeader className="space-y-5">
            <div className="flex items-start justify-between">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-slate-900 dark:bg-white p-4 rounded-2xl shadow-lg shadow-slate-200 dark:shadow-none"
              >
                <ShieldCheck className="w-7 h-7 text-white dark:text-slate-900" />
              </motion.div>
            </div>

            <div className="space-y-2 text-left">
              <DialogTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t('title')}
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-base max-w-sm">
                {t('subtitle')}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <div className="relative z-10 px-8 space-y-6 pb-8">

          {/* Plan Summary Card - Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 text-left shadow-sm"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  {plan.duration === 'monthly' ? t('billing_monthly') : t('billing_yearly')}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-medium text-slate-500">$</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {plan.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500">
                  /{plan.duration === 'monthly' ? t('duration_monthly') : t('duration_yearly')}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 bg-slate-50/50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                {t('includes')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.features.slice(0, 4).map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium leading-tight">{feature.title}</span>
                  </motion.div>
                ))}
              </div>
              {plan.features.length > 4 && (
                <div className="pt-2 mt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('more_benefits', { count: plan.features.length - 4 })}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Billing Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 px-2"
          >
            <div className="space-y-3 text-left">
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('subtotal')}</span>
                <span className="text-slate-900 dark:text-white font-semibold">${plan.price.toLocaleString()}</span>
              </div>

              {savings > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-between text-sm items-center text-emerald-600 dark:text-emerald-400 font-medium"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('yearly_savings')}
                  </span>
                  <span className="font-bold">-${savings.toLocaleString()}</span>
                </motion.div>
              )}

              <Separator className="bg-slate-200 dark:bg-slate-800 my-2" />

              <div className="flex justify-between items-center py-1">
                <span className="font-bold text-slate-900 dark:text-white text-lg">{t('total_today')}</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  ${plan.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Next billing info */}
            <div className="bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3.5 mt-6 text-left">
              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <Calendar className="w-5 h-5 text-slate-700 dark:text-slate-300 flex-shrink-0" />
              </div>
              <div className="flex-1 space-y-1 py-0.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('next_billing_title')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {t('next_billing_desc', { date: nextBillingDate })}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Security & Guarantees */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left"
          >
            <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3.5 flex items-start gap-3 shadow-sm">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{t('secure_payment_title')}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{t('secure_payment_desc')}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3.5 flex items-start gap-3 shadow-sm">
              <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{t('no_commitment_title')}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{t('no_commitment_desc')}</p>
              </div>
            </div>
          </motion.div>

          {/* Important Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-4 flex items-start gap-3 text-left"
          >
            <Info className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <p className="font-bold text-slate-900 dark:text-slate-300 mb-2">{t('important_info_title')}</p>
              <ul className="space-y-1.5 list-disc list-outside ml-3 marker:text-slate-300 dark:marker:text-slate-600">
                <li>{t('important_info_1')}</li>
                <li>{t('important_info_2')}</li>
                <li>{t('important_info_3')}</li>
              </ul>
            </div>
          </motion.div>
        </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-6 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 rounded-b-3xl">
          <DialogFooter className="flex-col gap-3">
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "w-full h-14 text-base font-bold shadow-xl transition-all duration-300 rounded-2xl",
                "bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white",
                "disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5",
              )}
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
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('btn_processing')}
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    {t('btn_confirm', { amount: plan.price.toLocaleString() })}
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 h-12 font-semibold rounded-2xl"
            >
              {t('btn_cancel')}
            </Button>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] text-slate-400 dark:text-slate-500 pt-4 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('trust_ssl')}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>{t('trust_pci')}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t('trust_no_commitment')}</span>
              </div>
            </div>
          </DialogFooter>
        </div>

      </DialogContent>
    </Dialog>
  );
};
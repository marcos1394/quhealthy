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
      <DialogContent className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-0">

        <div className="p-6 pb-2">
          {/* Header */}
          <DialogHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-medical-50 dark:bg-medical-500/10 p-3.5 rounded-2xl border border-medical-100 dark:border-medical-500/20 shadow-sm"
              >
                <ShieldCheck className="w-6 h-6 text-medical-600 dark:text-medical-400" />
              </motion.div>

              {!isLoading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCancel}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t('title')}
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-base">
                {t('subtitle')}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 space-y-5 pb-6">

          {/* Plan Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-left"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  {plan.duration === 'monthly' ? t('billing_monthly') : t('billing_yearly')}
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-medical-200 dark:border-medical-500/30 text-medical-600 dark:text-medical-400 bg-medical-50 dark:bg-medical-500/10 text-base py-1.5 px-3 font-bold shadow-none"
              >
                ${plan.price.toLocaleString()}
                <span className="text-xs font-medium text-medical-600/70 dark:text-medical-400/70 ml-1.5">
                  /{plan.duration === 'monthly' ? t('duration_monthly') : t('duration_yearly')}
                </span>
              </Badge>
            </div>

            {/* Features */}
            <div className="space-y-3 bg-white dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                {t('includes')}
              </p>
              <div className="space-y-2.5">
                {plan.features.slice(0, 4).map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{feature.title}</span>
                  </motion.div>
                ))}
                {plan.features.length > 4 && (
                  <p className="text-xs text-medical-600 dark:text-medical-400 pl-6 font-medium flex items-center gap-1 mt-3.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('more_benefits', { count: plan.features.length - 4 })}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Billing Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 px-1"
          >
            <div className="space-y-2.5 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('subtotal')}</span>
                <span className="text-slate-900 dark:text-white font-semibold">${plan.price.toLocaleString()}</span>
              </div>

              {savings > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-between text-sm bg-emerald-50 dark:bg-emerald-500/10 -mx-3 px-3 py-2 rounded-xl"
                >
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('yearly_savings')}
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">-${savings.toLocaleString()}</span>
                </motion.div>
              )}

              <div className="pt-2">
                <Separator className="bg-slate-100 dark:bg-slate-800" />
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="font-bold text-slate-900 dark:text-white text-base">{t('total_today')}</span>
                <span className="text-2xl font-black text-medical-600 dark:text-medical-400">
                  ${plan.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Next billing info */}
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-3.5 flex items-start gap-3 mt-4 text-left">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                  {t('next_billing_title')}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400/80 font-medium">
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
            className="grid grid-cols-1 gap-2.5 text-left"
          >
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3.5 shadow-sm">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{t('secure_payment_title')}</p>
                <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{t('secure_payment_desc')}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3.5 shadow-sm">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{t('no_commitment_title')}</p>
                <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{t('no_commitment_desc')}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3.5 shadow-sm">
              <div className="p-2 bg-pink-100 dark:bg-pink-500/20 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{t('guarantee_title')}</p>
                <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{t('guarantee_desc')}</p>
              </div>
            </div>
          </motion.div>

          {/* Important Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3 text-left"
          >
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-amber-800 dark:text-amber-300/90 font-medium">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-400 mb-2">{t('important_info_title')}</p>
              <ul className="space-y-1.5 list-disc list-outside ml-3 marker:text-amber-400">
                <li>{t('important_info_1')}</li>
                <li>{t('important_info_2')}</li>
                <li>{t('important_info_3')}</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 rounded-b-lg">
          <DialogFooter className="flex-col gap-3 mt-4">
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "w-full h-12 text-sm font-bold shadow-md transition-all duration-300",
                "bg-medical-600 hover:bg-medical-700 text-white",
                "disabled:opacity-70 disabled:cursor-not-allowed",
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
                    <Loader2 className="w-4 h-4 animate-spin" />
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
                    <CreditCard className="w-4 h-4" />
                    {t('btn_confirm', { amount: plan.price.toLocaleString() })}
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 h-10 font-medium"
            >
              {t('btn_cancel')}
            </Button>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[10px] text-slate-500 dark:text-slate-400 pt-2 font-medium uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>{t('trust_ssl')}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-blue-500" />
                <span>{t('trust_pci')}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 text-indigo-500" />
                <span>{t('trust_no_commitment')}</span>
              </div>
            </div>
          </DialogFooter>
        </div>

      </DialogContent>
    </Dialog>
  );
};
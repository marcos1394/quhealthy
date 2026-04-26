"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export const SuccessActions = () => {
  const router = useRouter();
  const t = useTranslations('SettingsSubscription.Success');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
    >
      <button
        onClick={() => router.push('/dashboard')}
        className="px-6 py-2.5 bg-medical-600 hover:bg-medical-700 text-white font-medium rounded-lg transition-colors shadow-sm"
      >
        {t('btn_dashboard') || "Ir al Dashboard"}
      </button>
      <button
        onClick={() => router.push('/dashboard/settings/billing')}
        className="px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium rounded-lg transition-colors shadow-sm"
      >
        {t('btn_billing') || "Ver mi Facturación"}
      </button>
    </motion.div>
  );
};
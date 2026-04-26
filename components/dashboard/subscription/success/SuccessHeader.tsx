"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const SuccessHeader = () => {
  const t = useTranslations('SettingsSubscription.Success');

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4"
      >
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </motion.div>
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
      >
        {t('title') || "¡Pago procesado con éxito!"}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-slate-500 dark:text-slate-400 max-w-md"
      >
        {t('subtitle') || "Tu suscripción ha sido actualizada. Ya tienes acceso a todos los beneficios de tu nuevo plan."}
      </motion.p>
    </div>
  );
};
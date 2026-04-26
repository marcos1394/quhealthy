"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, LayoutDashboard } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const NextStepsList = () => {
  const t = useTranslations('SettingsSubscription.Success');

  const steps = [
    {
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      title: t('step1_title') || "Nuevas funciones desbloqueadas",
      description: t('step1_desc') || "Tu cuenta ya fue actualizada en nuestros servidores."
    },
    {
      icon: <Mail className="w-5 h-5 text-blue-500" />,
      title: t('step2_title') || "Recibo enviado",
      description: t('step2_desc') || "Hemos enviado la confirmación y factura a tu correo."
    },
    {
      icon: <LayoutDashboard className="w-5 h-5 text-medical-500" />,
      title: t('step3_title') || "Configura tu consultorio",
      description: t('step3_desc') || "Aprovecha al máximo tu nuevo catálogo y herramientas."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 w-full max-w-lg mx-auto shadow-sm"
    >
      <h3 className="font-semibold text-slate-900 dark:text-white mb-6">
        {t('next_steps') || "¿Qué sigue ahora?"}
      </h3>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-700">
              {step.icon}
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white text-sm">{step.title}</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
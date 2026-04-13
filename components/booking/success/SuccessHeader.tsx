// Ubicación: src/components/booking/success/SuccessHeader.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  t: any;
  email?: string;
}

export function SuccessHeader({ t, email }: Props) {
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
      <CardContent className="p-8 sm:p-10 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="mx-auto w-24 h-24 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-200 dark:border-emerald-500/30 mb-8 relative">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
          <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-amber-400 animate-pulse" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-6 max-w-md mx-auto">{t('subtitle')}</p>
          {email && (
            <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700">
              <Mail className="w-4 h-4 text-medical-500" />
              Recibo enviado a <span className="text-slate-900 dark:text-white">{email}</span>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}
// Ubicación: src/components/booking/success/QrCodeCard.tsx
"use client";

import React from 'react';
import { QrCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { QhSpinner } from '@/components/ui/QhSpinner';

interface Props {
  t: any;
  qrCodeUrl: string | null;
}

export function QrCodeCard({ t, qrCodeUrl }: Props) {
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm mb-8">
      <CardContent className="p-6 sm:p-8 flex flex-col items-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> {t('qr_label')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center max-w-sm">{t('tip_arrive')}</p>
        <div className="bg-white p-4 rounded-2xl w-48 h-48 flex items-center justify-center border-4 border-slate-200 dark:border-slate-700 shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {qrCodeUrl ? <img src={qrCodeUrl} alt={t('qr_label')} className="w-full h-full object-contain rounded-lg" /> : <QhSpinner size="md" />}
        </div>
      </CardContent>
    </Card>
  );
}
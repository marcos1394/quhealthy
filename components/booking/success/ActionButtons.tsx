// Ubicación: src/components/booking/success/ActionButtons.tsx
"use client";

import React from 'react';
import { Calendar, Download, Share, Bell, ArrowRight, Home, Shield, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

interface Props {
  t: any;
  router: any;
  copied: boolean;
  isDownloading: boolean;
  handleAddToCalendar: () => void;
  downloadInvoice: () => void;
  handleShare: () => void;
}

export function ActionButtons({ t, router, copied, isDownloading, handleAddToCalendar, downloadInvoice, handleShare }: Props) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Button onClick={handleAddToCalendar} variant="outline" className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 h-auto flex-col gap-2 py-4 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
          <Calendar className="w-5 h-5 text-emerald-500" /> <span className="text-xs font-semibold">{t('btn_calendar')}</span>
        </Button>
        <Button onClick={downloadInvoice} variant="outline" disabled={isDownloading} className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 h-auto flex-col gap-2 py-4 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
          {isDownloading ? <Loader2 className="w-5 h-5 animate-spin text-medical-500" /> : <Download className="w-5 h-5 text-medical-500" />} <span className="text-xs font-semibold">PDF</span>
        </Button>
        <Button onClick={handleShare} variant="outline" className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 h-auto flex-col gap-2 py-4 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
          {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share className="w-5 h-5 text-blue-500" />} <span className="text-xs font-semibold">{t('btn_share')}</span>
        </Button>
        <Button onClick={() => toast.info("Recordatorio configurado")} variant="outline" className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 h-auto flex-col gap-2 py-4 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
          <Bell className="w-5 h-5 text-pink-500" /> <span className="text-xs font-semibold">Reminder</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => router.push('/patient/appointments')} className="flex-1 h-14 bg-gradient-to-r from-medical-600 to-medical-500 hover:from-medical-700 hover:to-medical-600 text-white text-base font-bold rounded-2xl shadow-lg">
          {t('btn_appointments')} <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <Button onClick={() => router.push('/patient/dashboard')} variant="outline" className="flex-1 h-14 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-base font-bold rounded-2xl">
          <Home className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400" /> {t('btn_home')}
        </Button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
        <Shield className="w-4 h-4 text-emerald-500/70" /> <span>Pago procesado de forma segura</span>
      </div>
    </>
  );
}
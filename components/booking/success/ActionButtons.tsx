"use client"
/* eslint-disable react-doctor/button-has-type */;

import React from 'react';
import { Calendar, Download, Share, Bell, ArrowRight, Home, ShieldCheck, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

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
    <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-12">
      
      {/* Botonera Secundaria (Herramientas del Documento) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-gray-200 dark:border-gray-800 mb-8 bg-gray-50 dark:bg-[#050505]">
        <button 
          onClick={handleAddToCalendar} 
          className="flex flex-col items-center justify-center gap-3 py-6 border-b sm:border-b-0 border-r border-gray-200 dark:border-gray-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors group"
        >
          <Calendar className="w-5 h-5 text-gray-400 group-hover:text-white dark:group-hover:text-black" strokeWidth={1.5} /> 
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white dark:group-hover:text-black">{t('btn_calendar', { defaultValue: 'Agendar' })}</span>
        </button>
        
        <button 
          onClick={downloadInvoice} 
          disabled={isDownloading} 
          className="flex flex-col items-center justify-center gap-3 py-6 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors group disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400 group-hover:text-white dark:group-hover:text-black" strokeWidth={1.5} />
          ) : (
            <Download className="w-5 h-5 text-gray-400 group-hover:text-white dark:group-hover:text-black" strokeWidth={1.5} />
          )}
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white dark:group-hover:text-black">PDF</span>
        </button>

        <button 
          onClick={handleShare} 
          className="flex flex-col items-center justify-center gap-3 py-6 border-r border-gray-200 dark:border-gray-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors group"
        >
          {copied ? (
            <Check className="w-5 h-5 text-black dark:text-white group-hover:text-white dark:group-hover:text-black" strokeWidth={2} />
          ) : (
            <Share className="w-5 h-5 text-gray-400 group-hover:text-white dark:group-hover:text-black" strokeWidth={1.5} />
          )}
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white dark:group-hover:text-black">{t('btn_share', { defaultValue: 'Compartir' })}</span>
        </button>

        <button 
          onClick={() => toast.info("NOTIFICACIÓN PROGRAMADA EN TERMINAL.")} 
          className="flex flex-col items-center justify-center gap-3 py-6 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors group"
        >
          <Bell className="w-5 h-5 text-gray-400 group-hover:text-white dark:group-hover:text-black" strokeWidth={1.5} /> 
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white dark:group-hover:text-black">Alerta</span>
        </button>
      </div>

      {/* Botonera Primaria (Navegación) */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => router.push('/patient/dashboard/appointments')} 
          className="flex-1 h-14 rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest transition-colors border-0 flex items-center justify-center px-8"
        >
          {t('btn_appointments', { defaultValue: 'Directorio de Citas' })} <ArrowRight className="w-4 h-4 ml-3" strokeWidth={1.5} />
        </Button>
        <Button 
          onClick={() => router.push('/patient/dashboard')} 
          variant="outline" 
          className="flex-1 h-14 rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center px-8"
        >
          <Home className="w-4 h-4 mr-3" strokeWidth={1.5} /> {t('btn_home', { defaultValue: 'Retorno al Panel' })}
        </Button>
      </div>

      {/* Sello de Confianza Final */}
      <div className="mt-8 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500">
        <ShieldCheck className="w-4 h-4" strokeWidth={1.5} /> <span>LIQUIDACIÓN PROCESADA BAJO ESTÁNDARES CIFRADOS.</span>
      </div>
    </div>
  );
}
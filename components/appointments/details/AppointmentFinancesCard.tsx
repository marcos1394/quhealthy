import React from 'react';
import { Receipt, FileText, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QhSpinner } from '@/components/ui/QhSpinner';

export function AppointmentFinancesCard({
  totalPrice,
  currency,
  paymentStatus,
  downloadInvoice,
  isDownloading,
  handlePayNow,
  isProcessingPayment,
  t
}: {
  totalPrice?: number;
  currency?: string;
  paymentStatus: string;
  downloadInvoice: () => void;
  isDownloading: boolean;
  handlePayNow: () => void;
  isProcessingPayment: boolean;
  t: (key: string, options?: any) => string;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
      <div className="border-b border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-[#050505]">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
          <Receipt className="w-4 h-4" strokeWidth={1.5} /> Resumen Financiero
        </h3>
      </div>
      <div className="p-6 md:p-8 space-y-8">
        
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Importe Final</span>
          <span className="text-3xl font-semibold tracking-tight text-black dark:text-white">
            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency || 'MXN' }).format(totalPrice || 0)}
          </span>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          {paymentStatus === 'SETTLED' ? (
            <Button type="button" 
              onClick={downloadInvoice} 
              disabled={isDownloading}
              className="w-full rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 text-[10px] font-bold uppercase tracking-widest transition-colors border-0 flex items-center justify-between px-6"
            >
              {t('btn_receipt', { defaultValue: 'Extraer Recibo Fiscal' })}
              {isDownloading ? <QhSpinner size="sm" /> : <FileText className="w-4 h-4" strokeWidth={1.5} />}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-900/10 p-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">
                  Estado: Requiere Liquidación
                </p>
              </div>
              <Button type="button" 
                onClick={handlePayNow} 
                disabled={isProcessingPayment}
                className="w-full rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 text-[10px] font-bold uppercase tracking-widest transition-colors border-0 flex items-center justify-between px-6 disabled:opacity-50"
              >
                {t('btn_pay', { defaultValue: 'Ejecutar Pago' })}
                {isProcessingPayment ? <QhSpinner size="sm" /> : <CreditCard className="w-4 h-4" strokeWidth={1.5} />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, Calculator, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { cashRegisterService } from '@/services/cash-register.service';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface CloseRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  registerId: number;
  expectedBalance: number;
  onSuccess: () => void;
}

export const CloseRegisterModal: React.FC<CloseRegisterModalProps> = ({
  isOpen,
  onClose,
  registerId,
  expectedBalance,
  onSuccess
}) => {
  const [actualBalance, setActualBalance] = useState<number>(expectedBalance);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('CashRegister');

  const difference = actualBalance - expectedBalance;

  const handleCloseRegister = async () => {
    if (actualBalance < 0) {
      toast.error('EL BALANCE NO PUEDE SER NEGATIVO.');
      return;
    }

    try {
      setIsSubmitting(true);
      await cashRegisterService.closeRegister(registerId, {
        actualClosingBalance: actualBalance,
        closingNotes: notes || undefined
      });
      toast.success('CAJA CERRADA CORRECTAMENTE.');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'ERROR AL CERRAR LA CAJA');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col rounded-none"
        >
          {/* HEADER TÉCNICO */}
          <div className="flex items-center justify-between p-6 border-b border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                <Calculator className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold text-black dark:text-white uppercase tracking-tighter">
                CIERRE DE CAJA
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 border border-transparent hover:border-black dark:hover:border-white transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* BODY */}
          <div className="p-6 md:p-8 space-y-8">
            
            <div className="border border-black dark:border-white p-6 bg-gray-50 dark:bg-[#050505] flex justify-between items-center shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">BALANCE ESPERADO</span>
              <span className="text-2xl font-black text-black dark:text-white tracking-tighter">
                ${expectedBalance.toFixed(2)}
              </span>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest block">
                EFECTIVO CONTADO (ARQUEO) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={actualBalance}
                onChange={(e) => setActualBalance(parseFloat(e.target.value) || 0)}
                className="w-full p-4 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white text-lg font-bold tracking-widest focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-300"
                placeholder="0.00"
              />
            </div>

            {difference !== 0 && (
              <div className={cn(
                "flex items-start gap-4 p-5 border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]",
                difference > 0 ? "bg-emerald-50 dark:bg-emerald-900/10" : "bg-red-50 dark:bg-red-900/10"
              )}>
                <AlertCircle className={cn("w-6 h-6 shrink-0", difference > 0 ? "text-emerald-600" : "text-red-600")} strokeWidth={1.5} />
                <div>
                  <p className={cn("text-[9px] font-bold uppercase tracking-widest", difference > 0 ? "text-emerald-700" : "text-red-700")}>
                    {difference > 0 ? 'SOBRANTE DETECTADO' : 'FALTANTE DETECTADO'}
                  </p>
                  <p className={cn("text-2xl font-black tracking-tighter", difference > 0 ? "text-emerald-700" : "text-red-700")}>
                    ${Math.abs(difference).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest block">
                JUSTIFICACIÓN (OPCIONAL)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-4 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white text-[10px] uppercase font-bold tracking-widest focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-300"
                placeholder="OBSERVACIONES DEL CIERRE..."
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-6 border-t border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex justify-end gap-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="h-14 px-8 border border-black dark:border-white bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none"
            >
              CANCELAR
            </button>
            <button
              onClick={handleCloseRegister}
              disabled={isSubmitting || actualBalance < 0}
              className="h-14 px-8 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]"
            >
              {isSubmitting ? (
                <QhSpinner className="w-5 h-5 text-white dark:text-black" />
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> CONFIRMAR CIERRE
                </span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { cashRegisterService } from '@/services/cash-register.service';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { useTranslations } from 'next-intl';

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
      toast.error('El balance no puede ser negativo.');
      return;
    }

    try {
      setIsSubmitting(true);
      await cashRegisterService.closeRegister(registerId, {
        actualClosingBalance: actualBalance,
        closingNotes: notes || undefined
      });
      toast.success('Caja cerrada correctamente.');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error al cerrar la caja');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white dark:bg-[#18181b] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl">
                <Calculator className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Cerrar Caja
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            
            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 flex justify-between items-center">
              <div className="text-sm font-medium text-slate-500 dark:text-zinc-400">Balance Esperado</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                ${expectedBalance.toFixed(2)}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                Efectivo Contado Físicamente (Arqueo) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={actualBalance}
                onChange={(e) => setActualBalance(parseFloat(e.target.value) || 0)}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-lg font-semibold transition-all"
                placeholder="0.00"
              />
            </div>

            {difference !== 0 && (
              <div className={`flex items-start gap-3 p-4 rounded-xl border ${difference > 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'}`}>
                <AlertCircle className={`w-5 h-5 mt-0.5 ${difference > 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                <div>
                  <p className={`text-sm font-bold ${difference > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                    {difference > 0 ? 'Sobrante detectado' : 'Faltante detectado'}
                  </p>
                  <p className={`text-xl font-black ${difference > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                    ${Math.abs(difference).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                Notas / Justificación (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all text-sm"
                placeholder="Escribe el motivo del sobrante/faltante u observaciones del día..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-6"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCloseRegister}
              disabled={isSubmitting || actualBalance < 0}
              className="rounded-xl px-8 bg-red-600 hover:bg-red-700 text-white shadow-lg"
            >
              {isSubmitting ? (
                <QhSpinner className="w-5 h-5 text-white" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Confirmar Cierre
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

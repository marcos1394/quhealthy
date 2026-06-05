import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, X, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { paymentService } from '@/services/payment.service';
import { DenominationMap } from '@/types/cash-register';

const DENOMINATIONS = ['1000', '500', '200', '100', '50', '20', '10', '5', '2', '1', '0.5'];
const denomLabel = (d: string) => parseFloat(d) >= 20 ? `$${d}` : `$${d}`;
const denomTotal = (denoms: DenominationMap): number =>
  Object.entries(denoms).reduce((acc, [d, count]) => acc + (parseFloat(d) * (count || 0)), 0);
const cleanDenoms = (denoms: DenominationMap): DenominationMap | undefined => {
  const clean = Object.fromEntries(Object.entries(denoms).filter(([, v]) => v > 0));
  return Object.keys(clean).length > 0 ? clean : undefined;
};

interface ManualExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentDenominations?: DenominationMap | null;
  maxExpectedBalance: number;
}

export const ManualExpenseModal = ({ isOpen, onClose, onSuccess, currentDenominations, maxExpectedBalance }: ManualExpenseModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [description, setDescription] = useState('');
  const [totalAmountStr, setTotalAmountStr] = useState('');
  const [showDenominations, setShowDenominations] = useState(false);
  const [expenseDenoms, setExpenseDenoms] = useState<DenominationMap>({});

  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setTotalAmountStr('');
      setExpenseDenoms({});
      setShowDenominations(false);
    }
  }, [isOpen]);

  const expenseTotal = useMemo(() => denomTotal(expenseDenoms), [expenseDenoms]);
  const hasDenoms = Object.values(expenseDenoms).some(v => v > 0);
  
  const parsedTotal = hasDenoms ? expenseTotal : parseFloat(totalAmountStr || '0');
  const isValid = description.trim().length > 0 && parsedTotal > 0;
  const isOverBalance = parsedTotal > maxExpectedBalance;

  const updateExpenseDenom = (denom: string, count: number) => {
    const maxAvailable = currentDenominations?.[denom] || 0;
    setExpenseDenoms(prev => ({ ...prev, [denom]: Math.min(Math.max(0, count), maxAvailable) }));
  };

  const handleRegisterExpense = async () => {
    if (!isValid) return;

    setIsProcessing(true);
    try {
      await paymentService.registerManualExpense({
        amount: parsedTotal,
        description: description.trim(),
        expenseDenominations: hasDenoms ? cleanDenoms(expenseDenoms) : undefined,
      });
      toast.success('Gasto registrado y caja actualizada.');
      onSuccess();
    } catch (error) {
      console.error('Error procesando gasto:', error);
      toast.error('No se pudo registrar el gasto.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-red-50/50 dark:bg-red-500/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Registrar Salida de Efectivo</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Gasto de caja chica</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5 overflow-y-auto flex-1">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-zinc-300">Concepto del Gasto</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej. Garrafón de agua, papel higiénico..."
                  className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              {!hasDenoms && (
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-zinc-300">Monto Total a Retirar ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={totalAmountStr}
                    onChange={(e) => setTotalAmountStr(e.target.value)}
                    placeholder="Ej. 50.00"
                    className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button 
                type="button"
                onClick={() => setShowDenominations(!showDenominations)}
                className="w-full flex items-center justify-between text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
              >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Desglosar denominaciones (Opcional)
                </span>
                {showDenominations ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showDenominations && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-3 gap-2"
                >
                  {DENOMINATIONS.map(denom => {
                    const available = currentDenominations?.[denom] || 0;
                    if (available <= 0) return null;
                    return (
                      <div key={`exp-${denom}`} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                        <div className="shrink-0 w-10">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">{denomLabel(denom)}</span>
                          <span className="text-[10px] text-slate-400">({available})</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max={available}
                          value={expenseDenoms[denom] || ''}
                          onChange={(e) => updateExpenseDenom(denom, parseInt(e.target.value) || 0)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold text-center focus:ring-2 focus:ring-red-500 outline-none"
                          placeholder="0"
                        />
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {hasDenoms && (
              <div className="flex justify-between items-center bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-200 dark:border-red-500/20">
                <span className="text-sm font-bold text-red-700 dark:text-red-400">Total Desglosado:</span>
                <span className="text-xl font-black text-red-700 dark:text-red-400">${expenseTotal.toFixed(2)}</span>
              </div>
            )}

            {isOverBalance && (
               <p className="text-xs text-red-500 font-medium text-center">
                 ⚠️ El monto supera el balance esperado de tu caja (${maxExpectedBalance.toFixed(2)}).
               </p>
            )}
          </div>

          <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
            <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button 
              onClick={handleRegisterExpense} 
              disabled={!isValid || isProcessing}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? 'Registrando...' : <><CheckCircle2 className="w-4 h-4 mr-2"/> Registrar Gasto</>}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Calculator, CheckCircle2, X, ArrowDown, ArrowUp, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { paymentService } from '@/services/payment.service';
import { DenominationMap } from '@/types/cash-register';
import { QhSpinner } from '@/components/ui/QhSpinner';

const DENOMINATIONS = ['1000', '500', '200', '100', '50', '20', '10', '5', '2', '1', '0.5'];
const denomLabel = (d: string) => parseFloat(d) >= 20 ? `$${d}` : `$${d}`;

const denomTotal = (denoms: DenominationMap): number =>
  Object.entries(denoms).reduce((acc, [d, count]) => acc + (parseFloat(d) * (count || 0)), 0);

const cleanDenoms = (denoms: DenominationMap): DenominationMap | undefined => {
  const clean = Object.fromEntries(Object.entries(denoms).filter(([, v]) => v > 0));
  return Object.keys(clean).length > 0 ? clean : undefined;
};

const suggestChange = (changeAmount: number, availableInRegister: DenominationMap): DenominationMap => {
  const suggestion: DenominationMap = {};
  let remaining = changeAmount;

  const sortedDenoms = DENOMINATIONS
    .map(d => parseFloat(d))
    .sort((a, b) => b - a);

  for (const denomValue of sortedDenoms) {
    if (remaining <= 0) break;
    const denomKey = denomValue.toString();
    const availableCount = availableInRegister[denomKey] || 0;
    if (availableCount <= 0 || denomValue > remaining) continue;

    const needed = Math.floor(remaining / denomValue);
    const canUse = Math.min(needed, availableCount);
    if (canUse > 0) {
      suggestion[denomKey] = canUse;
      remaining = Math.round((remaining - (canUse * denomValue)) * 100) / 100;
    }
  }

  return suggestion;
};

interface CashCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointmentId: number;
  totalAmount: number;
  patientName: string;
  registerDenominations?: DenominationMap | null;
}

export const CashCheckoutModal = ({ 
  isOpen, onClose, onSuccess, appointmentId, totalAmount, patientName, 
  registerDenominations 
}: CashCheckoutModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceivedDenoms, setShowReceivedDenoms] = useState(true);
  const [showChangeDenoms, setShowChangeDenoms] = useState(false);

  const [receivedDenoms, setReceivedDenoms] = useState<DenominationMap>({});
  const [changeDenoms, setChangeDenoms] = useState<DenominationMap>({});

  useEffect(() => {
    if (isOpen) {
      setReceivedDenoms({});
      setChangeDenoms({});
      setShowReceivedDenoms(true);
      setShowChangeDenoms(false);
    }
  }, [isOpen]);

  const receivedTotal = useMemo(() => denomTotal(receivedDenoms), [receivedDenoms]);
  const changeTotal = useMemo(() => denomTotal(changeDenoms), [changeDenoms]);
  
  const correctChange = receivedTotal - totalAmount;
  const isValid = receivedTotal >= totalAmount;

  const availableDenoms = useMemo(() => {
    const available: DenominationMap = {};
    DENOMINATIONS.forEach(d => {
      available[d] = (registerDenominations?.[d] || 0) + (receivedDenoms[d] || 0);
    });
    return available;
  }, [registerDenominations, receivedDenoms]);

  useEffect(() => {
    if (isValid && correctChange > 0) {
      const suggested = suggestChange(correctChange, availableDenoms);
      setChangeDenoms(suggested);
      setShowChangeDenoms(true);
    } else {
      setChangeDenoms({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receivedTotal, totalAmount]);

  const updateReceivedDenom = (denom: string, count: number) => {
    setReceivedDenoms(prev => ({ ...prev, [denom]: Math.max(0, count) }));
  };

  const updateChangeDenom = (denom: string, count: number) => {
    const maxAvailable = availableDenoms[denom] || 0;
    setChangeDenoms(prev => ({ ...prev, [denom]: Math.min(Math.max(0, count), maxAvailable) }));
  };

  const handleCheckout = async () => {
    if (!isValid) return;

    if (correctChange > 0 && Math.abs(changeTotal - correctChange) > 0.01) {
      toast.error(`La feria en denominaciones ($${changeTotal.toFixed(2)}) no coincide con el cambio correcto ($${correctChange.toFixed(2)}).`);
      return;
    }

    setIsProcessing(true);
    try {
      await paymentService.processCashCheckout({
        appointmentId,
        totalAmount,
        amountReceived: receivedTotal,
        description: `Cobro en efectivo: ${patientName}`,
        receivedDenominations: cleanDenoms(receivedDenoms),
        changeDenominations: cleanDenoms(changeDenoms),
      });
      toast.success('Cobro registrado y caja actualizada.');
      onSuccess();
    } catch (error) {
      console.error('Error procesando cobro:', error);
      toast.error('No se pudo procesar el cobro. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-black dark:border-white shrink-0 bg-white dark:bg-[#0a0a0a]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex justify-center items-center shrink-0">
                <Banknote className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-serif italic font-bold text-2xl uppercase text-black dark:text-white">COBRO EFECTIVO</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{patientName}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="border border-black dark:border-white p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            {/* Total a cobrar */}
            <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-[#050505] border border-black dark:border-white p-6 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">TOTAL A COBRAR</span>
              <span className="font-serif italic text-4xl font-bold text-black dark:text-white">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Efectivo Recibido */}
            <div className="space-y-4">
              <button 
                type="button"
                onClick={() => setShowReceivedDenoms(!showReceivedDenoms)}
                className="w-full flex items-center justify-between p-4 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ArrowDown className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                    EFECTIVO RECIBIDO
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${isValid ? 'text-green-600 dark:text-green-400' : 'text-black dark:text-white'}`}>
                    ${receivedTotal.toFixed(2)}
                  </span>
                  {showReceivedDenoms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {showReceivedDenoms && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-3 gap-3"
                >
                  {DENOMINATIONS.filter(d => parseFloat(d) >= 20).map(denom => (
                    <div key={`recv-${denom}`} className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 text-center">{denomLabel(denom)}</span>
                      <input
                        type="number"
                        min="0"
                        value={receivedDenoms[denom] || ''}
                        onChange={(e) => updateReceivedDenom(denom, parseInt(e.target.value) || 0)}
                        className="w-full h-10 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] text-black dark:text-white text-sm font-light text-center focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none"
                        placeholder="0"
                      />
                    </div>
                  ))}
                  {DENOMINATIONS.filter(d => parseFloat(d) < 20).map(denom => (
                    <div key={`recv-${denom}`} className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 text-center">{denomLabel(denom)}</span>
                      <input
                        type="number"
                        min="0"
                        value={receivedDenoms[denom] || ''}
                        onChange={(e) => updateReceivedDenom(denom, parseInt(e.target.value) || 0)}
                        className="w-full h-10 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] text-black dark:text-white text-sm font-light text-center focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Cambio a Entregar */}
            {isValid && correctChange > 0 && (
              <div className="space-y-4 pt-4 border-t border-black dark:border-white">
                <button 
                  type="button"
                  onClick={() => setShowChangeDenoms(!showChangeDenoms)}
                  className="w-full flex items-center justify-between p-4 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ArrowUp className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                      CAMBIO A ENTREGAR
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">
                      ${correctChange.toFixed(2)}
                    </span>
                    {showChangeDenoms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {showChangeDenoms && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-3 gap-3">
                      {DENOMINATIONS.filter(d => parseFloat(d) >= 1).map(denom => {
                        const available = availableDenoms[denom] || 0;
                        const used = changeDenoms[denom] || 0;
                        if (available <= 0 && used <= 0) return null;
                        return (
                          <div key={`change-${denom}`} className="flex flex-col gap-1 p-2 border border-black dark:border-white bg-red-50 dark:bg-red-900/10">
                            <div className="flex flex-col items-center mb-1">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-red-700 dark:text-red-400">{denomLabel(denom)}</span>
                              <span className="text-[8px] uppercase tracking-widest text-gray-500">DISP: {available}</span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              max={available}
                              value={used || ''}
                              onChange={(e) => updateChangeDenom(denom, parseInt(e.target.value) || 0)}
                              className="w-full h-8 border border-red-200 dark:border-red-900/30 bg-white dark:bg-slate-900 text-black dark:text-white text-xs font-light text-center focus:outline-none focus:ring-0 focus:border-red-500 rounded-none transition-colors"
                              placeholder="0"
                            />
                          </div>
                        );
                      })}
                    </div>
                    {Math.abs(changeTotal - correctChange) > 0.01 && (
                      <div className="p-3 border border-red-500 bg-red-50 dark:bg-red-900/20 text-center">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                          ATENCIÓN: LAS DENOMINACIONES SUMAN ${changeTotal.toFixed(2)} PERO EL CAMBIO CORRECTO ES ${correctChange.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* Resumen */}
            <div className={`p-6 border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] ${isValid ? 'bg-white dark:bg-[#0a0a0a]' : 'bg-gray-50 dark:bg-[#050505]'}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">RECIBIDO:</span>
                  <span className="font-bold text-sm text-black dark:text-white">${receivedTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">COBRO:</span>
                  <span className="font-bold text-sm text-black dark:text-white">-${totalAmount.toFixed(2)}</span>
                </div>
                <div className="h-px w-full bg-black dark:bg-white" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">FERIA A DAR:</span>
                  <span className={`font-serif italic font-bold text-2xl ${isValid ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                    ${isValid ? correctChange.toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-black dark:border-white flex flex-col sm:flex-row gap-4 shrink-0 bg-white dark:bg-[#0a0a0a]">
            <button 
              onClick={onClose} 
              className="flex-1 py-4 px-6 border border-black dark:border-white bg-transparent text-black dark:text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              CANCELAR
            </button>
            <button 
              onClick={handleCheckout} 
              disabled={!isValid || isProcessing || (correctChange > 0 && Math.abs(changeTotal - correctChange) > 0.01)}
              className="flex-1 flex items-center justify-center gap-3 py-4 px-6 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] disabled:opacity-50 disabled:shadow-none"
            >
              {isProcessing ? (
                <><QhSpinner size="sm" className="text-current"/> PROCESANDO...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /> REGISTRAR COBRO</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

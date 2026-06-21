"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Calculator, CheckCircle2, X, ArrowDown, ArrowUp, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { paymentService } from '@/services/payment.service';
import { DenominationMap } from '@/types/cash-register';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from '@/lib/utils';

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
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-none"
        >
          {/* Header Arquitectónico */}
          <div className="flex items-start md:items-center justify-between p-6 md:p-8 border-b border-black dark:border-white shrink-0 bg-white dark:bg-[#0a0a0a]">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex justify-center items-center shrink-0">
                <Banknote className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                  Terminal de Caja
                </p>
                <h3 className="font-semibold text-xl md:text-2xl uppercase tracking-tight text-black dark:text-white leading-none mb-2">
                  Liquidación en Efectivo
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  <span>{patientName}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-12 h-12 flex items-center justify-center border border-transparent hover:border-black dark:hover:border-white text-gray-400 hover:text-black dark:hover:text-white transition-colors shrink-0 bg-gray-50 dark:bg-[#050505] hover:bg-black hover:dark:bg-white hover:dark:text-black"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Body Principal */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#050505]">
            
            {/* Total a cobrar (Display Estricto) */}
            <div className="border-b border-black dark:border-white bg-white dark:bg-[#0a0a0a] flex items-center justify-between p-6 md:p-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  TOTAL A LIQUIDAR
                </p>
                <p className="text-4xl md:text-5xl font-semibold tracking-tighter text-black dark:text-white leading-none">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="hidden sm:flex w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] items-center justify-center shrink-0">
                 <Calculator className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
              </div>
            </div>

            {/* Efectivo Recibido */}
            <div className="flex flex-col">
              <button 
                type="button"
                onClick={() => setShowReceivedDenoms(!showReceivedDenoms)}
                className="w-full flex items-center justify-between p-6 border-b border-black dark:border-white bg-white dark:bg-[#0a0a0a] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none group"
              >
                <div className="flex items-center gap-4">
                  <ArrowDown className="w-4 h-4 text-black dark:text-white group-hover:text-white dark:group-hover:text-black shrink-0" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    EFECTIVO RECIBIDO
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "text-sm font-semibold tracking-widest", 
                    isValid ? "text-green-600 dark:text-green-400 group-hover:text-green-400 dark:group-hover:text-green-500" : ""
                  )}>
                    ${receivedTotal.toFixed(2)}
                  </span>
                  {showReceivedDenoms ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                </div>
              </button>

              {showReceivedDenoms && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-b border-black dark:border-white"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 bg-white dark:bg-[#0a0a0a] border-t border-l border-black/10 dark:border-white/10">
                    {DENOMINATIONS.map(denom => (
                      <div key={`recv-${denom}`} className="border-r border-b border-black/10 dark:border-white/10 p-4 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                          {denomLabel(denom)}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={receivedDenoms[denom] || ''}
                          onChange={(e) => updateReceivedDenom(denom, parseInt(e.target.value) || 0)}
                          className="w-full h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white text-xs font-semibold text-center focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-700 transition-colors rounded-none"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Cambio a Entregar */}
            {isValid && correctChange > 0 && (
              <div className="flex flex-col">
                <button 
                  type="button"
                  onClick={() => setShowChangeDenoms(!showChangeDenoms)}
                  className="w-full flex items-center justify-between p-6 border-b border-black dark:border-white bg-white dark:bg-[#0a0a0a] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none group"
                >
                  <div className="flex items-center gap-4">
                    <ArrowUp className="w-4 h-4 text-black dark:text-white group-hover:text-white dark:group-hover:text-black shrink-0" strokeWidth={1.5} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      CAMBIO A ENTREGAR
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold tracking-widest text-red-600 dark:text-red-400 group-hover:text-red-400 dark:group-hover:text-red-400">
                      ${correctChange.toFixed(2)}
                    </span>
                    {showChangeDenoms ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                  </div>
                </button>

                {showChangeDenoms && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-b border-black dark:border-white"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 bg-red-50 dark:bg-red-900/10 border-t border-l border-red-200 dark:border-red-900/30">
                      {DENOMINATIONS.filter(d => parseFloat(d) >= 1).map(denom => {
                        const available = availableDenoms[denom] || 0;
                        const used = changeDenoms[denom] || 0;
                        if (available <= 0 && used <= 0) return null;
                        return (
                          <div key={`change-${denom}`} className="border-r border-b border-red-200 dark:border-red-900/30 p-4 flex flex-col items-center justify-center">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-red-700 dark:text-red-400 mb-1">
                              {denomLabel(denom)}
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-red-400 dark:text-red-600 mb-2">
                              DISP: {available}
                            </span>
                            <input
                              type="number"
                              min="0"
                              max={available}
                              value={used || ''}
                              onChange={(e) => updateChangeDenom(denom, parseInt(e.target.value) || 0)}
                              className="w-full h-10 border border-red-300 dark:border-red-500/50 bg-white dark:bg-black text-black dark:text-white text-xs font-semibold text-center focus:outline-none focus:border-red-600 focus:ring-0 rounded-none transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
                              placeholder="0"
                            />
                          </div>
                        );
                      })}
                    </div>
                    {Math.abs(changeTotal - correctChange) > 0.01 && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-center border-t border-red-200 dark:border-red-900/30">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                          ATENCIÓN: LAS DENOMINACIONES SUMAN ${changeTotal.toFixed(2)} PERO EL CAMBIO CORRECTO ES ${correctChange.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* Resumen Final Estricto */}
            <div className="p-6 md:p-8 bg-gray-50 dark:bg-[#050505]">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">FONDO RECIBIDO:</span>
                  <span className="font-semibold text-sm tracking-widest text-black dark:text-white">${receivedTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">IMPORTE A COBRAR:</span>
                  <span className="font-semibold text-sm tracking-widest text-black dark:text-white">-${totalAmount.toFixed(2)}</span>
                </div>
                <div className="h-px w-full bg-black/20 dark:bg-white/20" />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">REMANENTE (CAMBIO):</span>
                  <span className={cn(
                    "font-semibold text-2xl tracking-tighter leading-none", 
                    isValid ? "text-black dark:text-white" : "text-gray-400"
                  )}>
                    ${isValid ? correctChange.toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer de Comandos Estricto */}
          <div className="p-6 md:p-8 border-t border-black dark:border-white flex flex-col sm:flex-row gap-4 shrink-0 bg-white dark:bg-[#0a0a0a]">
            <button 
              onClick={onClose} 
              className="flex-1 h-16 border border-black dark:border-white bg-transparent text-black dark:text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none"
            >
              CANCELAR
            </button>
            <button 
              onClick={handleCheckout} 
              disabled={!isValid || isProcessing || (correctChange > 0 && Math.abs(changeTotal - correctChange) > 0.01)}
              className="flex-1 h-16 flex items-center justify-center gap-3 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:hover:bg-black rounded-none border-0"
            >
              {isProcessing ? (
                <><QhSpinner size="sm" className="text-current"/> PROCESANDO CAJA...</>
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
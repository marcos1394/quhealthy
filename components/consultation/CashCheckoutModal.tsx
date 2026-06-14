import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Calculator, CheckCircle2, X, ArrowDown, ArrowUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { paymentService } from '@/services/payment.service';
import { DenominationMap } from '@/types/cash-register';

// Denominaciones en orden descendente (pesos MXN)
const DENOMINATIONS = ['1000', '500', '200', '100', '50', '20', '10', '5', '2', '1', '0.5'];

// Etiqueta amigable para la denominación
const denomLabel = (d: string) => parseFloat(d) >= 20 ? `$${d}` : `$${d}`;

// Calcula el total de un mapa de denominaciones
const denomTotal = (denoms: DenominationMap): number =>
  Object.entries(denoms).reduce((acc, [d, count]) => acc + (parseFloat(d) * (count || 0)), 0);

// Filtra solo denominaciones con valor > 0
const cleanDenoms = (denoms: DenominationMap): DenominationMap | undefined => {
  const clean = Object.fromEntries(Object.entries(denoms).filter(([, v]) => v > 0));
  return Object.keys(clean).length > 0 ? clean : undefined;
};

// Algoritmo greedy para sugerir la mejor combinación de feria con las denominaciones disponibles
const suggestChange = (changeAmount: number, availableInRegister: DenominationMap): DenominationMap => {
  const suggestion: DenominationMap = {};
  let remaining = changeAmount;

  // Ordenar denominaciones de mayor a menor
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
  registerDenominations?: DenominationMap | null; // Denominaciones actuales en caja
}

export const CashCheckoutModal = ({ 
  isOpen, onClose, onSuccess, appointmentId, totalAmount, patientName, 
  registerDenominations 
}: CashCheckoutModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceivedDenoms, setShowReceivedDenoms] = useState(true);
  const [showChangeDenoms, setShowChangeDenoms] = useState(false);

  // Denominaciones recibidas del paciente
  const [receivedDenoms, setReceivedDenoms] = useState<DenominationMap>({});
  // Denominaciones entregadas como feria
  const [changeDenoms, setChangeDenoms] = useState<DenominationMap>({});

  // Resetear todo al abrir
  useEffect(() => {
    if (isOpen) {
      setReceivedDenoms({});
      setChangeDenoms({});
      setShowReceivedDenoms(true);
      setShowChangeDenoms(false);
    }
  }, [isOpen]);

  // Total recibido calculado de las denominaciones
  const receivedTotal = useMemo(() => denomTotal(receivedDenoms), [receivedDenoms]);
  const changeTotal = useMemo(() => denomTotal(changeDenoms), [changeDenoms]);
  
  // El cambio correcto a dar
  const correctChange = receivedTotal - totalAmount;
  const isValid = receivedTotal >= totalAmount;

  // Denominaciones disponibles en caja (apertura + lo que ya ingresó en esta transacción)
  const availableDenoms = useMemo(() => {
    const available: DenominationMap = {};
    DENOMINATIONS.forEach(d => {
      available[d] = (registerDenominations?.[d] || 0) + (receivedDenoms[d] || 0);
    });
    return available;
  }, [registerDenominations, receivedDenoms]);

  // Auto-sugerir feria cuando el cambio cambia
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

    // Validar que la feria en denominaciones coincida con el cambio correcto
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-500/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Caja - Cobro en Efectivo</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{patientName}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body — scrollable */}
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
            {/* Total a cobrar */}
            <div className="flex justify-between items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total a cobrar:</span>
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Sección: Efectivo Recibido (Denominaciones) */}
            <div className="space-y-3">
              <button 
                type="button"
                onClick={() => setShowReceivedDenoms(!showReceivedDenoms)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-lg">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Efectivo Recibido
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    ${receivedTotal.toFixed(2)}
                  </span>
                  {showReceivedDenoms ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {showReceivedDenoms && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-3 gap-2"
                >
                  {DENOMINATIONS.filter(d => parseFloat(d) >= 20).map(denom => (
                    <div key={`recv-${denom}`} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-10 shrink-0">{denomLabel(denom)}</span>
                      <input
                        type="number"
                        min="0"
                        value={receivedDenoms[denom] || ''}
                        onChange={(e) => updateReceivedDenom(denom, parseInt(e.target.value) || 0)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold text-center focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                  ))}
                  {/* Fila para monedas (menores a $20) */}
                  {DENOMINATIONS.filter(d => parseFloat(d) < 20).map(denom => (
                    <div key={`recv-${denom}`} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-10 shrink-0">{denomLabel(denom)}</span>
                      <input
                        type="number"
                        min="0"
                        value={receivedDenoms[denom] || ''}
                        onChange={(e) => updateReceivedDenom(denom, parseInt(e.target.value) || 0)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold text-center focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Sección: Cambio a Entregar (Feria) */}
            {isValid && correctChange > 0 && (
              <div className="space-y-3">
                <button 
                  type="button"
                  onClick={() => setShowChangeDenoms(!showChangeDenoms)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-lg">
                      <ArrowUp className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Cambio a Entregar (Feria)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      ${correctChange.toFixed(2)}
                    </span>
                    {showChangeDenoms ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {showChangeDenoms && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    {/* Denominaciones sugeridas para feria */}
                    <div className="grid grid-cols-3 gap-2">
                      {DENOMINATIONS.filter(d => parseFloat(d) >= 1).map(denom => {
                        const available = availableDenoms[denom] || 0;
                        const used = changeDenoms[denom] || 0;
                        if (available <= 0 && used <= 0) return null;
                        return (
                          <div key={`change-${denom}`} className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/5 rounded-xl p-2.5 border border-amber-100 dark:border-amber-500/10">
                            <div className="shrink-0">
                              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">{denomLabel(denom)}</span>
                              <span className="text-[10px] text-slate-400">({available} disp.)</span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              max={available}
                              value={used || ''}
                              onChange={(e) => updateChangeDenom(denom, parseInt(e.target.value) || 0)}
                              className="w-full p-1.5 rounded-lg border border-amber-200 dark:border-amber-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold text-center focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                              placeholder="0"
                            />
                          </div>
                        );
                      })}
                    </div>
                    {/* Validación de suma */}
                    {Math.abs(changeTotal - correctChange) > 0.01 && (
                      <p className="text-xs text-red-500 font-medium text-center">
                        ⚠️ Las denominaciones suman ${changeTotal.toFixed(2)} pero el cambio correcto es ${correctChange.toFixed(2)}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* Resumen */}
            <div className={`p-4 rounded-xl border-2 ${isValid ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Recibido:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">${receivedTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Cobro:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">-${totalAmount.toFixed(2)}</span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex justify-between">
                  <span className={`text-sm font-semibold ${isValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    Feria a dar:
                  </span>
                  <span className={`text-xl font-black ${isValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                    ${isValid ? correctChange.toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
            <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button 
              onClick={handleCheckout} 
              disabled={!isValid || isProcessing || (correctChange > 0 && Math.abs(changeTotal - correctChange) > 0.01)}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm"
            >
              {isProcessing ? 'Procesando...' : <><CheckCircle2 className="w-4 h-4 mr-2"/> Registrar Cobro</>}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

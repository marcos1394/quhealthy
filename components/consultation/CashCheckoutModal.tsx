import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Calculator, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { paymentService } from '@/services/payment.service';

interface CashCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointmentId: number;
  totalAmount: number;
  patientName: string;
}

export const CashCheckoutModal = ({ isOpen, onClose, onSuccess, appointmentId, totalAmount, patientName }: CashCheckoutModalProps) => {
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Resetea el input cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) setAmountReceived('');
  }, [isOpen]);

  const receivedNum = parseFloat(amountReceived) || 0;
  const change = receivedNum - totalAmount;
  const isValid = receivedNum >= totalAmount;

  const handleCheckout = async () => {
    if (!isValid) return;
    setIsProcessing(true);
    try {
      await paymentService.processCashCheckout({
        appointmentId,
        totalAmount,
        amountReceived: receivedNum,
        description: `Cobro en efectivo: ${patientName}`
      });
      toast.success('Cobro registrado y caja actualizada.');
      onSuccess(); // Dispara la finalización clínica
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
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-500/5">
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

          <div className="p-6 space-y-6">
            {/* Total a cobrar */}
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total a cobrar:</span>
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Input de Efectivo Recibido */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-slate-400" /> Efectivo Recibido:
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                <Input
                  type="number"
                  autoFocus
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder="0.00"
                  className="pl-8 text-2xl font-semibold h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Cálculo de Feria */}
            <div className={`p-4 rounded-xl border ${isValid && receivedNum > 0 ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${isValid && receivedNum > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  Cambio a entregar (Feria):
                </span>
                <span className={`text-2xl font-bold ${isValid && receivedNum > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                  ${isValid ? change.toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button 
              onClick={handleCheckout} 
              disabled={!isValid || isProcessing}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isProcessing ? 'Procesando...' : <><CheckCircle2 className="w-4 h-4 mr-2"/> Registrar Cobro</>}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

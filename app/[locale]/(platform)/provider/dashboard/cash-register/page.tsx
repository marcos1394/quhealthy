"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Calculator, Play, Ban, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cashRegisterService } from '@/services/cash-register.service';
import { CashRegister, CashRegisterReportDto } from '@/types/cash-register';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { toast } from 'react-toastify';
import { CloseRegisterModal } from '@/components/cash-register/CloseRegisterModal';
import { scheduleService } from '@/services/schedule.service';

export default function CashRegisterPage() {
  const t = useTranslations('CashRegister');
  const [register, setRegister] = useState<CashRegister | null>(null);
  const [report, setReport] = useState<CashRegisterReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Para abrir caja
  const [initialBalance, setInitialBalance] = useState<string>('');
  const [isOpening, setIsOpening] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdown, setBreakdown] = useState<Record<string, number>>({
    '1000': 0, '500': 0, '200': 0, '100': 0, '50': 0, '20': 0,
    '10': 0, '5': 0, '2': 0, '1': 0, '0.5': 0
  });

  const updateBreakdown = (denom: string, count: number) => {
    const newBreakdown = { ...breakdown, [denom]: count };
    setBreakdown(newBreakdown);
    const total = Object.entries(newBreakdown).reduce((acc, [d, c]) => acc + (parseFloat(d) * c), 0);
    setInitialBalance(total > 0 ? total.toString() : '');
  };

  // Para cerrar caja
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const fetchCurrentRegister = async () => {
    try {
      setIsLoading(true);
      // TODO: If locations are properly fetched, use the actual locationId.
      // For MVP we pass undefined/null so the backend assigns null (useful for online/multi-site default registers)
      const current = await cashRegisterService.getCurrentRegister();
      setRegister(current);

      if (current) {
        const reportData = await cashRegisterService.getRegisterReport(current.id);
        setReport(reportData);
      } else {
        setReport(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentRegister();
  }, []);

  const handleOpenRegister = async () => {
    const parsedBalance = parseFloat(initialBalance || '0');
    if (parsedBalance < 0) {
      toast.error('El balance inicial no puede ser negativo.');
      return;
    }
    try {
      setIsOpening(true);
      await cashRegisterService.openRegister({
        locationId: null, // As requested, null for now until Location selector is fully integrated
        initialBalance: parsedBalance
      });
      toast.success('Caja abierta exitosamente.');
      fetchCurrentRegister();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error al abrir la caja.');
    } finally {
      setIsOpening(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <QhSpinner size="lg" />
      </div>
    );
  }

  // VISTA 1: CAJA CERRADA
  if (!register) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-3xl p-8 sm:p-12 shadow-sm text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calculator className="w-10 h-10 text-slate-400 dark:text-zinc-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Caja Cerrada
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 max-w-lg mx-auto mb-8 leading-relaxed">
            Para poder recibir pagos en efectivo de tus pacientes, necesitas abrir la caja registradora primero. 
            Indica con cuánto dinero en efectivo (cambio) iniciarás tu turno.
          </p>

          <div className="max-w-md mx-auto space-y-4">
            <div className="text-left space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                Balance Inicial en Caja ($)
              </label>
              <input 
                type="number"
                min="0"
                step="0.01"
                value={initialBalance}
                onChange={(e) => {
                  setInitialBalance(e.target.value);
                  // Resetear desglose si el usuario escribe manualmente el total
                  if (showBreakdown) {
                    setBreakdown({
                      '1000': 0, '500': 0, '200': 0, '100': 0, '50': 0, '20': 0,
                      '10': 0, '5': 0, '2': 0, '1': 0, '0.5': 0
                    });
                  }
                }}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-lg font-semibold transition-all"
                placeholder="Ej. 500.00"
              />
            </div>

            <div className="text-left">
              <button 
                type="button" 
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="text-medical-600 dark:text-medical-400 text-sm font-semibold hover:underline flex items-center gap-1 transition-colors"
              >
                <Calculator className="w-4 h-4" />
                {showBreakdown ? 'Ocultar calculadora de desglose' : 'Usar calculadora de desglose (Billetes y Monedas)'}
              </button>
            </div>

            {showBreakdown && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 text-left space-y-4"
              >
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Cantidad de billetes/monedas</p>
                <div className="grid grid-cols-2 gap-4">
                  {['1000', '500', '200', '100', '50', '20', '10', '5', '2', '1', '0.5'].map(denom => (
                    <div key={denom} className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-700 dark:text-zinc-300 w-12">${denom}</span>
                      <input 
                        type="number" 
                        min="0"
                        value={breakdown[denom] || ''} 
                        onChange={(e) => updateBreakdown(denom, parseInt(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-medical-500 outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            
            <Button 
              onClick={handleOpenRegister} 
              disabled={isOpening || !initialBalance}
              className="w-full rounded-xl p-6 font-bold shadow-lg hover:scale-105 transition-transform mt-2"
            >
              {isOpening ? <QhSpinner className="w-5 h-5 text-white" /> : <><Play className="w-5 h-5 mr-2" /> Abrir Caja</>}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // VISTA 2: CAJA ABIERTA (DASHBOARD)
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Caja Activa</h1>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">ABIERTA</Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Abierta el {new Date(register.openedAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchCurrentRegister} className="rounded-xl border-slate-200 dark:border-white/10">
            <RefreshCcw className="w-4 h-4 mr-2" /> Actualizar
          </Button>
          <Button variant="destructive" onClick={() => setIsCloseModalOpen(true)} className="rounded-xl shadow-lg">
            <Ban className="w-4 h-4 mr-2" /> Cerrar Caja
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">Balance Inicial</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">${register.initialBalance.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">Ingresos del Día</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            +${report?.transactions.filter(t => t.transactionType === 'CASH_IN').reduce((acc, t) => acc + t.amount, 0).toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mb-2">Egresos del Día</p>
          <p className="text-2xl font-black text-red-600 dark:text-red-400">
            -${report?.transactions.filter(t => t.transactionType === 'CASH_OUT').reduce((acc, t) => acc + t.amount, 0).toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-slate-900 dark:bg-white/5 border border-slate-800 dark:border-white/10 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Calculator className="w-16 h-16 text-white" />
          </div>
          <p className="text-sm font-medium text-slate-300 dark:text-zinc-400 mb-2">Balance Esperado</p>
          <p className="text-3xl font-black text-white">${register.expectedClosingBalance?.toFixed(2) || register.initialBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-white/5">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Transacciones Recientes</h3>
        </div>
        
        {report?.transactions && report.transactions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {report.transactions.map((tx) => (
              <div key={tx.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${tx.transactionType === 'CASH_IN' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                    {tx.transactionType === 'CASH_IN' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 dark:text-zinc-400">{new Date(tx.createdAt).toLocaleTimeString()}</span>
                      <Badge variant="outline" className="text-[10px] uppercase border-slate-200 dark:border-white/10">{tx.referenceType}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-lg ${tx.transactionType === 'CASH_IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {tx.transactionType === 'CASH_IN' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No hay movimientos aún</h4>
            <p className="text-slate-500 dark:text-zinc-400">Los pagos en efectivo aparecerán aquí automáticamente.</p>
          </div>
        )}
      </div>

      <CloseRegisterModal 
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        registerId={register.id}
        expectedBalance={register.expectedClosingBalance || register.initialBalance}
        onSuccess={fetchCurrentRegister}
      />
    </div>
  );
}

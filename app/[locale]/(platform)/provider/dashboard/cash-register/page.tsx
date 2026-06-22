"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Calculator, Play, Ban, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCcw, CheckCircle2, History, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cashRegisterService } from '@/services/cash-register.service';
import { CashRegister, CashRegisterReportDto, DenominationMap } from '@/types/cash-register';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { toast } from 'react-toastify';
import { CloseRegisterModal } from '@/components/cash-register/CloseRegisterModal';
import { ManualExpenseModal } from '@/components/cash-register/ManualExpenseModal';
import { paymentService } from '@/services/payment.service';
import { cn } from '@/lib/utils';

export default function CashRegisterPage() {
  const t = useTranslations('CashRegister');
    const [{ register, report, isLoading, activeTab, history, isHistoryLoading, initialBalance, isOpening, showBreakdown, breakdown, isCloseModalOpen, isExpenseModalOpen }, dispatch] = React.useReducer(
      (state: any, action: any) => {
        switch (action.type) {
      case 'SET_REGISTER': return { ...state, register: typeof action.payload === 'function' ? action.payload(state.register) : action.payload };
      case 'SET_REPORT': return { ...state, report: typeof action.payload === 'function' ? action.payload(state.report) : action.payload };
      case 'SET_ISLOADING': return { ...state, isLoading: typeof action.payload === 'function' ? action.payload(state.isLoading) : action.payload };
      case 'SET_ACTIVETAB': return { ...state, activeTab: typeof action.payload === 'function' ? action.payload(state.activeTab) : action.payload };
      case 'SET_HISTORY': return { ...state, history: typeof action.payload === 'function' ? action.payload(state.history) : action.payload };
      case 'SET_ISHISTORYLOADING': return { ...state, isHistoryLoading: typeof action.payload === 'function' ? action.payload(state.isHistoryLoading) : action.payload };
      case 'SET_INITIALBALANCE': return { ...state, initialBalance: typeof action.payload === 'function' ? action.payload(state.initialBalance) : action.payload };
      case 'SET_ISOPENING': return { ...state, isOpening: typeof action.payload === 'function' ? action.payload(state.isOpening) : action.payload };
      case 'SET_SHOWBREAKDOWN': return { ...state, showBreakdown: typeof action.payload === 'function' ? action.payload(state.showBreakdown) : action.payload };
      case 'SET_BREAKDOWN': return { ...state, breakdown: typeof action.payload === 'function' ? action.payload(state.breakdown) : action.payload };
      case 'SET_ISCLOSEMODALOPEN': return { ...state, isCloseModalOpen: typeof action.payload === 'function' ? action.payload(state.isCloseModalOpen) : action.payload };
      case 'SET_ISEXPENSEMODALOPEN': return { ...state, isExpenseModalOpen: typeof action.payload === 'function' ? action.payload(state.isExpenseModalOpen) : action.payload };
          default: return state;
        }
      },
      {
        register: null, report: null, isLoading: true, activeTab: 'current', history: [], isHistoryLoading: false, initialBalance: '', isOpening: false, showBreakdown: false, breakdown: {
    '1000': 0, '500': 0, '200': 0, '100': 0, '50': 0, '20': 0,
    '10': 0, '5': 0, '2': 0, '1': 0, '0.5': 0
  }, isCloseModalOpen: false, isExpenseModalOpen: false
      }
    );

    const setRegister = (val: any) => dispatch({ type: 'SET_REGISTER', payload: val });
    const setReport = (val: any) => dispatch({ type: 'SET_REPORT', payload: val });
    const setIsLoading = (val: any) => dispatch({ type: 'SET_ISLOADING', payload: val });
    const setActiveTab = (val: any) => dispatch({ type: 'SET_ACTIVETAB', payload: val });
    const setHistory = (val: any) => dispatch({ type: 'SET_HISTORY', payload: val });
    const setIsHistoryLoading = (val: any) => dispatch({ type: 'SET_ISHISTORYLOADING', payload: val });
    const setInitialBalance = (val: any) => dispatch({ type: 'SET_INITIALBALANCE', payload: val });
    const setIsOpening = (val: any) => dispatch({ type: 'SET_ISOPENING', payload: val });
    const setShowBreakdown = (val: any) => dispatch({ type: 'SET_SHOWBREAKDOWN', payload: val });
    const setBreakdown = (val: any) => dispatch({ type: 'SET_BREAKDOWN', payload: val });
    const setIsCloseModalOpen = (val: any) => dispatch({ type: 'SET_ISCLOSEMODALOPEN', payload: val });
    const setIsExpenseModalOpen = (val: any) => dispatch({ type: 'SET_ISEXPENSEMODALOPEN', payload: val });






  
  // Para abrir caja





  const updateBreakdown = (denom: string, count: number) => {
    const newBreakdown = { ...breakdown, [denom]: count };
    setBreakdown(newBreakdown);
    const total = Object.entries(newBreakdown).reduce((acc, [d, c]: [string, any]) => acc + (parseFloat(d) * c), 0);
    setInitialBalance(total > 0 ? total.toString() : '');
  };

  // Modales



  const fetchHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const res = await paymentService.getCashRegisterHistory(0, 50);
      if (res && res.content) {
        setHistory(res.content);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const fetchCurrentRegister = async () => {
    try {
      setIsLoading(true);
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
    fetchHistory();
  }, []);

  const handleOpenRegister = async () => {
    const parsedBalance = parseFloat(initialBalance || '0');
    if (parsedBalance < 0) {
      toast.error('EL BALANCE INICIAL NO PUEDE SER NEGATIVO.');
      return;
    }
    const hasBreakdownValues = showBreakdown && Object.values(breakdown).some((v: any) => v > 0);
    const cleanDenoms: DenominationMap | undefined = hasBreakdownValues 
      ? Object.fromEntries(Object.entries(breakdown).filter(([, v]: [string, any]) => v > 0)) as any
      : undefined;
    try {
      setIsOpening(true);
      await cashRegisterService.openRegister({
        locationId: null,
        initialBalance: parsedBalance,
        initialDenominations: cleanDenoms,
      });
      toast.success('PROTOCOLO DE APERTURA EXITOSO.');
      fetchCurrentRegister();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'FALLO EN APERTURA DE CAJA.');
    } finally {
      setIsOpening(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-[#050505]">
        <QhSpinner size="lg" className="text-black dark:text-white" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
          EXTRAYENDO ESTADO CONTABLE...
        </p>
      </div>
    );
  }

  // --- VISTA 1: CAJA CERRADA ---
  if (!register) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 bg-gray-50 dark:bg-[#050505] min-h-screen pt-8 px-6 md:px-10">
        <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white flex flex-col rounded-none">
          
          <div className="border-b border-black/20 dark:border-white/20 p-6 md:p-8 flex items-start gap-5 bg-white dark:bg-[#0a0a0a]">
            <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
              <Calculator className="w-6 h-6 text-gray-500" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                Estado Operativo: Inactivo
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
                CAJA CERRADA
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2 max-w-lg leading-relaxed">
                ES NECESARIO EJECUTAR EL PROTOCOLO DE APERTURA PARA HABILITAR LA RECEPCIÓN DE FONDOS. INDIQUE EL FONDO DE CAMBIO INICIAL.
              </p>
            </div>
          </div>

          <div className="flex flex-col bg-gray-50 dark:bg-[#050505]">
            <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">1</span>
                BALANCE INICIAL EN CAJA *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={initialBalance}
                  onChange={(e) => {
                    setInitialBalance(e.target.value);
                    if (showBreakdown) {
                      setBreakdown({
                        '1000': 0, '500': 0, '200': 0, '100': 0, '50': 0, '20': 0,
                        '10': 0, '5': 0, '2': 0, '1': 0, '0.5': 0
                      });
                    }
                  }}
                  className="w-full h-14 pl-9 pr-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-black dark:text-white text-xl font-semibold focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-300 dark:placeholder:text-gray-700"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a]">
              <button 
                type="button" 
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full flex items-center justify-between p-6 md:p-8 border-b border-black/10 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none group"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                  <Calculator className="w-4 h-4" strokeWidth={1.5} />
                  {showBreakdown ? 'OCULTAR MATRIZ DE DESGLOSE' : 'HABILITAR MATRIZ DE DESGLOSE (OPCIONAL)'}
                </span>
              </button>

              {showBreakdown && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="border-b border-black/10 dark:border-white/10 overflow-hidden bg-gray-50 dark:bg-[#050505]"
                >
                  <div className="p-4 border-b border-black/10 dark:border-white/10">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center">
                      CANTIDAD FÍSICA DE BILLETES Y MONEDAS
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-l border-black/10 dark:border-white/10">
                    {['1000', '500', '200', '100', '50', '20', '10', '5', '2', '1', '0.5'].map(denom => (
                      <div key={denom} className="border-r border-b border-black/10 dark:border-white/10 p-4 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-3">
                          ${denom}
                        </span>
                        <input 
                          type="number" 
                          min="0"
                          value={breakdown[denom] || ''} 
                          onChange={(e) => updateBreakdown(denom, parseInt(e.target.value) || 0)}
                          className="w-full h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white text-xs font-semibold text-center focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-300 dark:placeholder:text-gray-700"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-black/20 dark:border-white/20">
              <Button 
                onClick={handleOpenRegister} 
                disabled={isOpening || !initialBalance}
                className="w-full h-14 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-0 rounded-none text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isOpening ? <QhSpinner size="sm" className="text-current" /> : <Play className="w-4 h-4" strokeWidth={1.5} />}
                {isOpening ? 'PROCESANDO APERTURA...' : 'INICIALIZAR CAJA'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA 2: CAJA ABIERTA (DASHBOARD) ---
  return (
    <div className="max-w-7xl mx-auto space-y-8 bg-gray-50 dark:bg-[#050505] min-h-screen pt-8 px-6 md:px-10 pb-16 transition-colors">
      
      {/* TABS HEADER (Blueprint style) */}
      <div className="flex items-center gap-0 border-b border-black/20 dark:border-white/20 pb-4">
        <button
          onClick={() => setActiveTab('current')}
          className={cn(
            "px-6 h-12 flex items-center justify-center border border-b-0 transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none",
            activeTab === 'current'
              ? "border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white"
              : "border-transparent bg-transparent text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#111]"
          )}
        >
          <Calculator className="w-4 h-4 mr-2" strokeWidth={1.5} /> CAJA ACTIVA
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "px-6 h-12 flex items-center justify-center border border-b-0 transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none",
            activeTab === 'history'
              ? "border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white"
              : "border-transparent bg-transparent text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#111]"
          )}
        >
          <History className="w-4 h-4 mr-2" strokeWidth={1.5} /> HISTÓRICO CONTABLE
        </button>
      </div>

      {activeTab === 'current' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-black/20 dark:border-white/20 pb-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white flex items-center justify-center shrink-0">
                <Calculator className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
                    TURNO ACTUAL
                  </h1>
                  <span className="border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500" /> ABIERTA
                  </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
                  APERTURA: {new Date(register.openedAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button onClick={() => setIsExpenseModalOpen(true)} className="flex-1 sm:flex-none h-12 px-6 flex items-center justify-center gap-2 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none">
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} /> SALIDA EFECTIVO
              </button>
              <button onClick={fetchCurrentRegister} className="flex-1 sm:flex-none h-12 px-6 flex items-center justify-center gap-2 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none">
                <RefreshCcw className="w-4 h-4" strokeWidth={1.5} /> ACTUALIZAR
              </button>
              <button onClick={() => setIsCloseModalOpen(true)} className="flex-1 sm:flex-none h-12 px-6 flex items-center justify-center gap-2 border border-red-500 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-600 transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none">
                <Ban className="w-4 h-4" strokeWidth={1.5} /> CERRAR CAJA
              </button>
            </div>
          </div>

          {/* Stats: Blueprint Grid Matriz */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
            <div className="border-b border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col justify-between min-h-[140px] group transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors mb-2">BALANCE INICIAL</p>
              <p className="text-3xl font-semibold tracking-tight text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors leading-none">${register.initialBalance.toFixed(2)}</p>
            </div>
            <div className="border-b border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col justify-between min-h-[140px] group transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors mb-2">INGRESOS DEL DÍA</p>
              <p className="text-3xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400 leading-none">
                +${report?.transactions.filter((t: any) => t.transactionType === 'INCOME').reduce((acc: number, t: any) => acc + t.amount, 0).toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="border-b border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col justify-between min-h-[140px] group transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors mb-2">EGRESOS DEL DÍA</p>
              <p className="text-3xl font-semibold tracking-tight text-red-600 dark:text-red-400 leading-none">
                -${report?.transactions.filter((t: any) => t.transactionType === 'EXPENSE').reduce((acc: number, t: any) => acc + t.amount, 0).toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="border-b border-r border-black/20 dark:border-white/20 bg-black text-white dark:bg-white dark:text-black p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calculator className="w-16 h-16 text-white dark:text-black" />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 relative z-10">BALANCE ESPERADO</p>
              <p className="text-3xl font-semibold tracking-tight text-white dark:text-black leading-none relative z-10">
                ${register.expectedClosingBalance?.toFixed(2) || register.initialBalance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 flex flex-col transition-colors rounded-none">
            <div className="p-6 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
              <h3 className="font-semibold text-lg uppercase tracking-tight text-black dark:text-white leading-none">LIBRO MAYOR (RECIENTES)</h3>
            </div>
            
            {report?.transactions && report.transactions.length > 0 ? (
              <div className="divide-y divide-black/10 dark:divide-white/10 bg-white dark:bg-[#0a0a0a]">
                {report.transactions.map((tx: any) => (
                  <div key={tx.id} className="p-6 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 group hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 border flex items-center justify-center shrink-0 transition-colors",
                          tx.transactionType === 'INCOME' 
                            ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400" 
                            : "border-red-500/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400"
                        )}>
                          {tx.transactionType === 'INCOME' ? <ArrowDownRight className="w-5 h-5" strokeWidth={1.5} /> : <ArrowUpRight className="w-5 h-5" strokeWidth={1.5} />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">{tx.description}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 border border-black/20 dark:border-white/20 px-2 py-0.5 bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent group-hover:text-white dark:group-hover:text-black group-hover:border-white/30 dark:group-hover:border-black/30 transition-colors">
                              {tx.referenceType}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
                              {new Date(tx.createdAt).toLocaleTimeString()} HRS
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="sm:text-right ml-14 sm:ml-0">
                        <p className={cn(
                          "font-semibold text-xl tracking-tight leading-none",
                          tx.transactionType === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        )}>
                          {tx.transactionType === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {/* Desglose de denominaciones (Blueprint Style) */}
                    {tx.denominations && Object.keys(tx.denominations).length > 0 && (
                      <div className="mt-4 ml-14 flex flex-wrap gap-2">
                        {Object.entries(tx.denominations)
                          .filter(([, count]: [string, any]) => count > 0)
                          .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
                          .map(([denom, count]) => (
                            <span 
                              key={denom}
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-widest px-2 py-1 border",
                                tx.transactionType === 'INCOME' 
                                  ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400' 
                                  : 'border-red-500/30 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400'
                              )}
                            >
                              {String(count)} × ${denom}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-[#050505]">
                <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6">
                  <Banknote className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                </div>
                <h4 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">CERO MOVIMIENTOS</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">LOS INGRESOS Y EGRESOS EN EFECTIVO SE REGISTRARÁN AQUÍ.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* --- PESTAÑA DE HISTORIAL --- */}
      {activeTab === 'history' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 flex flex-col transition-colors rounded-none">
            <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#0a0a0a]">
              <h3 className="font-semibold text-lg uppercase tracking-tight text-black dark:text-white leading-none">REGISTROS ANTERIORES</h3>
              <button onClick={fetchHistory} className="h-10 px-4 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                <RefreshCcw className="w-3 h-3" strokeWidth={1.5} /> SINCRONIZAR
              </button>
            </div>
            
            {isHistoryLoading ? (
              <div className="p-16 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-[#050505]">
                <QhSpinner className="mb-4 text-black dark:text-white" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">EXTRAYENDO HISTORIAL...</p>
              </div>
            ) : history.length > 0 ? (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-white dark:bg-[#0a0a0a] text-[9px] font-bold uppercase tracking-widest text-gray-500 border-b border-black/10 dark:border-white/10">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">ESTADO</th>
                      <th className="px-6 py-4 whitespace-nowrap">APERTURA</th>
                      <th className="px-6 py-4 whitespace-nowrap">CIERRE</th>
                      <th className="px-6 py-4 whitespace-nowrap">M. INICIAL</th>
                      <th className="px-6 py-4 whitespace-nowrap">M. FINAL</th>
                      <th className="px-6 py-4 whitespace-nowrap text-right">DESCUADRE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10 dark:divide-white/10 bg-white dark:bg-[#0a0a0a]">
                    {history.map((h: any) => (
                      <tr key={h.id} className="hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 group hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer">
                        <td className="px-6 py-6">
                          {h.status === 'OPEN' ? (
                            <span className="border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit">
                              <span className="w-1.5 h-1.5 bg-emerald-500" /> ABIERTA
                            </span>
                          ) : (
                            <span className="border border-gray-500/30 bg-gray-50 dark:bg-gray-900/10 text-gray-600 dark:text-gray-400 px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit">
                              <span className="w-1.5 h-1.5 bg-gray-500" /> CERRADA
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                          {new Date(h.openedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                          {h.closedAt ? new Date(h.closedAt).toLocaleString() : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-6 py-6 text-sm font-semibold tracking-tight text-black dark:text-white">
                          ${h.initialBalance.toFixed(2)}
                        </td>
                        <td className="px-6 py-6 text-sm font-semibold tracking-tight text-black dark:text-white">
                          ${(h.actualClosingBalance || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-6 text-right">
                          {h.balanceDifference !== undefined && h.balanceDifference !== null ? (
                            <span className={cn(
                              "text-sm font-semibold tracking-tight",
                              h.balanceDifference > 0 ? "text-emerald-600 dark:text-emerald-400" : h.balanceDifference < 0 ? "text-red-600 dark:text-red-400" : "text-gray-500"
                            )}>
                              {h.balanceDifference > 0 ? '+' : ''}${h.balanceDifference.toFixed(2)}
                            </span>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-[#050505]">
                <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6">
                  <AlertCircle className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                </div>
                <h4 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">REGISTRO VACÍO</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">EL SISTEMA AÚN NO CUENTA CON HISTORIAL DE CAJAS CERRADAS.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <CloseRegisterModal 
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        registerId={register.id}
        expectedBalance={register.expectedClosingBalance || register.initialBalance}
        onSuccess={() => {
           fetchCurrentRegister();
           fetchHistory();
        }}
      />
      
      <ManualExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={() => {
           setIsExpenseModalOpen(false);
           fetchCurrentRegister();
        }}
        currentDenominations={register.currentDenominations || register.initialDenominations}
        maxExpectedBalance={register.expectedClosingBalance || register.initialBalance}
      />
    </div>
  );
}